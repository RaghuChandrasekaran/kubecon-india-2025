import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Redirect if user is already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/profile');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      await login({ username: email, password });
      navigate('/profile'); // Redirect to profile page instead of home
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // These social login functions would be implemented when SSO is available
  const handleGoogleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Just for demo - no actual functionality
    console.log('Google login clicked - demo mode only');
  };

  const handleFacebookLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Just for demo - no actual functionality
    console.log('Facebook login clicked - demo mode only');
  };

  const handleTwitterLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Just for demo - no actual functionality
    console.log('Twitter login clicked - demo mode only');
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
          Welcome Back
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Social Login Buttons - Clean subtle design matching screenshot */}
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
              onClick={handleGoogleLogin}
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
              onClick={handleFacebookLogin}
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
              onClick={handleTwitterLogin}
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
            or
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Box>
          
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
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" fontWeight="medium" underline="hover">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};