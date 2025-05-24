export const teacherMockData = {
  totalStudents: 156,
  activeClasses: 8,
  averageAttendance: 92,
  upcomingClasses: [
    { id: 1, subject: "Matemática", time: "14:00", date: "2024-01-20", students: 25, room: "Sala 101" },
    { id: 2, subject: "Física", time: "15:30", date: "2024-01-20", students: 22, room: "Lab Física" },
    { id: 3, subject: "Química", time: "09:00", date: "2024-01-21", students: 20, room: "Lab Química" },
    { id: 4, subject: "Biologia", time: "10:30", date: "2024-01-21", students: 23, room: "Lab Biologia" },
    { id: 5, subject: "História", time: "13:00", date: "2024-01-22", students: 28, room: "Sala 203" }
  ],
  studentPerformance: [
    { month: "Jan", average: 85, approved: 142, pending: 14 },
    { month: "Fev", average: 82, approved: 138, pending: 18 },
    { month: "Mar", average: 88, approved: 145, pending: 11 },
    { month: "Abr", average: 85, approved: 140, pending: 16 },
    { month: "Mai", average: 90, approved: 148, pending: 8 },
    { month: "Jun", average: 87, approved: 144, pending: 12 },
    { month: "Jul", average: 89, approved: 146, pending: 10 },
    { month: "Ago", average: 86, approved: 141, pending: 15 },
    { month: "Set", average: 88, approved: 143, pending: 13 },
    { month: "Out", average: 91, approved: 150, pending: 6 },
    { month: "Nov", average: 89, approved: 147, pending: 9 },
    { month: "Dez", average: 92, approved: 152, pending: 4 }
  ],
  classAttendance: [
    { month: "Jan", attendance: 95, total: 156, present: 148 },
    { month: "Fev", attendance: 93, total: 156, present: 145 },
    { month: "Mar", attendance: 91, total: 156, present: 142 },
    { month: "Abr", attendance: 94, total: 156, present: 147 },
    { month: "Mai", attendance: 92, total: 156, present: 144 },
    { month: "Jun", attendance: 90, total: 156, present: 140 },
    { month: "Jul", attendance: 93, total: 156, present: 145 },
    { month: "Ago", attendance: 91, total: 156, present: 142 },
    { month: "Set", attendance: 94, total: 156, present: 147 },
    { month: "Out", attendance: 96, total: 156, present: 150 },
    { month: "Nov", attendance: 95, total: 156, present: 148 },
    { month: "Dez", attendance: 97, total: 156, present: 151 }
  ],
  subjectDistribution: [
    { 
      subject: "Matemática", 
      students: 45,
      averageGrade: 8.5,
      attendanceRate: 94,
      completionRate: 92
    },
    { 
      subject: "Física", 
      students: 38,
      averageGrade: 8.2,
      attendanceRate: 91,
      completionRate: 88
    },
    { 
      subject: "Química", 
      students: 35,
      averageGrade: 8.7,
      attendanceRate: 93,
      completionRate: 90
    },
    { 
      subject: "Biologia", 
      students: 38,
      averageGrade: 8.9,
      attendanceRate: 95,
      completionRate: 94
    },
    { 
      subject: "História", 
      students: 42,
      averageGrade: 8.6,
      attendanceRate: 92,
      completionRate: 89
    },
    { 
      subject: "Geografia", 
      students: 40,
      averageGrade: 8.8,
      attendanceRate: 93,
      completionRate: 91
    }
  ],
  classPerformance: [
    {
      class: "9º Ano A",
      students: 32,
      averageGrade: 8.7,
      attendanceRate: 94,
      completionRate: 92,
      subjects: [
        { name: "Matemática", average: 8.5 },
        { name: "Física", average: 8.2 },
        { name: "Química", average: 8.8 },
        { name: "Biologia", average: 9.0 }
      ]
    },
    {
      class: "9º Ano B",
      students: 30,
      averageGrade: 8.5,
      attendanceRate: 92,
      completionRate: 90,
      subjects: [
        { name: "Matemática", average: 8.3 },
        { name: "Física", average: 8.0 },
        { name: "Química", average: 8.6 },
        { name: "Biologia", average: 8.8 }
      ]
    }
  ],
  recentActivities: [
    {
      id: 1,
      type: "Avaliação",
      subject: "Matemática",
      class: "9º Ano A",
      date: "2024-01-18",
      status: "Concluído",
      averageGrade: 8.5,
      submissions: 30,
      totalStudents: 32
    },
    {
      id: 2,
      type: "Trabalho em Grupo",
      subject: "Física",
      class: "9º Ano B",
      date: "2024-01-19",
      status: "Em Andamento",
      submissions: 25,
      totalStudents: 30
    }
  ]
};

