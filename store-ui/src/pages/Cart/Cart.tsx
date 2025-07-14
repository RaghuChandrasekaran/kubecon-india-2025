import { useParams } from "react-router-dom";
import { getCart, updateQuantity, removeFromCart } from "../../api/cart"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography, Divider, Card, CardMedia, useTheme, useMediaQuery } from '@mui/material';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaidIcon from '@mui/icons-material/Paid';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useCart } from '../../components/layout/CartContext';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SEO from '../../components/SEO';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, updateItemQuantity, removeItem, refreshCart } = useCart();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
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

    // Sample recommended products (would come from API in real implementation)
    const recommendedProducts = [
        {
            id: 1,
            title: "Sport Shoes",
            price: 163.00,
            image: "/assets/images/deals/shoes.jpg"
        },
        {
            id: 2,
            title: "Leather Loafers",
            price: 83.99,
            image: "/assets/images/deals/slippers.webp"
        },
        {
            id: 3,
            title: "Fitness Band",
            price: 113.50,
            image: "/assets/images/deals/mobile.webp"
        },
        {
            id: 4,
            title: "Casual Heels",
            price: 89.95,
            image: "/assets/images/deals/shoes.jpg"
        }
    ];

    // Load cart on mount
    useEffect(() => {
        refreshCart().catch(() => {
            showMessage('Failed to load cart', 'error');
        });
    }, [refreshCart]);

    return (
        <Box sx={{ p: isMobile ? 1 : 2, maxWidth: 1200, mx: 'auto' }}>
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
                <Paper elevation={2} sx={{ p: 4, borderRadius: '8px', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Your cart is empty
                    </Typography>
                    <Button 
                        variant="contained"
                        startIcon={<ShoppingBagIcon />}
                        onClick={() => navigate('/')}
                        sx={{ 
                            mt: 2,
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                            }
                        }}
                    >
                        Continue Shopping
                    </Button>
                </Paper>
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
                                <Box 
                                    key={index} 
                                    sx={{ 
                                        p: 2, 
                                        borderBottom: index < cart.items.length - 1 ? '1px solid #eee' : 'none',
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        gap: 2
                                    }}
                                >
                                    {/* Product Image */}
                                    <Box sx={{ width: { xs: '100%', sm: '120px' }, maxWidth: '120px' }}>
                                        <img 
                                            src={item.image || '/assets/images/deals/shoes.jpg'} 
                                            alt={item.title}
                                            style={{ 
                                                width: '100%', 
                                                height: 'auto',
                                                borderRadius: '4px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </Box>
                                    
                                    {/* Product Details */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                mb: 0.5,
                                                fontWeight: 500,
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{ mb: 1 }}
                                        >
                                            {item.vendor || 'Brand Name'}
                                        </Typography>
                                        
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                flexDirection: { xs: 'column', sm: 'row' }, 
                                                justifyContent: 'space-between',
                                                alignItems: { xs: 'flex-start', sm: 'center' },
                                                gap: 2,
                                                mt: 1
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography sx={{ mr: 1 }}>Quantity:</Typography>
                                                <IconButton 
                                                    size="small"
                                                    color="primary" 
                                                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    sx={{ p: 0.5 }}
                                                >
                                                    <RemoveCircleIcon fontSize="small" />
                                                </IconButton>
                                                <Typography sx={{ px: 1, minWidth: '20px', textAlign: 'center' }}>
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton 
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                    sx={{ p: 0.5 }}
                                                >
                                                    <AddCircleIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: theme.palette.primary.main
                                                    }}
                                                >
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                                <IconButton 
                                                    color="error"
                                                    onClick={() => handleRemoveItem(item.productId || item.sku)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                    
                    {/* Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                p: 3, 
                                borderRadius: '8px',
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 2,
                                    fontWeight: 600
                                }}
                            >
                                Total
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Subtotal
                                    </Typography>
                                    <Typography variant="body1">
                                        ${calculateTotal().toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Shipping
                                    </Typography>
                                    <Typography variant="body1">
                                        $0.00
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tax
                                    </Typography>
                                    <Typography variant="body1">
                                        $0.00
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6">
                                    Total
                                </Typography>
                                <Typography variant="h6" color="primary" fontWeight={600}>
                                    ${calculateTotal().toFixed(2)}
                                </Typography>
                            </Box>
                            
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="primary"
                                size="large"
                                onClick={() => navigate('/checkout')}
                                sx={{ 
                                    py: 1.5,
                                    backgroundColor: '#FF9800',
                                    '&:hover': {
                                        backgroundColor: '#F57C00',
                                    },
                                    mb: 2
                                }}
                            >
                                Proceed to Checkout
                            </Button>
                            
                            <Button 
                                fullWidth 
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/')}
                                sx={{ 
                                    py: 1.2, 
                                    textTransform: 'none', 
                                    borderColor: '#ddd',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: '#aaa',
                                        backgroundColor: 'rgba(0, 0, 0, 0.01)'
                                    }
                                }}
                            >
                                Continue Shopping
                            </Button>
                        </Paper>
                    </Grid>
                    
                    {/* Recommended Products */}
                    <Grid item xs={12}>
                        <Box sx={{ mt: 3 }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 2,
                                    fontWeight: 500
                                }}
                            >
                                Recommended For You
                            </Typography>
                            <Grid container spacing={2}>
                                {recommendedProducts.map((product) => (
                                    <Grid item xs={6} sm={3} key={product.id}>
                                        <Card 
                                            sx={{ 
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)'
                                                },
                                                borderRadius: '8px',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            <Box sx={{ p: 1, height: '140px', position: 'relative' }}>
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ p: 2 }}>
                                                <Typography 
                                                    variant="body2" 
                                                    component="div" 
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        height: '40px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}
                                                >
                                                    {product.title}
                                                </Typography>
                                                <Typography 
                                                    variant="body1" 
                                                    color="primary" 
                                                    sx={{ 
                                                        fontWeight: 600, 
                                                        mt: 1 
                                                    }}
                                                >
                                                    ${product.price.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
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