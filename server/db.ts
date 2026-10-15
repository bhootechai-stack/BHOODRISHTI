import fs from 'fs';
import path from 'path';
import { getDeterministicFarmerUuid, verifyPassword, hashPassword } from './supabase';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  address?: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  phone: string; // 10 digit mobile number
  dob: string; // YYYY-MM-DD
  password?: string; // Farmer-set password
  name: string;
  kisanId: string;
  state: string;
  district?: string;
  city?: string;
  tehsil?: string;
  patwarCircle?: string;
  village?: string;
  primaryCrop: string;
  totalLandAcres: number;
  createdAt: string;
  lastLogin: string;
  location?: UserLocation;
}

export interface SavedFarm {
  id: string;
  userId: string; // Attached to specific user for isolated access
  name: string;
  farmerName: string;
  state: string;
  district?: string;
  tehsil?: string;
  patwarCircle?: string;
  crop: string;
  areaAcres: number;
  areaSqm: number;
  healthScore: number;
  points: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
  createdAt: string;
  notes?: string;
}

export interface DiagnosticLog {
  id: string;
  userId: string;
  farmId?: string;
  crop: string;
  diseaseName: string;
  severity: string;
  confidence: number;
  symptoms: string[];
  remedyType: 'chemical' | 'organic' | 'both';
  createdAt: string;
}

export interface AdvisoryLog {
  id: string;
  userId: string;
  farmName: string;
  crop: string;
  state: string;
  areaAcres: number;
  summary: string;
  irrigationSchedule: string;
  nitrogenRecommendation: string;
  createdAt: string;
}

export interface LandReport {
  id: string;
  userId: string;
  farmId?: string;
  farmName: string;
  farmerName: string;
  kisanId?: string;
  state: string;
  district?: string;
  tehsil?: string;
  crop: string;
  areaAcres: number;
  areaSqm: number;
  healthScore: number;
  ndreScore?: number;
  ndwiScore?: number;
  soilN?: number;
  soilP?: number;
  soilK?: number;
  soilPh?: number;
  soilMoisture?: number;
  temperature?: number;
  humidity?: number;
  rainChance?: number;
  riskLevel?: string;
  advisorySummary?: string;
  irrigationSchedule?: string;
  fertilizerRecommendation?: string;
  pestRisk?: string;
  actionChecklist?: string[];
  points?: { lat: number; lng: number }[];
  center?: { lat: number; lng: number };
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserProfile[];
  farms: SavedFarm[];
  diagnostics: DiagnosticLog[];
  advisories: AdvisoryLog[];
  reports?: LandReport[];
  meta: {
    version: string;
    lastUpdated: string;
    totalSyncCount: number;
  };
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'bhootech_db.json');

