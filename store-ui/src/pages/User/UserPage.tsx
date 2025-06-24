// filepath: /home/naveenkumar.kumanan/Naveen_personal/e-commerce-microservices-sample/store-ui/src/pages/User/UserPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { User, createUser, getUserById, updateUser } from '../../api/users';
import { useParams, useNavigate } from 'react-router-dom';

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    mobile: ''
  });
  const [userId, setUserId] = useState<number | null>(id ? parseInt(id) : null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  // Fetch user data if ID is provided in URL
  useEffect(() => {
    if (id && id !== 'new') {
      setInitialLoading(true);
      const fetchUser = async () => {
        try {
          const userData = await getUserById(parseInt(id));
          setUser(userData);
          setUserId(parseInt(id));
        } catch (err) {
          setError('Failed to load user. User may not exist.');
          setIsSnackbarOpen(true);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleFetchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Please enter a user ID');
      setIsSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
      setMessage('User loaded successfully!');
      setIsSnackbarOpen(true);
    } catch (err) {
      setError('Failed to load user. User may not exist.');
      setIsSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!user.name || !user.email || !user.mobile) {
      setError('Please fill all required fields');
      setIsSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const newUser = await createUser(user);
      setUserId(newUser.id || null);
      setMessage('User created successfully!');
      setIsSnackbarOpen(true);
      // Navigate to the user list page after successful creation
      setTimeout(() => navigate('/users'), 2000);
    } catch (err) {
      setError('Failed to create user');
      setIsSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('No user selected for update');
      setIsSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      await updateUser(userId, user);
      setMessage('User updated successfully!');
      setIsSnackbarOpen(true);
      // Navigate to the user list page after successful update
      setTimeout(() => navigate('/users'), 2000);
    } catch (err) {
      setError('Failed to update user');
      setIsSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setIsSnackbarOpen(false);
  };

  if (initialLoading) {
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
          {id === 'new' ? 'Create New User' : userId ? 'Update User' : 'User Profile Management'}
        </Typography>

        {!id && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box component="form" onSubmit={handleFetchUser} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Fetch User
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="User ID"
                    type="number"
                    value={userId || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(parseInt(e.target.value))}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    disabled={loading}
                  >
                    Fetch User
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {id === 'new' ? 'Create New User' : userId ? 'Update User Details' : 'Create New User'}
          </Typography>
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Name"
                  name="name"
                  value={user.name}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Mobile"
                  name="mobile"
                  value={user.mobile}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleCreateUser}
                  disabled={loading || !!userId}
                  sx={{ mt: 2 }}
                >
                  Create User
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleUpdateUser}
                  disabled={loading || !userId}
                  sx={{ mt: 2 }}
                >
                  Update User
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/users')}
                  sx={{ mt: 2 }}
                >
                  Back to User List
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      <Snackbar 
        open={isSnackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserPage;