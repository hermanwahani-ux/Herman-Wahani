import React, { useState } from 'react';
import { Search, Printer, FileText, User, School, Info, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { Student, SchoolProfile } from '../types';
import { cn } from '../lib/utils';

interface ReportCoverPanelProps {
  students: Student[];
  schoolProfile: SchoolProfile;
}

type CoverPage = 'cover' | 'school' | 'identity';

export default function ReportCoverPanel({ students, schoolProfile }: ReportCoverPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activePage, setActivePage] = useState<CoverPage>('cover');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nisn.includes(searchTerm)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cover & Identitas Raport</h1>
          <p className="text-gray-500 mt-1">Cetak sampul dan lembar identitas peserta didik.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student Selection Sidebar */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-0.5",
                    selectedStudent?.id === student.id 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <span className="font-bold text-sm truncate">{student.name}</span>
                  <span className={cn("text-xs", selectedStudent?.id === student.id ? "text-blue-100" : "text-gray-400")}>
                    NISN: {student.nisn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8 space-y-4">
          {selectedStudent ? (
            <>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sticky top-0 z-10 no-print">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActivePage('cover')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      activePage === 'cover' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <FileText size={18} />
                    <span>Sampul</span>
                  </button>
                  <button
                    onClick={() => setActivePage('school')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      activePage === 'school' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <School size={18} />
                    <span>Info Sekolah</span>
                  </button>
                  <button
                    onClick={() => setActivePage('identity')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      activePage === 'identity' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <User size={18} />
                    <span>Identitas</span>
                  </button>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Printer size={18} />
                  <span>Cetak Halaman</span>
                </button>
              </div>

              <div className="bg-gray-200 p-8 rounded-2xl overflow-auto min-h-[800px] flex justify-center print:p-0 print:bg-white print:block">
                <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl print:shadow-none print:w-full print:p-0 print:min-h-0">
                  {activePage === 'cover' && <CoverPage student={selectedStudent} schoolProfile={schoolProfile} />}
                  {activePage === 'school' && <SchoolInfoPage student={selectedStudent} schoolProfile={schoolProfile} />}
                  {activePage === 'identity' && <IdentityPage student={selectedStudent} schoolProfile={schoolProfile} />}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <User size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Pilih Siswa</h3>
              <p className="text-gray-500 max-w-xs mt-2">Silakan pilih siswa dari daftar di samping untuk melihat pratinjau cover raport.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CoverPage = ({ student, schoolProfile }: { student: Student; schoolProfile: SchoolProfile }) => (
  <div className="flex flex-col items-center text-center h-full font-serif">
    <div className="mt-20 space-y-2">
      <h1 className="text-2xl font-bold uppercase">Rapor Peserta Didik</h1>
      <h2 className="text-2xl font-bold uppercase">Sekolah Menengah Kejuruan</h2>
      <h2 className="text-2xl font-bold uppercase">(SMK)</h2>
    </div>

    <div className="my-24">
      <img 
        src={schoolProfile.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg/1200px-Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg.png"} 
        alt="Logo Sekolah" 
        className="w-48 h-48 object-contain"
        referrerPolicy="no-referrer"
      />
    </div>

    <div className="w-full space-y-12 mt-auto mb-20">
      <div className="space-y-4">
        <p className="text-lg font-bold uppercase">Nama Peserta Didik</p>
        <div className="border-2 border-black py-4 px-8 inline-block min-w-[300px]">
          <p className="text-xl font-bold uppercase tracking-widest">{student.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-lg font-bold uppercase">NIS / NISN</p>
        <div className="border-2 border-black py-4 px-8 inline-block min-w-[300px]">
          <p className="text-xl font-bold uppercase tracking-widest">{student.nis ? `${student.nis} / ` : ''}{student.nisn}</p>
        </div>
      </div>
    </div>

    <div className="mt-auto space-y-2">
      <p className="text-lg font-bold uppercase">Kementerian Pendidikan, Kebudayaan, Riset dan Teknologi</p>
      <p className="text-lg font-bold uppercase">Republik Indonesia</p>
    </div>
  </div>
);

const SchoolInfoPage = ({ student, schoolProfile }: { student: Student; schoolProfile: SchoolProfile }) => (
  <div className="flex flex-col h-full font-serif text-sm">
    <div className="text-center mb-16">
      <h1 className="text-xl font-bold uppercase">Rapor Peserta Didik</h1>
      <h2 className="text-xl font-bold uppercase">Sekolah Menengah Kejuruan</h2>
      <h2 className="text-xl font-bold uppercase">(SMK)</h2>
    </div>

    <div className="space-y-6">
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Bidang Keahlian</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{student.major.includes('Manajemen') ? 'Bisnis dan Manajemen' : '-'}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Program Keahlian</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{student.major}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Konsentrasi Keahlian</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{student.major}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Nama Sekolah</p>
        <p>:</p>
        <p className="border-b border-black font-bold uppercase">{schoolProfile.name}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>NPSN</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.npsn}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>NIS/NSS/NDS</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.nss}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Alamat Sekolah</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.address}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p></p>
        <p></p>
        <div className="flex justify-between border-b border-black font-bold">
          <p>Kode Pos : {schoolProfile.postalCode}</p>
          <p>Telp. {schoolProfile.phone}</p>
        </div>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Desa/Kelurahan</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.village}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Kecamatan</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.district}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Kota/Kabupaten</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.city}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Provinsi</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.province}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>Website</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.website}</p>
      </div>
      <div className="grid grid-cols-[200px_20px_1fr] gap-2">
        <p>E-mail</p>
        <p>:</p>
        <p className="border-b border-black font-bold">{schoolProfile.email}</p>
      </div>
    </div>
  </div>
);

