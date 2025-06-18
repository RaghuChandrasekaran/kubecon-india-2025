import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Alert from '@mui/material/Alert';
import { useCart } from '../../components/layout/CartContext';
import { getCart } from '../../api/cart';

const steps = ['Shipping Address', 'Payment Details', 'Review Order'];

const Checkout = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = React.useState(0);
    const [cart, setCart] = React.useState<any>(null);
    const { updateCartCount } = useCart();

    React.useEffect(() => {
        getCart().then(setCart).catch(() => {
            navigate('/cart');
        });
    }, [navigate]);

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            // Place order
            // This would typically call your backend API
            navigate('/order-confirmation');
            updateCartCount(); // Update cart count after order is placed
        } else {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const calculateTotal = () => {
        return cart?.items?.reduce((total: number, item: any) => {
            return total + (item.price * item.quantity);
        }, 0) || 0;
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="First Name"
                                autoComplete="given-name"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Last Name"
                                autoComplete="family-name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Address"
                                autoComplete="street-address"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="City"
                                autoComplete="address-level2"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Postal Code"
                                autoComplete="postal-code"
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Card Number"
                                autoComplete="cc-number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Expiry Date"
                                placeholder="MM/YY"
                                autoComplete="cc-exp"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="CVC"
                                autoComplete="cc-csc"
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        {cart?.items?.map((item: any, index: number) => (
                            <Grid container key={index} spacing={2}>
                                <Grid item xs={6}>
                                    <Typography>{item.title}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography>x{item.quantity}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                                </Grid>
                            </Grid>
                        ))}
                        <Box sx={{ mt: 2, borderTop: 1, pt: 2 }}>
                            <Typography variant="h6">
                                Total: ${calculateTotal().toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                );
            default:
                return <Alert severity="error">Unknown step</Alert>;
        }
    };

    if (!cart?.items?.length) {
        return null; // Or loading state
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    {activeStep !== 0 && (
                        <Button onClick={handleBack} sx={{ mr: 1 }}>
                            Back
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleNext}
                    >
                        {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Checkout;
