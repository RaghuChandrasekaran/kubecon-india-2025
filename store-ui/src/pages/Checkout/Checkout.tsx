import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { useCart } from '../../components/layout/CartContext';
import { getCart, updateCartWithShipping, clearCart, getShippingCost, formatCurrency } from '../../api/cart';
import { isAuthenticated, getUserAddresses, saveUserAddress, Address } from '../../api/users';
import SEO from '../../components/SEO';

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
    postalCode: '',
    country: 'IND',
    email: '',
    phone: '',
    isDefault: false
  },
  payment: {
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    billingAddressSame: true
  },
  options: {
    shippingMethod: 'default',
    giftWrap: false,
    saveInfo: true
  }
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
    });
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [cartSummary, setCartSummary] = useState<any>(null);
    const { cart: cartContext, refreshCart } = useCart();

    // Get cart data on component mount
    useEffect(() => {
        setLoading(true);
        getCart()
            .then((cartData) => {
                if (cartData && cartData.items?.length > 0) {
                    setCart(cartData);
                    // Set initial cart summary with default shipping
                    setCartSummary({
                        cart: cartData,
                        shippingMethod: 'default'
                    });
                } else {
                    navigate('/cart');
                }
                setLoading(false);
            })
            .catch(() => {
                navigate('/cart');
            });
    }, [navigate]);

    // Get user addresses if authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            getUserAddresses()
                .then(fetchedAddresses => {
                    setAddresses(fetchedAddresses);
                    // Set default selected address to first one if available
                    if (fetchedAddresses.length > 0) {
                        setSelectedAddress(fetchedAddresses[0]);
                        // Also populate shipping form with first address details
                        setFormData((prev: any) => ({
                            ...prev,
                            shipping: {
                                ...prev.shipping,
                                ...fetchedAddresses[0]
                            }
                        }));
                    }
                })
                .catch(error => {
                    console.error('Error fetching addresses:', error);
                });
        }
    }, []);

    // Calculate order values (backend handles shipping addition in total)
    const calculateSubtotal = () => {
        console.log('Cart Summary:', cartSummary); // Debug log
        return cartSummary?.cart?.subtotal || 0;
    };

    const calculateShipping = () => {
        // This is just for display - backend handles actual shipping in total
        const shippingMethod = formData.options.shippingMethod || cartSummary?.shippingMethod || 'default';
        return getShippingCost(shippingMethod);
    };

    const calculateTax = () => {
        return cartSummary?.cart?.taxAmount || 0;
    };

    const calculateTotal = () => {
        // Use backend calculated total (includes shipping)
        return cartSummary?.cart?.total || 0;
    };

    // Handle shipping method change and update cart summary
    const handleShippingMethodChange = async (newShippingMethod: string) => {
        try {
            setLoading(true);
            
            // Update cart with shipping method in backend
            await updateCartWithShipping(newShippingMethod);
            
            // Get fresh cart data to get updated totals from backend
            const freshCartData = await getCart();
            if (freshCartData && freshCartData.items?.length > 0) {
                setCart(freshCartData);
                setCartSummary({
                    cart: freshCartData,
                    shippingMethod: newShippingMethod
                });
            }
            
            // Update form data with new shipping method
            setFormData((prev: any) => ({
                ...prev,
                options: {
                    ...prev.options,
                    shippingMethod: newShippingMethod
                }
            }));
            
        } catch (error) {
            console.error('Error updating shipping method:', error);
        } finally {
            setLoading(false);
        }
    };

    // Form validation functions
    const validateShippingForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.shipping.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        
        if (!formData.shipping.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        
        if (!formData.shipping.address.trim()) {
            newErrors.address = 'Address is required';
        }
        
        if (!formData.shipping.city.trim()) {
            newErrors.city = 'City is required';
        }
        
        if (!formData.shipping.postalCode.trim()) {
            newErrors.postalCode = 'Postal code is required';
        } else if (!/^\d{5,6}(-\d{4})?$/.test(formData.shipping.postalCode)) {
            newErrors.postalCode = 'Invalid postal code format';
        }
        
        if (!formData.shipping.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.shipping.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors((prev: any) => ({ ...prev, shipping: newErrors }));
        const isValid = Object.keys(newErrors).length === 0;
        setSectionComplete((prev: any) => ({ ...prev, shipping: isValid }));
        
        return isValid;
    };

    const validatePaymentForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.payment.cardName.trim()) {
            newErrors.cardName = 'Name on card is required';
        }
        
        if (!formData.payment.cardNumber.trim()) {
            newErrors.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(formData.payment.cardNumber.replace(/\s/g, ''))) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }
        
        if (!formData.payment.expDate.trim()) {
            newErrors.expDate = 'Expiration date is required';
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.payment.expDate)) {
            newErrors.expDate = 'Invalid format (MM/YY)';
        }
        
        if (!formData.payment.cvv.trim()) {
            newErrors.cvv = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(formData.payment.cvv)) {
            newErrors.cvv = 'CVV must be 3 or 4 digits';
        }
        
        setErrors((prev: any) => ({ ...prev, payment: newErrors }));
        const isValid = Object.keys(newErrors).length === 0;
        setSectionComplete((prev: any) => ({ ...prev, payment: isValid }));
        
        return isValid;
    };

    // Handle form input changes
    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            shipping: {
                ...prev.shipping,
                [name as string]: value
            }
        }));
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            payment: {
                ...prev.payment,
                [name as string]: value
            }
        }));
    };

    const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            options: {
                ...prev.options,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    // Handle form section expansion
    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSection(isExpanded ? panel : '');
    };

    // Handle shipping form completion
    const completeShippingSection = () => {
        if (validateShippingForm()) {
            setExpandedSection('payment');
        }
    };

    // Handle payment form completion
    const completePaymentSection = () => {
        if (validatePaymentForm()) {
            setExpandedSection('review');
        }
    };

    // Handle form submission
    const handleSubmitOrder = async () => {
        // Validate all sections first
        const isShippingValid = validateShippingForm();
        const isPaymentValid = validatePaymentForm();
        
        if (!isShippingValid) {
            setExpandedSection('shipping');
            return;
        }
        
        if (!isPaymentValid) {
            setExpandedSection('payment');
            return;
        }
        
        setSubmitting(true);
        
        try {
            // In a real app, you would call your order placement API here
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Clear the cart using API after successful order placement
            await clearCart();
            
            // Success - navigate to confirmation page
            refreshCart(); // Update cart count to reflect empty cart
            navigate('/order-confirmation');
        } catch (error) {
            console.error('Error placing order:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle address selection
    const handleAddressSelect = (address: Address) => {
        setSelectedAddress(address);
        setFormData((prev: any) => ({
            ...prev,
            shipping: {
                ...prev.shipping,
                ...address
            }
        }));
    };

    // Handle new address save
    const handleSaveAddress = () => {
        // Validate address fields
        if (!formData.shipping.firstName || !formData.shipping.lastName || !formData.shipping.address || !formData.shipping.city || !formData.shipping.postalCode) {
            return;
        }
        
        // Simulate API call to save address
        saveUserAddress(formData.shipping)
            .then(savedAddress => {
                setAddresses((prev: any) => [...prev, savedAddress]);
                setSelectedAddress(savedAddress);
                setFormData((prev: any) => ({
                    ...prev,
                    shipping: {
                        ...prev.shipping,
                        ...savedAddress
                    }
                }));
                alert('Address saved successfully!');
            })
            .catch(error => {
                console.error('Error saving address:', error);
            });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!cart?.items?.length) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="info">
                    Your cart is empty. Please add items to your cart before proceeding to checkout.
                </Alert>
                <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/')}
                >
                    Continue Shopping
                </Button>
            </Box>
        );
    }

    // Prepare structured data for SEO
    const checkoutSchema = {
        "@context": "https://schema.org",
        "@type": "CheckoutPage",
        "name": "Secure Checkout",
        "description": "Complete your purchase securely with multiple payment options and fast shipping",
        "mainEntity": {
            "@type": "Order",
            "acceptedPaymentMethod": [
                {
                    "@type": "PaymentMethod",
                    "name": "Credit Card"
                }
            ],
            "discount": 0,
            "offeredBy": {
                "@type": "Organization",
                "name": "E-Commerce Store"
            },
            "orderStatus": "OrderInProgress"
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1200px', mx: 'auto' }}>
            <SEO 
                title="Secure Checkout | E-Commerce Store" 
                description="Complete your purchase securely with multiple payment options and fast shipping. Your personal information is encrypted and protected."
                keywords="secure checkout, payment options, fast shipping, credit card, express shipping"
                type="checkout"
                schema={checkoutSchema}
            />
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                Checkout
            </Typography>
            
            <Grid container spacing={3}>
                {/* Main checkout form */}
                <Grid item xs={12} md={8}>
                    {/* Shipping Information Section */}
                    <Accordion 
                        expanded={expandedSection === 'shipping'} 
                        onChange={handleAccordionChange('shipping')}
                        sx={{ mb: 2 }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="shipping-content"
                            id="shipping-header"
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <LocalShippingIcon sx={{ mr: 2, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    Shipping Information
                                </Typography>
                                {sectionComplete.shipping && (
                                    <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                                )}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="firstName"
                                        name="firstName"
                                        label="First Name"
                                        value={formData.shipping.firstName}
                                        onChange={handleShippingChange}
                                        error={!!errors.shipping.firstName}
                                        helperText={errors.shipping.firstName}
                                        autoComplete="given-name"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="lastName"
                                        name="lastName"
                                        label="Last Name"
                                        value={formData.shipping.lastName}
                                        onChange={handleShippingChange}
                                        error={!!errors.shipping.lastName}
                                        helperText={errors.shipping.lastName}
                                        autoComplete="family-name"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        value={formData.shipping.email}
                                        onChange={handleShippingChange}
                                        error={!!errors.shipping.email}
                                        helperText={errors.shipping.email}
                                        autoComplete="email"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="address"
                                        name="address"
                                        label="Address"
                                        value={formData.shipping.address}
                                        onChange={handleShippingChange}
                                        error={!!errors.shipping.address}
                                        helperText={errors.shipping.address}
                                        autoComplete="street-address"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="city"
                                        name="city"
                                        label="City"
                                        value={formData.shipping.city}
                                        onChange={handleShippingChange}
                                        error={!!errors.shipping.city}
                                        helperText={errors.shipping.city}
                                        autoComplete="address-level2"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="state"
                                        name="state"
                                        label="State/Province"
                                        value={formData.shipping.state}
                                        onChange={handleShippingChange}
                                        autoComplete="address-level1"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="postalCode"
                                        name="postalCode"
                                        label="ZIP / Postal Code"
                                        value={formData.shipping.postalCode}
                                        onChange={handleShippingChange}
                                        error={!!errors.shipping.postalCode}
                                        helperText={errors.shipping.postalCode}
                                        autoComplete="postal-code"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="country"
                                        name="country"
                                        select
                                        label="Country"
                                        value={formData.shipping.country}
                                        onChange={handleShippingChange}
                                        autoComplete="country"
                                    >
                                        <MenuItem value="IND">India</MenuItem>
                                        <MenuItem value="USA">United States</MenuItem>
                                        <MenuItem value="CAN">Canada</MenuItem>
                                        <MenuItem value="MEX">Mexico</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="phone"
                                        name="phone"
                                        label="Phone Number"
                                        value={formData.shipping.phone}
                                        onChange={handleShippingChange}
                                        autoComplete="tel"
                                    />
                                </Grid>
                                
                                {/* Saved Addresses Section */}
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                            Saved Addresses
                                        </Typography>
                                    </Box>
                                    
                                    {addresses.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            No saved addresses found. Fill in the form below to add a new address.
                                        </Typography>
                                    ) : (
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container spacing={2}>
                                                {addresses.map((address: any, index: number) => (
                                                    <Grid item xs={12} sm={6} key={address.id || index}>
                                                        <Paper 
                                                            elevation={1}
                                                            sx={{ 
                                                                p: 2, 
                                                                border: '1px solid', 
                                                                borderColor: selectedAddress?.id === address.id ? 'primary.main' : 'divider',
                                                                borderRadius: 1,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s',
                                                                position: 'relative',
                                                                '&:hover': {
                                                                    borderColor: 'primary.main',
                                                                    boxShadow: 3
                                                                }
                                                            }}
                                                            onClick={() => handleAddressSelect(address)}
                                                        >
                                                            {address.isDefault && (
                                                                <Chip 
                                                                    label="Default" 
                                                                    size="small" 
                                                                    color="primary" 
                                                                    sx={{ 
                                                                        position: 'absolute', 
                                                                        top: 8, 
                                                                        right: 8,
                                                                        fontSize: '0.7rem'
                                                                    }} 
                                                                />
                                                            )}
                                                            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                                                {address.firstName} {address.lastName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {address.address}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {address.city}, {address.state} {address.postalCode}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {address.country}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.85rem' }}>
                                                                {address.email}
                                                            </Typography>
                                                            {address.phone && (
                                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                                                    {address.phone}
                                                                </Typography>
                                                            )}

                                                            {selectedAddress?.id === address.id && (
                                                                <Box sx={{ 
                                                                    position: 'absolute', 
                                                                    bottom: 8, 
                                                                    right: 8,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                }}>
                                                                    <CheckCircleIcon color="primary" fontSize="small" />
                                                                </Box>
                                                            )}
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                                <Grid item xs={12}>
                                                    <Button 
                                                        variant="outlined" 
                                                        startIcon={<AddIcon />} 
                                                        onClick={() => {
                                                            // Clear form to add a new address
                                                            setFormData((prev: any) => ({
                                                                ...prev,
                                                                shipping: {
                                                                    ...initialFormState.shipping,
                                                                    country: prev.shipping.country // Keep current country selection
                                                                }
                                                            }));
                                                            setSelectedAddress(null);
                                                        }}
                                                        sx={{ mt: 1 }}
                                                    >
                                                        Add New Address
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* New Address Form - Only shown when no address is selected or user clicks "Add New Address" */}
                                    {(!selectedAddress || addresses.length === 0) && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                {addresses.length === 0 ? 'Add Address' : 'Add New Address'}
                                            </Typography>
                                            
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        id="firstName"
                                                        name="firstName"
                                                        label="First Name"
                                                        value={formData.shipping.firstName}
                                                        onChange={handleShippingChange}
                                                        error={!!errors.shipping.firstName}
                                                        helperText={errors.shipping.firstName}
                                                        autoComplete="given-name"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        id="lastName"
                                                        name="lastName"
                                                        label="Last Name"
                                                        value={formData.shipping.lastName}
                                                        onChange={handleShippingChange}
                                                        error={!!errors.shipping.lastName}
                                                        helperText={errors.shipping.lastName}
                                                        autoComplete="family-name"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        id="email"
                                                        name="email"
                                                        label="Email Address"
                                                        type="email"
                                                        value={formData.shipping.email}
                                                        onChange={handleShippingChange}
                                                        error={!!errors.shipping.email}
                                                        helperText={errors.shipping.email}
                                                        autoComplete="email"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        id="address"
                                                        name="address"
                                                        label="Address"
                                                        value={formData.shipping.address}
                                                        onChange={handleShippingChange}
                                                        error={!!errors.shipping.address}
                                                        helperText={errors.shipping.address}
                                                        autoComplete="street-address"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        id="city"
                                                        name="city"
                                                        label="City"
                                                        value={formData.shipping.city}
                                                        onChange={handleShippingChange}
                                                        error={!!errors.shipping.city}
                                                        helperText={errors.shipping.city}
                                                        autoComplete="address-level2"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        id="state"
                                                        name="state"
                                                        label="State/Province"
                                                        value={formData.shipping.state}
                                                        onChange={handleShippingChange}
                                                        autoComplete="address-level1"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        id="postalCode"
                                                        name="postalCode"
                                                        label="ZIP / Postal Code"
                                                        value={formData.shipping.postalCode}
                                                        onChange={handleShippingChange}
                                                        error={!!errors.shipping.postalCode}
                                                        helperText={errors.shipping.postalCode}
                                                        autoComplete="postal-code"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        id="country"
                                                        name="country"
                                                        select
                                                        label="Country"
                                                        value={formData.shipping.country}
                                                        onChange={handleShippingChange}
                                                        autoComplete="country"
                                                    >
                                                        <MenuItem value="IND">India</MenuItem>
                                                        <MenuItem value="USA">United States</MenuItem>
                                                        <MenuItem value="CAN">Canada</MenuItem>
                                                        <MenuItem value="MEX">Mexico</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        id="phone"
                                                        name="phone"
                                                        label="Phone Number"
                                                        value={formData.shipping.phone}
                                                        onChange={handleShippingChange}
                                                        autoComplete="tel"
                                                    />
                                                </Grid>
                                                {isAuthenticated() && (
                                                    <Grid item xs={12}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    name="makeDefault"
                                                                    checked={!!formData.shipping.isDefault}
                                                                    onChange={(e: any) => setFormData((prev: any) => ({
                                                                        ...prev,
                                                                        shipping: {
                                                                            ...prev.shipping,
                                                                            isDefault: e.target.checked
                                                                        }
                                                                    }))}
                                                                    color="primary"
                                                                />
                                                            }
                                                            label="Set as default address"
                                                        />
                                                    </Grid>
                                                )}
                                                <Grid item xs={12}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleSaveAddress}
                                                            startIcon={<AddIcon />}
                                                        >
                                                            Save Address
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}
                                </Grid>
                                
                                {/* Shipping Method Selection */}
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
                                        Shipping Method
                                    </Typography>
                                    
                                    <FormControl component="fieldset" fullWidth>
                                        <RadioGroup
                                            value={formData.options.shippingMethod}
                                            onChange={(e: any) => handleShippingMethodChange(e.target.value)}
                                        >
                                            <Paper 
                                                elevation={1} 
                                                sx={{ 
                                                    p: 2, 
                                                    mb: 1, 
                                                    border: formData.options.shippingMethod === 'default' ? '2px solid' : '1px solid',
                                                    borderColor: formData.options.shippingMethod === 'default' ? 'primary.main' : 'divider'
                                                }}
                                            >
                                                <FormControlLabel
                                                    value="default"
                                                    control={<Radio />}
                                                    label={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                            <Box>
                                                                <Typography variant="body1" fontWeight="medium">Default Shipping</Typography>
                                                                <Typography variant="body2" color="text.secondary">7-10 business days</Typography>
                                                            </Box>
                                                            <Typography variant="h6" color="primary">FREE</Typography>
                                                        </Box>
                                                    }
                                                    sx={{ margin: 0, width: '100%' }}
                                                />
                                            </Paper>
                                            
                                            <Paper 
                                                elevation={1} 
                                                sx={{ 
                                                    p: 2, 
                                                    mb: 1, 
                                                    border: formData.options.shippingMethod === 'standard' ? '2px solid' : '1px solid',
                                                    borderColor: formData.options.shippingMethod === 'standard' ? 'primary.main' : 'divider'
                                                }}
                                            >
                                                <FormControlLabel
                                                    value="standard"
                                                    control={<Radio />}
                                                    label={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                            <Box>
                                                                <Typography variant="body1" fontWeight="medium">Standard Shipping</Typography>
                                                                <Typography variant="body2" color="text.secondary">5-7 business days</Typography>
                                                            </Box>
                                                            <Typography variant="h6" color="primary">₹99</Typography>
                                                        </Box>
                                                    }
                                                    sx={{ margin: 0, width: '100%' }}
                                                />
                                            </Paper>
                                            
                                            <Paper 
                                                elevation={1} 
                                                sx={{ 
                                                    p: 2, 
                                                    mb: 1, 
                                                    border: formData.options.shippingMethod === 'express' ? '2px solid' : '1px solid',
                                                    borderColor: formData.options.shippingMethod === 'express' ? 'primary.main' : 'divider'
                                                }}
                                            >
                                                <FormControlLabel
                                                    value="express"
                                                    control={<Radio />}
                                                    label={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                            <Box>
                                                                <Typography variant="body1" fontWeight="medium">Express Shipping</Typography>
                                                                <Typography variant="body2" color="text.secondary">2-3 business days</Typography>
                                                            </Box>
                                                            <Typography variant="h6" color="primary">₹199</Typography>
                                                        </Box>
                                                    }
                                                    sx={{ margin: 0, width: '100%' }}
                                                />
                                            </Paper>
                                            
                                            <Paper 
                                                elevation={1} 
                                                sx={{ 
                                                    p: 2, 
                                                    mb: 1, 
                                                    border: formData.options.shippingMethod === 'overnight' ? '2px solid' : '1px solid',
                                                    borderColor: formData.options.shippingMethod === 'overnight' ? 'primary.main' : 'divider'
                                                }}
                                            >
                                                <FormControlLabel
                                                    value="overnight"
                                                    control={<Radio />}
                                                    label={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                            <Box>
                                                                <Typography variant="body1" fontWeight="medium">Overnight Shipping</Typography>
                                                                <Typography variant="body2" color="text.secondary">Next business day</Typography>
                                                            </Box>
                                                            <Typography variant="h6" color="primary">₹399</Typography>
                                                        </Box>
                                                    }
                                                    sx={{ margin: 0, width: '100%' }}
                                                />
                                            </Paper>
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            onClick={completeShippingSection}
                                        >
                                            Continue to Payment
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {/* Payment Information Section */}
                    <Accordion 
                        expanded={expandedSection === 'payment'} 
                        onChange={handleAccordionChange('payment')}
                        sx={{ mb: 2 }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="payment-content"
                            id="payment-header"
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <PaymentIcon sx={{ mr: 2, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    Payment Information
                                </Typography>
                                {sectionComplete.payment && (
                                    <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                                )}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LockIcon color="success" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Your payment information is secure and encrypted
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="cardName"
                                        name="cardName"
                                        label="Name on Card"
                                        value={formData.payment.cardName}
                                        onChange={handlePaymentChange}
                                        error={!!errors.payment.cardName}
                                        helperText={errors.payment.cardName}
                                        autoComplete="cc-name"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="cardNumber"
                                        name="cardNumber"
                                        label="Card Number"
                                        value={formData.payment.cardNumber}
                                        onChange={handlePaymentChange}
                                        error={!!errors.payment.cardNumber}
                                        helperText={errors.payment.cardNumber}
                                        autoComplete="cc-number"
                                        type="password"
                                        inputProps={{
                                            maxLength: 16,
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <LockIcon fontSize="small" color="action" />
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="expDate"
                                        name="expDate"
                                        label="Expiry Date"
                                        placeholder="MM/YY"
                                        value={formData.payment.expDate}
                                        onChange={handlePaymentChange}
                                        error={!!errors.payment.expDate}
                                        helperText={errors.payment.expDate}
                                        autoComplete="cc-exp"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="cvv"
                                        name="cvv"
                                        label="CVV"
                                        value={formData.payment.cvv}
                                        onChange={handlePaymentChange}
                                        error={!!errors.payment.cvv}
                                        helperText={errors.payment.cvv}
                                        autoComplete="cc-csc"
                                        type="password"
                                        inputProps={{
                                            maxLength: 4,
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <LockIcon fontSize="small" color="action" />
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="billingAddressSame"
                                                checked={formData.payment.billingAddressSame}
                                                onChange={(e: any) => setFormData((prev: any) => ({
                                                    ...prev,
                                                    payment: {
                                                        ...prev.payment,
                                                        billingAddressSame: e.target.checked
                                                    }
                                                }))}
                                                color="primary"
                                            />
                                        }
                                        label="Billing address same as shipping address"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Button
                                            onClick={() => setExpandedSection('shipping')}
                                        >
                                            Back to Shipping
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={completePaymentSection}
                                        >
                                            Review Order
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {/* Order Review Section */}
                    <Accordion 
                        expanded={expandedSection === 'review'} 
                        onChange={handleAccordionChange('review')}
                        sx={{ mb: 2 }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="review-content"
                            id="review-header"
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <ReceiptIcon sx={{ mr: 2, color: 'primary.main' }} />
                                <Typography variant="h6">
                                    Review Order
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={3}>
                                {/* Shipping Info Summary */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Shipping Information
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.shipping.firstName} {formData.shipping.lastName}
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.shipping.address}
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.shipping.city}, {formData.shipping.state} {formData.shipping.postalCode}
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.shipping.country}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                        Email: {formData.shipping.email}
                                    </Typography>
                                    {formData.shipping.phone && (
                                        <Typography variant="body1">
                                            Phone: {formData.shipping.phone}
                                        </Typography>
                                    )}
                                    <Chip 
                                        label={`${formData.options.shippingMethod.charAt(0).toUpperCase()}${formData.options.shippingMethod.slice(1)} Shipping`} 
                                        size="small" 
                                        color="primary" 
                                        sx={{ mt: 1 }}
                                    />
                                </Grid>
                                
                                {/* Payment Info Summary */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Payment Information
                                    </Typography>
                                    <Typography variant="body1">
                                        {formData.payment.cardName}
                                    </Typography>
                                    <Typography variant="body1">
                                        Card ending in {formData.payment.cardNumber.slice(-4)}
                                    </Typography>
                                    <Typography variant="body1">
                                        Expires: {formData.payment.expDate}
                                    </Typography>
                                    {formData.payment.billingAddressSame ? (
                                        <Chip label="Billing address same as shipping" size="small" sx={{ mt: 1 }} />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Custom billing address
                                        </Typography>
                                    )}
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    
                                    {/* Order Items */}
                                    <Typography variant="h6" gutterBottom>
                                        Order Items ({cart?.items?.length})
                                    </Typography>
                                    
                                    {cart?.items?.map((item: any, index: number) => (
                                        <Box key={index} sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            py: 1,
                                            borderBottom: index < cart.items.length - 1 ? '1px solid #eee' : 'none'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                    x{item.quantity}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1">
                                                {formatCurrency(item.price * item.quantity)}
                                            </Typography>
                                        </Box>
                                    ))}
                                    
                                    {/* Order Options */}
                                    <Box sx={{ mt: 3 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name="giftWrap"
                                                    checked={formData.options.giftWrap}
                                                    onChange={handleOptionsChange}
                                                    color="primary"
                                                />
                                            }
                                            label="Add gift wrapping (+₹49)"
                                        />
                                        
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name="saveInfo"
                                                    checked={formData.options.saveInfo}
                                                    onChange={handleOptionsChange}
                                                    color="primary"
                                                />
                                            }
                                            label="Save my information for future orders"
                                        />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Button
                                            onClick={() => setExpandedSection('payment')}
                                        >
                                            Back to Payment
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSubmitOrder}
                                            disabled={submitting}
                                            sx={{ minWidth: '150px' }}
                                        >
                                            {submitting ? (
                                                <CircularProgress size={24} color="inherit" />
                                            ) : (
                                                'Place Order'
                                            )}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                
                {/* Order Summary Sidebar */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, position: { md: 'sticky' }, top: { md: '20px' } }}>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mb: 1 
                        }}>
                            <Typography variant="body1">
                                Subtotal ({cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0)} items)
                            </Typography>
                            <Typography variant="body1">
                                {formatCurrency(calculateSubtotal())}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mb: 1
                        }}>
                            <Typography variant="body1">
                                Shipping
                            </Typography>
                            <Typography variant="body1">
                                {formatCurrency(calculateShipping())}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mb: 1
                        }}>
                            <Typography variant="body1">
                                Tax
                            </Typography>
                            <Typography variant="body1">
                                {formatCurrency(calculateTax())}
                            </Typography>
                        </Box>
                        
                        {formData.options.giftWrap && (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                mb: 1
                            }}>
                                <Typography variant="body1">
                                    Gift Wrapping
                                </Typography>
                                <Typography variant="body1">
                                    {formatCurrency(49)} {/* Gift wrap cost in INR */}
                                </Typography>
                            </Box>
                        )}
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mb: 1
                        }}>
                            <Typography variant="h6">
                                Total
                            </Typography>
                            <Typography variant="h6" color="primary.main">
                                {formatCurrency(calculateTotal() + (formData.options.giftWrap ? 49 : 0))}
                            </Typography>
                        </Box>
                        
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Your credit card will be charged when you place your order.
                        </Alert>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Checkout;
