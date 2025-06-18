import React from 'react';
import { getCart } from '../../api/cart';

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

    const updateCartCount = React.useCallback(() => {
        getCart().then((cart) => {
            const count = cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
            setCartCount(count);
        }).catch((error) => {
            console.error('Failed to update cart count:', error);
        });
    }, []);

    React.useEffect(() => {
        updateCartCount();
    }, [updateCartCount]);

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => React.useContext(CartContext);

export default CartContext;
