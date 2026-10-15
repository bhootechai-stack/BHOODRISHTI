import React, { useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  Trash2,
  Clock,
  ArrowLeft,
  FileText,
  MapPin,
  Camera,
  Smartphone,
  CheckCircle2,
  Mail,
  Printer,
  Scale,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface PrivacyPolicyPageProps {
  onBackToApp: () => void;
  onNavigateToTerms?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onBackToApp,
  onNavigateToTerms,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Privacy Policy — BhooTech AI (किसान डेटा सुरक्षा नीति)';
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
          {onNavigateToTerms && (
            <button
              type="button"
              onClick={onNavigateToTerms}
              className="text-xs text-[#6B7280] hover:text-[#1F2A1F] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer hidden md:inline-block"
            >
              Terms & Conditions
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
            <ShieldCheck className="w-4 h-4 text-[#2F5233]" />
            <span>Kisan Privacy Guarantee • किसान डेटा सुरक्षा नीति</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1F2A1F]">
            Privacy Policy & Data Protection Policy
          </h1>

          <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-3xl">
            At <strong>BhooTech AI</strong>, we respect your privacy and honor the hard work of every farmer in India. 
            This Privacy Policy explains clearly and transparently what data we collect from you, how your farm information is stored, how it is protected, and how you retain 100% control over your data at all times.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] pt-2 border-t border-[#E5E0D3]">
            <span><strong>Effective Date:</strong> January 1, 2026</span>
            <span>•</span>
            <span><strong>Last Updated:</strong> March 2026</span>
            <span>•</span>
            <span className="text-[#1F2A1F] font-semibold">Jurisdiction: Republic of India (Digital Personal Data Protection Act, 2023)</span>
          </div>
        </div>

        {/* Highlight Callout: Plain Language Guarantee */}
        <div className="bg-[#FFFFFF] border-l-4 border-[#2F5233] p-4 sm:p-5 rounded-r-2xl border-y border-r border-[#E5E0D3] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#1F2A1F] text-sm">
            <CheckCircle2 className="w-4 h-4 text-[#2F5233] shrink-0" />
            <span>Summary in Plain Words for Farmers (सरल शब्दों में सारांश)</span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Your field map, mobile number, land boundaries, and crop photos belong strictly to you. 
            <strong className="text-[#1F2A1F]"> We NEVER sell your data to brokers, advertising companies, or pesticide marketers.</strong> 
            Your information is stored securely in our sovereign database solely to calculate satellite health indexes, deliver local weather alerts, and provide clinical disease diagnoses for your crops. You may delete all your records at any time.
          </p>
        </div>

        {/* Section 1: What User Data We Collect */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              1
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Information & Data We Collect
              </h2>
              <p className="text-xs text-[#6B7280]">किसान से एकत्रित की जाने वाली जानकारी</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            We only collect data strictly necessary to provide satellite telemetry, microclimate advisories, mandi rate tracking, and plant pathology diagnoses. This includes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <Smartphone className="w-4 h-4 text-[#6B7280]" />
                <span>Identity & Phone Number</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Your name, mobile phone number, date of birth (for identity verification), and secure One-Time Password (OTP) session tokens.
              </p>
            </div>

            <div className="p-3.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <MapPin className="w-4 h-4 text-[#6B7280]" />
                <span>Live Location & Field GPS Coordinates</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Live GPS position coordinates used to locate your field on satellite maps and fetch hyperlocal weather grid data from Open-Meteo.
              </p>
            </div>

            <div className="p-3.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <Scale className="w-4 h-4 text-[#6B7280]" />
                <span>Land Area & Regional Units</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Total land parcel size in your regional measurement unit (acres, bigha, hectare, guntha, kanal, marla, or cent), state, district, and village.
              </p>
            </div>

            <div className="p-3.5 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <Camera className="w-4 h-4 text-[#6B7280]" />
                <span>Crop Photos for Leaf Doctor</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Photos of affected leaves, stems, or fruits you upload directly or capture using your camera for plant pathology disease diagnosis.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How & Where Your Data is Stored */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              2
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                How & Where Data is Stored (डेटा का सुरक्षित भंडारण)
              </h2>
              <p className="text-xs text-[#6B7280]">Enterprise Cloud Security & Sovereign Database Architecture</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            All user profiles, farm boundary polygons, agronomy records, and smart sensor telemetry are securely stored in our managed <strong className="text-[#1F2A1F]">Supabase PostgreSQL database</strong>.
          </p>

          <ul className="space-y-2 text-xs sm:text-sm text-[#6B7280]">
            <li className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1F2A1F]">Encryption in Transit & At Rest:</strong> All communications between your mobile browser and our servers are encrypted using modern TLS 1.3 encryption. Stored database volumes are encrypted with AES-256 standards.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Database className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1F2A1F]">Row-Level Security (RLS):</strong> Every farm record and diagnostic report is tied to your individual account ID (<code className="text-[#1F2A1F] bg-[#F7F4EC] px-1 py-0.5 rounded text-[11px] border border-[#E5E0D3]">x-user-id</code>). No other farmer or unauthorized party can view or access your private land boundaries.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1F2A1F]">Session Isolation:</strong> Sensitive passwords or OTP hashes are never stored in plain text. Session tokens are securely saved in private client-side browser storage and invalidated upon logout.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 3: Absolute Prohibition on Selling or Sharing Data */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              3
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Zero Data Selling & Third-Party Disclosure Policy
              </h2>
              <p className="text-xs text-[#6B7280]">डेटा किसी को भी नहीं बेचा या साझा नहीं किया जाएगा</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F4EC] border border-[#E5E0D3] flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-[#C0392B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#1F2A1F] uppercase tracking-wider">
                Our Non-Negotiable Commitment
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                <strong className="text-[#1F2A1F]">BhooTech AI will never sell, rent, lease, trade, or monetize your personal or agricultural data to any third party</strong>, including advertising networks, private data brokers, agrochemical companies, or commercial financial institutions.
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            When connecting to external public utility services (such as European Space Agency Copernicus Sentinel-2 for satellite images, Open-Meteo for weather forecasts, and Agmarknet for APMC mandi rates), our servers transmit only geographic coordinate bounding boxes or commodity names. <strong className="text-[#1F2A1F]">No personal identifying information (PII) is ever attached to these requests.</strong>
          </p>
        </section>

        {/* Section 4: Data Retention Timeline */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              4
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Data Retention Period (डेटा कितने समय तक रखा जाता है)
              </h2>
              <p className="text-xs text-[#6B7280]">Duration and Purpose of Storage</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#6B7280]">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1F2A1F]">Active Account Lifetime:</strong> Your saved field coordinates, crop history, and subscription data are retained only as long as you maintain an active Kisan account with BhooTech AI so that you can track multi-season crop progress and historic NDVI satellite curves.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1F2A1F]">Leaf Doctor Crop Photos:</strong> Uploaded plant photos are processed in temporary diagnostic memory. Diagnoses and recommended treatments are saved to your account passbook for future reference. Photos can be removed immediately upon user request.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1F2A1F]">Inactivity Policy:</strong> Accounts inactive for more than 24 consecutive months with no subscription or login activity may be marked for automated archiving after advance SMS notice.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: How to Request Complete Data Deletion */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              5
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Right to Erasure & How to Request Data Deletion
              </h2>
              <p className="text-xs text-[#6B7280]">डेटा मिटाने या हटाने का किसान का पूरा अधिकार</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Under India's Digital Personal Data Protection Act, 2023, you hold the unconditional right to request complete, permanent erasure of your personal data, field boundaries, and account history. You can exercise this right through either of the following methods:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <Trash2 className="w-4 h-4 text-[#C0392B]" />
                <span>Method A: Instant In-App Deletion</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Open the <strong className="text-[#1F2A1F]">Kisan Passbook / Profile</strong> modal from the top navigation bar or menu. Under the Account Settings tab, click <strong className="text-[#1F2A1F]">"Delete All Saved Farms & Account Data"</strong>. This immediately purges your boundaries and user records from our database.
              </p>
            </div>

            <div className="p-4 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F2A1F]">
                <Mail className="w-4 h-4 text-[#6B7280]" />
                <span>Method B: Email or Phone Request</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Send an email from or referencing your registered phone number to our Data Protection Officer at:
                <br />
                <a
                  href="mailto:privacy@bhootech.in"
                  className="font-mono text-[#1F2A1F] underline font-semibold mt-1 inline-block"
                >
                  privacy@bhootech.in
                </a>
                <br />
                Subject: <em>Request for Permanent Kisan Data Deletion</em>
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] text-xs text-[#6B7280] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2F5233] shrink-0" />
            <span>
              <strong className="text-[#1F2A1F]">48-Hour Purge Guarantee:</strong> Deletion requests submitted via email or support are verified and permanently wiped across all active databases and cache within 48 business hours.
            </span>
          </div>
        </section>

        {/* Section 6: Contact & Grievance Redressal */}
        <section className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E0D3] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] flex items-center justify-center text-[#1F2A1F] font-black">
              6
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2A1F]">
                Grievance Officer & Support Contact
              </h2>
              <p className="text-xs text-[#6B7280]">शिकायत निवारण अधिकारी संपर्क</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            If you have any questions, concerns, or grievances regarding how your data is handled, you may reach our dedicated Grievance Redressal Officer:
          </p>

          <div className="p-4 bg-[#F7F4EC] rounded-xl border border-[#E5E0D3] space-y-2 text-xs text-[#6B7280]">
            <p><strong className="text-[#1F2A1F]">Entity:</strong> BhooTech AI Platform • Sovereign AgriTech Initiative</p>
            <p><strong className="text-[#1F2A1F]">Data Protection & Grievance Officer:</strong> Legal & Agronomy Governance Cell</p>
            <p><strong className="text-[#1F2A1F]">Official Email:</strong> <a href="mailto:privacy@bhootech.in" className="text-[#1F2A1F] underline">privacy@bhootech.in</a></p>
            <p><strong className="text-[#1F2A1F]">Technical Support:</strong> <a href="mailto:support@bhootech.in" className="text-[#1F2A1F] underline">support@bhootech.in</a></p>
            <p><strong className="text-[#1F2A1F]">Registered Address:</strong> Technology Innovation Hub, New Delhi / Chandigarh, India</p>
          </div>
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

          {onNavigateToTerms && (
            <button
              type="button"
              onClick={onNavigateToTerms}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#1F2A1F] font-semibold text-xs border border-[#E5E0D3] transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#6B7280]" />
              <span>Read Terms & Conditions</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F7F4EC] border-t border-[#E5E0D3] py-6 px-4 text-center text-xs text-[#6B7280] print:hidden">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 BhooTech AI. All rights reserved. Built for Indian Agriculture.</p>
          <div className="flex items-center gap-4 text-[#6B7280]">
            <span className="text-[#1F2A1F] font-semibold">Privacy Policy</span>
            <span>•</span>
            {onNavigateToTerms ? (
              <button
                type="button"
                onClick={onNavigateToTerms}
                className="hover:text-[#1F2A1F] transition-colors cursor-pointer"
              >
                Terms & Conditions
              </button>
            ) : (
              <span>Terms & Conditions</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
