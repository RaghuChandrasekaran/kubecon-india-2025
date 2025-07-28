import React from 'react';
import {
    Box,
    Grid,
    TextField,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

interface PaymentFormProps {
    formData: any;
    errors: Record<string, string>;
    expandedSection: string;
    isCompleted: boolean;
    onFormChange: (section: string, field: string, value: string) => void;
    onSectionChange: (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
    onNextStep: () => void;
    onPrevStep: () => void;
}

const PaymentForm = ({
    formData,
    errors,
    expandedSection,
    isCompleted,
    onFormChange,
    onSectionChange,
    onNextStep,
    onPrevStep
}: PaymentFormProps) => {
    
    const validatePaymentForm = (): boolean => {
        const requiredFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
        return requiredFields.every(field => formData.payment[field]?.trim());
    };

    const handleNextStep = () => {
        if (validatePaymentForm()) {
            onNextStep();
        }
    };

    const formatCardNumber = (value: string) => {
        // Remove all non-digit characters
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        // Add spaces every 4 digits
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    return (
        <Accordion 
            expanded={expandedSection === 'payment'} 
            onChange={onSectionChange('payment')}
            sx={{ mb: 2, borderRadius: '8px', boxShadow: 2 }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isCompleted ? (
                        <CheckCircleIcon color="success" />
                    ) : (
                        <PaymentIcon color="primary" />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        2. Payment Information
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
                    {/* Security Notice */}
                    <Alert 
                        icon={<LockIcon />} 
                        severity="info" 
                        sx={{ mb: 3 }}
                    >
                        Your payment information is secured with 256-bit SSL encryption
                    </Alert>

                    {/* Accepted Cards */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Accepted Cards:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label="Visa" size="small" />
                            <Chip label="Mastercard" size="small" />
                            <Chip label="American Express" size="small" />
                            <Chip label="Discover" size="small" />
                        </Box>
                    </Box>

                    {/* Payment Form */}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Cardholder Name"
                                value={formData.payment.cardholderName}
                                onChange={(e) => onFormChange('payment', 'cardholderName', e.target.value)}
                                error={!!errors.cardholderName}
                                helperText={errors.cardholderName}
                                required
                                placeholder="John Doe"
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Card Number"
                                value={formData.payment.cardNumber}
                                onChange={(e) => {
                                    const formatted = formatCardNumber(e.target.value);
                                    onFormChange('payment', 'cardNumber', formatted);
                                }}
                                error={!!errors.cardNumber}
                                helperText={errors.cardNumber}
                                required
                                placeholder="1234 5678 9012 3456"
                                inputProps={{ maxLength: 19 }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Expiry Date"
                                value={formData.payment.expiryDate}
                                onChange={(e) => {
                                    const formatted = formatExpiryDate(e.target.value);
                                    onFormChange('payment', 'expiryDate', formatted);
                                }}
                                error={!!errors.expiryDate}
                                helperText={errors.expiryDate}
                                required
                                placeholder="MM/YY"
                                inputProps={{ maxLength: 5 }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="CVV"
                                value={formData.payment.cvv}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    onFormChange('payment', 'cvv', value);
                                }}
                                error={!!errors.cvv}
                                helperText={errors.cvv}
                                required
                                placeholder="123"
                                inputProps={{ maxLength: 4 }}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Billing Address"
                                value={formData.payment.billingAddress}
                                onChange={(e) => onFormChange('payment', 'billingAddress', e.target.value)}
                                error={!!errors.billingAddress}
                                helperText={errors.billingAddress || "Same as shipping address if left blank"}
                                placeholder="123 Main St, City, State 12345"
                            />
                        </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={onPrevStep}
                            sx={{ 
                                px: 3, 
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none'
                            }}
                        >
                            Back to Shipping
                        </Button>
                        
                        <Button
                            variant="contained"
                            onClick={handleNextStep}
                            disabled={!validatePaymentForm()}
                            sx={{ 
                                px: 4, 
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            Continue to Review
                        </Button>
                    </Box>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default PaymentForm;
