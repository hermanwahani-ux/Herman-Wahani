import React, { useState } from 'react';
import { Search, FileText, FileSpreadsheet, Download, User, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Student, Subject, Grade, Attendance, ReportMetadata, SchoolProfile } from '../types';
import ReportPreview from './ReportPreview';

interface ReportPanelProps {
  students: Student[];
  subjects: Subject[];
  grades: Grade[];
  attendance: Attendance[];
  metadata: ReportMetadata[];
  schoolProfile: SchoolProfile;
  onExportPDF: (student: Student) => void;
  onExportDetailedPDF: (student: Student) => void;
  onExportBulkPDF: (students: Student[]) => void;
  onExportExcel: (students: Student[]) => void;
}

export default function ReportPanel({ 
  students, 
  subjects, 
  grades, 
  attendance, 
  metadata, 
  schoolProfile,
  onExportPDF, 
  onExportDetailedPDF,
  onExportBulkPDF, 
  onExportExcel 
}: ReportPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [selectedMajor, setSelectedMajor] = useState('Semua Jurusan');
  const [selectedSemester, setSelectedSemester] = useState('Semua Semester');
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);

  const classes = ['Semua Kelas', ...Array.from(new Set(students.map(s => String(s.class)).filter(Boolean)))].sort();
  const majors = ['Semua Jurusan', ...Array.from(new Set(students.map(s => String(s.major)).filter(Boolean)))].sort();
  const semesters = ['Semua Semester', ...Array.from(new Set(students.map(s => String(s.semester)).filter(Boolean)))].sort();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.nisn.includes(searchTerm) ||
      s.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'Semua Kelas' || String(s.class) === selectedClass;
    const matchesMajor = selectedMajor === 'Semua Jurusan' || String(s.major) === selectedMajor;
    const matchesSemester = selectedSemester === 'Semua Semester' || String(s.semester) === selectedSemester;

    return matchesSearch && matchesClass && matchesMajor && matchesSemester;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cetak Raport</h1>
          <p className="text-gray-500 mt-1">Pilih siswa untuk mencetak raport atau export data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onExportBulkPDF(filteredStudents)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
          >
            <FileText size={18} />
            <span>Cetak Semua PDF ({filteredStudents.length})</span>
          </button>
          <button
            onClick={() => onExportExcel(filteredStudents)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all text-sm"
          >
            <FileSpreadsheet size={18} />
            <span>Export Excel ({filteredStudents.length})</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari nama, NISN, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-w-[140px]"
            >
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-w-[160px]"
            >
              {majors.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-w-[140px]"
            >
              {semesters.map(s => (
                <option key={s} value={s}>{s === 'Semua Semester' ? s : `Semester ${s}`}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('Semua Kelas');
                setSelectedMajor('Semua Jurusan');
                setSelectedSemester('Semua Semester');
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 text-sm"
              title="Reset Filter"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">NISN</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.nisn}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Semester {student.semester}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewStudent(student)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all active:scale-95"
                        title="Preview Raport"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => onExportPDF(student)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
                        title="Cetak Halaman Nilai"
                      >
                        <FileText size={14} />
                        <span>Nilai</span>
                      </button>
                      <button
                        onClick={() => onExportDetailedPDF(student)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95"
                        title="Cetak Identitas & Nilai"
                      >
                        <FileText size={14} />
                        <span>Lengkap</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewStudent && (
        <ReportPreview
          isOpen={!!previewStudent}
          onClose={() => setPreviewStudent(null)}
          student={previewStudent}
          subjects={subjects}
          grades={grades.filter(g => g.studentId === previewStudent.id)}
          attendance={attendance.find(a => a.studentId === previewStudent.id)}
          metadata={metadata.find(m => m.studentId === previewStudent.id)}
          schoolProfile={schoolProfile}
          onDownloadPDF={() => onExportPDF(previewStudent)}
        />
      )}
    </div>
  );
}
