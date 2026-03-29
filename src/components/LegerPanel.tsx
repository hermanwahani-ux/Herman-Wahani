import React, { useState, useMemo } from 'react';
import { FileText, Download, Search, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Subject, Grade } from '../types';

interface LegerPanelProps {
  students: Student[];
  subjects: Subject[];
  grades: Grade[];
  onEditStudent?: (id: string) => void;
}

export default function LegerPanel({ students, subjects, grades, onEditStudent }: LegerPanelProps) {
  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');
  const [selectedSemester, setSelectedSemester] = useState<string>('1 (Ganjil)');
  const [searchTerm, setSearchTerm] = useState('');

  const classes = useMemo(() => 
    ['Semua Kelas', ...Array.from(new Set(students.map(s => s.class)))].sort(),
    [students]
  );

  const semesters = useMemo(() => 
    Array.from(new Set(students.map(s => s.semester))).sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesClass = selectedClass === 'Semua Kelas' || s.class === selectedClass;
      const matchesSemester = s.semester === selectedSemester;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nisn.includes(searchTerm);
      return matchesClass && matchesSemester && matchesSearch;
    });
  }, [students, selectedClass, selectedSemester, searchTerm]);

  const legerData = useMemo(() => {
    return filteredStudents.map(student => {
      const studentGrades = subjects.reduce((acc, subject) => {
        const grade = grades.find(g => 
          g.studentId === student.id && 
          g.subjectId === subject.id && 
          g.semester === selectedSemester
        );
        acc[subject.id] = grade ? grade.score : 0;
        return acc;
      }, {} as Record<string, number>);

      const total = Object.values(studentGrades).reduce((sum, score) => sum + score, 0);
      const average = subjects.length > 0 ? total / subjects.length : 0;

      return {
        ...student,
        grades: studentGrades,
        total,
        average
      };
    }).sort((a, b) => b.total - a.total); // Sort by total for ranking
  }, [filteredStudents, subjects, grades, selectedSemester]);

  const handleExportExcel = () => {
    const header = [
      'No', 'NISN', 'Nama Siswa', 'Kelas',
      ...subjects.map(s => s.name),
      'Total', 'Rata-rata', 'Ranking'
    ];

    const data = legerData.map((item, index) => [
      index + 1,
      item.nisn,
      item.name,
      item.class,
      ...subjects.map(s => item.grades[s.id] || 0),
      item.total,
      item.average.toFixed(2),
      index + 1
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leger Nilai');
    
    const fileName = `Leger_Nilai_${selectedClass.replace(/ /g, '_')}_Semester_${selectedSemester.replace(/ /g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleExportCSV = () => {
    const header = [
      'No', 'NISN', 'Nama Siswa', 'Kelas',
      ...subjects.map(s => s.name),
      'Total', 'Rata-rata', 'Ranking'
    ];

    const data = legerData.map((item, index) => [
      index + 1,
      item.nisn,
      item.name,
      item.class,
      ...subjects.map(s => item.grades[s.id] || 0),
      item.total,
      item.average.toFixed(2),
      index + 1
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leger Nilai');
    
    const fileName = `Leger_Nilai_${selectedClass.replace(/ /g, '_')}_Semester_${selectedSemester.replace(/ /g, '_')}.csv`;
    XLSX.writeFile(wb, fileName, { bookType: 'csv' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leger Nilai</h1>
          <p className="text-gray-500 mt-1">Rekapitulasi nilai seluruh mata pelajaran per kelas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white font-semibold rounded-xl shadow-lg shadow-gray-100 hover:bg-gray-700 active:scale-95 transition-all text-sm"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all text-sm"
          >
            <Download size={18} />
            <span>Export Excel</span>
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
              placeholder="Cari nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-w-[140px]"
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-w-[140px]"
            >
              {semesters.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-100">No</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider sticky left-[48px] bg-gray-50 z-10 border-r border-gray-100 min-w-[200px]">Nama Siswa</th>
                {subjects.map(subject => (
                  <th key={subject.id} className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center min-w-[80px] border-r border-gray-100">
                    <div className="truncate w-20 mx-auto" title={subject.name}>
                      {subject.code || subject.name.substring(0, 3)}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center bg-blue-50/50">Total</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center bg-blue-50/50">Rata2</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center bg-amber-50/50">Rank</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center bg-gray-50 sticky right-0 z-10 border-l border-gray-100">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {legerData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-4 text-sm text-gray-600 sticky left-0 bg-white group-hover:bg-gray-50 border-r border-gray-100">{index + 1}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-900 sticky left-[48px] bg-white group-hover:bg-gray-50 border-r border-gray-100">{item.name}</td>
                  {subjects.map(subject => {
                    const score = item.grades[subject.id] || 0;
                    return (
                      <td key={subject.id} className={`px-4 py-4 text-sm text-center border-r border-gray-100 ${score < 75 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {score || '-'}
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-sm font-bold text-center bg-blue-50/30 text-blue-700">{item.total}</td>
                  <td className="px-4 py-4 text-sm font-bold text-center bg-blue-50/30 text-blue-700">{item.average.toFixed(1)}</td>
                  <td className="px-4 py-4 text-sm font-bold text-center bg-amber-50/30 text-amber-700">
                    <span className={`px-2 py-1 rounded-lg ${index < 3 ? 'bg-amber-100 text-amber-800' : ''}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-center sticky right-0 bg-white group-hover:bg-gray-50 border-l border-gray-100">
                    <button
                      onClick={() => onEditStudent?.(item.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Input Nilai"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {legerData.length === 0 && (
                <tr>
                  <td colSpan={subjects.length + 5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data siswa ditemukan untuk kriteria ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span>
              <span>Nilai di bawah KKM (75)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></span>
              <span>Peringkat 3 Besar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
