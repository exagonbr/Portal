export const teacherMockData = {
  totalStudents: 156,
  activeClasses: 8,
  averageAttendance: 92,
  upcomingClasses: [
    { id: 1, subject: "Matemática", time: "14:00", date: "2024-01-20", students: 25 },
    { id: 2, subject: "Física", time: "15:30", date: "2024-01-20", students: 22 },
    { id: 3, subject: "Química", time: "09:00", date: "2024-01-21", students: 20 },
  ],
  studentPerformance: [
    { month: "Jan", average: 85 },
    { month: "Fev", average: 82 },
    { month: "Mar", average: 88 },
    { month: "Abr", average: 85 },
    { month: "Mai", average: 90 },
    { month: "Jun", average: 87 },
  ],
  classAttendance: [
    { month: "Jan", attendance: 95 },
    { month: "Fev", attendance: 93 },
    { month: "Mar", attendance: 91 },
    { month: "Abr", attendance: 94 },
    { month: "Mai", attendance: 92 },
    { month: "Jun", attendance: 90 },
  ],
  subjectDistribution: [
    { subject: "Matemática", students: 45 },
    { subject: "Física", students: 38 },
    { subject: "Química", students: 35 },
    { subject: "Biologia", students: 38 },
  ]
};

export const studentMockData = {
  currentGrade: 8.5,
  attendanceRate: 95,
  completedAssignments: 45,
  totalAssignments: 50,
  upcomingDeadlines: [
    { id: 1, subject: "Matemática", task: "Trabalho de Álgebra", deadline: "2024-01-22" },
    { id: 2, subject: "Física", task: "Relatório de Laboratório", deadline: "2024-01-24" },
    { id: 3, subject: "Química", task: "Questionário", deadline: "2024-01-25" },
  ],
  gradeHistory: [
    { subject: "Matemática", grades: [8.5, 9.0, 8.0, 9.5] },
    { subject: "Física", grades: [7.5, 8.0, 8.5, 8.0] },
    { subject: "Química", grades: [9.0, 8.5, 9.0, 8.5] },
    { subject: "Biologia", grades: [8.0, 8.5, 9.0, 8.5] },
  ],
  attendanceBySubject: [
    { subject: "Matemática", attendance: 98 },
    { subject: "Física", attendance: 95 },
    { subject: "Química", attendance: 92 },
    { subject: "Biologia", attendance: 94 },
  ],
  weeklyStudyHours: [
    { day: "Segunda", hours: 3 },
    { day: "Terça", hours: 2.5 },
    { day: "Quarta", hours: 4 },
    { day: "Quinta", hours: 3 },
    { day: "Sexta", hours: 2 },
  ]
};
