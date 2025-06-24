import React from 'react';
import { getCart } from '../../api/cart';
import { useAuth } from '../../contexts/AuthContext';

interface CartContextType {
    cartCount: number;
    updateCartCount: () => void;
}

const CartContext = React.createContext<CartContextType>({
    cartCount: 0,
    updateCartCount: () => {}
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartCount, setCartCount] = React.useState(0);
    const { isLoggedIn, user } = useAuth();

    const updateCartCount = React.useCallback(() => {
        // Only fetch cart if user is logged in
        if (isLoggedIn && user) {
            getCart().then((cart) => {
                const count = cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
                setCartCount(count);
            }).catch((error) => {
                console.error('Failed to update cart count:', error);
                setCartCount(0);
            });
        } else {
            // Reset cart count if not logged in
            setCartCount(0);
        }
    }, [isLoggedIn, user]);

    // Update cart count when auth state changes
    React.useEffect(() => {
        updateCartCount();
    }, [updateCartCount, isLoggedIn, user]);

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => React.useContext(CartContext);

export default CartContext;
