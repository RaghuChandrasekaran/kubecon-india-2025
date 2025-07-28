import { useParams } from "react-router-dom";
import { getCart, updateQuantity, removeFromCart, getShippingCost, formatCurrency, updateCartWithShipping } from "../../api/cart"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography, Divider, useTheme, useMediaQuery } from '@mui/material';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useCart } from '../../components/layout/CartContext';
import SEO from '../../components/SEO';

// Import new components
import CartSummary from '../../components/Cart/CartSummary';
import CartItem from '../../components/Cart/CartItem';
import EmptyCart from '../../components/Cart/EmptyCart';
import RecommendedProducts from '../../components/Cart/RecommendedProducts';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, updateItemQuantity, removeItem, refreshCart } = useCart();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [shippingMethod, setShippingMethod] = useState('default');
    const [cartWithShipping, setCartWithShipping] = useState<any>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClose = () => {
        setOpenSnackbar(false);
    };

    const showMessage = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    const handleUpdateQuantity = async (item: any, newQuantity: number) => {
        if (newQuantity < 1) return;
        
        try {
            await updateItemQuantity(item.productId || item.sku, newQuantity);
            showMessage('Cart updated successfully', 'success');
        } catch (error) {
            console.error('Error updating quantity:', error);
            showMessage('Failed to update cart', 'error');
        }
    };

    const handleRemoveItem = async (sku: string) => {
        try {
            await removeItem(sku);
            showMessage('Item removed from cart', 'success');
        } catch (error) {
            console.error('Error removing item:', error);
            showMessage('Failed to remove item', 'error');
        }
    };

    const handleShippingMethodChange = async (method: string) => {
        try {
            setShippingMethod(method);
            const updatedCart = await updateCartWithShipping(method);
            setCartWithShipping(updatedCart);
            showMessage('Shipping method updated', 'success');
        } catch (error) {
            console.error('Error updating shipping method:', error);
            showMessage('Failed to update shipping method', 'error');
        }
    };

    // Load cart on mount
    useEffect(() => {
        refreshCart().catch(() => {
            showMessage('Failed to load cart', 'error');
        });
    }, [refreshCart]);

    // Update cart with shipping when cart changes
    useEffect(() => {
        if (cart?.items && cart.items.length > 0) {
            updateCartWithShipping(shippingMethod)
                .then(setCartWithShipping)
                .catch(() => {
                    // Fallback to original cart with calculated shipping
                    const shipping = getShippingCost(shippingMethod);
                    if (cart) {
                        setCartWithShipping({
                            ...cart,
                            shippingCost: shipping,
                            total: ((cart as any).subtotal || 0) + ((cart as any).taxAmount || 0) + shipping
                        });
                    }
                });
        }
    }, [cart, shippingMethod]);

    return (
        <Box sx={{ p: isMobile ? 1 : 2, maxWidth: 1200, mx: 'auto' }}>
            <SEO 
                title="Your Shopping Cart | Clusterly"
                description="Review your shopping cart items, update quantities, and proceed to checkout securely. Free shipping on eligible orders over $50."
                keywords="shopping cart, checkout, online shopping, e-commerce, secure checkout"
                type="website"
            />
            
            {/* Back Button */}
            <Button 
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Continue Shopping
            </Button>

            <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                    mb: 3, 
                    fontWeight: 500,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' } 
                }}
            >
                Shopping Cart
            </Typography>

            {cart?.items?.length === 0 ? (
                <EmptyCart />
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            {cart?.items?.map((item: any, index: number) => (
                                <Box key={index} sx={{ 
                                    borderBottom: index < cart.items.length - 1 ? '1px solid #eee' : 'none'
                                }}>
                                    <CartItem 
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemoveItem={handleRemoveItem}
                                    />
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                    
                    {/* Order Summary */}
                    <Grid item xs={12} md={4}>
                        <CartSummary 
                            cart={cartWithShipping || cart}
                            shippingMethod={shippingMethod}
                            onCheckout={() => navigate('/checkout')}
                            onContinueShopping={() => navigate('/')}
                            onShippingMethodChange={handleShippingMethodChange}
                        />
                    </Grid>
                    
                    {/* Recommended Products */}
                    <Grid item xs={12}>
                        <RecommendedProducts />
                    </Grid>
                </Grid>
            )}
            
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Cart;