import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Subject, Grade, Attendance, ReportMetadata } from '../types';

interface GradeImportProps {
  students: Student[];
  subjects: Subject[];
  onImport: (
    grades: Omit<Grade, 'id' | 'updatedAt'>[],
    attendance: Omit<Attendance, 'id' | 'updatedAt'>[],
    metadata: ReportMetadata[]
  ) => void;
}

export default function GradeImport({ students, subjects, onImport }: GradeImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
        parseExcel(selectedFile);
      } else {
        setError('Format file tidak didukung. Gunakan .xlsx atau .xls');
        setFile(null);
      }
    }
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setPreviewData(jsonData);
      } catch (err) {
        setError('Gagal membaca file Excel. Pastikan format benar.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (previewData.length === 0) return;

    const newGrades: Omit<Grade, 'id' | 'updatedAt'>[] = [];
    const newAttendance: Omit<Attendance, 'id' | 'updatedAt'>[] = [];
    const newMetadata: ReportMetadata[] = [];

    let importedCount = 0;

    previewData.forEach((row: any) => {
      const nisn = String(row.NISN || row.nisn || '');
      const student = students.find(s => s.nisn === nisn);

      if (!student) return;

      importedCount++;

      // Map subjects
      subjects.forEach(subject => {
        // Try to find subject name in row keys
        const scoreKey = Object.keys(row).find(key => 
          key.toLowerCase().includes(subject.name.toLowerCase()) || 
          key.toLowerCase().includes(subject.code.toLowerCase())
        );

        if (scoreKey && row[scoreKey] !== undefined) {
          const score = Number(row[scoreKey]);
          if (!isNaN(score)) {
            newGrades.push({
              studentId: student.id,
              subjectId: subject.id,
              score: score,
              predicate: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D',
              description: row[`Deskripsi ${subject.name}`] || row[`Deskripsi ${subject.code}`] || '',
              semester: student.semester,
              academicYear: student.academicYear
            });
          }
        }
      });

      // Map Attendance
      const sick = Number(row.Sakit || row.sakit || 0);
      const permission = Number(row.Izin || row.izin || 0);
      const absent = Number(row.Alpa || row.alpa || 0);

      newAttendance.push({
        studentId: student.id,
        sick,
        permission,
        absent,
        semester: student.semester,
        academicYear: student.academicYear
      });

      // Map Metadata (Basic)
      newMetadata.push({
        studentId: student.id,
        kokurikuler: row.Kokurikuler || row.kokurikuler || '',
        extracurriculars: [],
        catatanWaliKelas: row['Catatan Wali Kelas'] || row.catatan || '',
        tanggapanOrangTua: '',
        waliKelasName: row['Wali Kelas'] || '',
        waliKelasNip: '',
        kepalaSekolahName: '',
        kepalaSekolahNip: '',
        tanggalRaport: '',
        tempatRaport: ''
      });
    });

    if (importedCount > 0) {
      onImport(newGrades, newAttendance, newMetadata);
      setSuccess(`Berhasil mengimport data untuk ${importedCount} siswa.`);
      setPreviewData([]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setError('Tidak ada data siswa yang cocok ditemukan (berdasarkan NISN).');
    }
  };

  const downloadTemplate = () => {
    const headers = ['NISN', 'Nama'];
    subjects.forEach(s => {
      headers.push(s.name);
      headers.push(`Deskripsi ${s.name}`);
    });
    headers.push('Sakit', 'Izin', 'Alpa', 'Kokurikuler', 'Catatan Wali Kelas');

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Nilai");
    XLSX.writeFile(wb, "Template_Nilai_SMK.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Nilai Excel</h1>
          <p className="text-gray-500 mt-1">Unggah file Excel untuk mengimport nilai siswa secara massal.</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm"
        >
          <Download size={18} />
          <span>Unduh Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Unggah File</h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">Klik untuk unggah</p>
                <p className="text-xs text-gray-500 mt-1">Format .xlsx atau .xls</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden" 
              />
            </div>

            {file && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
                <FileSpreadsheet className="text-blue-600" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl flex items-start gap-3 text-sm">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <p>{success}</p>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!file || previewData.length === 0}
              className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              Proses Import
            </button>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800 mb-3">
              <Info size={20} />
              <h3 className="font-bold">Petunjuk Import</h3>
            </div>
            <ul className="text-sm text-amber-800/80 space-y-2 list-disc pl-4">
              <li>Pastikan kolom <b>NISN</b> tersedia untuk mencocokkan data siswa.</li>
              <li>Nama kolom mata pelajaran harus sesuai dengan nama mata pelajaran di sistem.</li>
              <li>Gunakan kolom <b>Sakit, Izin, Alpa</b> untuk data kehadiran.</li>
              <li>Data yang sudah ada untuk siswa tersebut akan diperbarui.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Preview Data</h2>
              <p className="text-sm text-gray-500">Pratinjau data dari file yang diunggah.</p>
            </div>
            <div className="flex-1 overflow-auto">
              {previewData.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {Object.keys(previewData[0]).slice(0, 6).map(key => (
                        <th key={key} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                          {key}
                        </th>
                      ))}
                      {Object.keys(previewData[0]).length > 6 && (
                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                          ...
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        {Object.values(row).slice(0, 6).map((val: any, j) => (
                          <td key={j} className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">
                            {val}
                          </td>
                        ))}
                        {Object.values(row).length > 6 && (
                          <td className="px-4 py-3 text-sm text-gray-400 italic">
                            +{Object.values(row).length - 6} kolom lagi
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12">
                  <FileSpreadsheet size={48} className="mb-4 opacity-20" />
                  <p>Belum ada data untuk ditampilkan.</p>
                </div>
              )}
            </div>
            {previewData.length > 10 && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium">Menampilkan 10 dari {previewData.length} baris data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
