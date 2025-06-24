// filepath: /home/naveenkumar.kumanan/Naveen_personal/e-commerce-microservices-sample/store-ui/src/api/users.tsx
import axiosClient, { usersUrl } from "./config";

// Types for User data
export interface User {
  id?: number;
  name: string;
  email: string;
  mobile: string;
  role?: string;
  is_active?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

// Store auth token in localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

/**
 * Login user and get JWT token
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Convert credentials to form data format as required by FastAPI OAuth2
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await axiosClient.post(`${usersUrl}login`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Store token in localStorage
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    
    return response.data;
  } catch (err: any) {
    console.error("Login error:", err);
    throw err;
  }
};

/**
 * Register a new user
 */
export const registerUser = async (userData: RegisterData): Promise<User> => {
  try {
    const response = await axiosClient.post(`${usersUrl}register`, userData);
    return response.data;
  } catch (err: any) {
    console.error("Registration error:", err);
    throw err;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axiosClient.get(`${usersUrl}me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Raw user data from API:', response.data); // Log raw data
    
    // Ensure role is properly normalized to lowercase
    const userData = {
      ...response.data,
      role: response.data.role ? response.data.role.toLowerCase() : null
    };
    
    console.log('Processed user data with role:', userData); // Log processed data with role
    
    // Cache user in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    return userData;
  } catch (err: any) {
    console.error("Error fetching current user:", err);
    throw err;
  }
};

/**
 * Logout user by removing token
 */
export const logoutUser = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is logged in
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(TOKEN_KEY) !== null;
};

/**
 * Get cached user data (without API call)
 */
export const getCachedUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) {
    console.log('No cached user data found in localStorage');
    return null;
  }
  
  try {
    const parsedUser = JSON.parse(userData);
    console.log('Raw cached user data:', parsedUser);
    
    // Ensure role is properly normalized
    if (parsedUser.role) {
      console.log('Original role value:', parsedUser.role);
      parsedUser.role = parsedUser.role.toLowerCase();
      console.log('Normalized role value:', parsedUser.role);
    } else {
      console.log('No role found in cached user data');
    }
    
    console.log('Final cached user data:', parsedUser);
    return parsedUser;
  } catch (error) {
    console.error('Error parsing cached user data:', error);
    // If there's an error parsing, clear the cache and return null
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Get all users from the users service
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosClient.get(`${usersUrl}users`);
    return response.data;
  } catch (err: any) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

/**
 * Get a specific user by ID
 */
export const getUserById = async (userId: number): Promise<User> => {
  try {
    const response = await axiosClient.get(`${usersUrl}users/${userId}`);
    return response.data;
  } catch (err: any) {
    console.error(`Error fetching user ${userId}:`, err);
    throw err;
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData: User): Promise<User> => {
  try {
    const response = await axiosClient.post(
      `${usersUrl}users`,
      {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: "default123" // Default password
      }
    );
    return response.data;
  } catch (err: any) {
    console.error("Error creating user:", err);
    throw err;
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (userId: number, userData: Partial<User>): Promise<User> => {
  try {
    const response = await axiosClient.put(
      `${usersUrl}users/${userId}`,
      {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile
      }
    );
    return response.data;
  } catch (err: any) {
    console.error(`Error updating user ${userId}:`, err);
    throw err;
  }
};