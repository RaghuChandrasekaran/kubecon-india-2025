import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Link,
  Divider,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person, 
  Phone 
} from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });
      navigate('/'); // Redirect to home page after successful registration
    } catch (err) {
      setError('Registration failed. This email may already be registered.');
    }
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // These social login functions would be implemented when SSO is available
  const handleGoogleSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    // Just for demo - no actual functionality
    console.log('Google signup clicked - demo mode only');
  };

  const handleFacebookSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    // Just for demo - no actual functionality
    console.log('Facebook signup clicked - demo mode only');
  };

  const handleTwitterSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    // Just for demo - no actual functionality
    console.log('Twitter signup clicked - demo mode only');
  };

  return (
    <Container maxWidth="sm" sx={{ pt: isMobile ? 2 : 4, pb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 2,
          bgcolor: 'background.paper',
          maxWidth: 500,
          mx: 'auto'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            mb: 3
          }}
        >
          Create Account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Social Signup Buttons - Clean subtle design matching screenshot */}
        <Grid container direction="column" spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Button
              fullWidth
              variant="outlined"
              sx={{ 
                py: 1.2, 
                borderColor: '#e0e0e0',
                color: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: 'white',
                justifyContent: 'center',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 400,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#d5d5d5'
                }
              }}
              onClick={handleGoogleSignup}
              startIcon={
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <GoogleIcon sx={{ color: '#DB4437' }} />
                </Box>
              }
            >
              Continue with Google
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              fullWidth
              variant="outlined"
              sx={{ 
                py: 1.2, 
                borderColor: '#e0e0e0',
                color: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: '#ececec',
                justifyContent: 'center',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 400,
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderColor: '#d5d5d5'
                }
              }}
              onClick={handleFacebookSignup}
              startIcon={
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <FacebookIcon sx={{ color: '#3b5998' }} />
                </Box>
              }
            >
              Continue with Facebook
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              fullWidth
              variant="outlined"
              sx={{ 
                py: 1.2, 
                borderColor: '#e0e0e0',
                color: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: '#ececec',
                justifyContent: 'center',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 400,
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderColor: '#d5d5d5'
                }
              }}
              onClick={handleTwitterSignup}
              startIcon={
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <TwitterIcon sx={{ color: '#1DA1F2' }} />
                </Box>
              }
            >
              Continue with Twitter
            </Button>
          </Grid>
        </Grid>

        {/* Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
            or sign up with email
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="mobile"
            label="Mobile Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5, 
              backgroundColor: '#FF9800',
              '&:hover': {
                backgroundColor: '#F57C00',
              },
              borderRadius: 1
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight="medium" underline="hover">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};