console.log('Auth module initializing...');

export const authService = {
  currentUser: null,

  async login(credentials) {
    if (!credentials || !credentials.email || !credentials.password) {
      console.error('Auth Service: Invalid credentials format', credentials);
      throw new Error('Invalid credentials format: email and password are required');
    }
    
    console.log('Auth Service: Login attempt for:', credentials.email);
    // Mock users for demo purposes
    const mockUsers = {
      'teacher@edu.com': {
        id: '1',
        name: 'John Smith',
        email: 'teacher@edu.com',
        password: 'teacher123',
        type: 'teacher'
      },
      'student@edu.com': {
        id: '2',
        name: 'Sarah Johnson',
        email: 'student@edu.com',
        password: 'student123',
        type: 'student'
      }
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers[credentials.email];
        console.log('Found user:', user);
        if (user && user.password === credentials.password) {
          this.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            type: user.type
          };
          localStorage.setItem('auth_token', 'demo_token');
          console.log('Login successful:', this.currentUser);
          resolve(this.currentUser);
        } else {
          const errorMessage = !user 
            ? `User not found with email: ${credentials.email}`
            : 'Invalid password';
          console.log('Auth Service: Login failed -', errorMessage);
          reject(new Error(errorMessage));
        }
      }, 1000);
    });
  },

  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.currentUser);
      }, 500);
    });
  },

  async logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        localStorage.removeItem('auth_token');
        resolve();
      }, 500);
    });
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
};

console.log('Auth module loaded, service:', authService);
