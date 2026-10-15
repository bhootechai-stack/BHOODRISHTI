import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Compass,
  Navigation,
  Crosshair,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  MapPin,
  Footprints,
  RotateCw,
  RotateCcw,
  LocateFixed,
  Radio,
  Volume2,
  VolumeX,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Play,
  Square,
  Flag,
  Smartphone,
  Laptop,
  Activity,
  ShieldCheck,
  RefreshCw,
  X,
  Globe,
} from 'lucide-react';
import { LatLng, UserLocation } from '../types';
import {
  calculateDistanceMeters,
  calculateBearing,
  getCardinalDirection,
  calculateCentroid,
  calculateFieldRedSpots,
  generateFieldPolygonAroundPoint,
} from '../utils/geoUtils';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../utils/translations';
import { COMPASS_LOCALES, CompassLocaleStrings } from '../utils/compassTranslations';

export interface NavigationTarget {
  id: string;
  name: string;
  nameKey?: string;
  pos: LatLng;
  type: 'centroid' | 'corner' | 'well' | 'gate' | 'base' | 'custom' | 'red_spot';
  description?: string;
  deficiencyInfo?: string;
}

interface FarmerNavigatorOverlayProps {
  fieldBoundaryPoints: LatLng[];
  fieldCenter: LatLng;
  userLocation?: LatLng | null;
  savedProfileLocation?: UserLocation | null;
  onCenterMapOnField?: () => void;
  onUserLocationUpdate?: (pos: LatLng) => void;
  onSelectTargetCoordinate?: (target: { id: string; name: string; pos: LatLng }) => void;
  isOpen?: boolean;
  onClose?: () => void;
  initialTargetId?: string;
}

export type SensorSourceType =
  | 'ios-webkit'
  | 'w3c-sensor-api'
  | 'magnetometer-api'
  | 'device-orientation-absolute'
  | 'device-orientation'
  | 'gps-heading'
  | 'manual-dial';

