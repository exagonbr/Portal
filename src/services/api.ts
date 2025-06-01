import { API_ENDPOINTS } from '@/constants/apiEndpoints';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getAuthToken();
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }

      // Construir URL completa se for relativa
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Erro na requisição',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  public getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  public removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // Métodos HTTP
  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' });
  }

  // Métodos específicos da API

  // Autenticação
  async login(email: string, password: string) {
    return this.post(API_ENDPOINTS.auth.login, { email, password });
  }

  async logout() {
    const response = await this.post(API_ENDPOINTS.auth.logout);
    this.removeAuthToken();
    return response;
  }

  async register(userData: any) {
    return this.post(API_ENDPOINTS.auth.register, userData);
  }

  async getProfile() {
    return this.get(API_ENDPOINTS.auth.profile);
  }

  // Usuários
  async getUsers(params?: { role?: string; page?: number; limit?: number }) {
    const url = new URL(API_ENDPOINTS.users.list);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    return this.get(url.toString());
  }

  async getUser(id: string) {
    return this.get(API_ENDPOINTS.users.get(id));
  }

  async createUser(userData: any) {
    return this.post(API_ENDPOINTS.users.create, userData);
  }

  async updateUser(id: string, userData: any) {
    return this.put(API_ENDPOINTS.users.update(id), userData);
  }

  async deleteUser(id: string) {
    return this.delete(API_ENDPOINTS.users.delete(id));
  }

  // Instituições
  async getInstitutions() {
    return this.get(API_ENDPOINTS.institutions.list);
  }

  async getInstitution(id: string) {
    return this.get(API_ENDPOINTS.institutions.get(id));
  }

  async createInstitution(data: any) {
    return this.post(API_ENDPOINTS.institutions.create, data);
  }

  async updateInstitution(id: string, data: any) {
    return this.put(API_ENDPOINTS.institutions.update(id), data);
  }

  async deleteInstitution(id: string) {
    return this.delete(API_ENDPOINTS.institutions.delete(id));
  }

  // Cursos
  async getCourses(params?: { teacher?: string; student?: string }) {
    const url = new URL(API_ENDPOINTS.courses.list);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }
    return this.get(url.toString());
  }

  async getCourse(id: string) {
    return this.get(API_ENDPOINTS.courses.get(id));
  }

  async createCourse(data: any) {
    return this.post(API_ENDPOINTS.courses.create, data);
  }

  async updateCourse(id: string, data: any) {
    return this.put(API_ENDPOINTS.courses.update(id), data);
  }

  async deleteCourse(id: string) {
    return this.delete(API_ENDPOINTS.courses.delete(id));
  }

  // Livros
  async getBooks(params?: { search?: string }) {
    const url = new URL(API_ENDPOINTS.books.list);
    if (params?.search) {
      url.searchParams.append('search', params.search);
    }
    return this.get(url.toString());
  }

  async getBook(id: string) {
    return this.get(API_ENDPOINTS.books.get(id));
  }

  async createBook(data: any) {
    return this.post(API_ENDPOINTS.books.create, data);
  }

  async updateBook(id: string, data: any) {
    return this.put(API_ENDPOINTS.books.update(id), data);
  }

  async deleteBook(id: string) {
    return this.delete(API_ENDPOINTS.books.delete(id));
  }

  // Vídeos
  async getVideos(params?: { module?: string }) {
    const url = new URL(API_ENDPOINTS.videos.list);
    if (params?.module) {
      url.searchParams.append('module', params.module);
    }
    return this.get(url.toString());
  }

  async getVideo(id: string) {
    return this.get(API_ENDPOINTS.videos.get(id));
  }

  async createVideo(data: any) {
    return this.post(API_ENDPOINTS.videos.create, data);
  }

  async updateVideo(id: string, data: any) {
    return this.put(API_ENDPOINTS.videos.update(id), data);
  }

  async deleteVideo(id: string) {
    return this.delete(API_ENDPOINTS.videos.delete(id));
  }

  // Dashboard
  async getTeacherDashboard() {
    return this.get(API_ENDPOINTS.dashboard.teacher);
  }

  async getStudentDashboard() {
    return this.get(API_ENDPOINTS.dashboard.student);
  }

  async getAdminDashboard() {
    return this.get(API_ENDPOINTS.dashboard.admin);
  }

  async getCoordinatorDashboard() {
    return this.get(API_ENDPOINTS.dashboard.coordinator);
  }

  async getGuardianDashboard() {
    return this.get(API_ENDPOINTS.dashboard.guardian);
  }

  // Notas
  async getGrades(params?: { student?: string; course?: string }) {
    const url = new URL(API_ENDPOINTS.grades.list);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }
    return this.get(url.toString());
  }

  async createGrade(data: any) {
    return this.post(API_ENDPOINTS.grades.create, data);
  }

  async updateGrade(id: string, data: any) {
    return this.put(API_ENDPOINTS.grades.update(id), data);
  }

  // Quizzes
  async getQuizzes() {
    return this.get(API_ENDPOINTS.quizzes.list);
  }

  async getQuiz(id: string) {
    return this.get(API_ENDPOINTS.quizzes.get(id));
  }

  async createQuiz(data: any) {
    return this.post(API_ENDPOINTS.quizzes.create, data);
  }

  async submitQuiz(id: string, answers: any) {
    return this.post(API_ENDPOINTS.quizzes.submit(id), { answers });
  }

  async getQuizResults(id: string) {
    return this.get(API_ENDPOINTS.quizzes.results(id));
  }

  // Notificações
  async getNotifications() {
    return this.get(API_ENDPOINTS.notifications.list);
  }

  async markNotificationAsRead(id: string) {
    return this.patch(API_ENDPOINTS.notifications.markAsRead(id));
  }

  async markAllNotificationsAsRead() {
    return this.patch(API_ENDPOINTS.notifications.markAllAsRead);
  }
}

export const apiService = new ApiService();
export default apiService;