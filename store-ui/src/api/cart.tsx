import axios from 'axios';
import { getCachedUser } from "./users";
import { cartUrl } from './config';

const axiosClient = axios.create();

// Helper function to get the current user's ID (email) for cart operations
const getCurrentCustomerId = () => {
  const user = getCachedUser();
  return user?.email || localStorage.getItem('guest_user_id') || 'guest-user';
};

export const getCart = async () => {
    try {
        const customerId = getCurrentCustomerId();
        const response = await axiosClient.get(`${cartUrl}cart/${customerId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching cart:", error);
        return null;
    }
}

export const addToCart = async (item: any) => {
    try {
        const customerId = getCurrentCustomerId();
        // Get current cart
        let cart = await getCart();
        
        if (!cart || !cart.items) {
            cart = { customerId, items: [] };
        }
        // Check if item exists
        const idx = cart.items.findIndex((i: any) => i.productId === item.productId);
        if (idx > -1) {
            cart.items[idx].quantity += item.quantity;
        } else {
            cart.items.push(item);
        }
        // Send updated cart
        const response = await axiosClient.post(`${cartUrl}cart`, cart);
        return response.data;
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
}

export const updateQuantity = async (productId: string, quantity: number) => {
    try {
        const customerId = getCurrentCustomerId();
        let cart = await getCart();
        if (!cart || !cart.items) throw new Error('Cart not found');
        cart.items = cart.items.map((item: any) =>
            item.productId === productId ? { ...item, quantity } : item
        );
        const response = await axiosClient.post(`${cartUrl}cart`, cart);
        return response.data;
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        throw error;
    }
}

export const removeFromCart = async (productId: string) => {
    try {
        const customerId = getCurrentCustomerId();
        let cart = await getCart();
        if (!cart || !cart.items) throw new Error('Cart not found');
        cart.items = cart.items.filter((item: any) => item.productId !== productId);
        const response = await axiosClient.post(`${cartUrl}cart`, cart);
        return response.data;
    } catch (error) {
        console.error("Error removing item from cart:", error);
        throw error;
    }
}

// New function to clear the entire cart
export const clearCart = async () => {
    try {
        const customerId = getCurrentCustomerId();
        // Empty the items array to clear the cart
        const response = await axiosClient.post(`${cartUrl}cart`, {
            customerId,
            items: []
        });
        return response.data;
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
}