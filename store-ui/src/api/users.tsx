// filepath: /home/naveenkumar.kumanan/Naveen_personal/e-commerce-microservices-sample/store-ui/src/api/users.tsx
import axios from 'axios';
import axiosClient, { usersUrl } from "./config";

// Constants for localStorage
export const USER_TOKEN_KEY = 'user_token';
export const USER_INFO_KEY = 'user_info';
export const USER_ADDRESSES_KEY = 'user_addresses';

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

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phone?: string;
  isDefault?: boolean;
}

// Add auth token to requests if available
axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (token) {
    // Ensure headers object exists before setting properties
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    localStorage.setItem(USER_TOKEN_KEY, response.data.access_token);
    
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
    const token = localStorage.getItem(USER_TOKEN_KEY);
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
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
    
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
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
};

/**
 * Check if user is logged in
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(USER_TOKEN_KEY) !== null;
};

/**
 * Get cached user data (without API call)
 */
export const getCachedUser = (): User | null => {
  const userData = localStorage.getItem(USER_INFO_KEY);
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
    localStorage.removeItem(USER_INFO_KEY);
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

// Get user's saved addresses
export const getUserAddresses = async (): Promise<Address[]> => {
  // First check if addresses are in localStorage
  const cachedAddresses = localStorage.getItem(USER_ADDRESSES_KEY);
  if (cachedAddresses) {
    return JSON.parse(cachedAddresses);
  }
  
  try {
    // If not in localStorage, fetch from API
    const response = await axiosClient.get(`${usersUrl}/addresses`);
    const addresses = response.data;
    
    // Cache addresses in localStorage
    localStorage.setItem(USER_ADDRESSES_KEY, JSON.stringify(addresses));
    
    return addresses;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    // Return empty array if request fails
    return [];
  }
};

// Save a new address for the user
export const saveUserAddress = async (addressData: Partial<Address>): Promise<Address> => {
  try {
    // In a real app, this would send a POST request to your API
    // For now, we'll simulate an API response
    
    // Get existing addresses
    const existingAddresses = await getUserAddresses();
    
    // Create new address with ID
    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      firstName: addressData.firstName || '',
      lastName: addressData.lastName || '',
      address: addressData.address || '',
      city: addressData.city || '',
      state: addressData.state || '',
      postalCode: addressData.postalCode || '',
      country: addressData.country || 'USA',
      email: addressData.email || '',
      phone: addressData.phone || '',
      isDefault: existingAddresses.length === 0 // First address is default
    };
    
    // Save to "API" (localStorage in this case)
    const updatedAddresses = [...existingAddresses, newAddress];
    localStorage.setItem(USER_ADDRESSES_KEY, JSON.stringify(updatedAddresses));
    
    return newAddress;
  } catch (error) {
    console.error('Error saving user address:', error);
    throw new Error('Failed to save address');
  }
};

// Delete a saved address
export const deleteUserAddress = async (addressId: string): Promise<boolean> => {
  try {
    // Get existing addresses
    const existingAddresses = await getUserAddresses();
    
    // Filter out the address to delete
    const updatedAddresses = existingAddresses.filter(addr => addr.id !== addressId);
    
    // Save updated list back to localStorage
    localStorage.setItem(USER_ADDRESSES_KEY, JSON.stringify(updatedAddresses));
    
    return true;
  } catch (error) {
    console.error('Error deleting user address:', error);
    return false;
  }
};

// Set an address as the default
export const setDefaultAddress = async (addressId: string): Promise<boolean> => {
  try {
    // Get existing addresses
    const existingAddresses = await getUserAddresses();
    
    // Update isDefault flag for all addresses
    const updatedAddresses = existingAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    
    // Save updated list back to localStorage
    localStorage.setItem(USER_ADDRESSES_KEY, JSON.stringify(updatedAddresses));
    
    return true;
  } catch (error) {
    console.error('Error setting default address:', error);
    return false;
  }
};