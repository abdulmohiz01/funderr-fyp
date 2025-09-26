import axios from 'axios';
import { AuthService } from './AuthService';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API
// Use different URL for Android emulator, physical device, and web
export const getApiUrl = () => {
  // Use localhost for all platforms (web, android, ios)
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();
console.log('ApiService using URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header for authenticated requests
api.interceptors.request.use(
  async (config) => {
    const token = await AuthService.getUserToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export class ApiService {
  // Campaign API methods
  static async createCampaign(campaignData) {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async listCampaigns(status = null) {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/campaigns', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async approveCampaign(campaignId) {
    try {
      const response = await api.put(`/campaigns/${campaignId}/approve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async rejectCampaign(campaignId, reason = '') {
    try {
      const response = await api.put(`/campaigns/${campaignId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUserCampaigns(userId) {
    try {
      const response = await api.get(`/campaigns/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  static async updateCampaign(campaignId, updateData) {
    try {
      const response = await api.put(`/campaigns/${campaignId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteCampaign(campaignId) {
    try {
      const response = await api.delete(`/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  static async getUserId() {
    return await AuthService.getUserId();
  }
  
  // User API calls
  static async getUserProfile() {
    try {
      // Get the user ID from the authentication service
      const userId = await AuthService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      try {
        // Make an API call to get the user profile
        const response = await api.get(`/users/${userId}`);
        return response.data;
      } catch (error) {
        // If we get a 404, the user might not have a profile yet
        if (error.response && error.response.status === 404) {
          console.log('User profile not found in API, using basic data');
          
          // Get basic user info from authentication API
          const token = await AuthService.getUserToken();
          
          if (token) {
            try {
              // Try to get user info from token verification endpoint
              const verifyResponse = await api.post('/auth/verify-token', { token });
              if (verifyResponse.data && verifyResponse.data.user) {
                return verifyResponse.data.user;
              }
            } catch (verifyError) {
              console.log('Could not get user info from token verification');
            }
          }
          
          // Last resort - use stored data as fallback
          const email = await AsyncStorage.getItem('userEmail');
          const role = await AsyncStorage.getItem('userRole');
          
          return {
            id: userId,
            email: email,
            role: role || 'user',
            joinDate: new Date().toISOString(),
          };
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  static async updateUserProfile(userData) {
    try {
      // Get the user ID
      const userId = await AuthService.getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Make an API call to update the user profile
      const response = await api.put(`/users/${userId}`, userData);
      
      // Store role in AsyncStorage for UI purposes
      if (userData.role) {
        await AsyncStorage.setItem('userRole', userData.role);
      }
      
      return response.data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  // Forgot Password: Request reset code
  static async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/request-password-reset', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Forgot Password: Verify code and set new password
  static async resetPassword(email, code, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', { email, code, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Signup: Request code for new user (does not require user to exist)
  static async requestSignupCode(email) {
    try {
      const response = await api.post('/auth/send-signup-code', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Signup: Verify code for new user (does not require user to exist)
  static async verifySignupCode(email, code) {
    try {
      const response = await api.post('/auth/verify-signup-code', { email, code });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Forgot Password: Verify reset code (user must exist)
  static async verifyResetCode(email, code) {
    try {
      const response = await api.post('/auth/verify-reset-code', { email, code });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