const IdentityPage = ({ student, schoolProfile }: { student: Student; schoolProfile: SchoolProfile }) => (
  <div className="flex flex-col h-full font-serif text-[11pt] leading-relaxed">
    <h1 className="text-center font-bold uppercase mb-8">Keterangan Tentang Peserta Didik</h1>
    
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
            <p>1</p>
            <p>Nama Peserta didik (Lengkap)</p>
            <p>:</p>
            <p className="font-bold">{student.name}</p>
          </div>
          <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
            <p>2</p>
            <p>Nomor Induk / NISN</p>
            <p>:</p>
            <p>{student.nis ? `${student.nis} / ` : ''}{student.nisn}</p>
          </div>
          <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
            <p>3</p>
            <p>Tempat Tanggal Lahir</p>
            <p>:</p>
            <p>{student.birthPlace || '-'}, {student.birthDate || '-'}</p>
          </div>
          <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
            <p>4</p>
            <p>Jenis Kelamin</p>
            <p>:</p>
            <p>{student.gender || '-'}</p>
          </div>
          <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
            <p>5</p>
            <p>Agama/Kepercayaan</p>
            <p>:</p>
            <p>{student.religion || '-'}</p>
          </div>
        </div>
        
        {/* Student Photo */}
        <div className="w-[30mm] h-[40mm] border border-black flex items-center justify-center ml-4 shrink-0">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt="Foto Siswa" className="w-full h-full object-cover" />
          ) : (
            <div className="text-[8pt] text-gray-400 text-center p-2">
              Pas Foto<br/>3 x 4
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>6</p>
        <p>Status dalam Keluarga</p>
        <p>:</p>
        <p>{student.familyStatus || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>7</p>
        <p>Anak ke</p>
        <p>:</p>
        <p>{student.childOrder || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>8</p>
        <p>Alamat Peserta didik</p>
        <p>:</p>
        <p>{student.address || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>9</p>
        <p>Nomor Telepon Rumah</p>
        <p>:</p>
        <p>{student.phone || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>10</p>
        <p>Sekolah Asal</p>
        <p>:</p>
        <p>{student.previousSchool || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>11</p>
        <p>Diterima di sekolah ini</p>
        <p></p>
        <p></p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1 pl-8">
        <p></p>
        <p>Di kelas</p>
        <p>:</p>
        <p>{student.admissionClass || student.class}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1 pl-8">
        <p></p>
        <p>Pada tanggal</p>
        <p>:</p>
        <p>{student.admissionDate || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p></p>
        <p>Nama Orang Tua</p>
        <p></p>
        <p></p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1 pl-8">
        <p></p>
        <p>a. Ayah</p>
        <p>:</p>
        <p>{student.fatherName || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1 pl-8">
        <p></p>
        <p>b. Ibu</p>
        <p>:</p>
        <p>{student.motherName || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>12</p>
        <p>Alamat Orang Tua</p>
        <p>:</p>
        <p>{student.parentAddress || student.address}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1 pl-8">
        <p></p>
        <p>Nomor Telepon Rumah</p>
        <p>:</p>
        <p>{student.parentPhone || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>13</p>
        <p>Pekerjaan Orang Tua</p>
        <p></p>
        <p></p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1 pl-8">
        <p></p>
        <p>a. Ayah</p>
        <p>:</p>
        <p>{student.fatherJob || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1 pl-8">
        <p></p>
        <p>b. Ibu</p>
        <p>:</p>
        <p>{student.motherJob || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>14</p>
        <p>Nama Wali Peserta didik</p>
        <p>:</p>
        <p>{student.guardianName || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>15</p>
        <p>Alamat Wali Peserta didik</p>
        <p>:</p>
        <p>{student.guardianAddress || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1 pl-8">
        <p></p>
        <p>Nomor Telepon Rumah</p>
        <p>:</p>
        <p>{student.guardianPhone || '-'}</p>
      </div>
      <div className="grid grid-cols-[30px_1fr_20px_1.5fr] gap-1">
        <p>16</p>
        <p>Pekerjaan Wali Peserta didik</p>
        <p>:</p>
        <p>{student.guardianJob || '-'}</p>
      </div>
    </div>

    <div className="mt-12 ml-auto text-right space-y-20">
      <div>
        <p>{schoolProfile.city}, {student.admissionDate || '11 Juli 2025'}</p>
        <p>Kepala Sekolah</p>
      </div>
      <div>
        <p className="font-bold underline">{schoolProfile.headmasterName}</p>
        <p>NIP. {schoolProfile.headmasterNip}</p>
      </div>
    </div>
  </div>
);
