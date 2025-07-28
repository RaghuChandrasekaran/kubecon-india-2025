import React from 'react';
import {
    Box,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Divider,
    Paper,
    CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatCurrency } from '../../api/cart';

interface Address {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
}

interface OrderReviewProps {
    formData: any;
    cart: any;
    cartSummary: any;
    expandedSection: string;
    isCompleted: boolean;
    submitting: boolean;
    onSectionChange: (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
    onPrevStep: () => void;
    onPlaceOrder: () => void;
}

const OrderReview = ({
    formData,
    cart,
    cartSummary,
    expandedSection,
    isCompleted,
    submitting,
    onSectionChange,
    onPrevStep,
    onPlaceOrder
}: OrderReviewProps) => {

    const shippingMethods = {
        default: { name: 'Free Shipping', time: '5-7 business days' },
        standard: { name: 'Standard Shipping', time: '3-5 business days' },
        express: { name: 'Express Shipping', time: '1-2 business days' },
        overnight: { name: 'Overnight Shipping', time: 'Next business day' }
    };

    const selectedShippingMethod = shippingMethods[formData.shippingMethod as keyof typeof shippingMethods];

    return (
        <Accordion 
            expanded={expandedSection === 'review'} 
            onChange={onSectionChange('review')}
            sx={{ mb: 2, borderRadius: '8px', boxShadow: 2 }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isCompleted ? (
                        <CheckCircleIcon color="success" />
                    ) : (
                        <ReceiptIcon color="primary" />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        3. Review Order
                    </Typography>
                    {isCompleted && (
                        <Typography variant="body2" color="success.main" sx={{ ml: 'auto' }}>
                            Completed
                        </Typography>
                    )}
                </Box>
            </AccordionSummary>
            
            <AccordionDetails>
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={3}>
                        {/* Order Items */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Order Items ({cart?.items?.length || 0})
                                </Typography>
                                
                                {cart?.items?.map((item: any, index: number) => (
                                    <Box key={index} sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mb: 2,
                                        pb: 2,
                                        borderBottom: index < cart.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                                    }}>
                                        <Box sx={{ width: 80, height: 80 }}>
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
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Quantity: {item.quantity}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {formatCurrency(item.price * item.quantity)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>

                        {/* Order Summary */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Order Summary
                                </Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Subtotal:</Typography>
                                        <Typography>
                                            {formatCurrency(cartSummary?.cart?.subtotal || 0)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Shipping:</Typography>
                                        <Typography>
                                            {formatCurrency(cartSummary?.cart?.shippingCost || 0)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Tax:</Typography>
                                        <Typography>
                                            {formatCurrency(cartSummary?.cart?.taxAmount || 0)}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        {formatCurrency(cartSummary?.cart?.total || 0)}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Shipping & Payment Info */}
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            Shipping Address
                                        </Typography>
                                        <Typography variant="body2">
                                            {formData.shipping.firstName} {formData.shipping.lastName}<br />
                                            {formData.shipping.address}<br />
                                            {formData.shipping.city}, {formData.shipping.state} {formData.shipping.zipCode}<br />
                                            Phone: {formData.shipping.phone}
                                        </Typography>
                                        
                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Shipping Method:
                                        </Typography>
                                        <Typography variant="body2">
                                            {selectedShippingMethod?.name} - {selectedShippingMethod?.time}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            Payment Method
                                        </Typography>
                                        <Typography variant="body2">
                                            Credit Card ending in {formData.payment.cardNumber?.slice(-4) || '****'}<br />
                                            {formData.payment.cardholderName}<br />
                                            Expires: {formData.payment.expiryDate}
                                        </Typography>
                                        
                                        {formData.payment.billingAddress && (
                                            <>
                                                <Divider sx={{ my: 2 }} />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    Billing Address:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {formData.payment.billingAddress}
                                                </Typography>
                                            </>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={onPrevStep}
                            disabled={submitting}
                            sx={{ 
                                px: 3, 
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none'
                            }}
                        >
                            Back to Payment
                        </Button>
                        
                        <Button
                            variant="contained"
                            onClick={onPlaceOrder}
                            disabled={submitting}
                            sx={{ 
                                px: 4, 
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                backgroundColor: '#4caf50',
                                '&:hover': { backgroundColor: '#45a049' }
                            }}
                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {submitting ? 'Processing...' : 'Place Order'}
                        </Button>
                    </Box>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default OrderReview;
