import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCart } from '../../components/layout/CartContext';
import { getCart, updateCartWithShipping, clearCart } from '../../api/cart';
import { isAuthenticated, getUserAddresses, Address } from '../../api/users';
import SEO from '../../components/SEO';

// Import new components
import ShippingForm from '../../components/Checkout/ShippingForm';
import PaymentForm from '../../components/Checkout/PaymentForm';
import OrderReview from '../../components/Checkout/OrderReview';
import CheckoutSummary from '../../components/Checkout/CheckoutSummary';

// Form validation types
interface FormErrors {
  shipping: Record<string, string>;
  payment: Record<string, string>;
}

// Initial form state
const initialFormState = {
  shipping: {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  },
  payment: {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: ''
  },
  shippingMethod: 'default',
  saveAddress: false,
  termsAccepted: false
};

// Initial error state
const initialErrorState: FormErrors = {
  shipping: {},
  payment: {}
};

const Checkout = () => {
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState<string>('shipping');
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<FormErrors>(initialErrorState);
    const [sectionComplete, setSectionComplete] = useState({
      shipping: false,
      payment: false,
      review: false
    });
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [cartSummary, setCartSummary] = useState<any>(null);
    const { cart: cartContext, refreshCart } = useCart();

    // Get cart data on component mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const cartData = await getCart();
                setCart(cartData);
                
                if (cartData?.items?.length) {
                    // Set initial cart summary with default shipping
                    setCartSummary({
                        cart: cartData,
                        shippingMethod: 'default'
                    });
                    
                    // Update cart with shipping method for backend calculations
                    await updateCartWithShipping('default');
                }
                
                // Load user addresses if authenticated
                if (isAuthenticated()) {
                    try {
                        const userAddresses = await getUserAddresses();
                        setAddresses(userAddresses);
                        
                        if (userAddresses.length > 0) {
                            setSelectedAddress(userAddresses[0]);
                            // Also populate shipping form with first address details
                            setFormData(prev => ({
                                ...prev,
                                shipping: {
                                    ...prev.shipping,
                                    firstName: userAddresses[0].firstName,
                                    lastName: userAddresses[0].lastName,
                                    address: userAddresses[0].address,
                                    city: userAddresses[0].city,
                                    state: userAddresses[0].state,
                                    zipCode: userAddresses[0].postalCode,
                                    phone: userAddresses[0].phone || '',
                                }
                            }));
                        }
                    } catch (addressError) {
                        console.error('Error loading addresses:', addressError);
                    }
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [navigate]);

    // Handle form input changes
    const handleFormChange = (section: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof typeof prev] as any),
                [field]: value
            }
        }));

        // Clear error when user starts typing
        if (errors[section as keyof FormErrors][field]) {
            setErrors(prev => ({
                ...prev,
                [section]: {
                    ...prev[section as keyof FormErrors],
                    [field]: ''
                }
            }));
        }
    };

    // Handle accordion expansion
    const handleSectionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSection(isExpanded ? section : '');
    };

    // Handle shipping method change
    const handleShippingMethodChange = async (method: string) => {
        setFormData(prev => ({ ...prev, shippingMethod: method }));
        
        try {
            // Update cart with shipping method for backend calculations
            const updatedCart = await updateCartWithShipping(method);
            console.log('Updated cart with shipping:', updatedCart);
            
            setCartSummary({
                cart: updatedCart,
                shippingMethod: method
            });
        } catch (error) {
            console.error('Error updating shipping method:', error);
        }
    };

    // Step navigation functions
    const handleNextStep = () => {
        if (expandedSection === 'shipping') {
            setSectionComplete(prev => ({ ...prev, shipping: true }));
            setExpandedSection('payment');
        } else if (expandedSection === 'payment') {
            setSectionComplete(prev => ({ ...prev, payment: true }));
            setExpandedSection('review');
        }
    };

    const handlePrevStep = () => {
        if (expandedSection === 'payment') {
            setExpandedSection('shipping');
        } else if (expandedSection === 'review') {
            setExpandedSection('payment');
        }
    };

    // Handle address selection
    const handleAddressSelect = (address: Address | null) => {
        setSelectedAddress(address);
        if (address) {
            setFormData(prev => ({
                ...prev,
                shipping: {
                    ...prev.shipping,
                    firstName: address.firstName,
                    lastName: address.lastName,
                    address: address.address,
                    city: address.city,
                    state: address.state,
                    zipCode: address.postalCode,
                    phone: address.phone || '',
                }
            }));
        }
    };

    // Handle order submission
    const handlePlaceOrder = async () => {
        setSubmitting(true);
        try {
            // Simulate order processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Clear cart after successful order
            await clearCart();
            await refreshCart();
            
            // Navigate to order confirmation
            navigate('/order-confirmation', {
                state: {
                    orderData: {
                        orderId: Math.random().toString(36).substr(2, 9).toUpperCase(),
                        cart: cart,
                        formData: formData,
                        total: cartSummary?.cart?.total || 0
                    }
                }
            });
        } catch (error) {
            console.error('Error placing order:', error);
            // Handle error (show error message)
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography>Loading checkout...</Typography>
            </Box>
        );
    }

    if (!cart?.items?.length) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Your cart is empty</Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Continue Shopping
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
            <SEO 
                title="Checkout | Clusterly"
                description="Complete your purchase securely with our streamlined checkout process. Fast shipping and secure payment options available."
                keywords="checkout, secure payment, fast shipping, online shopping"
                type="website"
            />
            
            {/* Back to Cart Button */}
            <Button 
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/cart')}
                sx={{ mb: 3, textTransform: 'none' }}
            >
                Back to Cart
            </Button>

            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
                Checkout
            </Typography>

            <Grid container spacing={4}>
                {/* Checkout Forms */}
                <Grid item xs={12} lg={8}>
                    <ShippingForm
                        formData={formData}
                        errors={errors.shipping}
                        addresses={addresses}
                        selectedAddress={selectedAddress}
                        expandedSection={expandedSection}
                        isCompleted={sectionComplete.shipping}
                        onFormChange={handleFormChange}
                        onAddressSelect={handleAddressSelect}
                        onShippingMethodChange={handleShippingMethodChange}
                        onSectionChange={handleSectionChange}
                        onNextStep={handleNextStep}
                    />

                    <PaymentForm
                        formData={formData}
                        errors={errors.payment}
                        expandedSection={expandedSection}
                        isCompleted={sectionComplete.payment}
                        onFormChange={handleFormChange}
                        onSectionChange={handleSectionChange}
                        onNextStep={handleNextStep}
                        onPrevStep={handlePrevStep}
                    />

                    <OrderReview
                        formData={formData}
                        cart={cart}
                        cartSummary={cartSummary}
                        expandedSection={expandedSection}
                        isCompleted={sectionComplete.review}
                        submitting={submitting}
                        onSectionChange={handleSectionChange}
                        onPrevStep={handlePrevStep}
                        onPlaceOrder={handlePlaceOrder}
                    />
                </Grid>

                {/* Order Summary Sidebar */}
                <Grid item xs={12} lg={4}>
                    <CheckoutSummary
                        cart={cart}
                        cartSummary={cartSummary}
                        shippingMethod={formData.shippingMethod}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Checkout;
