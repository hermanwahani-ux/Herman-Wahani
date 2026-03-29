import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Subject, Grade, Attendance, ReportMetadata, SchoolProfile } from '../types';

interface ReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  subjects: Subject[];
  grades: Grade[];
  attendance?: Attendance;
  metadata?: ReportMetadata;
  schoolProfile: SchoolProfile;
  onDownloadPDF: () => void;
}

export default function ReportPreview({
  isOpen,
  onClose,
  student,
  subjects,
  grades,
  attendance,
  metadata,
  schoolProfile,
  onDownloadPDF
}: ReportPreviewProps) {
  if (!isOpen) return null;

  const categories = ['A. Muatan Umum', 'B. Muatan Kejuruan', 'C. Mata Pelajaran Pilihan'] as const;

  const getGradesByCategory = (category: string) => {
    return subjects
      .filter(s => s.category === category)
      .map(subject => {
        const grade = grades.find(g => g.subjectId === subject.id);
        return { subject, grade };
      });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:rounded-none"
        >
          {/* Header Actions */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 print:hidden">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">Preview Raport</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
                {student.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
              >
                <Printer size={18} />
                <span>Cetak</span>
              </button>
              <button
                onClick={onDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Download size={18} />
                <span>Unduh PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-12 bg-white min-h-[1123px] font-serif text-gray-900 print:p-8">
            {/* School Header */}
            <div className="text-center space-y-2 mb-10">
              <h1 className="text-xl font-bold uppercase tracking-widest">LAPORAN HASIL BELAJAR (RAPOR)</h1>
              <h2 className="text-lg font-bold uppercase tracking-wider">{schoolProfile.name}</h2>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-8 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold">Nama Peserta Didik</span>
                <span className="text-center">:</span>
                <span>{student.name}</span>
                
                <span className="font-bold">Nomor Induk/NISN</span>
                <span className="text-center">:</span>
                <span>{student.nisn}</span>
                
                <span className="font-bold">Sekolah</span>
                <span className="text-center">:</span>
                <span>{schoolProfile.name}</span>
                
                <span className="font-bold">Alamat</span>
                <span className="text-center">:</span>
                <span>{schoolProfile.address}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold">Kelas</span>
                <span className="text-center">:</span>
                <span>{student.class}</span>
                
                <span className="font-bold">Fase</span>
                <span className="text-center">:</span>
                <span>{student.phase}</span>
                
                <span className="font-bold">Semester</span>
                <span className="text-center">:</span>
                <span>{student.semester}</span>
                
                <span className="font-bold">Tahun Pelajaran</span>
                <span className="text-center">:</span>
                <span>{student.academicYear}</span>
              </div>
            </div>

            {/* Grades Table */}
            <div className="space-y-6 mb-10">
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-black px-3 py-2 text-center w-12">No</th>
                    <th className="border border-black px-3 py-2 text-left">Mata Pelajaran</th>
                    <th className="border border-black px-3 py-2 text-center w-20">Nilai Akhir</th>
                    <th className="border border-black px-3 py-2 text-left">Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, catIdx) => (
                    <React.Fragment key={category}>
                      <tr className="bg-gray-100 font-bold">
                        <td className="border border-black px-3 py-2 text-center">{String.fromCharCode(65 + catIdx)}</td>
                        <td colSpan={3} className="border border-black px-3 py-2">{category}</td>
                      </tr>
                      {getGradesByCategory(category).map((item, idx) => (
                        <tr key={item.subject.id}>
                          <td className="border border-black px-3 py-2 text-center">{idx + 1}</td>
                          <td className="border border-black px-3 py-2">{item.subject.name}</td>
                          <td className="border border-black px-3 py-2 text-center font-bold">{item.grade?.score || '-'}</td>
                          <td className="border border-black px-3 py-2 text-justify leading-relaxed">{item.grade?.description || '-'}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kokurikuler */}
            <div className="mb-8">
              <h3 className="font-bold text-sm mb-2">Kokurikuler</h3>
              <div className="border border-black p-4 text-xs text-justify leading-relaxed min-h-[80px]">
                {metadata?.kokurikuler || '-'}
              </div>
            </div>

            {/* Extracurriculars & Attendance Grid */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="font-bold text-sm mb-2">Ekstrakurikuler</h3>
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-black px-3 py-2 text-center w-12">No</th>
                      <th className="border border-black px-3 py-2 text-left">Kegiatan Ekstrakurikuler</th>
                      <th className="border border-black px-3 py-2 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metadata?.extracurriculars && metadata.extracurriculars.length > 0 ? (
                      metadata.extracurriculars.map((ex, idx) => (
                        <tr key={idx}>
                          <td className="border border-black px-3 py-2 text-center">{idx + 1}</td>
                          <td className="border border-black px-3 py-2">{ex.name}</td>
                          <td className="border border-black px-3 py-2">{ex.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="border border-black px-3 py-2 text-center">1</td>
                        <td className="border border-black px-3 py-2">-</td>
                        <td className="border border-black px-3 py-2">-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-bold text-sm mb-2">Ketidakhadiran</h3>
                <table className="w-full border-collapse border border-black text-xs">
                  <tbody>
                    <tr>
                      <td className="border border-black px-4 py-2 w-1/2">Sakit</td>
                      <td className="border border-black px-4 py-2 text-center font-bold">{attendance?.sick || 0} hari</td>
                    </tr>
                    <tr>
                      <td className="border border-black px-4 py-2">Izin</td>
                      <td className="border border-black px-4 py-2 text-center font-bold">{attendance?.permission || 0} hari</td>
                    </tr>
                    <tr>
                      <td className="border border-black px-4 py-2">Tanpa Keterangan</td>
                      <td className="border border-black px-4 py-2 text-center font-bold">{attendance?.absent || 0} hari</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan Wali Kelas */}
            <div className="mb-12">
              <h3 className="font-bold text-sm mb-2">Catatan Wali Kelas</h3>
              <div className="border border-black p-4 text-xs italic min-h-[60px]">
                "{metadata?.catatanWaliKelas || '-'}"
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 text-sm mt-16">
              <div className="text-center space-y-20">
                <p>Orang Tua/Wali,</p>
                <div className="space-y-1">
                  <p className="font-bold underline">..........................................</p>
                </div>
              </div>
              <div className="text-center space-y-20">
                <p>Wali Kelas,</p>
                <div className="space-y-1">
                  <p className="font-bold underline">{metadata?.waliKelasName || '..........................................'}</p>
                  <p>NIP. {metadata?.waliKelasNip || '..........................................'}</p>
                </div>
              </div>
              <div className="text-center space-y-20">
                <div className="space-y-1">
                  <p>{schoolProfile.city}, {metadata?.tanggalRaport || '....................'}</p>
                  <p>Kepala Sekolah,</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold underline">{schoolProfile.headmasterName}</p>
                  <p>NIP. {schoolProfile.headmasterNip}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
