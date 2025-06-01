'use client'

import { useAuth } from '@/contexts/AuthContext'
import { teacherMockData, studentMockData } from '@/constants/mockData'
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
ChartJS.defaults.resizeDelay = 300; // Delay maior para resize
ChartJS.defaults.animation = {
  duration: 500, // Animação mais rápida
  easing: 'easeOutQuart',
};

// Configurações adicionais para estabilidade
ChartJS.defaults.plugins = {
  ...ChartJS.defaults.plugins,
  legend: {
    ...ChartJS.defaults.plugins?.legend,
    display: true,
  },
  tooltip: {
    ...ChartJS.defaults.plugins?.tooltip,
    enabled: true,
    animation: {
      duration: 200, // Tooltip mais rápido
    },
  },
};

ChartJS.defaults.interaction = {
  intersect: false,
  mode: 'index',
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

const chartColors = {
  blue: '#3B82F6',
  lightBlue: '#60A5FA',
  lighterBlue: '#93C5FD',
  lightestBlue: '#BFDBFE',
  darkBlue: '#2563EB',
  darkerBlue: '#1D4ED8',
}

export function Chart({ title, subtitle, type, data, height = 'h-64', showLegend = false }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${height} flex items-center justify-center`}>
          <p className="text-gray-500">Não há dados disponíveis</p>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        backgroundColor: type === 'pie' 
          ? Object.values(chartColors)
          : chartColors.blue,
        borderColor: type === 'line' ? chartColors.blue : undefined,
        borderWidth: type === 'line' ? 2 : 1,
        tension: 0.4,
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
      },
      tooltip: {
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
        ticks: {
          callback: function(value: any) {
            return value + (type === 'line' ? '%' : '')
          }
        }
      }
    } : undefined
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      
      <div className="p-4">
        <div className={height}>
          {type === 'line' && <Line data={chartData} options={options} />}
          {type === 'bar' && <Bar data={chartData} options={options} />}
          {type === 'pie' && <Pie data={chartData} options={options} />}
          {type === 'stats' && (
            <div className="grid grid-cols-2 gap-4">
              {data.map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-500">{item.label}</div>
                  <div className="text-xl font-semibold mt-1">{item.value}</div>
                  {item.details?.change !== undefined && (
                    <div className={`text-sm ${Number(item.details.change) >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
                      <span className="material-symbols-outlined text-sm mr-1">
                        {Number(item.details.change) >= 0 ? 'trending_up' : 'trending_down'}
                      </span>
                      {Number(item.details.change) >= 0 ? '+' : ''}{item.details.change}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Charts() {
  const { user } = useAuth()

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
