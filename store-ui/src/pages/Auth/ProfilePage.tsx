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
  Snackbar
} from '@mui/material';
import { Person as PersonIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../../api/users';

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
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
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
          {/* Profile Summary Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    margin: '0 auto',
                    bgcolor: 'primary.main',
                    mb: 2
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.mobile}
                </Typography>
                {user.role && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Role: {user.role === 'admin' ? 'Administrator' : 'Customer'}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleLogout}
                  sx={{ mt: 3 }}
                  fullWidth
                >
                  Logout
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Edit Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {editMode ? 'Edit Profile' : 'Profile Information'}
                </Typography>
                {!editMode && (
                  <Button 
                    startIcon={<EditIcon />} 
                    onClick={() => setEditMode(true)}
                    variant="outlined"
                    size="small"
                  >
                    Edit
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {updateError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {updateError}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  required
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  required
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  required
                />
                
                {editMode && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      onClick={() => setEditMode(false)} 
                      variant="outlined"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
            
            {/* Orders Section */}
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                My Orders
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box py={2} textAlign="center">
                <Typography variant="body1" color="textSecondary">
                  You don't have any orders yet.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/')}
                  sx={{ mt: 2 }}
                >
                  Continue Shopping
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