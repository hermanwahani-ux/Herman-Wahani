import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { Subject } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface SubjectListProps {
  subjects: Subject[];
  onAdd: (subject: Omit<Subject, 'id'>) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

export default function SubjectList({ subjects, onAdd, onEdit, onDelete }: SubjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'A. Muatan Umum' as 'A. Muatan Umum' | 'B. Muatan Kejuruan' | 'C. Mata Pelajaran Pilihan',
    teacherName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      onEdit({ ...editingSubject, ...formData });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData({ code: '', name: '', category: 'A. Muatan Umum', teacherName: '' });
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      category: subject.category,
      teacherName: subject.teacherName || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSubjectToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (subjectToDelete) {
      onDelete(subjectToDelete);
      setSubjectToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Pelajaran</h1>
          <p className="text-gray-500 mt-1">Kelola daftar mata pelajaran sesuai kurikulum.</p>
        </div>
        <button
          onClick={() => {
            setEditingSubject(null);
            setFormData({ code: '', name: '', category: 'A. Muatan Umum', teacherName: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
        >
          <Plus size={18} />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Guru Pengampu</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kelompok</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{subject.code}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{subject.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{subject.teacherName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                      subject.category.includes('Umum') ? 'bg-blue-50 text-blue-700' :
                      subject.category.includes('Kejuruan') ? 'bg-purple-50 text-purple-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {subject.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(subject)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(subject.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada mata pelajaran ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Hapus Mata Pelajaran"
        message="Apakah Anda yakin ingin menghapus mata pelajaran ini? Semua data nilai yang terkait dengan pelajaran ini juga akan dihapus secara permanen."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Kode Mapel</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Contoh: MP001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Contoh: Matematika"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nama Guru Pengampu</label>
                <input
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Contoh: Herman Wahani, S.Pd"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Kelompok</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="A. Muatan Umum">A. Muatan Umum</option>
                  <option value="B. Muatan Kejuruan">B. Muatan Kejuruan</option>
                  <option value="C. Mata Pelajaran Pilihan">C. Mata Pelajaran Pilihan</option>
                </select>
              </div>
              <div className="pt-6 flex gap-3">
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
                  {editingSubject ? 'Simpan Perubahan' : 'Tambah Mapel'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