export const studentMockData = {
  currentGrade: 8.5,
  attendanceRate: 95,
  completedAssignments: 45,
  totalAssignments: 50,
  ranking: {
    position: 15,
    totalStudents: 156,
    improvement: 3
  },
  upcomingDeadlines: [
    { 
      id: 1, 
      subject: "Matemática", 
      task: "Trabalho de Álgebra", 
      deadline: "2024-01-22",
      type: "Trabalho",
      weight: 30,
      status: "Pendente"
    },
    { 
      id: 2, 
      subject: "Física", 
      task: "Relatório de Laboratório", 
      deadline: "2024-01-24",
      type: "Relatório",
      weight: 20,
      status: "Em Andamento"
    },
    { 
      id: 3, 
      subject: "Química", 
      task: "Questionário Online", 
      deadline: "2024-01-25",
      type: "Avaliação",
      weight: 25,
      status: "Não Iniciado"
    }
  ],
  gradeHistory: [
    { 
      subject: "Matemática", 
      grades: [8.5, 9.0, 8.0, 9.5],
      weights: [25, 25, 25, 25],
      average: 8.75,
      ranking: 8,
      teacher: "Prof. Silva"
    },
    { 
      subject: "Física", 
      grades: [7.5, 8.0, 8.5, 8.0],
      weights: [25, 25, 25, 25],
      average: 8.0,
      ranking: 12,
      teacher: "Prof. Santos"
    },
    { 
      subject: "Química", 
      grades: [9.0, 8.5, 9.0, 8.5],
      weights: [25, 25, 25, 25],
      average: 8.75,
      ranking: 5,
      teacher: "Profa. Lima"
    },
    { 
      subject: "Biologia", 
      grades: [8.0, 8.5, 9.0, 8.5],
      weights: [25, 25, 25, 25],
      average: 8.5,
      ranking: 10,
      teacher: "Profa. Costa"
    }
  ],
  attendanceBySubject: [
    { 
      subject: "Matemática", 
      attendance: 98,
      totalClasses: 40,
      presentClasses: 39,
      lastAbsence: "2024-01-10"
    },
    { 
      subject: "Física", 
      attendance: 95,
      totalClasses: 38,
      presentClasses: 36,
      lastAbsence: "2024-01-15"
    },
    { 
      subject: "Química", 
      attendance: 92,
      totalClasses: 36,
      presentClasses: 33,
      lastAbsence: "2024-01-12"
    },
    { 
      subject: "Biologia", 
      attendance: 94,
      totalClasses: 35,
      presentClasses: 33,
      lastAbsence: "2024-01-08"
    }
  ],
  weeklyStudyHours: [
    { day: "Segunda", hours: 3, subjects: ["Matemática", "Física"] },
    { day: "Terça", hours: 2.5, subjects: ["Química", "Biologia"] },
    { day: "Quarta", hours: 4, subjects: ["Matemática", "História"] },
    { day: "Quinta", hours: 3, subjects: ["Física", "Geografia"] },
    { day: "Sexta", hours: 2, subjects: ["Química", "Matemática"] }
  ],
  performanceHistory: [
    {
      month: "Janeiro",
      averageGrade: 8.5,
      attendanceRate: 95,
      completionRate: 90,
      ranking: 15
    },
    {
      month: "Fevereiro",
      averageGrade: 8.7,
      attendanceRate: 96,
      completionRate: 92,
      ranking: 12
    },
    {
      month: "Março",
      averageGrade: 8.9,
      attendanceRate: 97,
      completionRate: 94,
      ranking: 10
    }
  ]
};
