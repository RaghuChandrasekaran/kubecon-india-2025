import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../../components/layout/CartContext';
import { getCart } from '../../api/cart';
import axiosClient, { cartUrl } from '../../api/config';

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { updateCartCount } = useCart();

    useEffect(() => {
        // Clear the cart in backend
        const clearCart = async () => {
            try {
                const cart = await getCart();
                if (cart && cart.customerId) {
                    await axiosClient.post(`${cartUrl}cart`, { customerId: cart.customerId, items: [] });
                    updateCartCount();
                }
            } catch (err) {
                // Optionally handle error
                console.error('Failed to clear cart after order', err);
            }
        };
        clearCart();
    }, [updateCartCount]);

    return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    Order Confirmed!
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Thank you for your purchase. Your order has been successfully placed.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Continue Shopping
                </Button>
            </Paper>
        </Box>
    );
};

export default OrderConfirmation;
