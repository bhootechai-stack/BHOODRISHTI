import React from 'react';
import {
  Home,
  Tractor,
  ScanLine,
  FileText,
  Menu,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type BottomNavTab = 'home' | 'my-farms' | 'ai-diagnosis' | 'reports' | 'more';

interface BottomNavBarProps {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  onOpenMyFarms: () => void;
  onOpenAiDiagnosis: () => void;
  onOpenReports: () => void;
  onOpenMore: () => void;
  onNavigateHome: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMyFarms,
  onOpenAiDiagnosis,
  onOpenReports,
  onOpenMore,
  onNavigateHome,
}) => {
  const { t } = useLanguage();

  const handleTabClick = (tab: BottomNavTab) => {
    onSelectTab(tab);
    switch (tab) {
      case 'home':
        onNavigateHome();
        break;
      case 'my-farms':
        onOpenMyFarms();
        break;
      case 'ai-diagnosis':
        onOpenAiDiagnosis();
        break;
      case 'reports':
        onOpenReports();
        break;
      case 'more':
        onOpenMore();
        break;
    }
  };

  const tabs: Array<{
    id: BottomNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'my-farms',
      label: 'My Farms',
      icon: Tractor,
    },
    {
      id: 'ai-diagnosis',
      label: 'AI Diagnosis',
      icon: ScanLine,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
    },
    {
      id: 'more',
      label: 'More',
      icon: Menu,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-[#f6fbf5] border-t border-[#e5e9e4] shadow-[0_-1px_8px_rgba(0,0,0,0.04)]"
      aria-label="Bottom Navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] py-1 transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#2f5233] font-bold'
                  : 'text-[#424841] hover:text-[#183b1e] font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#c4edc3] text-[#002108]' : 'text-[#727970]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className={`text-[10px] leading-tight tracking-tight ${isActive ? 'font-bold text-[#183b1e]' : 'text-[#727970]'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#2f5233]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
