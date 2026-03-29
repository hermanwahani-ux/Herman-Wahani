export type UserRole = 'admin' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  nss: string;
  address: string;
  postalCode: string;
  phone: string;
  village: string;
  district: string;
  city: string;
  province: string;
  website: string;
  email: string;
  logoUrl?: string;
  headmasterName: string;
  headmasterNip: string;
}

export interface Student {
  id: string;
  nisn: string;
  nis?: string;
  name: string;
  class: string;
  major: string;
  semester: string;
  academicYear: string;
  school: string;
  address: string;
  phone?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  religion?: string;
  familyStatus?: string;
  childOrder?: number;
  previousSchool?: string;
  admissionClass?: string;
  admissionDate?: string;
  fatherName?: string;
  motherName?: string;
  parentAddress?: string;
  parentPhone?: string;
  fatherJob?: string;
  motherJob?: string;
  guardianName?: string;
  guardianAddress?: string;
  guardianPhone?: string;
  guardianJob?: string;
  photoUrl?: string;
  phase: string;
  createdAt: any;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'A. Muatan Umum' | 'B. Muatan Kejuruan' | 'C. Mata Pelajaran Pilihan';
  teacherName: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  score: number;
  predicate: string;
  description: string;
  semester: string;
  academicYear: string;
  updatedAt: any;
}

export interface Attendance {
  id: string;
  studentId: string;
  sick: number;
  permission: number;
  absent: number;
  semester: string;
  academicYear: string;
  updatedAt: any;
}

export interface Extracurricular {
  name: string;
  description: string;
}

export interface ReportMetadata {
  studentId: string;
  kokurikuler: string;
  extracurriculars: Extracurricular[];
  catatanWaliKelas: string;
  tanggapanOrangTua: string;
  waliKelasName: string;
  waliKelasNip: string;
  kepalaSekolahName: string;
  kepalaSekolahNip: string;
  tanggalRaport: string;
  tempatRaport: string;
}
