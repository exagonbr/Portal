import { ChartOptions } from 'chart.js';

export const baseChartOptions: ChartOptions<'bar'> = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        }
      }
    },
    title: {
      display: true,
      font: {
        size: 16,
        family: "'Inter', sans-serif",
        weight: 'bold'
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: function(value: string | number) {
          if (Number.isInteger(value)) {
            return value;
          }
        },
      }
    }
  }
};

export const getRoleChartOptions = (): ChartOptions<'bar'> => ({
  ...baseChartOptions,
  plugins: {
    ...baseChartOptions.plugins,
    title: {
      ...baseChartOptions.plugins?.title,
      text: 'Distribuição de Funções'
    }
  }
});

export const getInstitutionChartOptions = (): ChartOptions<'bar'> => ({
  ...baseChartOptions,
  plugins: {
    ...baseChartOptions.plugins,
    title: {
      ...baseChartOptions.plugins?.title,
      text: 'Usuários por Instituição'
    }
  }
});

export const getRoleChartData = (roleCounts: { 
  admin: number; 
  manager: number; 
  teacher: number;
  other: number; 
}) => ({
  labels: ['Administradores', 'Gerentes', 'Professores', 'Alunos'],
  datasets: [
    {
      label: 'Número de Usuários',
      data: [roleCounts.admin, roleCounts.manager, roleCounts.teacher, roleCounts.other],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    },
  ],
});

export const getInstitutionChartData = (institutionCounts: { [key: string]: number }) => ({
  labels: Object.keys(institutionCounts),
  datasets: [
    {
      label: 'Número de Usuários',
      data: Object.values(institutionCounts),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    },
  ],
});

export const getRolePieChartOptions = (): ChartOptions<'pie'> => ({
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        }
      }
    },
    title: {
      display: true,
      text: 'Distribuição de Funções (Pizza)',
      font: {
        size: 16,
        family: "'Inter', sans-serif",
        weight: 'bold'
      }
    }
  }
});

export const getRolePieChartData = (roleCounts: { 
  admin: number; 
  manager: number; 
  teacher: number;
  other: number; 
}) => ({
  labels: ['Administradores', 'Gerentes', 'Professores', 'Alunos'],
  datasets: [
    {
      data: [roleCounts.admin, roleCounts.manager, roleCounts.teacher, roleCounts.other],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    },
  ],
});
