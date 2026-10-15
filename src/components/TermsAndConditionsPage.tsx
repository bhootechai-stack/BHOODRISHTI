import React, { useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Printer,
  Clock,
  Radio,
  DollarSign,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface TermsAndConditionsPageProps {
  onBackToApp: () => void;
  onNavigateToPrivacy?: () => void;
}

export const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({
  onBackToApp,
  onNavigateToPrivacy,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Terms & Conditions — BhooTech AI (नियम एवं शर्तें)';
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1F2A1F] flex flex-col font-sans antialiased selection:bg-[#2F5233] selection:text-[#F7F4EC]">
      {/* Top Header / Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E0D3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToApp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#1F2A1F] text-xs font-semibold border border-[#E5E0D3] transition-colors cursor-pointer"
            aria-label="Back to BhooTech AI"
          >
            <ArrowLeft className="w-4 h-4 text-[#6B7280]" />
            <span>Back to Dashboard</span>
          </button>
          <div className="hidden sm:block h-5 w-px bg-[#E5E0D3]" />
          <BrandLogo size="sm" showTagline={false} />
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToPrivacy && (
            <button
              type="button"
              onClick={onNavigateToPrivacy}
              className="text-xs text-[#6B7280] hover:text-[#1F2A1F] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer hidden md:inline-block"
            >
              Privacy Policy
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#1F2A1F] text-xs font-semibold border border-[#E5E0D3] transition-colors cursor-pointer print:hidden"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#6B7280]" />
            <span className="hidden sm:inline">Print Document</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Document Header */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5E0D3] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FAF8F2] border border-[#E5E0D3] text-[#1F2A1F] text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-[#2F5233]" />
            <span>Legal Agreement • उपयोग की नियम एवं शर्तें</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1F2A1F]">
            Terms & Conditions of Service
          </h1>

          <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-3xl">
            Welcome to <strong>BhooTech AI</strong>. These Terms and Conditions govern your access to and use of the BhooTech AI platform, including satellite vegetative monitoring, Leaf Doctor pathology diagnostics, microclimate risk forecasting, APMC mandi feeds, and the Smart Sensor subscription service.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] pt-2 border-t border-[#E5E0D3]">
            <span><strong>Effective Date:</strong> January 1, 2026</span>
            <span>•</span>
            <span className="text-[#1F2A1F] font-semibold">Applicable Laws: Information Technology Act, 2000 & Consumer Protection Act, 2019 (India)</span>
          </div>
        </div>

        {/* Advisory Disclaimer Callout */}
        <div className="bg-[#FFFFFF] border-l-4 border-[#E5E0D3] p-5 rounded-r-2xl border-y border-r border-[#E5E0D3] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#1F2A1F] text-sm">
            <AlertTriangle className="w-5 h-5 text-[#6B7280] shrink-0" />
            <span>Important Agronomy Advisory Disclaimer (महत्वपूर्ण कृषि सलाह अस्वीकरण)</span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            All satellite index estimates (NDVI, NDRE, NDWI), Leaf Doctor disease diagnoses, chemical dosage calculations, irrigation wait times, and weather risk scores provided by BhooTech AI are <strong className="text-[#1F2A1F]">automated algorithmic and satellite-assisted advisory suggestions</strong>. They do <strong className="text-[#1F2A1F]">NOT</strong> constitute guaranteed agronomic outcomes, crop insurance assessments, or absolute biological guarantees. 
            Farmers are strongly encouraged to cross-verify all critical chemical sprays, pesticide treatments, and major irrigation schedules with their local <strong className="text-[#1F2A1F]">Krishi Vigyan Kendra (KVK)</strong>, state agriculture extension officers, or certified agronomists.
          </p>
        </div>

        {/* Section 1: Acceptance of Terms & Eligibility */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              1
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Acceptance of Terms & Farmer Eligibility
              </h2>
              <p className="text-xs text-[#6B7280]">नियमों की स्वीकृति एवं पात्रता</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            By creating an account, mapping a farm boundary, uploading crop photos, or subscribing to smart sensors, you confirm that:
          </p>

          <ul className="space-y-2 text-xs sm:text-sm text-[#6B7280]">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2F5233] shrink-0 mt-0.5" />
              <span>You are at least 18 years of age and legally competent to enter into a binding agreement under the Indian Contract Act, 1872.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2F5233] shrink-0 mt-0.5" />
              <span>You either own, lease, cultivate, or have legal authority to manage the agricultural land parcels you map or monitor through the platform.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2F5233] shrink-0 mt-0.5" />
              <span>The mobile phone number provided during sign-up is registered in your name or under your active custody for receiving OTP codes.</span>
            </li>
          </ul>
        </section>

        {/* Section 2: Acceptable Use & Conduct */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              2
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Acceptable Use of BhooTech AI Platform
              </h2>
              <p className="text-xs text-[#6B7280]">स्वीकार्य उपयोग और आचरण</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            The platform is intended exclusively for genuine agricultural planning, farm parcel monitoring, agronomic decision support, and market price transparency. You agree <strong className="text-[#1F2A1F]">NOT</strong> to:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#6B7280] pt-1">
            <div className="p-3 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="font-bold text-[#1F2A1F]">No Automated Scraping</div>
              <p>You may not deploy automated bots, spiders, or scrapers to extract Copernicus satellite raster tiles or APMC mandi price data.</p>
            </div>

            <div className="p-3 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="font-bold text-[#1F2A1F]">No Fictitious Boundaries</div>
              <p>You may not maliciously submit fraudulent land coordinates to harass third-party landholders or falsify crop acreage reports.</p>
            </div>

            <div className="p-3 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="font-bold text-[#1F2A1F]">No Hardware Tampering</div>
              <p>Subscribers to hardware soil sensors agree not to tamper with solar cells, LoRaWAN transmitters, or firmware calibration.</p>
            </div>

            <div className="p-3 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="font-bold text-[#1F2A1F]">No Reverse-Engineering</div>
              <p>You may not decompile, reverse-engineer, or attempt to extract source algorithms from the BhooTech AI advisory engine.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Diagnostic Accuracy & Agro-Advisory Limits */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              3
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Agronomic Recommendations & Diagnostic Scope
              </h2>
              <p className="text-xs text-[#6B7280]">रोग निदान एवं फसल सलाह की सीमाएं</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            <p>
              <strong className="text-[#1F2A1F]">Satellite Resolution & Timing:</strong> Sentinel-2 multispectral imagery is delivered via the European Space Agency Copernicus Constellation at 10-meter spatial resolution with a 5-day orbital revisit cycle. Cloud cover, heavy fog, dust storms, or atmospheric interference may delay fresh image acquisition.
            </p>

            <p>
              <strong className="text-[#1F2A1F]">Leaf Doctor Pathology Engine:</strong> Diagnoses cross-reference non-copyrighted agricultural extension bulletins and ICAR benchmark datasets. Diagnostic confidence percentages reflect visual pattern match correlation and should be corroborated with in-field physical stem and root inspection.
            </p>

            <p>
              <strong className="text-[#1F2A1F]">Chemical & Pesticide Dosages:</strong> Recommended chemical brand names, active ingredients, and dilution rates are derived from standardized Central Insecticides Board & Registration Committee (CIBRC) and university package-of-practices guidelines. <em>Always read the manufacturer product label and follow prescribed protective clothing and withholding period protocols before spraying.</em>
            </p>
          </div>
        </section>

        {/* Section 4: Smart Sensor Subscription Terms */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              4
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Smart Sensor Subscription Terms & Pricing
              </h2>
              <p className="text-xs text-[#6B7280]">स्मार्ट सेंसर सदस्यता एवं भुगतान नियम</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            <div className="p-3.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <DollarSign className="w-4 h-4 text-[#6B7280]" />
                <span>Subscription Billing & Pricing Computation</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Subscription fees are transparently calculated based on the farmer's confirmed field acreage and chosen tier (Pay-Per-Acre, Basic Monitoring, Automated Solenoid Control, or Enterprise Cooperative). Pricing includes base sensor deployment plus acreage-adjusted maintenance.
              </p>
            </div>

            <div className="p-3.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <Radio className="w-4 h-4 text-[#6B7280]" />
                <span>Hardware Maintenance & Telemetry Connectivity</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Soil capacitance and moisture sensors rely on cellular GSM or local LoRaWAN gateways. In areas with intermittent cellular tower coverage, telemetry updates will buffer locally and transmit once signal is restored.
              </p>
            </div>

            <div className="p-3.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <Clock className="w-4 h-4 text-[#6B7280]" />
                <span>Cancellation & Refund Policy</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Farmers may cancel any recurring subscription tier at any time through the Smart Sensor modal without penalty. Cancellations take effect at the end of the current billing cycle. Unused prorated days for hardware service may be refunded within 14 calendar days upon sensor return.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Limitation of Liability */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              5
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Limitation of Liability (दायित्व की सीमा)
              </h2>
              <p className="text-xs text-[#6B7280]">Comprehensive Disclaimer of Damages</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            <p>
              To the fullest extent permissible by applicable Indian law, <strong className="text-[#1F2A1F]">BhooTech AI, its founders, engineers, and data contributors shall not be held liable for:</strong>
            </p>

            <ul className="space-y-1.5 list-disc pl-5 text-xs text-[#6B7280]">
              <li>Any harvest crop loss, reduced yield, blight escalation, or root rot resulting from reliance on automated irrigation wait times or sensor threshold suggestions.</li>
              <li>Adverse microclimate events (unseasonal hailstorms, sudden cloudbursts, severe frost, or prolonged droughts) exceeding Open-Meteo or IMD forecast windows.</li>
              <li>Discrepancies between forecasted Agmarknet APMC mandi prices and actual spot auction rates negotiated at physical mandi yards.</li>
              <li>Temporary satellite downlink outages or CDSE Copernicus Sentinel API maintenance downtime outside of our operational control.</li>
            </ul>

            <p className="pt-2 text-xs text-[#6B7280]">
              In any event, our total cumulative liability to you for any proven claims arising from paid sensor services shall not exceed the total subscription fees actually paid by you in the 3 months preceding the event.
            </p>
          </div>
        </section>

        {/* Section 6: Governing Law & Jurisdiction */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              6
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Governing Law & Dispute Resolution
              </h2>
              <p className="text-xs text-[#6B7280]">लागू कानून और न्यायिक अधिकार क्षेत्र</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            These Terms & Conditions shall be governed by, construed, and enforced in accordance with the laws of the Republic of India. Any disputes, claims, or controversies arising out of or in connection with the platform shall be subject to the exclusive jurisdiction of the competent courts in New Delhi or the farmer's respective State High Court.
          </p>
        </section>

        {/* Back and Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E0D3] print:hidden">
          <button
            type="button"
            onClick={onBackToApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2F5233] hover:bg-[#6f8c75] text-[#F7F4EC] font-bold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to BhooTech AI Dashboard</span>
          </button>

          {onNavigateToPrivacy && (
            <button
              type="button"
              onClick={onNavigateToPrivacy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#1F2A1F] font-semibold text-xs border border-[#E5E0D3] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#6B7280]" />
              <span>Read Privacy Policy</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F7F4EC] border-t border-[#E5E0D3] py-6 px-4 text-center text-xs text-[#6B7280] print:hidden">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 BhooTech AI. All rights reserved. Built for Indian Agriculture.</p>
          <div className="flex items-center gap-4 text-[#6B7280]">
            {onNavigateToPrivacy ? (
              <button
                type="button"
                onClick={onNavigateToPrivacy}
                className="hover:text-[#1F2A1F] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
            ) : (
              <span>Privacy Policy</span>
            )}
            <span>•</span>
            <span className="text-[#1F2A1F] font-semibold">Terms & Conditions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
