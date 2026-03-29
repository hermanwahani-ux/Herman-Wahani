import React, { useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, FileUp, Camera, X } from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { Student } from '../types';
import { cn } from '../lib/utils';
import ConfirmDialog from './ConfirmDialog';

interface StudentListProps {
  students: Student[];
  onAdd: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  onImport: (students: Omit<Student, 'id' | 'createdAt'>[]) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export default function StudentList({ students, onAdd, onImport, onEdit, onDelete }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [selectedMajor, setSelectedMajor] = useState('Semua Jurusan');
  const [selectedSemester, setSelectedSemester] = useState('Semua Semester');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      const newStudents: Omit<Student, 'id' | 'createdAt'>[] = [];

      data.forEach((row: any) => {
        const nisn = row.NISN || row.nisn || '';
        const name = row.Nama || row.nama || row.Name || row.name || '';
        const studentClass = row.Kelas || row.kelas || row.Class || row.class || '';
        const major = row.Jurusan || row.jurusan || row.Major || row.major || '';

        if (nisn && name) {
          newStudents.push({
            nisn: nisn.toString(),
            name: name.toString(),
            class: studentClass.toString(),
            major: major.toString(),
            semester: '1 (Ganjil)',
            academicYear: '2025/2026',
            school: 'SMK COKROAMINOTO SALONGO',
            address: 'Jalan TNI 3 Desa Salongo Kec. Bolaang Uki',
            phase: 'E'
          });
        }
      });

      if (newStudents.length > 0) {
        onImport(newStudents);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const classes = ['Semua Kelas', ...Array.from(new Set(students.map(s => s.class)))].sort();
  const majors = ['Semua Jurusan', ...Array.from(new Set(students.map(s => s.major)))].sort();
  const semesters = ['Semua Semester', ...Array.from(new Set(students.map(s => s.semester)))].sort();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.nisn.includes(searchTerm) ||
      (s.nis && s.nis.includes(searchTerm)) ||
      s.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'Semua Kelas' || s.class === selectedClass;
    const matchesMajor = selectedMajor === 'Semua Jurusan' || s.major === selectedMajor;
    const matchesSemester = selectedSemester === 'Semua Semester' || s.semester === selectedSemester;

    return matchesSearch && matchesClass && matchesMajor && matchesSemester;
  });

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'createdAt'>>({
    nisn: '',
    nis: '',
    name: '',
    class: '',
    major: '',
    semester: '1 (Ganjil)',
    academicYear: '2025/2026',
    school: 'SMK COKROAMINOTO SALONGO',
    address: 'Jalan TNI 3 Desa Salongo Kec. Bolaang Uki',
    phone: '',
    birthPlace: '',
    birthDate: '',
    gender: 'Laki-laki',
    religion: 'Islam',
    familyStatus: 'Anak Kandung',
    childOrder: 1,
    previousSchool: '',
    admissionClass: '',
    admissionDate: '',
    fatherName: '',
    motherName: '',
    parentAddress: '',
    parentPhone: '',
    fatherJob: '',
    motherJob: '',
    guardianName: '',
    guardianAddress: '',
    guardianPhone: '',
    guardianJob: '',
    photoUrl: '',
    phase: 'E'
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onEdit({ ...editingStudent, ...formData });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
    setEditingStudent(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nisn: '',
      nis: '',
      name: '',
      class: '',
      major: '',
      semester: '1 (Ganjil)',
      academicYear: '2025/2026',
      school: 'SMK COKROAMINOTO SALONGO',
      address: 'Jalan TNI 3 Desa Salongo Kec. Bolaang Uki',
      phone: '',
      birthPlace: '',
      birthDate: '',
      gender: 'Laki-laki',
      religion: 'Islam',
      familyStatus: 'Anak Kandung',
      childOrder: 1,
      previousSchool: '',
      admissionClass: '',
      admissionDate: '',
      fatherName: '',
      motherName: '',
      parentAddress: '',
      parentPhone: '',
      fatherJob: '',
      motherJob: '',
      guardianName: '',
      guardianAddress: '',
      guardianPhone: '',
      guardianJob: '',
      photoUrl: '',
      phase: 'E'
    });
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nisn: student.nisn || '',
      nis: student.nis || '',
      name: student.name || '',
      class: student.class || '',
      major: student.major || '',
      semester: student.semester || '1 (Ganjil)',
      academicYear: student.academicYear || '2025/2026',
      school: student.school || 'SMK COKROAMINOTO SALONGO',
      address: student.address || 'Jalan TNI 3 Desa Salongo Kec. Bolaang Uki',
      phone: student.phone || '',
      birthPlace: student.birthPlace || '',
      birthDate: student.birthDate || '',
      gender: student.gender || 'Laki-laki',
      religion: student.religion || 'Islam',
      familyStatus: student.familyStatus || 'Anak Kandung',
      childOrder: student.childOrder || 1,
      previousSchool: student.previousSchool || '',
      admissionClass: student.admissionClass || '',
      admissionDate: student.admissionDate || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      parentAddress: student.parentAddress || '',
      parentPhone: student.parentPhone || '',
      fatherJob: student.fatherJob || '',
      motherJob: student.motherJob || '',
      guardianName: student.guardianName || '',
      guardianAddress: student.guardianAddress || '',
      guardianPhone: student.guardianPhone || '',
      guardianJob: student.guardianJob || '',
      photoUrl: student.photoUrl || '',
      phase: student.phase || 'E'
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      onDelete(studentToDelete);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-500 mt-1">Kelola data profil siswa dan cetak raport.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all text-sm"
          >
            <FileUp size={18} />
            <span>Import Excel</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => {
              setEditingStudent(null);
              setFormData({
                nisn: '',
                name: '',
                class: '',
                major: '',
                semester: '1 (Ganjil)',
                academicYear: '2025/2026',
                school: 'SMK COKROAMINOTO SALONGO',
                address: 'Jalan TNI 3 Desa Salongo Kec. Bolaang Uki',
                photoUrl: '',
                phase: 'E'
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
          >
            <Plus size={18} />
            <span>Tambah Siswa</span>
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">NISN</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">NIS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.nisn}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.nis || '-'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Semester {student.semester}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(student)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
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

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus Data Siswa"
        message="Apakah Anda yakin ingin menghapus data siswa ini? Semua data nilai dan kehadiran yang terkait juga akan dihapus secara permanen."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh] space-y-8">
              {/* Photo Upload */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2">Foto Siswa</h3>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {formData.photoUrl ? (
                        <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={32} className="text-gray-300" />
                      )}
                    </div>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-gray-500">Unggah foto siswa (3x4 atau 4x6). Format: JPG, PNG. Maksimal 1MB.</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 cursor-pointer transition-all active:scale-95"
                    >
                      <Camera size={16} />
                      <span>Pilih Foto</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Data Identitas */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2">Identitas Diri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Jenis Kelamin</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">NISN</label>
                    <input
                      type="text"
                      required
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">NIS</label>
                    <input
                      type="text"
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tanggal Lahir</label>
                    <input
                      type="text"
                      placeholder="Contoh: 10 Oktober 2010"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Agama</label>
                    <input
                      type="text"
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Telepon</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Alamat Lengkap</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]"
                  />
                </div>
              </section>

              {/* Data Akademik */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2">Data Akademik</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Kelas</label>
                    <input
                      type="text"
                      required
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Jurusan</label>
                    <input
                      type="text"
                      required
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="1 (Ganjil)">1 (Ganjil)</option>
                      <option value="2 (Genap)">2 (Genap)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tahun Akademik</label>
                    <input
                      type="text"
                      required
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Sekolah Asal</label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tanggal Masuk</label>
                    <input
                      type="text"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Data Orang Tua */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2">Data Orang Tua</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nama Ayah</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Pekerjaan Ayah</label>
                    <input
                      type="text"
                      value={formData.fatherJob}
                      onChange={(e) => setFormData({ ...formData, fatherJob: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nama Ibu</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Pekerjaan Ibu</label>
                    <input
                      type="text"
                      value={formData.motherJob}
                      onChange={(e) => setFormData({ ...formData, motherJob: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
