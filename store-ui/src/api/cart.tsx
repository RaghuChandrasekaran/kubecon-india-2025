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
        // Use a more efficient approach by sending the update directly
        const updateData = {
            customerId,
            productId,
            quantity,
            action: 'update'
        };
        const response = await axiosClient.put(`${cartUrl}cart/item`, updateData);
        return response.data;
    } catch (error) {
        // Fallback to the old method if the new endpoint doesn't exist
        console.warn("New cart update endpoint not available, using fallback method");
        try {
            let cart = await getCart();
            if (!cart || !cart.items) throw new Error('Cart not found');
            cart.items = cart.items.map((item: any) =>
                item.productId === productId ? { ...item, quantity } : item
            );
            const response = await axiosClient.post(`${cartUrl}cart`, cart);
            return response.data;
        } catch (fallbackError) {
            console.error("Error updating cart item quantity:", fallbackError);
            throw fallbackError;
        }
    }
}

export const removeFromCart = async (productId: string) => {
    try {
        const customerId = getCurrentCustomerId();
        // Use a more efficient approach by sending the removal directly
        const response = await axiosClient.delete(`${cartUrl}cart/item/${customerId}/${productId}`);
        return response.data;
    } catch (error) {
        // Fallback to the old method if the new endpoint doesn't exist
        console.warn("New cart remove endpoint not available, using fallback method");
        try {
            let cart = await getCart();
            if (!cart || !cart.items) throw new Error('Cart not found');
            cart.items = cart.items.filter((item: any) => item.productId !== productId);
            const response = await axiosClient.post(`${cartUrl}cart`, cart);
            return response.data;
        } catch (fallbackError) {
            console.error("Error removing item from cart:", fallbackError);
            throw fallbackError;
        }
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

// Update cart with shipping method
export const updateCartWithShipping = async (shippingMethod: string) => {
    try {
        const customerId = getCurrentCustomerId();
        
        // Get current cart from backend (this has the latest tax calculations)
        const cart = await getCart();
        if (!cart) throw new Error('Cart not found');
        
        // Calculate shipping cost on frontend since backend doesn't handle it
        const shippingCost = getShippingCost(shippingMethod);
        
        // Create updated cart with shipping information
        const cartWithShipping = {
            ...cart,
            shippingMethod,
            shippingCost,
            // Recalculate total: backend total (subtotal + tax) + shipping
            total: (cart.total || 0) + shippingCost,
            // Keep backend calculations for subtotal and tax
            subtotal: cart.subtotal || 0,
            taxAmount: cart.taxAmount || 0
        };
        
        // Note: We don't send this back to the backend since it doesn't handle shipping
        // The backend only handles item management and tax calculation
        return cartWithShipping;
    } catch (error) {
        console.error("Error updating cart with shipping:", error);
        throw error;
    }
}

// Helper function to get shipping cost by method
export const getShippingCost = (shippingMethod: string = 'default') => {
    const shippingCosts = {
        default: 0,
        standard: 99,
        express: 199,
        overnight: 399
    };
    return shippingCosts[shippingMethod as keyof typeof shippingCosts] || 0;
};

// Helper function to format currency in INR
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};