import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import SubjectList from './components/SubjectList';
import GradeEntry from './components/GradeEntry';
import GradeImport from './components/GradeImport';
import ReportPanel from './components/ReportPanel';
import ReportCoverPanel from './components/ReportCoverPanel';
import SchoolProfileSettings from './components/SchoolProfileSettings';
import LegerPanel from './components/LegerPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { Student, Subject, Grade, Attendance, ReportMetadata, SchoolProfile } from './types';
import { generatePDF, generateDetailedPDF, generateBulkPDF, exportToExcel } from './lib/reportGenerator';

// Mock Data for initial preview
const MOCK_STUDENTS: Student[] = [
  { 
    id: '1', 
    nisn: '0102687202', 
    name: 'PUTRI AMELIA TOBUHU', 
    class: 'X', 
    major: 'Manajemen Perkantoran', 
    semester: '2 (Genap)', 
    academicYear: '2025/2026', 
    school: 'SMK KONOHA',
    address: 'Jalan TNI 3 Desa Salongo Kec. Bolaang Uki',
    phase: 'E',
    createdAt: new Date() 
  },
];

const MOCK_SUBJECTS: Subject[] = [
  { id: 's1', code: 'A01', name: 'Pendidikan Agama Islam dan Budi Pekerti', category: 'A. Muatan Umum', teacherName: 'Firawati Harun, S.Pd' },
  { id: 's2', code: 'A02', name: 'Pendidikan Pancasila dan Kewarganegaraan', category: 'A. Muatan Umum', teacherName: 'Fahmi Djibran, SH' },
  { id: 's3', code: 'A03', name: 'Bahasa Indonesia', category: 'A. Muatan Umum', teacherName: 'Devita Meli, S.Pd' },
  { id: 's4', code: 'A04', name: 'Pendidikan Jasmani, Olahraga dan Kesehatan', category: 'A. Muatan Umum', teacherName: 'Moh.Gilang Pulumoduyo, S,Pd' },
  { id: 's5', code: 'A05', name: 'Sejarah', category: 'A. Muatan Umum', teacherName: 'Ibrahim Nur, S.Pd' },
  { id: 's6', code: 'A06', name: 'Seni Rupa', category: 'A. Muatan Umum', teacherName: 'Herman Wahani, S.Pd' },
  { id: 's7', code: 'A07', name: 'Muatan Lokal', category: 'A. Muatan Umum', teacherName: 'Firawati Harun, S.Pd' },
  { id: 's8', code: 'B01', name: 'Matematika', category: 'B. Muatan Kejuruan', teacherName: 'Wahyu S.N Kasim, S.Pd, S.Pd' },
  { id: 's9', code: 'B02', name: 'Bahasa Inggris', category: 'B. Muatan Kejuruan', teacherName: 'Ramdani Asrid Langi, S.Pd' },
  { id: 's10', code: 'B03', name: 'Informatika', category: 'B. Muatan Kejuruan', teacherName: 'Herman Wahani, S.Pd' },
  { id: 's11', code: 'B04', name: 'Projek IPAS', category: 'B. Muatan Kejuruan', teacherName: 'Nurfaidah, S.Si' },
];

const MOCK_GRADES: Grade[] = [
  { id: 'g1', studentId: '1', subjectId: 's1', score: 78, predicate: 'B', description: 'Menunjukkan penguasaan dalam memahami iman dan Ruang lingkup syuabul iman...', semester: '1 (Ganjil)', academicYear: '2025/2026', updatedAt: new Date() },
  { id: 'g2', studentId: '1', subjectId: 's2', score: 50, predicate: 'D', description: 'Menunjukan penguasaan dalam memahami dan membuat tentang konstitusi...', semester: '1 (Ganjil)', academicYear: '2025/2026', updatedAt: new Date() },
];

const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'a1', studentId: '1', sick: 1, permission: 2, absent: 5, semester: '1 (Ganjil)', academicYear: '2025/2026', updatedAt: new Date() }
];

