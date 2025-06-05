'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { teacherMockData, studentMockData } from '@/constants/mockData'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Configurar Chart.js para otimizar o ResizeObserver
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.resizeDelay = 200; // Delay para resize
ChartJS.defaults.animation = {
  ...ChartJS.defaults.animation,
  duration: 750, // Reduzir duração da animação
};

interface ChartDataDetails {
  [key: string]: string | number
}

interface ChartDataItem {
  label: string
  value: number
  details?: ChartDataDetails
}

interface ChartProps {
  title: string
  subtitle?: string
  type: 'line' | 'bar' | 'pie' | 'stats'
  data: ChartDataItem[]
  height?: string
  showLegend?: boolean
}

export function Chart({ title, subtitle, type, data, height = 'h-64', showLegend = false }: ChartProps) {
  const { theme } = useTheme();

  if (!data || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden shadow-sm"
        style={{ 
          backgroundColor: theme.colors.background.card,
          boxShadow: theme.shadows.sm
        }}
      >
        <div 
          className="p-4 border-b"
          style={{ borderColor: theme.colors.border.light }}
        >
          <h2 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>{title}</h2>
          {subtitle && <p className="text-sm mt-1" style={{ color: theme.colors.text.secondary }}>{subtitle}</p>}
        </div>
        <div className={`${height} flex items-center justify-center`}>
          <p style={{ color: theme.colors.text.tertiary }}>Não há dados disponíveis</p>
        </div>
      </motion.div>
    )
  }

  // Configurar cores do gráfico baseadas no tema
  const chartColors = {
    primary: theme.colors.primary.DEFAULT,
    secondary: theme.colors.secondary.DEFAULT,
    accent: theme.colors.accent.DEFAULT,
    success: theme.colors.status.success,
    warning: theme.colors.status.warning,
    error: theme.colors.status.error,
    info: theme.colors.status.info,
  };

  const colorArray = Object.values(chartColors);

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        backgroundColor: type === 'pie' 
          ? colorArray.slice(0, data.length)
          : type === 'line'
          ? `${theme.colors.primary.DEFAULT}20`
          : theme.colors.primary.DEFAULT,
        borderColor: type === 'line' ? theme.colors.primary.DEFAULT : 'transparent',
        borderWidth: type === 'line' ? 3 : 1,
        tension: 0.4,
        pointBackgroundColor: type === 'line' ? theme.colors.primary.DEFAULT : undefined,
        pointBorderColor: type === 'line' ? theme.colors.background.card : undefined,
        pointBorderWidth: type === 'line' ? 2 : undefined,
        pointRadius: type === 'line' ? 4 : undefined,
        pointHoverRadius: type === 'line' ? 6 : undefined,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right' as const,
        labels: {
          color: theme.colors.text.primary,
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: theme.colors.background.card,
        titleColor: theme.colors.text.primary,
        bodyColor: theme.colors.text.secondary,
        borderColor: theme.colors.border.DEFAULT,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            label += context.parsed.y || context.parsed || 0
            
            // Add details if available
            const itemDetails = data[context.dataIndex]?.details
            if (itemDetails) {
              Object.entries(itemDetails).forEach(([key, value]) => {
                label += `\n${key}: ${value}`
              })
            }
            return label
          }
        }
      }
    },
    scales: type !== 'pie' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: `${theme.colors.border.light}50`,
          drawBorder: false,
        },
        ticks: {
          color: theme.colors.text.secondary,
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + (type === 'line' ? '%' : '')
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: theme.colors.text.secondary,
          font: {
            size: 11,
          },
        }
      }
    } : undefined
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ 
        backgroundColor: theme.colors.background.card,
        boxShadow: theme.shadows.md
      }}
    >
      <div 
        className="p-4 border-b"
        style={{ borderColor: theme.colors.border.light }}
      >
        <h2 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: theme.colors.text.secondary }}>{subtitle}</p>}
      </div>
      
      <div className="p-4">
        <div className={height}>
          {type === 'line' && <Line data={chartData} options={options} />}
          {type === 'bar' && <Bar data={chartData} options={options} />}
          {type === 'pie' && <Pie data={chartData} options={options} />}
          {type === 'stats' && (
            <div className="grid grid-cols-2 gap-4">
              {data.map((item, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: theme.colors.background.secondary }}
                >
                  <div className="text-sm" style={{ color: theme.colors.text.secondary }}>{item.label}</div>
                  <div className="text-xl font-semibold mt-1" style={{ color: theme.colors.text.primary }}>{item.value}</div>
                  {item.details?.change !== undefined && (
                    <div 
                      className="text-sm flex items-center mt-1"
                      style={{ 
                        color: Number(item.details.change) >= 0 ? theme.colors.status.success : theme.colors.status.error 
                      }}
                    >
                      <span className="material-symbols-outlined text-sm mr-1">
                        {Number(item.details.change) >= 0 ? 'trending_up' : 'trending_down'}
                      </span>
                      {Number(item.details.change) >= 0 ? '+' : ''}{item.details.change}%
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Charts() {
  const { user } = useAuth()
  const { theme } = useTheme()

  if (!user) {
    return null
  }

  if (user.role === 'teacher') {
    const performanceData = teacherMockData.studentPerformance.map(item => ({
      label: item.month,
      value: item.average,
      details: {
        'Aprovados': item.approved,
        'Pendentes': item.pending
      }
    }))

    const attendanceData = teacherMockData.classAttendance.map(item => ({
      label: item.month,
      value: item.attendance,
      details: {
        'Presentes': item.present,
        'Total': item.total
      }
    }))

    const subjectData = teacherMockData.subjectDistribution.map(item => ({
      label: item.subject,
      value: item.students,
      details: {
        'Média': item.averageGrade,
        'Frequência': `${item.attendanceRate}%`,
        'Conclusão': `${item.completionRate}%`
      }
    }))

    const classPerformance = teacherMockData.classPerformance.map(item => ({
      label: item.class,
      value: item.averageGrade * 10,
      details: {
        'Alunos': item.students,
        'Frequência': `${item.attendanceRate}%`,
        'Conclusão': `${item.completionRate}%`
      }
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            title="Desempenho dos Alunos" 
            subtitle="Média mensal e status dos alunos"
            type="line" 
            data={performanceData}
            height="h-80"
          />
          <Chart 
            title="Frequência nas Aulas" 
            subtitle="Taxa de presença mensal"
            type="line" 
            data={attendanceData}
            height="h-80"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            title="Distribuição por Disciplina" 
            subtitle="Alunos e desempenho por matéria"
            type="pie" 
            data={subjectData}
            height="h-80"
            showLegend={true}
          />
          <Chart 
            title="Desempenho por Turma" 
            subtitle="Média e indicadores por turma"
            type="bar" 
            data={classPerformance}
            height="h-80"
          />
        </div>
      </div>
    )
  }

  if (user.role === 'student') {
    const gradeData = studentMockData.gradeHistory.map(subject => ({
      label: subject.subject.substring(0, 3),
      value: subject.average,
      details: {
        'Professor': subject.teacher,
        'Ranking': `${subject.ranking}º lugar`
      }
    }))

    const attendanceData = studentMockData.attendanceBySubject.map(item => ({
      label: item.subject.substring(0, 3),
      value: item.attendance,
      details: {
        'Aulas': `${item.presentClasses}/${item.totalClasses}`,
        'Última Falta': item.lastAbsence
      }
    }))

    const studyData = studentMockData.weeklyStudyHours.map(item => ({
      label: item.day.substring(0, 3),
      value: item.hours * 10,
      details: {
        'Matérias': item.subjects.join(', ')
      }
    }))

    const performanceData = studentMockData.performanceHistory.map(item => ({
      label: item.month.substring(0, 3),
      value: item.averageGrade * 10,
      details: {
        'Frequência': `${item.attendanceRate}%`,
        'Conclusão': `${item.completionRate}%`,
        'Ranking': `${item.ranking}º`
      }
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            title="Notas por Disciplina" 
            subtitle="Média e ranking em cada matéria"
            type="bar" 
            data={gradeData}
            height="h-80"
          />
          <Chart 
            title="Frequência por Disciplina" 
            subtitle="Taxa de presença e histórico"
            type="bar" 
            data={attendanceData}
            height="h-80"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            title="Horas de Estudo" 
            subtitle="Dedicação semanal por dia"
            type="line" 
            data={studyData}
            height="h-80"
          />
          <Chart 
            title="Evolução do Desempenho" 
            subtitle="Progresso ao longo do tempo"
            type="line" 
            data={performanceData}
            height="h-80"
          />
        </div>
      </div>
    )
  }

  return null
}
