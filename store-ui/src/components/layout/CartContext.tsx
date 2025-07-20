import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCart, updateQuantity, removeFromCart } from '../../api/cart';

interface CartItem {
    productId: string;
    sku: string;
    title: string;
    quantity: number;
    price: number;
    currency: string;
    thumbnail?: string;
}

interface CartContextType {
    cart: { items: CartItem[] } | null;
    cartCount: number;
    cartTotal: number;
    loading: boolean;
    error: string | null;
    addToCart: (item: CartItem) => Promise<void>;
    updateItemQuantity: (sku: string, quantity: number) => Promise<void>;
    removeItem: (sku: string) => Promise<void>;
    refreshCart: () => Promise<void>;
    clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Memoized calculations for performance
    const cartCount = useMemo(() => {
        return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    }, [cart?.items]);

    const cartTotal = useMemo(() => {
        return cart?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
    }, [cart?.items]);

    // Clear error function
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Refresh cart data
    const refreshCart = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const cartData = await getCart();
            setCart(cartData || { items: [] });
        } catch (err: any) {
            setError(err.message || 'Failed to load cart');
            console.error('Error loading cart:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Add item to cart with optimistic updates
    const addToCart = useCallback(async (item: CartItem) => {
        try {
            setError(null);
            
            // Optimistic update - add item immediately to UI
            setCart(prevCart => {
                if (!prevCart) return { items: [item] };
                
                const existingItemIndex = prevCart.items.findIndex(cartItem => cartItem.sku === item.sku);
                
                if (existingItemIndex >= 0) {
                    // Update existing item quantity
                    const updatedItems = [...prevCart.items];
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        quantity: updatedItems[existingItemIndex].quantity + item.quantity
                    };
                    return { items: updatedItems };
                } else {
                    // Add new item
                    return { items: [...prevCart.items, item] };
                }
            });

            // Make API call
            await updateQuantity(item.sku, item.quantity);
            
            // Refresh cart to get server state
            await refreshCart();
        } catch (err: any) {
            setError(err.message || 'Failed to add item to cart');
            // Revert optimistic update on error
            await refreshCart();
            throw err;
        }
    }, [refreshCart]);

    // Update item quantity with optimistic updates
    const updateItemQuantity = useCallback(async (sku: string, quantity: number) => {
        const previousCartState = cart; // Declare at the beginning
        
        try {
            setError(null);
            
            // Optimistic update
            setCart(prevCart => {
                if (!prevCart) return null;
                
                const updatedItems = prevCart.items.map(item => 
                    item.sku === sku ? { ...item, quantity } : item
                ).filter(item => item.quantity > 0); // Remove items with 0 quantity
                
                return { items: updatedItems };
            });

            // Make API call
            await updateQuantity(sku, quantity);
            
            // Refresh cart to get server state
            await refreshCart();
        } catch (err: any) {
            setError(err.message || 'Failed to update item quantity');
            // Revert optimistic update on error
            setCart(previousCartState);
            throw err;
        }
    }, [cart, refreshCart]);

    // Remove item from cart with optimistic updates
    const removeItem = useCallback(async (sku: string) => {
        const previousCartState = cart; // Declare at the beginning
        
        try {
            setError(null);
            
            // Optimistic update
            setCart(prevCart => {
                if (!prevCart) return null;
                
                const updatedItems = prevCart.items.filter(item => item.sku !== sku);
                return { items: updatedItems };
            });

            // Make API call
            await removeFromCart(sku);
            
            // Refresh cart to get server state
            await refreshCart();
        } catch (err: any) {
            setError(err.message || 'Failed to remove item from cart');
            // Revert optimistic update on error
            setCart(previousCartState);
            throw err;
        }
    }, [cart, refreshCart]);

    // Load cart on mount
    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    // Persist cart state to localStorage for offline resilience
    useEffect(() => {
        if (cart && cart.items.length > 0) {
            try {
                localStorage.setItem('cart_backup', JSON.stringify(cart));
            } catch (err) {
                console.error('Failed to backup cart to localStorage:', err);
            }
        }
    }, [cart]);

    // Load cart from localStorage on mount if available
    useEffect(() => {
        try {
            const backupCart = localStorage.getItem('cart_backup');
            if (backupCart && !cart) {
                const parsedCart = JSON.parse(backupCart);
                setCart(parsedCart);
            }
        } catch (err) {
            console.error('Failed to load cart backup from localStorage:', err);
        }
    }, []);

    const value = useMemo(() => ({
        cart,
        cartCount,
        cartTotal,
        loading,
        error,
        addToCart,
        updateItemQuantity,
        removeItem,
        refreshCart,
        clearError
    }), [cart, cartCount, cartTotal, loading, error, addToCart, updateItemQuantity, removeItem, refreshCart, clearError]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