const MOCK_METADATA: ReportMetadata[] = [
  {
    studentId: '1',
    kokurikuler: 'Pada semester ini, Ananda menunjukkan capaian yang baik dalam penguatan profil lulusan...',
    extracurriculars: [{ name: 'Pramuka', description: 'Mampu melaksanakan upacara dan memperaktikan baris-berbaris tali-temali dan semapore' }],
    catatanWaliKelas: 'Saya perhatikan kamu sering kali tidak mengumpulkan tugas tepat waktu...',
    tanggapanOrangTua: '',
    waliKelasName: 'Herman Wahani, S.Pd',
    waliKelasNip: '198502262014021001',
    kepalaSekolahName: 'Putu Astawan, S.Pd',
    kepalaSekolahNip: '19810109 200902 1 001',
    tanggalRaport: '18 Desember 2025',
    tempatRaport: 'Salongo'
  }
];

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  name: 'SMK KONOHA',
  npsn: '69754524',
  nss: '322171001501',
  address: 'Jalan TNI 3 Desa Salongo Kec. Bolaang Uki',
  postalCode: '995774',
  phone: '-',
  village: 'Salongo',
  district: 'Bolaang Uki',
  city: 'Bolaang Mongondow Selatan',
  province: 'Sulawesi Utara',
  website: '-',
  email: 'smkcas1@gmail.com',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg/1200px-Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg.png',
  headmasterName: 'Putu Astawan, S.Pd',
  headmasterNip: '19810109 200902 1 001'
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentIdForGrades, setSelectedStudentIdForGrades] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for data with localStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('smk_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('smk_subjects');
    return saved ? JSON.parse(saved) : MOCK_SUBJECTS;
  });
  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem('smk_grades');
    return saved ? JSON.parse(saved) : MOCK_GRADES;
  });
  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('smk_attendance');
    return saved ? JSON.parse(saved) : MOCK_ATTENDANCE;
  });
  const [metadata, setMetadata] = useState<ReportMetadata[]>(() => {
    const saved = localStorage.getItem('smk_metadata');
    return saved ? JSON.parse(saved) : MOCK_METADATA;
  });
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('smk_school_profile');
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_PROFILE;
  });

  // Persist to localStorage
  React.useEffect(() => {
    localStorage.setItem('smk_students', JSON.stringify(students));
  }, [students]);

  React.useEffect(() => {
    localStorage.setItem('smk_subjects', JSON.stringify(subjects));
  }, [subjects]);

  React.useEffect(() => {
    localStorage.setItem('smk_grades', JSON.stringify(grades));
  }, [grades]);

  React.useEffect(() => {
    localStorage.setItem('smk_attendance', JSON.stringify(attendance));
  }, [attendance]);

  React.useEffect(() => {
    localStorage.setItem('smk_metadata', JSON.stringify(metadata));
  }, [metadata]);

  React.useEffect(() => {
    localStorage.setItem('smk_school_profile', JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  const stats = useMemo(() => ({
    totalStudents: students.length,
    totalSubjects: subjects.length,
    totalGrades: grades.length,
    averageScore: grades.length > 0 ? grades.reduce((acc, g) => acc + g.score, 0) / grades.length : 0
  }), [students, subjects, grades]);

  const handleLogin = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      if (email === 'admin@smk.sch.id' && pass === 'admin123') {
        setIsAuthenticated(true);
      } else {
        setError('Email atau password salah. Coba admin@smk.sch.id / admin123');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleImportStudents = (newStudentsData: Omit<Student, 'id' | 'createdAt'>[]) => {
    const newStudents: Student[] = newStudentsData.map(data => ({
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    }));
    setStudents(prev => [...prev, ...newStudents]);
  };

  const handleEditStudent = (student: Student) => {
    setStudents(prev => prev.map(s => s.id === student.id ? student : s));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setGrades(prev => prev.filter(g => g.studentId !== id));
    setAttendance(prev => prev.filter(a => a.studentId !== id));
    setMetadata(prev => prev.filter(m => m.studentId !== id));
  };

  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setSubjects([...subjects, newSubject]);
  };

  const handleEditSubject = (subject: Subject) => {
    setSubjects(subjects.map(s => s.id === subject.id ? subject : s));
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setGrades(grades.filter(g => g.subjectId !== id));
  };

  const handleSaveGrades = async (
    studentId: string, 
    newGrades: Omit<Grade, 'id' | 'updatedAt'>[],
    newAttendance: Omit<Attendance, 'id' | 'updatedAt'>,
    newMetadata: ReportMetadata
  ) => {
    // Save Grades
    const gradesToKeep = grades.filter(g => g.studentId !== studentId);
    const updatedGrades = [
      ...gradesToKeep,
      ...newGrades.map(g => ({
        ...g,
        id: Math.random().toString(36).substr(2, 9),
        updatedAt: new Date()
      }))
    ];
    setGrades(updatedGrades);

    // Save Attendance
    const attendanceToKeep = attendance.filter(a => a.studentId !== studentId);
    const updatedAttendance = [
      ...attendanceToKeep,
      { ...newAttendance, id: Math.random().toString(36).substr(2, 9), updatedAt: new Date() }
    ];
    setAttendance(updatedAttendance);

    // Save Metadata
    const metadataToKeep = metadata.filter(m => m.studentId !== studentId);
    const updatedMetadata = [...metadataToKeep, newMetadata];
    setMetadata(updatedMetadata);
  };

  const handleImportGrades = (
    newGradesData: Omit<Grade, 'id' | 'updatedAt'>[],
    newAttendanceData: Omit<Attendance, 'id' | 'updatedAt'>[],
    newMetadataData: ReportMetadata[]
  ) => {
    // Process Grades
    const updatedGrades = [...grades];
    newGradesData.forEach(newGrade => {
      const index = updatedGrades.findIndex(g => g.studentId === newGrade.studentId && g.subjectId === newGrade.subjectId);
      if (index !== -1) {
        updatedGrades[index] = { ...newGrade, id: updatedGrades[index].id, updatedAt: new Date() };
      } else {
        updatedGrades.push({ ...newGrade, id: Math.random().toString(36).substr(2, 9), updatedAt: new Date() });
      }
    });
    setGrades(updatedGrades);

    // Process Attendance
    const updatedAttendance = [...attendance];
    newAttendanceData.forEach(newAtt => {
      const index = updatedAttendance.findIndex(a => a.studentId === newAtt.studentId);
      if (index !== -1) {
        updatedAttendance[index] = { ...newAtt, id: updatedAttendance[index].id, updatedAt: new Date() };
      } else {
        updatedAttendance.push({ ...newAtt, id: Math.random().toString(36).substr(2, 9), updatedAt: new Date() });
      }
    });
    setAttendance(updatedAttendance);

    // Process Metadata
    const updatedMetadata = [...metadata];
    newMetadataData.forEach(newMeta => {
      const index = updatedMetadata.findIndex(m => m.studentId === newMeta.studentId);
      if (index !== -1) {
        updatedMetadata[index] = { ...newMeta };
      } else {
        updatedMetadata.push(newMeta);
      }
    });
    setMetadata(updatedMetadata);
  };

  const handleExportPDF = (student: Student) => {
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const studentAttendance = attendance.find(a => a.studentId === student.id);
    const studentMetadata = metadata.find(m => m.studentId === student.id);
    generatePDF(student, subjects, studentGrades, studentAttendance, studentMetadata, true, undefined, schoolProfile);
  };

  const handleExportDetailedPDF = (student: Student) => {
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const studentAttendance = attendance.find(a => a.studentId === student.id);
    const studentMetadata = metadata.find(m => m.studentId === student.id);
    generateDetailedPDF(student, subjects, studentGrades, studentAttendance, studentMetadata, schoolProfile);
  };

  const handleExportBulkPDF = (studentsToExport: Student[]) => {
    const attendanceMap: Record<string, Attendance> = {};
    attendance.forEach(a => { attendanceMap[a.studentId] = a; });
    
    const metadataMap: Record<string, ReportMetadata> = {};
    metadata.forEach(m => { metadataMap[m.studentId] = m; });

    generateBulkPDF(studentsToExport, subjects, grades, attendanceMap, metadataMap);
  };

  const handleExportExcel = (studentsToExport: Student[]) => {
    exportToExcel(studentsToExport, subjects, grades);
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login onLogin={handleLogin} loading={loading} error={error} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        userEmail="admin@smk.sch.id"
      >
        {activeTab === 'dashboard' && <Dashboard stats={stats} />}
        {activeTab === 'students' && (
          <StudentList 
            students={students} 
            onAdd={handleAddStudent} 
            onImport={handleImportStudents}
            onEdit={handleEditStudent} 
            onDelete={handleDeleteStudent}
          />
        )}
        {activeTab === 'subjects' && (
          <SubjectList 
            subjects={subjects} 
            onAdd={handleAddSubject} 
            onEdit={handleEditSubject} 
            onDelete={handleDeleteSubject} 
          />
        )}
        {activeTab === 'grades' && (
          <GradeEntry 
            students={students} 
            subjects={subjects} 
            grades={grades} 
            attendance={attendance}
            metadata={metadata}
            selectedStudentId={selectedStudentIdForGrades || undefined}
            onSelectStudent={(id) => setSelectedStudentIdForGrades(id)}
            onSaveGrades={handleSaveGrades} 
            onExportPDF={handleExportPDF}
          />
        )}
        {activeTab === 'import-grades' && (
          <GradeImport 
            students={students} 
            subjects={subjects} 
            onImport={handleImportGrades} 
          />
        )}
        {activeTab === 'reports' && (
          <ReportPanel 
            students={students} 
            subjects={subjects}
            grades={grades}
            attendance={attendance}
            metadata={metadata}
            schoolProfile={schoolProfile}
            onExportPDF={handleExportPDF} 
            onExportDetailedPDF={handleExportDetailedPDF}
            onExportBulkPDF={handleExportBulkPDF}
            onExportExcel={handleExportExcel} 
          />
        )}
        {activeTab === 'report-cover' && (
          <ReportCoverPanel students={students} schoolProfile={schoolProfile} />
        )}
        {activeTab === 'school-settings' && (
          <SchoolProfileSettings 
            profile={schoolProfile} 
            onSave={(newProfile) => {
              setSchoolProfile(newProfile);
              setActiveTab('report-cover');
            }} 
          />
        )}
        {activeTab === 'leger' && (
          <LegerPanel 
            students={students} 
            subjects={subjects} 
            grades={grades} 
            onEditStudent={(id) => {
              setSelectedStudentIdForGrades(id);
              setActiveTab('grades');
            }}
          />
        )}
      </Layout>
    </ErrorBoundary>
  );
}