export const FieldCompassOverlay: React.FC<FarmerNavigatorOverlayProps> = ({
  fieldBoundaryPoints,
  fieldCenter,
  userLocation,
  savedProfileLocation,
  onCenterMapOnField,
  onUserLocationUpdate,
  onSelectTargetCoordinate,
  isOpen = true,
  onClose,
  initialTargetId = 'nearest-red-spot',
}) => {
  const { language, setLanguage, languages } = useLanguage();
  const { coords: sharedCoords, retryLocation: refreshLocation } = useLocation();

  // Active locale strings for compass
  const locale: CompassLocaleStrings = useMemo(() => {
    return COMPASS_LOCALES[language] || COMPASS_LOCALES.en;
  }, [language]);

  // Calculate field red deficiency spots
  const redSpots = useMemo(() => {
    const polygon =
      fieldBoundaryPoints && fieldBoundaryPoints.length >= 3
        ? fieldBoundaryPoints
        : generateFieldPolygonAroundPoint(fieldCenter);
    return calculateFieldRedSpots(polygon);
  }, [fieldBoundaryPoints, fieldCenter]);

  // Compute field centroid
  const fieldCentroid = useMemo<LatLng>(() => {
    if (fieldBoundaryPoints && fieldBoundaryPoints.length >= 3) {
      return calculateCentroid(fieldBoundaryPoints);
    }
    return fieldCenter;
  }, [fieldBoundaryPoints, fieldCenter]);

  // Construct selectable target points (Red Deficiency Spots + Field Centroid + Profile Live Base Pin + Corner Boundary Pins)
  const navigationTargets = useMemo<NavigationTarget[]>(() => {
    const list: NavigationTarget[] = [];

    // 1. Red Problem Spots (Highest Priority for Agronomy)
    if (redSpots && redSpots.length > 0) {
      list.push({
        id: 'nearest-red-spot',
        name: locale.nearestRedSpot || 'Nearest Red Problem Spot (NDRE/NDWI)',
        pos: { lat: redSpots[0].lat, lng: redSpots[0].lng },
        type: 'red_spot',
        description: `${redSpots[0].name} (${redSpots[0].confidencePct}% Conf)`,
        deficiencyInfo: redSpots[0].recommendation,
      });

      if (redSpots.length > 1) {
        list.push({
          id: 'red-spot-2',
          name: (locale.redDeficiencySpot || 'Red Deficiency Spot #{num}').replace('{num}', '2'),
          pos: { lat: redSpots[1].lat, lng: redSpots[1].lng },
          type: 'red_spot',
          description: `${redSpots[1].name} (${redSpots[1].confidencePct}% Conf)`,
          deficiencyInfo: redSpots[1].recommendation,
        });
      }
    }

    // 2. Field Centroid
    list.push({
      id: 'center',
      name: locale.fieldCenter,
      pos: fieldCentroid,
      type: 'centroid',
      description: 'Field Centroid Point',
    });

    // 3. Corner pins
    if (fieldBoundaryPoints && fieldBoundaryPoints.length > 0) {
      fieldBoundaryPoints.forEach((pt, idx) => {
        list.push({
          id: `pin-${idx + 1}`,
          name: locale.cornerPin.replace('{num}', String(idx + 1)),
          pos: pt,
          type: 'corner',
          description: `Boundary Point #${idx + 1} (${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)})`,
        });
      });
    }

    return list;
  }, [redSpots, fieldCentroid, fieldBoundaryPoints, savedProfileLocation, locale]);

  // Default starting position
  const defaultInitialPos = useMemo<LatLng>(() => {
    if (userLocation) return userLocation;
    if (savedProfileLocation) return { lat: savedProfileLocation.lat, lng: savedProfileLocation.lng };
    return {
      lat: Number((fieldCentroid.lat - 0.00045).toFixed(6)),
      lng: Number((fieldCentroid.lng - 0.0004).toFixed(6)),
    };
  }, [userLocation, savedProfileLocation, fieldCentroid]);

  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [manualHeading, setManualHeading] = useState<number>(35);
  const [isSensorActive, setIsSensorActive] = useState<boolean>(false);
  const [activeSensorSource, setActiveSensorSource] = useState<SensorSourceType>('manual-dial');

  // Real-time raw hardware sensor telemetry (Pitch/Roll/Yaw)
  const [sensorRawAlpha, setSensorRawAlpha] = useState<number | null>(null);
  const [sensorRawBeta, setSensorRawBeta] = useState<number | null>(null);
  const [sensorRawGamma, setSensorRawGamma] = useState<number | null>(null);
  const [isAbsoluteCompass, setIsAbsoluteCompass] = useState<boolean>(false);
  const [gpsHeadingVal, setGpsHeadingVal] = useState<number | null>(null);
  const [gpsSpeedVal, setGpsSpeedVal] = useState<number | null>(null);

  const [isWatchingGps, setIsWatchingGps] = useState<boolean>(false);
  const [isLocatingSingle, setIsLocatingSingle] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [liveUserPos, setLiveUserPos] = useState<LatLng>(defaultInitialPos);

  // Floating States: Minimized (Floating FAB) | Standard Floating HUD | Maximized HUD
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(isOpen);

  const [showManualControls, setShowManualControls] = useState<boolean>(false);
  const [showSensorHubModal, setShowSensorHubModal] = useState<boolean>(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [isAudioGuidanceOn, setIsAudioGuidanceOn] = useState<boolean>(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(() => {
    return initialTargetId || (redSpots.length > 0 ? 'nearest-red-spot' : 'center');
  });

  useEffect(() => {
    if (initialTargetId) {
      setSelectedTargetId(initialTargetId);
    }
  }, [initialTargetId]);
  const [lastSpokenTime, setLastSpokenTime] = useState<number>(0);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const dialRef = useRef<HTMLDivElement>(null);
  const isDraggingDialRef = useRef<boolean>(false);
  const simIntervalRef = useRef<number | null>(null);
  const lastNotifiedTargetKeyRef = useRef<string>('');
  const genericSensorRef = useRef<any>(null);
  const magSensorRef = useRef<any>(null);

  // Sync isOpen prop
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const showLocalToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Active Selected Navigation Target
  const activeTarget = useMemo<NavigationTarget>(() => {
    const found = navigationTargets.find((t) => t.id === selectedTargetId);
    return found || navigationTargets[0];
  }, [navigationTargets, selectedTargetId]);

  // Notify parent of selected target so map can draw visual trace polyline
  useEffect(() => {
    if (!activeTarget || !onSelectTargetCoordinate) return;
    const targetKey = `${activeTarget.id}_${activeTarget.pos.lat.toFixed(6)}_${activeTarget.pos.lng.toFixed(6)}`;
    if (lastNotifiedTargetKeyRef.current !== targetKey) {
      lastNotifiedTargetKeyRef.current = targetKey;
      onSelectTargetCoordinate({
        id: activeTarget.id,
        name: activeTarget.name,
        pos: activeTarget.pos,
      });
    }
  }, [activeTarget, onSelectTargetCoordinate]);

  // Keep liveUserPos in sync when prop changes externally
  useEffect(() => {
    if (userLocation) {
      setLiveUserPos(userLocation);
    } else if (savedProfileLocation) {
      setLiveUserPos({ lat: savedProfileLocation.lat, lng: savedProfileLocation.lng });
    }
  }, [userLocation, savedProfileLocation]);

  // Initialize and Bind All Hardware Sensors (Phone + Laptop + Tablet)
  const initHardwareSensors = useCallback(() => {
    // 1. Check W3C AbsoluteOrientationSensor
    try {
      // @ts-expect-error W3C Generic Sensor API
      if (typeof AbsoluteOrientationSensor !== 'undefined' && !genericSensorRef.current) {
        // @ts-expect-error W3C Generic Sensor API
        const sensor = new AbsoluteOrientationSensor({ frequency: 25 });
        sensor.addEventListener('reading', () => {
          const q = sensor.quaternion;
          if (q && q.length === 4) {
            const yaw = Math.atan2(2 * (q[0] * q[1] + q[2] * q[3]), 1 - 2 * (q[1] * q[1] + q[2] * q[2]));
            let headingDeg = (yaw * 180) / Math.PI;
            if (headingDeg < 0) headingDeg += 360;
            const rounded = Math.round(headingDeg);
            setDeviceHeading(rounded);
            setIsSensorActive(true);
            setActiveSensorSource('w3c-sensor-api');
            setIsAbsoluteCompass(true);
            setSensorRawAlpha(rounded);
          }
        });
        sensor.addEventListener('error', (err: any) => {
          console.log('Generic sensor note:', err?.message || err);
        });
        sensor.start();
        genericSensorRef.current = sensor;
      }
    } catch (e) {
      console.log('AbsoluteOrientationSensor not initialized:', e);
    }

    // 2. Check W3C Magnetometer API
    try {
      // @ts-expect-error W3C Magnetometer
      if (typeof Magnetometer !== 'undefined' && !magSensorRef.current) {
        // @ts-expect-error W3C Magnetometer
        const mag = new Magnetometer({ frequency: 20 });
        mag.addEventListener('reading', () => {
          if (typeof mag.x === 'number' && typeof mag.y === 'number') {
            let angle = (Math.atan2(mag.y, mag.x) * 180) / Math.PI;
            if (angle < 0) angle += 360;
            const rounded = Math.round(angle);
            setDeviceHeading(rounded);
            setIsSensorActive(true);
            setActiveSensorSource('magnetometer-api');
            setIsAbsoluteCompass(true);
            setSensorRawAlpha(rounded);
          }
        });
        mag.start();
        magSensorRef.current = mag;
      }
    } catch (e) {
      console.log('Magnetometer not initialized:', e);
    }

    // 3. Standard Device Orientation Event Handler
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;
      let source: SensorSourceType = 'device-orientation';

      if (e.beta !== null) setSensorRawBeta(Math.round(e.beta));
      if (e.gamma !== null) setSensorRawGamma(Math.round(e.gamma));
      if (e.alpha !== null) setSensorRawAlpha(Math.round(e.alpha));
      if (e.absolute) setIsAbsoluteCompass(true);

      // iOS Webkit Compass Heading
      // @ts-expect-error webkitCompassHeading is iOS specific
      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
        // @ts-expect-error iOS property
        heading = e.webkitCompassHeading;
        source = 'ios-webkit';
        setIsAbsoluteCompass(true);
      } else if (e.alpha !== null && !isNaN(e.alpha)) {
        heading = (360 - e.alpha) % 360;
        source = e.absolute ? 'device-orientation-absolute' : 'device-orientation';
      }

      if (heading !== null && !isNaN(heading)) {
        const rounded = Math.round(heading);
        setDeviceHeading(rounded);
        setIsSensorActive(true);
        setActiveSensorSource(source);
      }
    };

    // 4. Device Motion (Tilt & Accelerometer)
    const handleMotion = (e: DeviceMotionEvent) => {
      if (e.accelerationIncludingGravity) {
        const { x, y } = e.accelerationIncludingGravity;
        if (x !== null && y !== null) {
          setSensorRawBeta(Math.round((y || 0) * 10));
          setSensorRawGamma(Math.round((x || 0) * 10));
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.addEventListener('deviceorientation', handleOrientation as EventListener, true);
      window.addEventListener('devicemotion', handleMotion as EventListener, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
        window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
        window.removeEventListener('devicemotion', handleMotion as EventListener, true);
      }
      if (genericSensorRef.current) {
        try {
          genericSensorRef.current.stop();
        } catch {}
        genericSensorRef.current = null;
      }
      if (magSensorRef.current) {
        try {
          magSensorRef.current.stop();
        } catch {}
        magSensorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = initHardwareSensors();
    return cleanup;
  }, [initHardwareSensors]);

  // Request Mobile / Laptop Sensor Permissions
  const requestSensorPermission = async () => {
    let activated = false;

    // iOS 13+ Safari
    // @ts-expect-error iOS 13+ permission API
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-expect-error iOS 13+
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setIsSensorActive(true);
          initHardwareSensors();
          showLocalToast(locale.sensorActiveBadge);
          activated = true;
        } else {
          showLocalToast('Permission Denied');
        }
      } catch (err) {
        console.warn('Sensor permission error:', err);
      }
    }

    // W3C Permissions Query API
    if (!activated && navigator.permissions) {
      try {
        // @ts-expect-error W3C Accelerometer permission
        const accelPerm = await navigator.permissions.query({ name: 'accelerometer' }).catch(() => null);
        // @ts-expect-error W3C Magnetometer permission
        const magPerm = await navigator.permissions.query({ name: 'magnetometer' }).catch(() => null);
        // @ts-expect-error W3C Gyroscope permission
        const gyroPerm = await navigator.permissions.query({ name: 'gyroscope' }).catch(() => null);

        if (
          (accelPerm && accelPerm.state === 'granted') ||
          (magPerm && magPerm.state === 'granted') ||
          (gyroPerm && gyroPerm.state === 'granted')
        ) {
          initHardwareSensors();
          setIsSensorActive(true);
          showLocalToast(locale.sensorActiveBadge);
          activated = true;
        }
      } catch (e) {
        console.log('Permissions query note:', e);
      }
    }

    if (!activated) {
      initHardwareSensors();
      setIsSensorActive(true);
      showLocalToast(locale.sensorActiveBadge);
    }
  };

  // Drag-to-Rotate Pointer Handlers
  const handleDialPointerDown = (e: React.PointerEvent) => {
    isDraggingDialRef.current = true;
    updateHeadingFromPointer(e.clientX, e.clientY);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleDialPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingDialRef.current) return;
    updateHeadingFromPointer(e.clientX, e.clientY);
  };

  const handleDialPointerUp = (e: React.PointerEvent) => {
    isDraggingDialRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const updateHeadingFromPointer = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let deg = Math.round((Math.atan2(dx, -dy) * 180) / Math.PI);
    if (deg < 0) deg += 360;
    setIsSensorActive(false);
    setActiveSensorSource('manual-dial');
    setManualHeading(deg);
  };

  // Step rotation +/- 15 deg
  const handleStepRotate = (delta: number) => {
    setIsSensorActive(false);
    setActiveSensorSource('manual-dial');
    setManualHeading((prev) => (prev + delta + 360) % 360);
  };

  // 1-Tap Get Precise Current Location
  const requestCurrentGps = async () => {
    setIsLocatingSingle(true);
    try {
      let target = sharedCoords;
      if (!target || !Number.isFinite(target.lat) || !Number.isFinite(target.lng)) {
        await refreshLocation();
        target = sharedCoords;
      }

      if (target && Number.isFinite(target.lat) && Number.isFinite(target.lng)) {
        setIsLocatingSingle(false);
        const newPos: LatLng = {
          lat: Number(target.lat.toFixed(6)),
          lng: Number(target.lng.toFixed(6)),
        };
        setLiveUserPos(newPos);
        if (onUserLocationUpdate) onUserLocationUpdate(newPos);

        if (target.heading !== null && target.heading !== undefined && !isNaN(target.heading)) {
          setDeviceHeading(Math.round(target.heading));
          setGpsHeadingVal(Math.round(target.heading));
          setIsSensorActive(true);
          setActiveSensorSource('gps-heading');
        }
        if (target.speed !== null && target.speed !== undefined && !isNaN(target.speed)) {
          setGpsSpeedVal(Math.round(target.speed * 3.6));
        }
        showLocalToast('GPS Location Acquired!');
      } else {
        setIsLocatingSingle(false);
        showLocalToast('GPS unavailable, interactive mode active');
      }
    } catch {
      setIsLocatingSingle(false);
      showLocalToast('GPS unavailable, interactive mode active');
    }
  };

  // Continuous Live GPS Tracking Watcher
  const toggleGpsWatch = useCallback(() => {
    if (isWatchingGps) {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsWatchingGps(false);
      showLocalToast(locale.gpsTrackStop);
    } else {
      if (sharedCoords && Number.isFinite(sharedCoords.lat) && Number.isFinite(sharedCoords.lng)) {
        const newPos: LatLng = {
          lat: Number(sharedCoords.lat.toFixed(6)),
          lng: Number(sharedCoords.lng.toFixed(6)),
        };
        setLiveUserPos(newPos);
        if (onUserLocationUpdate) {
          onUserLocationUpdate(newPos);
        }
        setIsWatchingGps(true);
        showLocalToast(locale.gpsTrackLive);
        return;
      }

      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        showLocalToast('GPS is not supported on this device.');
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newPos: LatLng = {
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
          };
          setLiveUserPos(newPos);
          if (onUserLocationUpdate) {
            onUserLocationUpdate(newPos);
          }

          if (position.coords.heading !== null && !isNaN(position.coords.heading)) {
            const h = Math.round(position.coords.heading);
            setDeviceHeading(h);
            setGpsHeadingVal(h);
            setIsSensorActive(true);
            setActiveSensorSource('gps-heading');
          }
          if (position.coords.speed !== null && !isNaN(position.coords.speed)) {
            setGpsSpeedVal(Math.round(position.coords.speed * 3.6));
          }
        },
        (err) => {
          console.warn('GPS Watch error:', err);
          setIsWatchingGps(false);
          showLocalToast('GPS signal lost');
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );

      setWatchId(id);
      setIsWatchingGps(true);
      showLocalToast(locale.gpsTrackLive);
    }
  }, [isWatchingGps, watchId, onUserLocationUpdate, locale, sharedCoords]);

  // Clean up GPS watcher and Walk simulation
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, [watchId]);

  // Walk Simulation
  const toggleWalkSimulation = () => {
    if (isSimulatingWalk) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulatingWalk(false);
      showLocalToast(locale.walkSimStopBtn);
    } else {
      setIsSimulatingWalk(true);
      showLocalToast(locale.walkSimBtn);

      const startWalk = liveUserPos || {
        lat: activeTarget.pos.lat - 0.0005,
        lng: activeTarget.pos.lng - 0.0004,
      };
      setLiveUserPos(startWalk);
      if (onUserLocationUpdate) onUserLocationUpdate(startWalk);

      if (simIntervalRef.current) clearInterval(simIntervalRef.current);

      simIntervalRef.current = window.setInterval(() => {
        setLiveUserPos((prev) => {
          if (!prev) return startWalk;
          const dLat = activeTarget.pos.lat - prev.lat;
          const dLng = activeTarget.pos.lng - prev.lng;
          const distDegrees = Math.sqrt(dLat * dLat + dLng * dLng);

          if (distDegrees < 0.00004) {
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
            setIsSimulatingWalk(false);
            showLocalToast(locale.arrived);
            return activeTarget.pos;
          }

          const stepRatio = Math.min(0.18, 0.00004 / distDegrees);
          const nextPos: LatLng = {
            lat: Number((prev.lat + dLat * stepRatio).toFixed(6)),
            lng: Number((prev.lng + dLng * stepRatio).toFixed(6)),
          };

          const walkingBearing = calculateBearing(prev, nextPos);
          setManualHeading(Math.round(walkingBearing));
          setIsSensorActive(false);
          setActiveSensorSource('manual-dial');

          if (onUserLocationUpdate) onUserLocationUpdate(nextPos);
          return nextPos;
        });
      }, 1100);
    }
  };

  // Active Heading (Hardware sensor or manual interactive dial)
  const activeHeading = isSensorActive ? deviceHeading : manualHeading;

  // Distance in meters to target
  const distanceToTargetMeters = useMemo(() => {
    if (!liveUserPos || !activeTarget.pos) return 0;
    return Math.round(calculateDistanceMeters(liveUserPos, activeTarget.pos));
  }, [liveUserPos, activeTarget]);

  // Bearing to target (0° - 360°)
  const bearingToTarget = useMemo(() => {
    if (!liveUserPos || !activeTarget.pos) return 0;
    return Math.round(calculateBearing(liveUserPos, activeTarget.pos));
  }, [liveUserPos, activeTarget]);

  // Relative needle angle
  const relativeTargetAngle = (bearingToTarget - activeHeading + 360) % 360;

  // Turn Offset (-180° to +180°)
  const turnOffset = ((bearingToTarget - activeHeading + 540) % 360) - 180;

  // Cardinal direction code
  const bearingCardinal = getCardinalDirection(bearingToTarget);
  const headingCardinal = getCardinalDirection(activeHeading);

  // Translated cardinal item
  const bearingCardinalData = locale.cardinals[bearingCardinal] || {
    name: bearingCardinal,
    audioHelp: `${bearingCardinal} direction`,
  };

  // Actionable Farmer Prompt (Dynamic Translation)
  const simpleActionPrompt = useMemo(() => {
    const stepsEst = Math.round(distanceToTargetMeters / 0.75);

    if (distanceToTargetMeters <= 8) {
      return {
        text: locale.arrived,
        sub: locale.arrivedSub,
        action: 'arrived',
        color: 'text-[#2F5233]',
        bgColor: 'bg-[#EAF0EB] border-[#2F5233]/40 shadow-xs',
      };
    }

    if (Math.abs(turnOffset) <= 20) {
      return {
        text: locale.walkStraight.replace('{dist}', String(distanceToTargetMeters)),
        sub: `~${stepsEst} ${locale.stepsLabel}`,
        action: 'straight',
        color: 'text-[#2F5233]',
        bgColor: 'bg-[#EAF0EB] border-[#2F5233]/30',
      };
    } else if (turnOffset > 20 && turnOffset <= 90) {
      return {
        text: locale.slightRight.replace('{deg}', String(Math.round(turnOffset))),
        sub: `${distanceToTargetMeters} ${locale.metersShort} (~${stepsEst} ${locale.stepsLabel})`,
        action: 'slight-right',
        color: 'text-[#1F2A1F]',
        bgColor: 'bg-[#FAF8F2] border-[#E5E0D3]',
      };
    } else if (turnOffset > 90) {
      return {
        text: locale.hardRight.replace('{deg}', String(Math.round(turnOffset))),
        sub: `${distanceToTargetMeters} ${locale.metersShort} (~${stepsEst} ${locale.stepsLabel})`,
        action: 'hard-right',
        color: 'text-[#D97706]',
        bgColor: 'bg-[#FFFBEB] border-[#FDE68A]',
      };
    } else if (turnOffset < -20 && turnOffset >= -90) {
      return {
        text: locale.slightLeft.replace('{deg}', String(Math.abs(Math.round(turnOffset)))),
        sub: `${distanceToTargetMeters} ${locale.metersShort} (~${stepsEst} ${locale.stepsLabel})`,
        action: 'slight-left',
        color: 'text-[#1F2A1F]',
        bgColor: 'bg-[#FAF8F2] border-[#E5E0D3]',
      };
    } else {
      return {
        text: locale.hardLeft.replace('{deg}', String(Math.abs(Math.round(turnOffset)))),
        sub: `${distanceToTargetMeters} ${locale.metersShort} (~${stepsEst} ${locale.stepsLabel})`,
        action: 'hard-left',
        color: 'text-[#D97706]',
        bgColor: 'bg-[#FFFBEB] border-[#FDE68A]',
      };
    }
  }, [distanceToTargetMeters, turnOffset, locale]);

  // Voice narration assist in selected language
  const speakGuidance = useCallback(
    (textToSpeak: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const voices = window.speechSynthesis.getVoices();
        const targetLocale = locale.speechLocale || 'hi-IN';
        const langVoice = voices.find(
          (v) => v.lang.toLowerCase().includes(language) || v.lang.includes(targetLocale) || v.lang.includes('IN')
        );
        if (langVoice) utterance.voice = langVoice;
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    },
    [language, locale]
  );

  // Periodic voice update when audio guidance is enabled
  useEffect(() => {
    if (!isAudioGuidanceOn || !liveUserPos) return;

    const now = Date.now();
    if (now - lastSpokenTime > 12000) {
      let speechMsg = '';
      if (distanceToTargetMeters <= 8) {
        speechMsg = `${activeTarget.name}: ${locale.arrived}`;
      } else {
        speechMsg = `${bearingCardinalData.audioHelp}. ${distanceToTargetMeters} ${locale.metersShort}.`;
      }
      speakGuidance(speechMsg);
      setLastSpokenTime(now);
    }
  }, [
    isAudioGuidanceOn,
    liveUserPos,
    distanceToTargetMeters,
    bearingCardinalData,
    activeTarget,
    lastSpokenTime,
    speakGuidance,
    locale,
  ]);

  const distanceFormatted = useMemo(() => {
    if (distanceToTargetMeters < 8) return `< 8${locale.metersShort}`;
    if (distanceToTargetMeters < 1000) return `${distanceToTargetMeters} ${locale.metersShort}`;
    return `${(distanceToTargetMeters / 1000).toFixed(2)} km`;
  }, [distanceToTargetMeters, locale]);

  const stepsEstimate = Math.round(distanceToTargetMeters / 0.75);

  // If completely closed by parent or user
  if (!isVisible) {
    return (
      <button
        type="button"
        id="reopen-floating-compass-btn"
        onClick={() => {
          setIsVisible(true);
          setIsMinimized(false);
        }}
        className="absolute top-3 right-3 z-[450] bg-[#FFFFFF] hover:bg-[#FAF8F2] text-[#2F5233] border border-[#E5E0D3] shadow-md px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer hover:scale-105"
        title="Open Floating Compass Navigator"
      >
        <Compass className="w-4 h-4 animate-spin-slow text-[#2F5233]" />
        <span>{locale.title}</span>
      </button>
    );
  }

  return (
    <div
      id="farmer-navigator-floating-overlay"
      className={`absolute z-[450] transition-all duration-300 select-none ${
        isMaximized
          ? 'inset-3 sm:inset-6 flex items-center justify-center p-2'
          : 'top-3 right-3 max-w-[310px] sm:max-w-[340px]'
      }`}
    >
      {/* Local Toast Alert */}
      {toastMsg && (
        <div className="absolute -top-10 right-0 z-50 bg-[#FFFFFF] text-[#1F2A1F] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#E5E0D3] shadow-md animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Sensor Hub Diagnostics & Calibration Modal */}
      {showSensorHubModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
          <div className="bg-[#FBFAF5] border border-[#E6E1D3] text-[#1E2B1F] rounded-[14px] max-w-md w-full p-5 shadow-[0_1px_3px_rgba(40,50,35,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EAF0EB] text-[#2F5233] border border-[#2F5233]/20">
                  <Activity className="w-5 h-5 text-[#2F5233]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F2A1F] flex items-center gap-2">
                    {locale.sensorHubTitle}
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">{locale.sensorHubSub}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSensorHubModal(false)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1F2A1F] hover:bg-[#FAF8F2] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active Sensor Badge */}
            <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] space-y-1.5">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                {locale.activeSensorStream}
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2F5233]" />
                <span className="text-xs font-bold text-[#2F5233]">
                  {isSensorActive ? locale.sensorActiveBadge : locale.touchDialBadge}
                </span>
              </div>
            </div>

            {/* Live Hardware Telemetry Matrix */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3]">
                <span className="text-[10px] text-[#6B7280] block font-semibold">Yaw / Heading</span>
                <span className="text-sm font-bold text-[#1F2A1F] font-mono">
                  {sensorRawAlpha !== null ? `${sensorRawAlpha}°` : `${activeHeading}°`}
                </span>
                <span className="text-[9px] text-[#6B7280] block">
                  {isAbsoluteCompass ? locale.trueNorth : locale.relativeHeading}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3]">
                <span className="text-[10px] text-[#6B7280] block font-semibold">Pitch (Beta)</span>
                <span className="text-sm font-bold text-[#1F2A1F] font-mono">
                  {sensorRawBeta !== null ? `${sensorRawBeta}°` : '0°'}
                </span>
                <span className="text-[9px] text-[#6B7280] block">Tilt Fwd/Back</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3]">
                <span className="text-[10px] text-[#6B7280] block font-semibold">Roll (Gamma)</span>
                <span className="text-sm font-bold text-[#1F2A1F] font-mono">
                  {sensorRawGamma !== null ? `${sensorRawGamma}°` : '0°'}
                </span>
                <span className="text-[9px] text-[#6B7280] block">Tilt Left/Right</span>
              </div>
            </div>

            {/* Device Specific Guidance */}
            <div className="space-y-2 text-xs text-[#6B7280] bg-[#FAF8F2] p-3 rounded-xl border border-[#E5E0D3]">
              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-[#2F5233] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1F2A1F] block">{locale.phoneSensors}</span>
                  <span className="text-[11px] text-[#6B7280] leading-relaxed">
                    {locale.phoneSensorsDesc}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-[#E5E0D3]">
                <Laptop className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1F2A1F] block">{locale.laptopSensors}</span>
                  <span className="text-[11px] text-[#6B7280] leading-relaxed">
                    {locale.laptopSensorsDesc}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons inside Hub */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  requestSensorPermission();
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#2F5233] hover:bg-[#244027] text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>{locale.connectSensors}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  initHardwareSensors();
                  showLocalToast(locale.recalibrate);
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#FFFFFF] hover:bg-[#FAF8F2] text-[#1F2A1F] flex items-center justify-center gap-2 border border-[#E5E0D3] cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4 text-[#6B7280]" />
                <span>{locale.recalibrate}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINIMIZED FLOATING COMPASS (Floating Action Button / Mini Circular Widget) */}
      {isMinimized ? (
        <div className="group relative flex items-center gap-2 bg-[#FFFFFF] text-[#1F2A1F] p-2 pl-2.5 rounded-full shadow-lg border border-[#E5E0D3] transition-all hover:scale-105 animate-in zoom-in-90">
          {/* Live Mini Rotating Compass Dial */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="relative w-11 h-11 rounded-full bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center cursor-pointer shadow-inner shrink-0"
            title={`${locale.title} - ${locale.maximize}`}
          >
            {/* Outer Cardinal Ring */}
            <div
              style={{ transform: `rotate(${-activeHeading}deg)` }}
              className="absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-100 ease-out"
            >
              <span className="absolute top-0.5 text-[8px] font-black text-[#C0392B]">N</span>
              <span className="absolute bottom-0.5 text-[8px] font-bold text-[#6B7280]">S</span>
              <span className="absolute right-0.5 text-[8px] font-bold text-[#6B7280]">E</span>
              <span className="absolute left-0.5 text-[8px] font-bold text-[#6B7280]">W</span>
            </div>

            {/* Target Direction Pointer Needle */}
            <div
              style={{ transform: `rotate(${relativeTargetAngle}deg)` }}
              className="absolute w-full h-full flex items-center justify-center transition-transform duration-100"
            >
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[12px] border-b-[#2F5233] -translate-y-2.5" />
            </div>

            <div className="w-1.5 h-1.5 rounded-full bg-[#2F5233] z-10" />
          </button>

          {/* Quick Info & Maximize Click Area */}
          <div
            onClick={() => setIsMinimized(false)}
            className="cursor-pointer pr-1 flex flex-col justify-center text-left min-w-[90px] max-w-[150px]"
          >
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-extrabold uppercase text-[#2F5233] bg-[#EAF0EB] px-1 py-0.5 rounded border border-[#2F5233]/20">
                {distanceFormatted}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#1F2A1F]">
                {activeHeading}° {headingCardinal}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#1F2A1F] truncate block mt-0.5">
              {simpleActionPrompt.text}
            </span>
          </div>

          {/* Expand Button */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg bg-[#EAF0EB] hover:bg-[#2F5233] text-[#2F5233] hover:text-white transition-colors cursor-pointer"
            title={locale.maximize}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* EXPANDED FLOATING HUD CARD */
        <div
          className={`bg-[#FFFFFF] text-[#1F2A1F] rounded-2xl shadow-xl border border-[#E5E0D3] p-3.5 sm:p-4 space-y-3 transition-all ${
            isMaximized ? 'max-w-lg w-full ring-2 ring-[#2F5233]' : 'w-full'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#EAF0EB] border border-[#2F5233]/20 flex items-center justify-center text-[#2F5233] shadow-xs">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-tight text-[#1F2A1F] block leading-none flex items-center gap-1.5">
                  <span>{locale.title}</span>
                  <span className="text-[9px] font-semibold text-[#6B7280] bg-[#FAF8F2] px-1 py-0.5 rounded border border-[#E5E0D3]">
                    HUD
                  </span>
                </span>
                <span className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-0.5 truncate max-w-[150px]">
                  {isSensorActive ? (
                    <span className="text-[#2F5233] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F5233]" />
                      {locale.sensorActiveBadge}
                    </span>
                  ) : (
                    <span className="text-[#6B7280]">{locale.manualDialHint}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Top Right Tool Icons */}
            <div className="flex items-center gap-1">
              {/* Language Selector Dropdown Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="p-1.5 rounded-lg text-xs bg-[#FAF8F2] hover:bg-[#E5E0D3]/50 text-[#1F2A1F] border border-[#E5E0D3] flex items-center gap-1 transition-colors cursor-pointer"
                  title={locale.languageSelect}
                >
                  <Globe className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span className="text-[10px] font-bold uppercase">{language}</span>
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-8 right-0 z-50 bg-[#FFFFFF] border border-[#E5E0D3] rounded-xl shadow-xl p-1.5 w-44 max-h-60 overflow-y-auto space-y-0.5">
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider px-2 py-1 block">
                      {locale.languageSelect}:
                    </span>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLanguage(l.code);
                          setShowLanguageDropdown(false);
                          showLocalToast(`Language: ${l.nativeName}`);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          language === l.code
                            ? 'bg-[#2F5233] text-white font-bold'
                            : 'text-[#1F2A1F] hover:bg-[#FAF8F2]'
                        }`}
                      >
                        <span>{l.nativeName}</span>
                        <span className="text-[10px] opacity-70 uppercase font-mono">{l.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sensor Diagnostics Modal Trigger */}
              <button
                type="button"
                onClick={() => setShowSensorHubModal(true)}
                className="p-1.5 rounded-lg text-xs bg-[#FAF8F2] hover:bg-[#E5E0D3]/50 text-[#6B7280] hover:text-[#1F2A1F] border border-[#E5E0D3] transition-colors cursor-pointer"
                title={locale.sensorHubTitle}
              >
                <Activity className="w-3.5 h-3.5 text-[#2F5233]" />
              </button>

              {/* Audio Voice Guidance Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !isAudioGuidanceOn;
                  setIsAudioGuidanceOn(nextState);
                  if (nextState) {
                    speakGuidance(`${locale.title}. ${locale.voiceGuidanceOn}`);
                    showLocalToast(locale.voiceGuidanceOn);
                  } else {
                    showLocalToast(locale.voiceGuidanceOff);
                  }
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                  isAudioGuidanceOn
                    ? 'bg-[#2F5233] text-white border-[#2F5233] animate-pulse'
                    : 'text-[#6B7280] hover:text-[#1F2A1F] bg-[#FAF8F2] border-[#E5E0D3]'
                }`}
                title={isAudioGuidanceOn ? locale.voiceGuidanceOff : locale.voiceGuidanceOn}
              >
                {isAudioGuidanceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Angle Controls Toggle */}
              <button
                type="button"
                onClick={() => setShowManualControls(!showManualControls)}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                  showManualControls
                    ? 'bg-[#EAF0EB] text-[#2F5233] border-[#2F5233]/40'
                    : 'text-[#6B7280] hover:text-[#1F2A1F] bg-[#FAF8F2] border-[#E5E0D3]'
                }`}
                title="Micro-Step Angle Adjuster"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Maximize / Normal Toggle */}
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1F2A1F] bg-[#FAF8F2] hover:bg-[#E5E0D3]/50 border border-[#E5E0D3] transition-colors cursor-pointer hidden sm:inline-flex"
                title={isMaximized ? locale.restore : locale.maximize}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Minimize to Floating FAB */}
              <button
                type="button"
                onClick={() => {
                  setIsMinimized(true);
                  setIsMaximized(false);
                }}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1F2A1F] bg-[#FAF8F2] hover:bg-[#E5E0D3]/50 border border-[#E5E0D3] transition-colors cursor-pointer"
                title={locale.minimize}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C0392B] bg-[#FAF8F2] hover:bg-[#FDF2F2] border border-[#E5E0D3] transition-colors cursor-pointer"
                  title={locale.close}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVisible(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#C0392B] bg-[#FAF8F2] hover:bg-[#FDF2F2] border border-[#E5E0D3] transition-colors cursor-pointer"
                  title={locale.close}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Target Destination Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Flag className="w-3 h-3 text-[#2F5233]" />
                {locale.destination}:
              </span>
              <span className="text-[#2F5233] font-mono text-[10px]">
                {navigationTargets.length} Points
              </span>
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E0D3] text-[#1F2A1F] text-xs rounded-xl px-2.5 py-1.5 font-medium focus:border-[#2F5233] outline-none cursor-pointer"
            >
              {navigationTargets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Instruction Banner */}
          <div
            className={`p-2.5 rounded-xl border transition-all ${simpleActionPrompt.bgColor} flex items-center justify-between gap-2`}
          >
            <div className="flex items-center gap-2">
              {distanceToTargetMeters <= 8 ? (
                <CheckCircle2 className="w-5 h-5 text-[#2F5233] shrink-0 animate-bounce" />
              ) : Math.abs(turnOffset) <= 20 ? (
                <ArrowUp className="w-5 h-5 text-[#2F5233] shrink-0 animate-pulse" />
              ) : turnOffset > 0 ? (
                <ArrowRight className="w-5 h-5 text-[#D97706] shrink-0" />
              ) : (
                <ArrowLeft className="w-5 h-5 text-[#6B7280] shrink-0" />
              )}
              <div>
                <span className={`text-xs font-black block leading-tight ${simpleActionPrompt.color}`}>
                  {simpleActionPrompt.text}
                </span>
                <span className="text-[10px] text-[#6B7280] font-medium">
                  {simpleActionPrompt.sub}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-[#1F2A1F] font-mono block">
                {distanceToTargetMeters > 0 ? `${distanceToTargetMeters}${locale.metersShort}` : '0m'}
              </span>
              <span className="text-[9px] text-[#6B7280] block font-semibold">
                ~{stepsEstimate} {locale.stepsLabel}
              </span>
            </div>
          </div>

          {/* Precision 360° Circular Dial */}
          <div className="flex flex-col items-center justify-center py-1">
            <div
              ref={dialRef}
              onPointerDown={handleDialPointerDown}
              onPointerMove={handleDialPointerMove}
              onPointerUp={handleDialPointerUp}
              onPointerCancel={handleDialPointerUp}
              className={`relative rounded-full border-2 border-[#E5E0D3] bg-[#FAF8F2] flex items-center justify-center shadow-inner overflow-hidden cursor-grab active:cursor-grabbing touch-none transition-all ${
                isMaximized ? 'w-52 h-52 sm:w-60 sm:h-60' : 'w-36 h-36 sm:w-40 sm:h-40'
              }`}
              title={locale.manualDialHint}
            >
              {/* Rotating Compass Rose */}
              <div
                style={{ transform: `rotate(${-activeHeading}deg)` }}
                className="absolute inset-0 rounded-full transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
              >
                {/* Degree Tick Ring */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ transform: `rotate(${i * 30}deg)` }}
                    className="absolute w-full h-full flex justify-center pt-1"
                  >
                    <div
                      className={`w-0.5 ${i % 3 === 0 ? 'h-3 bg-[#6B7280]' : 'h-1.5 bg-[#E5E0D3]'}`}
                    />
                  </div>
                ))}

                {/* Cardinal Points */}
                <div className="absolute top-1.5 font-black text-xs text-[#C0392B]">
                  N
                </div>
                <div className="absolute bottom-1.5 font-bold text-xs text-[#6B7280]">S</div>
                <div className="absolute right-2 font-bold text-xs text-[#6B7280]">E</div>
                <div className="absolute left-2 font-bold text-xs text-[#6B7280]">W</div>

                {/* Inter-cardinal Points */}
                <div className="absolute top-4 right-4 text-[9px] font-semibold text-[#9CA3AF]">NE</div>
                <div className="absolute bottom-4 right-4 text-[9px] font-semibold text-[#9CA3AF]">SE</div>
                <div className="absolute bottom-4 left-4 text-[9px] font-semibold text-[#9CA3AF]">SW</div>
                <div className="absolute top-4 left-4 text-[9px] font-semibold text-[#9CA3AF]">NW</div>
              </div>

              {/* Dynamic Target Needle */}
              <div
                style={{ transform: `rotate(${relativeTargetAngle}deg)` }}
                className="absolute w-full h-full flex items-center justify-center transition-transform duration-100 ease-out pointer-events-none z-10"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute top-3 flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[20px] border-b-[#2F5233]" />
                    <div className="w-1.5 h-6 bg-linear-to-b from-[#2F5233] to-transparent" />
                  </div>
                </div>
              </div>

              {/* Center Info Core */}
              <div className="relative z-20 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#FFFFFF] border border-[#E5E0D3] flex flex-col items-center justify-center shadow-xs pointer-events-none">
                <span className="text-[11px] font-black text-[#2F5233] font-mono leading-none">
                  {activeHeading}°
                </span>
                <span className="text-[10px] font-bold text-[#1F2A1F] mt-0.5">
                  {headingCardinal}
                </span>
                <span className="text-[8px] text-[#6B7280] font-mono mt-0.5">
                  Target: {bearingToTarget}°
                </span>
              </div>
            </div>

            {/* Heading Subtext */}
            <div className="flex items-center justify-between w-full text-[10px] text-[#6B7280] px-1 mt-2">
              <span className="font-semibold text-[#1F2A1F]">
                {bearingCardinalData.name} ({bearingToTarget}°)
              </span>
              <span className="font-mono text-[#2F5233]">
                {isSensorActive ? locale.sensorActiveBadge : locale.touchDialBadge}
              </span>
            </div>
          </div>

          {/* Micro-Adjustment Angle Sliders */}
          {showManualControls && (
            <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#1F2A1F]">
                <span>Manual Heading: {manualHeading}°</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStepRotate(-15)}
                    className="p-1 rounded bg-[#FFFFFF] hover:bg-[#E5E0D3]/50 text-[#1F2A1F] border border-[#E5E0D3] cursor-pointer"
                    title="-15°"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepRotate(15)}
                    className="p-1 rounded bg-[#FFFFFF] hover:bg-[#E5E0D3]/50 text-[#1F2A1F] border border-[#E5E0D3] cursor-pointer"
                    title="+15°"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Cardinal Presets */}
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                {[
                  { name: 'N (0°)', val: 0 },
                  { name: 'E (90°)', val: 90 },
                  { name: 'S (180°)', val: 180 },
                  { name: 'W (270°)', val: 270 },
                ].map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => {
                      setIsSensorActive(false);
                      setActiveSensorSource('manual-dial');
                      setManualHeading(c.val);
                    }}
                    className={`py-1 rounded border transition-colors cursor-pointer ${
                      manualHeading === c.val && !isSensorActive
                        ? 'bg-[#2F5233] border-[#2F5233] text-white font-black'
                        : 'bg-[#FFFFFF] border-[#E5E0D3] text-[#1F2A1F] hover:bg-[#FAF8F2]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Grid: GPS Pinpoint + Continuous GPS + Walk Simulator */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {/* 1-Tap My Current Location */}
            <button
              type="button"
              onClick={requestCurrentGps}
              disabled={isLocatingSingle}
              className="p-2 rounded-xl text-[11px] font-bold bg-[#FAF8F2] hover:bg-[#E5E0D3]/50 text-[#1F2A1F] border border-[#E5E0D3] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
              title="Get current GPS pinpoint"
            >
              <LocateFixed className={`w-4 h-4 ${isLocatingSingle ? 'text-[#2F5233] animate-spin' : 'text-[#2F5233]'}`} />
              <span className="leading-tight text-center">{locale.pinpointGps}</span>
            </button>

            {/* Continuous Live GPS Watcher */}
            <button
              type="button"
              onClick={toggleGpsWatch}
              className={`p-2 rounded-xl text-[11px] font-bold border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                isWatchingGps
                  ? 'bg-[#EAF0EB] text-[#2F5233] border-[#2F5233]'
                  : 'bg-[#FAF8F2] hover:bg-[#E5E0D3]/50 text-[#1F2A1F] border-[#E5E0D3]'
              }`}
              title="Toggle continuous high-accuracy live GPS navigation"
            >
              <Radio className={`w-4 h-4 ${isWatchingGps ? 'text-[#2F5233]' : 'text-[#6B7280]'}`} />
              <span className="leading-tight text-center">
                {isWatchingGps ? locale.gpsTrackStop : locale.gpsTrackLive}
              </span>
            </button>

            {/* Walk Simulation */}
            <button
              type="button"
              onClick={toggleWalkSimulation}
              className={`p-2 rounded-xl text-[11px] font-bold border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                isSimulatingWalk
                  ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                  : 'bg-[#FAF8F2] hover:bg-[#E5E0D3]/50 text-[#1F2A1F] border-[#E5E0D3]'
              }`}
              title="Simulate walking step-by-step to the selected target"
            >
              {isSimulatingWalk ? (
                <Square className="w-4 h-4 text-[#D97706]" />
              ) : (
                <Footprints className="w-4 h-4 text-[#2F5233]" />
              )}
              <span className="leading-tight text-center">
                {isSimulatingWalk ? locale.walkSimStopBtn : locale.walkSimBtn}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
