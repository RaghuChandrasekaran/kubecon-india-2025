import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Snackbar,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Chip
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Edit as EditIcon, 
  Save as SaveIcon, 
  ShoppingBag as ShoppingBagIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../../api/users';

// Interface for user address
interface Address {
  id: string;
  type: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// Interface for order history item
interface OrderHistoryItem {
  orderId: string;
  date: string;
  status: string;
  total: number;
}

const ProfilePage: React.FC = () => {
  const { user, loading, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sample addresses (would come from API in real implementation)
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'Home',
      fullName: 'Admin User',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      phone: '9284792850',
      isDefault: true
    },
    {
      id: '2',
      type: 'Work',
      fullName: 'Admin User',
      addressLine1: '456 Office Plaza',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
      phone: '9284792850',
      isDefault: false
    }
  ]);
  
  // Sample order history (would come from API in real implementation)
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([
    {
      orderId: '#1234',
      date: 'April 24, 2024',
      status: 'Completed',
      total: 145.99
    }
  ]);

  useEffect(() => {
    // If user data is loaded, set form data
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile
      });
    }
    
    // If not logged in and not loading, redirect to login
    if (!isLoggedIn && !loading) {
      navigate('/login');
    }
  }, [user, isLoggedIn, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) return;
    
    setIsSubmitting(true);
    setUpdateError(null);
    
    try {
      await updateUser(user.id, formData);
      setUpdateSuccess(true);
      setEditMode(false);
      
      // Refresh page to get updated user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // New address form state
  const [newAddressMode, setNewAddressMode] = useState(false);
  const [addressFormData, setAddressFormData] = useState<Omit<Address, 'id' | 'isDefault'>>({
    type: 'Home',
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new address with generated ID
    const newAddress: Address = {
      ...addressFormData,
      id: `addr_${Date.now()}`,
      isDefault: addresses.length === 0 // Make default if it's the first address
    };
    
    setAddresses([...addresses, newAddress]);
    setNewAddressMode(false);
    setUpdateSuccess(true);
    
    // Reset form
    setAddressFormData({
      type: 'Home',
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: ''
    });
  };

  if (loading || !user) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 600, mb: 4 }}>
          My Profile
        </Typography>

        <Snackbar 
          open={updateSuccess} 
          autoHideDuration={3000} 
          onClose={() => setUpdateSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Profile updated successfully!
          </Alert>
        </Snackbar>

        <Grid container spacing={3}>
          {/* Left Side - User Summary */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: '8px', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto',
                    bgcolor: '#f57c00',
                    fontSize: '3rem',
                    mb: 3
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 0.5 }}>
                  {user.email}
                </Typography>
                <Box 
                  sx={{ 
                    bgcolor: '#fff3e0', 
                    px: 2, 
                    py: 1, 
                    borderRadius: '20px',
                    display: 'inline-block',
                    mb: 3
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 500 }}>
                    Gold Member
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setEditMode(true)}
                  sx={{ 
                    mt: 2,
                    borderColor: '#e0e0e0',
                    color: 'rgba(0, 0, 0, 0.87)',
                    '&:hover': {
                      borderColor: '#bdbdbd',
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side - Profile Details & Tabs */}
          <Grid item xs={12} md={8}>
            {/* Personal Information Section */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: '8px', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Personal Information
                </Typography>
                {!editMode && (
                  <IconButton 
                    onClick={() => setEditMode(true)}
                    size="small"
                    sx={{ color: '#f57c00' }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              
              {updateError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {updateError}
                </Alert>
              )}
              
              {editMode ? (
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Mobile Number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      onClick={() => setEditMode(false)} 
                      variant="outlined"
                      disabled={isSubmitting}
                      sx={{ 
                        borderColor: '#e0e0e0',
                        color: 'rgba(0, 0, 0, 0.87)',
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={isSubmitting}
                      sx={{
                        bgcolor: '#f57c00',
                        '&:hover': {
                          bgcolor: '#ef6c00'
                        }
                      }}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="textSecondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {user.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="textSecondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {user.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="textSecondary">
                      Mobile Number
                    </Typography>
                    <Typography variant="body1">
                      {user.mobile}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Paper>
            
            {/* Shipping Addresses Section */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: '8px', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Shipping Addresses
                </Typography>
                {!newAddressMode && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setNewAddressMode(true)}
                    sx={{ 
                      borderColor: '#e0e0e0',
                      color: 'rgba(0, 0, 0, 0.87)',
                    }}
                  >
                    Add New Address
                  </Button>
                )}
              </Box>
              
              {newAddressMode ? (
                <Box component="form" onSubmit={handleAddNewAddress}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Full Name"
                        name="fullName"
                        value={addressFormData.fullName}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Phone Number"
                        name="phone"
                        value={addressFormData.phone}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Address Line 1"
                        name="addressLine1"
                        value={addressFormData.addressLine1}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address Line 2 (Optional)"
                        name="addressLine2"
                        value={addressFormData.addressLine2}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="City"
                        name="city"
                        value={addressFormData.city}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="State/Province"
                        name="state"
                        value={addressFormData.state}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Postal Code"
                        name="postalCode"
                        value={addressFormData.postalCode}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Country"
                        name="country"
                        value={addressFormData.country}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Address Type"
                        name="type"
                        value={addressFormData.type}
                        onChange={handleAddressInputChange}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      onClick={() => setNewAddressMode(false)} 
                      variant="outlined"
                      sx={{ 
                        borderColor: '#e0e0e0',
                        color: 'rgba(0, 0, 0, 0.87)',
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained"
                      sx={{
                        bgcolor: '#f57c00',
                        '&:hover': {
                          bgcolor: '#ef6c00'
                        }
                      }}
                    >
                      Save Address
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  {addresses.length > 0 ? (
                    <Grid container spacing={2}>
                      {addresses.map((address) => (
                        <Grid item xs={12} key={address.id}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              borderColor: address.isDefault ? '#f57c00' : '#e0e0e0',
                              borderWidth: address.isDefault ? 2 : 1,
                              borderRadius: '8px'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500, mr: 1 }}>
                                  {address.type}
                                </Typography>
                                {address.isDefault && (
                                  <Chip 
                                    label="Default" 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: '#fff3e0', 
                                      color: '#f57c00', 
                                      fontWeight: 500,
                                      height: '24px'
                                    }} 
                                  />
                                )}
                              </Box>
                              <Box>
                                <IconButton size="small">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            
                            <Typography variant="body1">{address.fullName}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {address.city}, {address.state} {address.postalCode}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {address.country}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                              Phone: {address.phone}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body1" color="textSecondary">
                        You haven't added any addresses yet.
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Paper>

            {/* Order History Section */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                Order History
              </Typography>
              
              {orderHistory.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ minWidth: 500 }}>
                    <Box 
                      sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        borderBottom: '1px solid #e0e0e0',
                        py: 1
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>ORDER</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>DATE</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>STATUS</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>TOTAL</Typography>
                    </Box>
                    
                    {orderHistory.map((order) => (
                      <Box 
                        key={order.orderId}
                        sx={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          borderBottom: '1px solid #f5f5f5',
                          py: 2,
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="body2">{order.orderId}</Typography>
                        <Typography variant="body2">{order.date}</Typography>
                        <Box>
                          <Chip 
                            label={order.status} 
                            size="small" 
                            sx={{ 
                              bgcolor: order.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                              color: order.status === 'Completed' ? '#2e7d32' : '#f57c00',
                              fontWeight: 500,
                              height: '24px'
                            }} 
                          />
                        </Box>
                        <Typography variant="body2">${order.total.toFixed(2)}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    You don't have any orders yet.
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  variant="outlined"
                  onClick={() => navigate('/')}
                  sx={{ 
                    borderColor: '#e0e0e0',
                    color: 'rgba(0, 0, 0, 0.87)',
                    '&:hover': {
                      borderColor: '#bdbdbd',
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  Continue Shopping
                </Button>
                
                <Button
                  variant="contained"
                  onClick={() => logout()}
                  sx={{
                    bgcolor: '#f57c00',
                    '&:hover': {
                      bgcolor: '#ef6c00'
                    },
                    ml: 2
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfilePage;