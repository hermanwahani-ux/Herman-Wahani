import React from 'react';
import { Users, BookOpen, FileText, TrendingUp, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5"
  >
    <div className={`p-4 rounded-xl ${color} shadow-lg`}>
      <Icon className="text-white" size={24} />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </motion.div>
);

interface DashboardProps {
  stats: {
    totalStudents: number;
    totalSubjects: number;
    totalGrades: number;
    averageScore: number;
  };
}

export default function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Selamat datang di sistem manajemen raport digital SMK.</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
          Semester Genap 2025/2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Siswa" 
          value={stats.totalStudents} 
          color="bg-blue-600 shadow-blue-100" 
          delay={0.1}
        />
        <StatCard 
          icon={BookOpen} 
          label="Mata Pelajaran" 
          value={stats.totalSubjects} 
          color="bg-purple-600 shadow-purple-100" 
          delay={0.2}
        />
        <StatCard 
          icon={FileText} 
          label="Nilai Terinput" 
          value={stats.totalGrades} 
          color="bg-orange-600 shadow-orange-100" 
          delay={0.3}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Rata-rata Nilai" 
          value={stats.averageScore.toFixed(1)} 
          color="bg-emerald-600 shadow-emerald-100" 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={20} />
            Informasi Kurikulum Merdeka
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2">Penilaian Formatif & Sumatif</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Kurikulum Merdeka menekankan pada penilaian proses (formatif) dan hasil akhir (sumatif). 
                Pastikan deskripsi kemajuan belajar mencerminkan capaian kompetensi siswa secara kualitatif.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <h3 className="font-bold text-emerald-900 mb-2">Kokurikuler</h3>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Raport Kokurikuler dicetak terintegrasi dari raport akademik. Sistem ini difokuskan pada raport akademik 
                dan kompetensi keahlian SMK.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Aktivitas Terbaru</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Input nilai Matematika Kelas XI TKJ 1</p>
                  <p className="text-xs text-gray-500 mt-1">2 jam yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
