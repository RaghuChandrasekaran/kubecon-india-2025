// filepath: /home/naveenkumar.kumanan/Naveen_personal/e-commerce-microservices-sample/store-ui/src/api/users.tsx
import axiosClient, { usersUrl } from "./config";

// Log the usersUrl to see what's being used
console.log('Users API URL:', usersUrl);

// Types for User data
export interface User {
  id?: number;
  name: string;
  email: string;
  mobile: string;
}

/**
 * Get all users from the users service
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log('Making request to:', `${usersUrl}users`);
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
    console.log('Making request to:', `${usersUrl}users/${userId}`);
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
    console.log('Making request to:', `${usersUrl}users`);
    const response = await axiosClient.post(
      `${usersUrl}users`,
      {},
      {
        params: {
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile
        }
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
    console.log('Making request to:', `${usersUrl}users/${userId}`);
    const response = await axiosClient.put(
      `${usersUrl}users/${userId}`,
      {},
      {
        params: {
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile
        }
      }
    );
    return response.data;
  } catch (err: any) {
    console.error(`Error updating user ${userId}:`, err);
    throw err;
  }
};