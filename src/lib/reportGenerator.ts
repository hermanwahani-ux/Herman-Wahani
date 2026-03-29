import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Student, Subject, Grade, Attendance, ReportMetadata, SchoolProfile } from '../types';

export const generatePDF = (
  student: Student, 
  subjects: Subject[], 
  grades: Grade[], 
  attendance?: Attendance, 
  metadata?: ReportMetadata,
  saveFile: boolean = true,
  existingDoc?: jsPDF,
  schoolProfile?: SchoolProfile
) => {
  const doc = existingDoc || new jsPDF();
  if (existingDoc) {
    doc.addPage();
  }
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN HASIL BELAJAR', pageWidth / 2, 15, { align: 'center' });
  doc.text('(RAPOR)', pageWidth / 2, 20, { align: 'center' });

  // Student Info Header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const leftColX = 15;
  const rightColX = pageWidth / 2 + 10;
  let currentY = 35;

  const drawInfoRow = (label: string, value: string, x: number, y: number) => {
    doc.text(label, x, y);
    doc.text(`: ${value}`, x + 35, y);
  };

  drawInfoRow('Nama Peserta didik', student.name, leftColX, currentY);
  drawInfoRow('NISN', student.nisn, leftColX, currentY + 5);
  drawInfoRow('Sekolah', schoolProfile?.name || student.school || 'SMK COKROAMINOTO SALONGO', leftColX, currentY + 10);
  drawInfoRow('Alamat', schoolProfile?.address || student.address || '-', leftColX, currentY + 15);

  drawInfoRow('Kelas', student.class, rightColX, currentY);
  drawInfoRow('Fase', student.phase || 'E', rightColX, currentY + 5);
  drawInfoRow('Semester', student.semester, rightColX, currentY + 10);
  drawInfoRow('Tahun Pelajaran', student.academicYear, rightColX, currentY + 15);

  // Table Data
  const categories = ['A. Muatan Umum', 'B. Muatan Kejuruan', 'C. Mata Pelajaran Pilihan'];
  const tableRows: any[] = [];

  categories.forEach(category => {
    const catSubjects = subjects.filter(s => s.category === category);
    if (catSubjects.length > 0) {
      tableRows.push([{ content: category, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]);
      catSubjects.forEach((subject, idx) => {
        const grade = grades.find(g => g.subjectId === subject.id);
        tableRows.push([
          idx + 1,
          { content: `${subject.name}\nNama Guru : ${subject.teacherName || '-'}`, styles: { fontSize: 8 } },
          grade?.score || '-',
          grade?.description || '-'
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: 60,
    head: [['No.', 'Mata Pelajaran', 'Nilai Akhir', 'Capaian Kompetensi']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: 0, lineWidth: 0.1 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 'auto' }
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY + 10;

  // Kokurikuler
  doc.setFont('helvetica', 'bold');
  doc.text('KOKURIKULER', 15, finalY);
  doc.setFont('helvetica', 'normal');
  doc.rect(15, finalY + 2, pageWidth - 30, 15);
  doc.text(metadata?.kokurikuler || '-', 17, finalY + 7, { maxWidth: pageWidth - 34 });
  finalY += 25;

  // Ekstrakurikuler
  autoTable(doc, {
    startY: finalY,
    head: [['No.', 'Ekstrakurikuler', 'Keterangan']],
    body: metadata?.extracurriculars?.map((ex, i) => [i + 1, ex.name, ex.description]) || [['-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: 0, lineWidth: 0.1 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 'auto' }
    }
  });

  finalY = (doc as any).lastAutoTable.finalY + 10;

  // Attendance and Catatan
  const attendanceData = [
    ['Sakit', `${attendance?.sick || 0} hari`],
    ['Izin', `${attendance?.permission || 0} hari`],
    ['Tanpa Keterangan', `${attendance?.absent || 0} hari`]
  ];

  autoTable(doc, {
    startY: finalY,
    head: [['Ketidakhadiran', '']],
    body: attendanceData,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: 0, lineWidth: 0.1 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 20, halign: 'center' }
    },
    margin: { left: 15 }
  });

  const attendanceY = (doc as any).lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalY,
    head: [['Catatan Wali Kelas']],
    body: [[metadata?.catatanWaliKelas || '-']],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: 0, lineWidth: 0.1 },
    margin: { left: 85 }
  });

  finalY = Math.max(attendanceY, (doc as any).lastAutoTable.finalY) + 15;

  // Signatures
  doc.setFontSize(9);
  doc.text('Tanggapan Orang Tua/Wali', 15, finalY);
  doc.rect(15, finalY + 2, pageWidth / 2 - 20, 15);

  const sigY = finalY + 30;
  doc.text('Orang Tua Peserta Didik', 25, sigY);
  doc.text('_______________________', 20, sigY + 20);

  doc.text(`${metadata?.tempatRaport || 'Salongo'}, ${metadata?.tanggalRaport || '18 Desember 2025'}`, pageWidth - 70, sigY - 5);
  doc.text('Wali Kelas', pageWidth - 60, sigY);
  doc.text(metadata?.waliKelasName || '_______________________', pageWidth - 65, sigY + 20);
  if (metadata?.waliKelasNip) doc.text(`NIP. ${metadata?.waliKelasNip}`, pageWidth - 65, sigY + 25);

  doc.text('Kepala Sekolah', pageWidth / 2, sigY + 35, { align: 'center' });
  doc.text(metadata?.kepalaSekolahName || '_______________________', pageWidth / 2, sigY + 55, { align: 'center' });
  if (metadata?.kepalaSekolahNip) doc.text(`NIP. ${metadata?.kepalaSekolahNip}`, pageWidth / 2, sigY + 60, { align: 'center' });

  if (saveFile) {
    doc.save(`Raport_${student.name}_${student.nisn}.pdf`);
  }
  return doc;
};

export const generateIdentityPDF = (
  student: Student,
  schoolProfile: SchoolProfile,
  saveFile: boolean = true,
  existingDoc?: jsPDF
) => {
  const doc = existingDoc || new jsPDF();
  if (existingDoc) {
    doc.addPage();
  }
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KETERANGAN TENTANG DIRI PESERTA DIDIK', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let currentY = 40;
  const leftX = 20;
  const midX = 80;
  const valueX = 85;

  const drawRow = (num: string, label: string, value: string) => {
    doc.text(num, leftX - 5, currentY);
    doc.text(label, leftX, currentY);
    doc.text(':', midX, currentY);
    doc.text(value || '-', valueX, currentY, { maxWidth: pageWidth - valueX - 20 });
    currentY += 8;
  };

  drawRow('1.', 'Nama Peserta Didik (Lengkap)', student.name);
  drawRow('2.', 'Nomor Induk / NISN', `${student.nis ? student.nis + ' / ' : ''}${student.nisn}`);
  drawRow('3.', 'Tempat, Tanggal Lahir', `${student.birthPlace || '-'}, ${student.birthDate || '-'}`);
  drawRow('4.', 'Jenis Kelamin', student.gender || '-');
  drawRow('5.', 'Agama', student.religion || '-');
  drawRow('6.', 'Status dalam Keluarga', student.familyStatus || '-');
  drawRow('7.', 'Anak ke', String(student.childOrder || '-'));
  drawRow('8.', 'Alamat Peserta Didik', student.address || '-');
  drawRow('9.', 'Nomor Telepon Rumah', student.phone || '-');
  drawRow('10.', 'Sekolah Asal', student.previousSchool || '-');
  drawRow('11.', 'Diterima di sekolah ini', '');
  currentY -= 4;
  doc.text('a. Di kelas', leftX + 5, currentY);
  doc.text(':', midX, currentY);
  doc.text(student.admissionClass || student.class, valueX, currentY);
  currentY += 8;
  doc.text('b. Pada tanggal', leftX + 5, currentY);
  doc.text(':', midX, currentY);
  doc.text(student.admissionDate || '-', valueX, currentY);
  currentY += 8;
  
  drawRow('12.', 'Nama Orang Tua', '');
  currentY -= 4;
  doc.text('a. Ayah', leftX + 5, currentY);
  doc.text(':', midX, currentY);
  doc.text(student.fatherName || '-', valueX, currentY);
  currentY += 8;
  doc.text('b. Ibu', leftX + 5, currentY);
  doc.text(':', midX, currentY);
  doc.text(student.motherName || '-', valueX, currentY);
  currentY += 8;

  drawRow('13.', 'Alamat Orang Tua', student.parentAddress || student.address);
  drawRow('14.', 'Pekerjaan Orang Tua', '');
  currentY -= 4;
  doc.text('a. Ayah', leftX + 5, currentY);
  doc.text(':', midX, currentY);
  doc.text(student.fatherJob || '-', valueX, currentY);
  currentY += 8;
  doc.text('b. Ibu', leftX + 5, currentY);
  doc.text(':', midX, currentY);
  doc.text(student.motherJob || '-', valueX, currentY);
  currentY += 8;

  drawRow('15.', 'Nama Wali Peserta Didik', student.guardianName || '-');
  drawRow('16.', 'Alamat Wali Peserta Didik', student.guardianAddress || '-');
  drawRow('17.', 'Pekerjaan Wali Peserta Didik', student.guardianJob || '-');

  // Photo
  const photoX = pageWidth - 50;
  const photoY = 40;
  const photoW = 30;
  const photoH = 40;
  doc.rect(photoX, photoY, photoW, photoH);
  if (student.photoUrl) {
    try {
      // Basic check for data URL format
      const format = student.photoUrl.split(';')[0].split('/')[1].toUpperCase();
      doc.addImage(student.photoUrl, format, photoX, photoY, photoW, photoH);
    } catch (e) {
      console.error('Error adding photo to PDF:', e);
      doc.setFontSize(8);
      doc.text('Gagal memuat foto', photoX + 2, photoY + 20);
      doc.setFontSize(10);
    }
  } else {
    doc.setFontSize(8);
    doc.text('Pas Foto', photoX + 8, photoY + 18);
    doc.text('3 x 4', photoX + 11, photoY + 23);
    doc.setFontSize(10);
  }

  // Signature
  currentY += 20;
  doc.text(`${schoolProfile.city}, ${student.admissionDate || '-'}`, pageWidth - 70, currentY);
  doc.text('Kepala Sekolah,', pageWidth - 70, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolProfile.headmasterName, pageWidth - 70, currentY + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${schoolProfile.headmasterNip}`, pageWidth - 70, currentY + 35);

  if (saveFile) {
    doc.save(`Identitas_${student.name}_${student.nisn}.pdf`);
  }
  return doc;
};

export const generateDetailedPDF = (
  student: Student,
  subjects: Subject[],
  grades: Grade[],
  attendance: Attendance | undefined,
  metadata: ReportMetadata | undefined,
  schoolProfile: SchoolProfile
) => {
  const doc = new jsPDF();
  
  // Page 1: Identity
  generateIdentityPDF(student, schoolProfile, false, doc);
  
  // Page 2: Grades
  generatePDF(student, subjects, grades, attendance, metadata, false, doc, schoolProfile);
  
  doc.save(`Raport_Lengkap_${student.name}_${student.nisn}.pdf`);
};

export const generateBulkPDF = (
  students: Student[],
  subjects: Subject[],
  grades: Grade[],
  attendances: Record<string, Attendance>,
  metadata: Record<string, ReportMetadata>,
  schoolProfile?: SchoolProfile
) => {
  let doc: jsPDF | undefined;
  students.forEach((student, index) => {
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const studentAttendance = attendances[student.id];
    const studentMetadata = metadata[student.id];
    doc = generatePDF(student, subjects, studentGrades, studentAttendance, studentMetadata, false, doc, schoolProfile);
  });
  
  if (doc) {
    doc.save('Rekap_Raport_Siswa_SMK.pdf');
  }
};

export const exportToExcel = (students: Student[], subjects: Subject[], grades: Grade[]) => {
  const data = students.map(student => {
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const row: any = {
      'NISN': student.nisn,
      'Nama': student.name,
      'Kelas': student.class,
      'Jurusan': student.major,
      'Semester': student.semester,
      'Tahun Ajaran': student.academicYear
    };

    subjects.forEach(subject => {
      const grade = studentGrades.find(g => g.subjectId === subject.id);
      row[subject.name] = grade?.score || 0;
    });

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Nilai Siswa');
  XLSX.writeFile(wb, 'Rekap_Nilai_Siswa_SMK.xlsx');
};
