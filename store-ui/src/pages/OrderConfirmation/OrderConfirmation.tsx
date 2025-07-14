import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../../components/layout/CartContext';
import { clearCart } from '../../api/cart';
import SEO from '../../components/SEO';

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();

    useEffect(() => {
        // Clear the cart in backend
        const handleClearCart = async () => {
            try {
                await clearCart();
                refreshCart(); // Update the cart state in the UI
            } catch (err) {
                // Optionally handle error
                console.error('Failed to clear cart after order', err);
            }
        };
        handleClearCart();
    }, [refreshCart]);

    return (
        <>
            <SEO 
                title="Order Confirmation | Thank You for Your Purchase" 
                description="Your order has been successfully placed. Thank you for shopping with us!"
                noindex={true} // Prevent search engines from indexing order confirmation pages
                meta={[
                    { name: 'robots', content: 'noindex, nofollow' }, // Explicitly tell search engines not to index or follow links
                    { name: 'googlebot', content: 'noindex, nofollow' }
                ]}
            />
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
        </>
    );
};

export default OrderConfirmation;
