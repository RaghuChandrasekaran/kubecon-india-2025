import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Divider,
    Chip
} from '@mui/material';
import { formatCurrency, getShippingCost } from '../../api/cart';

interface CheckoutSummaryProps {
    cart: any;
    cartSummary: any;
    shippingMethod: string;
}

const CheckoutSummary = ({ cart, cartSummary, shippingMethod }: CheckoutSummaryProps) => {
    const shippingMethodNames = {
        default: 'Free Shipping',
        standard: 'Standard Shipping',
        express: 'Express Shipping',
        overnight: 'Overnight Shipping'
    };

    return (
        <Paper sx={{ p: 3, borderRadius: '8px', position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order Summary
            </Typography>
            
            {/* Cart Items */}
            <Box sx={{ mb: 3 }}>
                {cart?.items?.map((item: any, index: number) => (
                    <Box key={index} sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.5
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                            <Box sx={{ width: 50, height: 50 }}>
                                <img 
                                    src={item.image || '/assets/images/deals/shoes.jpg'} 
                                    alt={item.title}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '4px'
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {item.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Qty: {item.quantity}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(item.price * item.quantity)}
                        </Typography>
                    </Box>
                ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Pricing Breakdown */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                        Subtotal ({cart?.items?.length || 0} items):
                    </Typography>
                    <Typography variant="body2">
                        {formatCurrency(cartSummary?.cart?.subtotal || 0)}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                    <Box>
                        <Typography variant="body2">Shipping:</Typography>
                        {shippingMethod && (
                            <Typography variant="caption" color="text.secondary">
                                {shippingMethodNames[shippingMethod as keyof typeof shippingMethodNames]}
                            </Typography>
                        )}
                    </Box>
                    <Typography variant="body2">
                        {getShippingCost(shippingMethod) === 0 ? (
                            <Chip label="FREE" size="small" color="success" />
                        ) : (
                            formatCurrency(getShippingCost(shippingMethod))
                        )}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">
                        {formatCurrency(cartSummary?.cart?.taxAmount || 0)}
                    </Typography>
                </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(cartSummary?.cart?.total || 0)}
                </Typography>
            </Box>
            
            {/* Estimated Delivery */}
            {shippingMethod && (
                <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    borderRadius: '8px',
                    border: '1px solid rgba(25, 118, 210, 0.12)'
                }}>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                        ESTIMATED DELIVERY
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {shippingMethod === 'default' && '5-7 business days'}
                        {shippingMethod === 'standard' && '3-5 business days'}
                        {shippingMethod === 'express' && '1-2 business days'}
                        {shippingMethod === 'overnight' && 'Next business day'}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default CheckoutSummary;
