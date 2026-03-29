import React, { useState, useEffect } from 'react';
import { Save, User, BookOpen, AlertCircle, CheckCircle2, Activity, ClipboardList, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { Student, Subject, Grade, Attendance, ReportMetadata } from '../types';

interface GradeEntryProps {
  students: Student[];
  subjects: Subject[];
  grades: Grade[];
  attendance: Attendance[];
  metadata: ReportMetadata[];
  selectedStudentId?: string;
  onSelectStudent?: (id: string) => void;
  onSaveGrades: (
    studentId: string, 
    grades: Omit<Grade, 'id' | 'updatedAt'>[],
    attendance: Omit<Attendance, 'id' | 'updatedAt'>,
    metadata: ReportMetadata
  ) => Promise<void>;
  onExportPDF: (student: Student) => void;
}

export default function GradeEntry({ 
  students, 
  subjects, 
  grades, 
  attendance, 
  metadata, 
  selectedStudentId: initialSelectedStudentId,
  onSelectStudent,
  onSaveGrades,
  onExportPDF
}: GradeEntryProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(initialSelectedStudentId || '');
  const [localGrades, setLocalGrades] = useState<{ [subjectId: string]: { score: number; description: string } }>({});
  const [localAttendance, setLocalAttendance] = useState({ sick: 0, permission: 0, absent: 0 });
  const [localMetadata, setLocalMetadata] = useState<ReportMetadata>({
    studentId: '',
    kokurikuler: '',
    extracurriculars: [],
    catatanWaliKelas: '',
    tanggapanOrangTua: '',
    waliKelasName: '',
    waliKelasNip: '',
    kepalaSekolahName: '',
    kepalaSekolahNip: '',
    tanggalRaport: '',
    tempatRaport: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  useEffect(() => {
    if (initialSelectedStudentId) {
      setSelectedStudentId(initialSelectedStudentId);
    }
  }, [initialSelectedStudentId]);

  useEffect(() => {
    if (selectedStudentId) {
      // Load Grades
      const studentGrades = grades.filter(g => g.studentId === selectedStudentId);
      const initialGrades: { [subjectId: string]: { score: number; description: string } } = {};
      subjects.forEach(subject => {
        const existingGrade = studentGrades.find(g => g.subjectId === subject.id);
        initialGrades[subject.id] = {
          score: existingGrade?.score || 0,
          description: existingGrade?.description || ''
        };
      });
      setLocalGrades(initialGrades);

      // Load Attendance
      const studentAttendance = attendance.find(a => a.studentId === selectedStudentId);
      setLocalAttendance({
        sick: studentAttendance?.sick || 0,
        permission: studentAttendance?.permission || 0,
        absent: studentAttendance?.absent || 0
      });

      // Load Metadata
      const studentMetadata = metadata.find(m => m.studentId === selectedStudentId);
      setLocalMetadata(studentMetadata || {
        studentId: selectedStudentId,
        kokurikuler: '',
        extracurriculars: [],
        catatanWaliKelas: '',
        tanggapanOrangTua: '',
        waliKelasName: '',
        waliKelasNip: '',
        kepalaSekolahName: '',
        kepalaSekolahNip: '',
        tanggalRaport: '',
        tempatRaport: ''
      });
    }
  }, [selectedStudentId, grades, subjects, attendance, metadata]);

  const handleScoreChange = (subjectId: string, score: number) => {
    setLocalGrades(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], score }
    }));
  };

  const handleDescriptionChange = (subjectId: string, description: string) => {
    setLocalGrades(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], description }
    }));
  };

  const handleSave = async () => {
    if (!selectedStudentId) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const gradesToSave = Object.entries(localGrades).map(([subjectId, data]) => {
        const d = data as { score: number; description: string };
        return {
          studentId: selectedStudentId,
          subjectId,
          score: d.score,
          predicate: d.score >= 90 ? 'A' : d.score >= 80 ? 'B' : d.score >= 70 ? 'C' : 'D',
          description: d.description,
          semester: selectedStudent?.semester || '1',
          academicYear: selectedStudent?.academicYear || '2023/2024'
        };
      });

      const attendanceToSave = {
        studentId: selectedStudentId,
        sick: localAttendance.sick,
        permission: localAttendance.permission,
        absent: localAttendance.absent,
        semester: selectedStudent?.semester || '1',
        academicYear: selectedStudent?.academicYear || '2023/2024'
      };
      
      await onSaveGrades(selectedStudentId, gradesToSave, attendanceToSave, { ...localMetadata, studentId: selectedStudentId });
      setMessage({ text: 'Data raport berhasil disimpan!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Gagal menyimpan data raport.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Input Nilai & Data Raport</h1>
          <p className="text-gray-500 mt-1">Lengkapi nilai, kehadiran, dan catatan wali kelas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Student Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Pilih Siswa</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    onSelectStudent?.(student.id);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedStudentId === student.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                      : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <p className="font-bold text-sm truncate">{student.name}</p>
                  <p className={`text-xs mt-1 ${selectedStudentId === student.id ? 'text-blue-100' : 'text-gray-400'}`}>
                    {student.nisn} • {student.class}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Form */}
        <div className="lg:col-span-3">
          {selectedStudentId ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User size={24} />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{selectedStudent?.name}</h2>
                      <p className="text-xs text-gray-500">{selectedStudent?.class} • {selectedStudent?.major}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => selectedStudent && onExportPDF(selectedStudent)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                    >
                      <ClipboardList size={18} />
                      <span>Cetak Raport</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'Menyimpan...' : (
                        <>
                          <Save size={18} />
                          <span>Simpan Semua Data</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {message && (
                  <div className={`p-4 mx-6 mt-6 rounded-xl border flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-semibold">{message.text}</span>
                  </div>
                )}

                {/* Section: Nilai Mata Pelajaran */}
                <div className="p-6 space-y-8">
                  <div className="flex items-center gap-2 text-gray-900 mb-4">
                    <BookOpen size={20} className="text-blue-600" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Nilai Mata Pelajaran</h3>
                  </div>
                  {subjects.map((subject) => (
                    <div key={subject.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start p-4 rounded-xl border border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <div className="md:col-span-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">{subject.category}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">{subject.name}</h3>
                        <p className="text-[10px] text-gray-400 mt-1">Guru: {subject.teacherName || '-'}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Nilai</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={localGrades[subject.id]?.score || 0}
                          onChange={(e) => handleScoreChange(subject.id, parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-center text-sm"
                        />
                      </div>

                      <div className="md:col-span-6">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Capaian Kompetensi</label>
                        <textarea
                          rows={2}
                          value={localGrades[subject.id]?.description || ''}
                          onChange={(e) => handleDescriptionChange(subject.id, e.target.value)}
                          placeholder="Deskripsi kemajuan belajar..."
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Kehadiran & Catatan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-900 mb-6">
                    <Activity size={20} className="text-blue-600" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Ketidakhadiran</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sakit</span>
                      <input 
                        type="number" 
                        value={localAttendance.sick}
                        onChange={(e) => setLocalAttendance({...localAttendance, sick: parseInt(e.target.value) || 0})}
                        className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-sm" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Izin</span>
                      <input 
                        type="number" 
                        value={localAttendance.permission}
                        onChange={(e) => setLocalAttendance({...localAttendance, permission: parseInt(e.target.value) || 0})}
                        className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-sm" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tanpa Keterangan</span>
                      <input 
                        type="number" 
                        value={localAttendance.absent}
                        onChange={(e) => setLocalAttendance({...localAttendance, absent: parseInt(e.target.value) || 0})}
                        className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-900 mb-6">
                    <ClipboardList size={20} className="text-blue-600" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Catatan Wali Kelas</h3>
                  </div>
                  <textarea
                    rows={5}
                    value={localMetadata.catatanWaliKelas}
                    onChange={(e) => setLocalMetadata({...localMetadata, catatanWaliKelas: e.target.value})}
                    placeholder="Tulis catatan untuk siswa..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {/* Section: Kokurikuler & Metadata */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 text-gray-900 mb-2">
                  <Settings size={20} className="text-blue-600" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Informasi Tambahan Raport</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Capaian Kokurikuler</label>
                    <textarea
                      rows={3}
                      value={localMetadata.kokurikuler}
                      onChange={(e) => setLocalMetadata({...localMetadata, kokurikuler: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Nama Wali Kelas</label>
                      <input 
                        type="text" 
                        value={localMetadata.waliKelasName}
                        onChange={(e) => setLocalMetadata({...localMetadata, waliKelasName: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">NIP Wali Kelas</label>
                      <input 
                        type="text" 
                        value={localMetadata.waliKelasNip}
                        onChange={(e) => setLocalMetadata({...localMetadata, waliKelasNip: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Nama Kepala Sekolah</label>
                      <input 
                        type="text" 
                        value={localMetadata.kepalaSekolahName}
                        onChange={(e) => setLocalMetadata({...localMetadata, kepalaSekolahName: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">NIP Kepala Sekolah</label>
                      <input 
                        type="text" 
                        value={localMetadata.kepalaSekolahNip}
                        onChange={(e) => setLocalMetadata({...localMetadata, kepalaSekolahNip: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Tempat Raport</label>
                      <input 
                        type="text" 
                        value={localMetadata.tempatRaport}
                        onChange={(e) => setLocalMetadata({...localMetadata, tempatRaport: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Tanggal Raport</label>
                      <input 
                        type="text" 
                        value={localMetadata.tanggalRaport}
                        onChange={(e) => setLocalMetadata({...localMetadata, tanggalRaport: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 p-8 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <User size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Belum Ada Siswa Terpilih</h3>
              <p className="text-sm mt-2 max-w-xs">Pilih salah satu siswa di sebelah kiri untuk mulai menginput data raport.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
