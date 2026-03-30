import React from 'react';
import { LogOut, User, BookOpen, GraduationCap, LayoutDashboard, FileText, Download, Upload, Book, Settings, ClipboardList } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
      active 
        ? "bg-blue-600 text-white shadow-lg" 
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userEmail?: string | null;
}

export default function Layout({ children, activeTab, setActiveTab, onLogout, userEmail }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full px-4 py-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl shadow-blue-200 shadow-lg">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">SMK KONOHA</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Konoha Village</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={User} 
              label="Data Siswa" 
              active={activeTab === 'students'} 
              onClick={() => setActiveTab('students')} 
            />
            <SidebarItem 
              icon={BookOpen} 
              label="Mata Pelajaran" 
              active={activeTab === 'subjects'} 
              onClick={() => setActiveTab('subjects')} 
            />
            <SidebarItem 
              icon={FileText} 
              label="Input Nilai" 
              active={activeTab === 'grades'} 
              onClick={() => setActiveTab('grades')} 
            />
            <SidebarItem 
              icon={Upload} 
              label="Import Nilai" 
              active={activeTab === 'import-grades'} 
              onClick={() => setActiveTab('import-grades')} 
            />
            <SidebarItem 
              icon={Download} 
              label="Cetak Raport" 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')} 
            />
            <SidebarItem 
              icon={ClipboardList} 
              label="Leger Nilai" 
              active={activeTab === 'leger'} 
              onClick={() => setActiveTab('leger')} 
            />
            <SidebarItem 
              icon={Book} 
              label="Cover Raport" 
              active={activeTab === 'report-cover'} 
              onClick={() => setActiveTab('report-cover')} 
            />
            <SidebarItem 
              icon={Settings} 
              label="Pengaturan Sekolah" 
              active={activeTab === 'school-settings'} 
              onClick={() => setActiveTab('school-settings')} 
            />
          </nav>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <div className="px-4 py-3 mb-4 rounded-xl bg-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Logged in as</p>
              <p className="text-sm font-medium text-gray-700 truncate">{userEmail || 'Admin'}</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
                  onLogout();
                }
              }}
              className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50"
            >
              <LogOut size={20} />
              <span>Keluar Aplikasi</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 capitalize">{activeTab.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900">{userEmail || 'Admin'}</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Administrator</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
                  onLogout();
                }
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
              title="Keluar Aplikasi"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