const INITIAL_DEMO_DATA: DatabaseSchema = {
  users: [
    {
      id: 'user-9876543210',
      phone: '9876543210',
      dob: '1985-05-15',
      name: 'Sardar Gurpreet Singh',
      kisanId: 'PMK-PB-84920',
      state: 'Punjab',
      district: 'Amritsar',
      village: 'Jandiala Guru',
      primaryCrop: 'Wheat (HD-2967)',
      totalLandAcres: 6.2,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'user-9822012345',
      phone: '9822012345',
      dob: '1990-08-22',
      name: 'Dnyaneshwar Patil',
      kisanId: 'PMK-MH-33104',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Dindori',
      primaryCrop: 'Grapes (Thompson Seedless)',
      totalLandAcres: 4.5,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      lastLogin: new Date().toISOString(),
    },
  ],
  farms: [
    {
      id: 'farm-pb-01',
      userId: 'user-9876543210',
      name: 'Amritsar Golden Wheat Plot 4B',
      farmerName: 'Sardar Gurpreet Singh',
      state: 'Punjab',
      district: 'Amritsar',
      crop: 'Wheat (HD-2967)',
      areaAcres: 3.8,
      areaSqm: 15378,
      healthScore: 88,
      center: { lat: 31.634, lng: 74.8723 },
      points: [
        { lat: 31.636, lng: 74.8703 },
        { lat: 31.636, lng: 74.8743 },
        { lat: 31.632, lng: 74.8743 },
        { lat: 31.632, lng: 74.8703 },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      notes: 'Optimum vegetative stage. Zero tillage adopted this Rabi season.',
    },
    {
      id: 'farm-pb-02',
      userId: 'user-9876543210',
      name: 'Canal Ridge Mustard Seed Block',
      farmerName: 'Sardar Gurpreet Singh',
      state: 'Punjab',
      district: 'Amritsar',
      crop: 'Mustard (Giriraj)',
      areaAcres: 2.4,
      areaSqm: 9712,
      healthScore: 91,
      center: { lat: 31.641, lng: 74.881 },
      points: [
        { lat: 31.643, lng: 74.879 },
        { lat: 31.643, lng: 74.883 },
        { lat: 31.639, lng: 74.883 },
        { lat: 31.639, lng: 74.879 },
      ],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      notes: 'Flowering stage. Soil moisture optimal.',
    },
    {
      id: 'farm-mh-02',
      userId: 'user-9822012345',
      name: 'Nashik Sahyadri Grape Vineyard',
      farmerName: 'Dnyaneshwar Patil',
      state: 'Maharashtra',
      district: 'Nashik',
      crop: 'Grapes (Thompson Seedless)',
      areaAcres: 2.4,
      areaSqm: 9712,
      healthScore: 76,
      center: { lat: 19.9975, lng: 73.7898 },
      points: [
        { lat: 19.9995, lng: 73.7878 },
        { lat: 19.9995, lng: 73.7918 },
        { lat: 19.9955, lng: 73.7918 },
        { lat: 19.9955, lng: 73.7878 },
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      notes: 'Micro-sprinkler fertigation installed. Monitoring for downy mildew.',
    },
  ],
  diagnostics: [
    {
      id: 'diag-001',
      userId: 'user-9876543210',
      farmId: 'farm-pb-01',
      crop: 'Wheat',
      diseaseName: 'Yellow Stripe Rust (Puccinia striiformis)',
      severity: 'Medium',
      confidence: 94.2,
      symptoms: [
        'Parallel bright yellow pustules along leaf veins',
        'Chlorotic striping on upper flag leaves',
      ],
      remedyType: 'both',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  advisories: [
    {
      id: 'adv-001',
      userId: 'user-9876543210',
      farmName: 'Amritsar Golden Wheat Plot 4B',
      crop: 'Wheat',
      state: 'Punjab',
      areaAcres: 3.8,
      summary: '88% canopy vigor detected via NDRE satellite index.',
      irrigationSchedule: '30mm evening sprinkler run recommended.',
      nitrogenRecommendation: 'Split-dose 22 kg/acre Urea with zinc sulphate foliar booster.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  meta: {
    version: '1.2.0-user-auth',
    lastUpdated: new Date().toISOString(),
    totalSyncCount: 3,
  },
};

export class DatabaseEngine {
  private static ensureDbExists() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DEMO_DATA, null, 2), 'utf-8');
    }
  }

  public static read(): DatabaseSchema {
    this.ensureDbExists();
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.users) {
        parsed.users = INITIAL_DEMO_DATA.users;
        this.write(parsed);
      }
      return parsed;
    } catch (e) {
      console.error('Error reading database file, resetting to demo data:', e);
      this.write(INITIAL_DEMO_DATA);
      return INITIAL_DEMO_DATA;
    }
  }

  public static write(data: DatabaseSchema): boolean {
    this.ensureDbExists();
    try {
      data.meta.lastUpdated = new Date().toISOString();
      data.meta.totalSyncCount = (data.meta.totalSyncCount || 0) + 1;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('Error writing to database:', e);
      return false;
    }
  }

  // User Auth & Profiles
  public static normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(-10);
  }

  public static normalizeDob(dob: string): string {
    return dob.trim().replace(/\//g, '-');
  }

  public static findUserByPhone(phone: string): UserProfile | undefined {
    const cleanPhone = this.normalizePhone(phone);
    const db = this.read();
    return db.users.find((u) => this.normalizePhone(u.phone) === cleanPhone);
  }

  public static getUserById(userId: string): UserProfile | undefined {
    const db = this.read();
    return db.users.find((u) => u.id === userId);
  }

  public static authenticate(identifier: string, secret: string): UserProfile | null {
    if (!identifier || !secret) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = this.normalizePhone(identifier);
    const cleanSecret = secret.trim();
    const cleanDob = this.normalizeDob(secret);
    const db = this.read();

    const user = db.users.find((u) => {
      const matchPhone = cleanPhone.length === 10 && this.normalizePhone(u.phone) === cleanPhone;
      const matchKisan = u.kisanId && u.kisanId.toLowerCase() === cleanId;
      const matchId = u.id && u.id.toLowerCase() === cleanId;
      const isUserMatch = matchPhone || matchKisan || matchId;

      if (!isUserMatch) return false;

      // Secure verification: checks hashed password or plaintext/DOB
      return verifyPassword(cleanSecret, u.password) || verifyPassword(cleanSecret, u.dob);
    });

    if (user) {
      user.lastLogin = new Date().toISOString();
      this.write(db);
      return user;
    }
    return null;
  }

  public static registerUser(data: {
    phone: string;
    dob: string;
    password?: string;
    name: string;
    state: string;
    district?: string;
    city?: string;
    tehsil?: string;
    patwarCircle?: string;
    village?: string;
    primaryCrop?: string;
    totalLandAcres?: number;
    location?: UserLocation;
  }): { user?: UserProfile; error?: string } {
    const cleanPhone = this.normalizePhone(data.phone);
    const cleanDob = this.normalizeDob(data.dob);
    const setPassword = data.password ? data.password.trim() : cleanDob;

    if (cleanPhone.length < 10) {
      return { error: 'Please enter a valid 10-digit mobile number' };
    }
    if (!cleanDob || cleanDob.length < 6) {
      return { error: 'Please provide a valid Date of Birth (DOB)' };
    }
    if (!data.name.trim()) {
      return { error: 'Farmer Name is required' };
    }

    const db = this.read();
    const existing = db.users.find((u) => this.normalizePhone(u.phone) === cleanPhone);
    if (existing) {
      return { error: 'A farmer profile is already registered with this mobile number. Please log in.' };
    }

    const stateCode = (data.state || 'IN').substring(0, 2).toUpperCase();
    const randomKisanNum = Math.floor(10000 + Math.random() * 90000);
    const kisanId = `PMK-${stateCode}-${randomKisanNum}`;

    // Uniform RFC 4122 UUID matching Supabase public.users.id
    const farmerUuid = getDeterministicFarmerUuid(undefined, cleanPhone);

    const newUser: UserProfile = {
      id: farmerUuid,
      phone: cleanPhone,
      dob: cleanDob,
      password: setPassword ? hashPassword(setPassword) : undefined,
      name: data.name.trim(),
      kisanId,
      state: data.state || 'Punjab',
      district: data.district || '',
      city: data.city || '',
      tehsil: data.tehsil || '',
      patwarCircle: data.patwarCircle || '',
      village: data.village || '',
      primaryCrop: data.primaryCrop || 'Wheat',
      totalLandAcres: Number(data.totalLandAcres) || 2.5,
      location: data.location,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    db.users.push(newUser);
    this.write(db);
    return { user: newUser };
  }

  public static updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const db = this.read();
    const cleanPhone = updates.phone ? this.normalizePhone(updates.phone) : undefined;
    const targetUuid = getDeterministicFarmerUuid(userId, cleanPhone);

    const userIndex = db.users.findIndex((u) => u.id === userId || u.id === targetUuid || (cleanPhone && this.normalizePhone(u.phone) === cleanPhone));
    if (userIndex === -1) return null;

    const user = db.users[userIndex];
    if (updates.name && updates.name.trim()) user.name = updates.name.trim();
    if (updates.phone && updates.phone.trim()) user.phone = this.normalizePhone(updates.phone);
    if (updates.dob && updates.dob.trim()) user.dob = this.normalizeDob(updates.dob);
    if (updates.password && updates.password.trim()) user.password = hashPassword(updates.password.trim());
    if (updates.state && updates.state.trim()) user.state = updates.state;
    if (updates.district !== undefined && updates.district !== null) user.district = updates.district;
    if (updates.city !== undefined && updates.city !== null) user.city = updates.city;
    if (updates.tehsil !== undefined && updates.tehsil !== null) user.tehsil = updates.tehsil;
    if (updates.patwarCircle !== undefined && updates.patwarCircle !== null) user.patwarCircle = updates.patwarCircle;
    if (updates.village !== undefined && updates.village !== null) user.village = updates.village;
    if (updates.primaryCrop !== undefined && updates.primaryCrop !== null) user.primaryCrop = updates.primaryCrop;
    if (updates.totalLandAcres !== undefined && updates.totalLandAcres !== null) user.totalLandAcres = Number(updates.totalLandAcres);
    if (updates.location !== undefined && updates.location !== null) user.location = updates.location;
    user.lastLogin = new Date().toISOString();

    db.users[userIndex] = user;
    this.write(db);
    return user;
  }

  public static upsertUser(user: UserProfile): UserProfile {
    const db = this.read();
    const cleanPhone = this.normalizePhone(user.phone);
    const targetUuid = getDeterministicFarmerUuid(user.id, cleanPhone);
    const existingIndex = db.users.findIndex(
      (u) => u.id === user.id || u.id === targetUuid || this.normalizePhone(u.phone) === cleanPhone
    );

    const fullUser: UserProfile = {
      ...user,
      id: targetUuid,
      phone: cleanPhone,
    };

    if (existingIndex >= 0) {
      const existing = db.users[existingIndex];
      db.users[existingIndex] = {
        ...existing,
        ...fullUser,
        name: (fullUser.name && fullUser.name.trim()) || existing.name,
        kisanId: fullUser.kisanId || existing.kisanId,
        state: fullUser.state || existing.state,
        district: fullUser.district !== undefined && fullUser.district !== null ? fullUser.district : existing.district,
        city: fullUser.city !== undefined && fullUser.city !== null ? fullUser.city : existing.city,
        tehsil: fullUser.tehsil !== undefined && fullUser.tehsil !== null ? fullUser.tehsil : existing.tehsil,
        patwarCircle: fullUser.patwarCircle !== undefined && fullUser.patwarCircle !== null ? fullUser.patwarCircle : existing.patwarCircle,
        village: fullUser.village !== undefined && fullUser.village !== null ? fullUser.village : existing.village,
        primaryCrop: fullUser.primaryCrop !== undefined && fullUser.primaryCrop !== null ? fullUser.primaryCrop : existing.primaryCrop,
        totalLandAcres: fullUser.totalLandAcres !== undefined && fullUser.totalLandAcres !== null ? fullUser.totalLandAcres : existing.totalLandAcres,
        location: fullUser.location !== undefined && fullUser.location !== null ? fullUser.location : existing.location,
        lastLogin: new Date().toISOString(),
      };
      this.write(db);
      return db.users[existingIndex];
    } else {
      db.users.push(fullUser);
      this.write(db);
      return fullUser;
    }
  }

  // User-scoped Farm Queries
  public static getFarms(userId?: string): SavedFarm[] {
    const db = this.read();
    if (!userId) return db.farms;
    return db.farms.filter((f) => f.userId === userId);
  }

  public static addFarm(farm: Omit<SavedFarm, 'id' | 'createdAt'>): SavedFarm {
    const db = this.read();
    const isNodeCrypto = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
    const newId = isNodeCrypto
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

    const newFarm: SavedFarm = {
      ...farm,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    db.farms.unshift(newFarm);
    this.write(db);
    return newFarm;
  }

  public static deleteFarm(id: string, userId?: string): boolean {
    const db = this.read();
    const initialLen = db.farms.length;
    db.farms = db.farms.filter((f) => {
      if (f.id !== id) return true;
      if (userId && f.userId !== userId) return true; // prevent deleting other users' farms
      return false;
    });
    if (db.farms.length !== initialLen) {
      this.write(db);
      return true;
    }
    return false;
  }

  // User-scoped Diagnostics
  public static getDiagnostics(userId?: string): DiagnosticLog[] {
    const db = this.read();
    if (!userId) return db.diagnostics;
    return db.diagnostics.filter((d) => d.userId === userId);
  }

  public static addDiagnostic(diag: Omit<DiagnosticLog, 'id' | 'createdAt'>): DiagnosticLog {
    const db = this.read();
    const newDiag: DiagnosticLog = {
      ...diag,
      id: `diag-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    db.diagnostics.unshift(newDiag);
    this.write(db);
    return newDiag;
  }

  // Advisories CRUD
  public static getAdvisories(userId?: string): AdvisoryLog[] {
    const db = this.read();
    if (!userId) return db.advisories;
    return db.advisories.filter((a) => a.userId === userId);
  }

  public static addAdvisory(adv: Omit<AdvisoryLog, 'id' | 'createdAt'>): AdvisoryLog {
    const db = this.read();
    const newAdv: AdvisoryLog = {
      ...adv,
      id: `adv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    db.advisories.unshift(newAdv);
    this.write(db);
    return newAdv;
  }

  // Land Reports CRUD
  public static getReports(userId?: string): LandReport[] {
    const db = this.read();
    if (!db.reports) db.reports = [];
    if (!userId) return db.reports;
    return db.reports.filter((r) => r.userId === userId);
  }

  public static addReport(report: Omit<LandReport, 'id' | 'createdAt'>): LandReport {
    const db = this.read();
    if (!db.reports) db.reports = [];
    const newReport: LandReport = {
      ...report,
      id: `report-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    db.reports.unshift(newReport);
    this.write(db);
    return newReport;
  }

  public static getStats(userId?: string) {
    const db = this.read();
    const userFarms = userId ? db.farms.filter((f) => f.userId === userId) : db.farms;
    const userDiags = userId ? db.diagnostics.filter((d) => d.userId === userId) : db.diagnostics;
    const totalAreaAcres = userFarms.reduce((acc, f) => acc + (f.areaAcres || 0), 0);

    return {
      totalFarms: userFarms.length,
      totalAreaAcres: Number(totalAreaAcres.toFixed(1)),
      totalDiagnostics: userDiags.length,
      totalAdvisories: db.advisories.length,
      lastSync: db.meta.lastUpdated,
      dbStatus: 'CONNECTED (Isolated User Sessions)',
      storageEngine: 'Node.js Express + File/JSON Database',
    };
  }

  public static resetToDemo(): DatabaseSchema {
    this.write(INITIAL_DEMO_DATA);
    return INITIAL_DEMO_DATA;
  }
}
