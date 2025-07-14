import { useParams } from "react-router-dom";
import { getCart, updateQuantity, removeFromCart } from "../../api/cart"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaidIcon from '@mui/icons-material/Paid';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useCart } from '../../components/layout/CartContext';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SEO from '../../components/SEO';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, updateItemQuantity, removeItem, refreshCart } = useCart();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

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
            await updateItemQuantity(item.sku, newQuantity);
            showMessage('Cart updated successfully', 'success');
        } catch (error) {
            showMessage('Failed to update cart', 'error');
        }
    };

    const handleRemoveItem = async (sku: string) => {
        try {
            await removeItem(sku);
            showMessage('Item removed from cart', 'success');
        } catch (error) {
            showMessage('Failed to remove item', 'error');
        }
    };

    const calculateTotal = () => {
        return cart?.items?.reduce((total: number, item: any) => {
            return total + (item.price * item.quantity);
        }, 0) || 0;
    };

    // Load cart on mount
    useEffect(() => {
        refreshCart().catch(() => {
            showMessage('Failed to load cart', 'error');
        });
    }, [refreshCart]);

    return (
        <Box sx={{ p: 1 }}>
            <SEO 
                title="Your Shopping Cart | E-Commerce Store"
                description="Review your shopping cart items, update quantities, and proceed to checkout securely. Free shipping on eligible orders over $50."
                keywords="shopping cart, checkout, online shopping, e-commerce, secure checkout"
                type="website"
                url="https://yourdomain.com/cart"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "ItemPage",
                    "name": "Shopping Cart",
                    "description": "View and manage your shopping cart items before checkout",
                    "mainEntity": {
                        "@type": "ItemList",
                        "itemListElement": cart?.items?.map((item: any, index: number) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "item": {
                                "@type": "Product",
                                "name": item.title,
                                "offers": {
                                    "@type": "Offer",
                                    "price": item.price,
                                    "priceCurrency": item.currency || "USD",
                                    "availability": "https://schema.org/InStock"
                                }
                            }
                        })) || []
                    }
                }}
            />
            <Paper elevation={3} sx={{ p: 1 }}>
                {cart?.items?.length === 0 ? (
                    <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
                        Your cart is empty
                    </Typography>
                ) : (
                    <>
                        {cart?.items?.map((item: any, index: number) => (
                            <Grid container key={index} direction="row" sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                                <Grid item xs={6}>
                                    <Typography variant="h6">{item?.title}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Grid item>
                                        <IconButton 
                                            color="primary" 
                                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <RemoveCircleIcon />
                                        </IconButton>
                                        <TextField
                                            sx={{ width: '8ch' }}
                                            required
                                            size="small"
                                            value={item?.quantity}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (!isNaN(value)) {
                                                    handleUpdateQuantity(item, value);
                                                }
                                            }}
                                        />
                                        <IconButton 
                                            color="primary"
                                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                        >
                                            <AddCircleIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography>{'$' + (item?.price * item?.quantity).toFixed(2)}</Typography>
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton 
                                        color="error"
                                        onClick={() => handleRemoveItem(item.productId)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Grid container sx={{ mt: 2, p: 2 }}>
                            <Grid item xs={6}>
                                <Typography variant="h6">Total: ${calculateTotal().toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<ShoppingBagIcon />}
                                    onClick={() => navigate('/')}
                                >
                                    Continue Shopping
                                </Button>
                                <Button 
                                    variant="contained" 
                                    startIcon={<PaidIcon />}
                                    onClick={() => navigate('/checkout')}
                                >
                                    Proceed to Checkout
                                </Button>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Paper>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default Cart