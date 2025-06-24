import axiosClient, { cartUrl } from "./config"
import { getCachedUser } from "./users";

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
    } catch (err: any) {
        console.log(err);
        throw err;
    }
};

export const addToCart = async (item: any) => {
    try {
        // Get current cart
        let cart = await getCart();
        const customerId = getCurrentCustomerId();
        
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
    } catch (err: any) {
        console.log(err);
        throw err;
    }
};

export const updateQuantity = async (productId: string, quantity: number) => {
    try {
        let cart = await getCart();
        if (!cart || !cart.items) throw new Error('Cart not found');
        cart.items = cart.items.map((item: any) =>
            item.productId === productId ? { ...item, quantity } : item
        );
        const response = await axiosClient.post(`${cartUrl}cart`, cart);
        return response.data;
    } catch (err: any) {
        console.log(err);
        throw err;
    }
};

export const removeFromCart = async (productId: string) => {
    try {
        let cart = await getCart();
        if (!cart || !cart.items) throw new Error('Cart not found');
        cart.items = cart.items.filter((item: any) => item.productId !== productId);
        const response = await axiosClient.post(`${cartUrl}cart`, cart);
        return response.data;
    } catch (err: any) {
        console.log(err);
        throw err;
    }
};