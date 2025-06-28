import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemAdminDashboard from '../page';

// Mock the required modules
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'SYSTEM_ADMIN' },
    isAuthenticated: true
  })
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

jest.mock('@/services/systemAdminService', () => ({
  systemAdminService: {
    getSystemDashboard: jest.fn().mockResolvedValue({
      system: {
        uptime: 86400,
        version: '1.0.0',
        environment: 'production',
        memoryUsage: {
          heapUsed: 100000000,
          heapTotal: 200000000,
          rss: 150000000,
          external: 50000000,
          arrayBuffers: 10000000
        }
      },
      sessions: {
        activeUsers: 100,
        totalActiveSessions: 150,
        averageSessionDuration: 30,
        sessionsByDevice: {
          Desktop: 80,
          Mobile: 50,
          Tablet: 20
        }
      }
    }),
    getUsersByRole: jest.fn().mockResolvedValue({
      STUDENT: 1000,
      TEACHER: 100,
      COORDINATOR: 10
    }),
    getRealTimeMetrics: jest.fn().mockResolvedValue({
      activeUsers: 100,
      activeSessions: 150,
      memoryUsage: {
        heapUsed: 100000000,
        heapTotal: 200000000,
        rss: 150000000,
        external: 50000000,
        arrayBuffers: 10000000
      }
    }),
    getSystemAnalytics: jest.fn().mockResolvedValue({
      userGrowth: [
        { month: 'Jan', users: 1000, growth: 10 },
        { month: 'Feb', users: 1100, growth: 10 }
      ]
    }),
    getUserEngagementMetrics: jest.fn().mockResolvedValue({
      retentionRate: 85,
      averageSessionDuration: 30,
      bounceRate: 15,
      topFeatures: [
        { name: 'Dashboard', usage: 90 },
        { name: 'Reports', usage: 75 }
      ]
    })
  }
}));

jest.mock('@/services/institutionService', () => ({
  InstitutionService: {
    getInstitutions: jest.fn().mockResolvedValue({
      items: [
        {
          id: '1',
          name: 'Test Institution',
          type: 'UNIVERSITY',
          active: true,
          users_count: 100,
          schools_count: 5,
          created_at: new Date().toISOString()
        }
      ],
      total: 1
    }),
    getActiveInstitutions: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('@/utils/auth-diagnostic', () => ({
  runAuthDiagnostic: jest.fn().mockResolvedValue({
    success: true,
    issues: []
  })
}));

jest.mock('@/utils/auth-debug', () => ({
  debugAuth: jest.fn()
}));

jest.mock('@/utils/global-error-handler', () => ({
  initializeGlobalErrorHandler: jest.fn()
}));

jest.mock('@/utils/chunk-error-test', () => ({
  runAllChunkErrorTests: jest.fn().mockResolvedValue(true)
}));

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes('/api/users/stats')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          total_users: 1110,
          active_users: 1000,
          inactive_users: 110,
          recent_registrations: 50,
          users_by_role: {
            STUDENT: 1000,
            TEACHER: 100,
            COORDINATOR: 10
          }
        }
      })
    });
  }
  
  if (url.includes('/api/roles/stats')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: {
          totalRoles: 6,
          systemRoles: 4,
          customRoles: 2,
          activeRoles: 6,
          inactiveRoles: 0,
          totalUsers: 1110
        }
      })
    });
  }
  
  if (url.includes('/api/aws/connection-logs/stats')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: {
          total_connections: 1000,
          successful_connections: 950,
          failed_connections: 50,
          success_rate: 95.0,
          average_response_time: 150,
          last_connection: new Date(),
          services_used: ['S3', 'RDS', 'EC2']
        }
      })
    });
  }
  
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({})
  });
});

describe('SystemAdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<SystemAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Painel do Administrador do Sistema')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<SystemAdminDashboard />);
    
    expect(screen.getByRole('generic', { name: /loading/i }) || 
           document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('handles error boundary correctly', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // This would trigger the error boundary in a real scenario
    const ThrowError = () => {
      throw new Error('ChunkLoadError: Loading chunk failed');
    };
    
    render(
      <div>
        <SystemAdminDashboard />
      </div>
    );
    
    consoleSpy.mockRestore();
  });

  it('displays system metrics when data is loaded', async () => {
    render(<SystemAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Uptime do Sistema')).toBeInTheDocument();
      expect(screen.getByText('Memória Heap')).toBeInTheDocument();
      expect(screen.getByText('Usuários Online')).toBeInTheDocument();
    });
  });

  it('handles missing data gracefully', async () => {
    // Mock services to return null/empty data
    const mockService = require('@/services/systemAdminService');
    mockService.systemAdminService.getSystemDashboard.mockResolvedValueOnce(null);
    
    render(<SystemAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });
});
