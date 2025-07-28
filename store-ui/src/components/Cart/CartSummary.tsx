import { Box, Paper, Typography, Divider, Button, FormControl, RadioGroup, FormControlLabel, Radio, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { formatCurrency, getShippingCost } from '../../api/cart';

interface CartSummaryProps {
    cart: any;
    shippingMethod?: string;
    onCheckout: () => void;
    onContinueShopping: () => void;
    onShippingMethodChange?: (method: string) => void;
}

const CartSummary = ({ cart, shippingMethod = 'default', onCheckout, onContinueShopping, onShippingMethodChange }: CartSummaryProps) => {
    const navigate = useNavigate();

    // Calculate totals from cart
    const subtotal = cart?.subtotal || 0;
    const tax = cart?.tax || cart?.taxAmount || 0;
    const shipping = cart?.shipping || cart?.shippingCost || getShippingCost(shippingMethod);
    // Use backend calculated total if available and shipping is included, otherwise calculate manually
    const total = cart?.total || (subtotal + tax + shipping);

    const shippingMethods = [
        { id: 'default', name: 'Free Shipping', time: '5-7 business days', cost: 0 },
        { id: 'standard', name: 'Standard Shipping', time: '3-5 business days', cost: 99 },
        { id: 'express', name: 'Express Shipping', time: '1-2 business days', cost: 199 },
        { id: 'overnight', name: 'Overnight Shipping', time: 'Next business day', cost: 399 }
    ];

    const handleShippingMethodChange = (method: string) => {
        if (onShippingMethodChange) {
            onShippingMethodChange(method);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order Summary
            </Typography>
            
            {/* Shipping Method Selection */}
            {onShippingMethodChange && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Shipping Method:
                    </Typography>
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={shippingMethod}
                            onChange={(e) => handleShippingMethodChange(e.target.value)}
                        >
                            {shippingMethods.map((method) => (
                                <FormControlLabel
                                    key={method.id}
                                    value={method.id}
                                    control={<Radio size="small" />}
                                    label={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {method.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {method.time}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {method.cost === 0 ? (
                                                    <Chip label="FREE" size="small" color="success" />
                                                ) : (
                                                    formatCurrency(method.cost)
                                                )}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ 
                                        border: '1px solid #e0e0e0', 
                                        borderRadius: '8px', 
                                        m: 0.5, 
                                        p: 1,
                                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Box>
            )}
            
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>
                        {formatCurrency(subtotal)}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Shipping:</Typography>
                    <Typography>
                        {shipping === 0 ? (
                            <Chip label="FREE" size="small" color="success" />
                        ) : (
                            formatCurrency(shipping)
                        )}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax:</Typography>
                    <Typography>
                        {formatCurrency(tax)}
                    </Typography>
                </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(total)}
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                    variant="contained" 
                    fullWidth
                    size="large"
                    onClick={onCheckout}
                    sx={{ 
                        py: 1.5,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}
                >
                    Proceed to Checkout
                </Button>
                
                <Button 
                    variant="outlined" 
                    fullWidth
                    startIcon={<ArrowBackIcon />}
                    onClick={onContinueShopping}
                    sx={{ 
                        py: 1.5,
                        borderRadius: '8px',
                        textTransform: 'none'
                    }}
                >
                    Continue Shopping
                </Button>
            </Box>
        </Paper>
    );
};

export default CartSummary;
