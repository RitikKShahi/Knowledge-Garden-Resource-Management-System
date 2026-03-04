import api from './api';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
  institution?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileData {
  user_id: number;
  name: string;
  email: string;
  role: string;
  institution: string;
  join_date: string;
  last_login: string | null;
  is_active: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// Auth service functions
const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const authData = response.data;
      
      console.log('Login API response:', authData);
      
      // Store token in localStorage
      if (authData.token) {
        localStorage.setItem('auth_token', authData.token);
      }
      
      // Store user data if available
      if (authData.user) {
        // Handle potential differences in API response format
        localStorage.setItem('user_id', authData.user.id || '');
        localStorage.setItem('user_email', authData.user.email || '');
        
        // Handle name format differences (firstName/lastName vs name)
        if (authData.user.firstName) {
          localStorage.setItem('user_firstName', authData.user.firstName);
          localStorage.setItem('user_lastName', authData.user.lastName || '');
        } else if (authData.user.name) {
          // If the API returns a single name field, split it for display
          const nameParts = authData.user.name.split(' ');
          localStorage.setItem('user_firstName', nameParts[0] || '');
          localStorage.setItem('user_lastName', nameParts.slice(1).join(' ') || '');
        }
        
        localStorage.setItem('user_created', authData.user.createdAt || new Date().toISOString());
        localStorage.setItem('user_role', authData.user.role || 'user');
      }
      
      return authData;
    } catch (error: any) {
      console.error('Login service error:', error);
      // Transform error to a more user-friendly format
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  },

  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const authData = response.data;
      
      console.log('Register API response:', authData);
      
      // Store token in localStorage
      if (authData.token) {
        localStorage.setItem('auth_token', authData.token);
      }
      
      // Store user data if available
      if (authData.user) {
        // Handle potential differences in API response format
        localStorage.setItem('user_id', authData.user.id || '');
        localStorage.setItem('user_email', authData.user.email || '');
        
        // Handle name format differences (firstName/lastName vs name)
        if (authData.user.firstName) {
          localStorage.setItem('user_firstName', authData.user.firstName);
          localStorage.setItem('user_lastName', authData.user.lastName || '');
        } else if (authData.user.name) {
          // If the API returns a single name field, split it for display
          const nameParts = authData.user.name.split(' ');
          localStorage.setItem('user_firstName', nameParts[0] || '');
          localStorage.setItem('user_lastName', nameParts.slice(1).join(' ') || '');
        }
        
        localStorage.setItem('user_created', authData.user.createdAt || new Date().toISOString());
        
        // Use role from API response if available, otherwise use registration data
        localStorage.setItem('user_role', authData.user.role || userData.role || 'user');
      } else {
        // If user object isn't in the response, store registration data
        localStorage.setItem('user_email', userData.email);
        
        // Handle the name field from registration (which is a single field)
        const nameParts = userData.name.split(' ');
        localStorage.setItem('user_firstName', nameParts[0] || '');
        localStorage.setItem('user_lastName', nameParts.slice(1).join(' ') || '');
        
        localStorage.setItem('user_role', userData.role || 'user');
      }
      
      // Always store institution from registration data if provided
      if (userData.institution) {
        localStorage.setItem('user_institution', userData.institution);
      }
      
      return authData;
    } catch (error: any) {
      console.error('Registration service error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Get user profile data
  getUserProfile: async (): Promise<ProfileData> => {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch user profile.';
      throw new Error(errorMessage);
    }
  },

  // Logout - client side only
  logout: (): void => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_firstName');
    localStorage.removeItem('user_lastName');
    localStorage.removeItem('user_created');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_institution');
  },

  // Password reset request
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/password-reset', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/password-reset/confirm', {
      token,
      password: newPassword,
    });
    return response.data;
  },
};

export default authService;
