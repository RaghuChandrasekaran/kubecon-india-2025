import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// Lazy load components for code splitting
const Home = React.lazy(() => import('./pages/Home/Home'));
const SearchComponent = React.lazy(() => import('./components/SearchComponent'));
const Product = React.lazy(() => import('./pages/Product/Product'));
const Cart = React.lazy(() => import('./pages/Cart/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout/Checkout'));
const OrderConfirmation = React.lazy(() => import('./pages/OrderConfirmation/OrderConfirmation'));

// Auth pages - using dynamic import with named exports
const LoginPage = React.lazy(() => 
  import('./pages/Auth/LoginPage').then(module => ({ default: module.LoginPage }))
);
const RegisterPage = React.lazy(() => 
  import('./pages/Auth/RegisterPage').then(module => ({ default: module.RegisterPage }))
);
const ProfilePage = React.lazy(() => import('./pages/Auth/ProfilePage'));

// Admin pages with error boundary
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));

// User management pages
const UserPage = React.lazy(() => import('./pages/User/UserPage'));
const UserListPage = React.lazy(() => import('./pages/User/UserListPage'));

// Enhanced Loading component with better UX
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px',
      p: 3
    }}
  >
    <CircularProgress size={40} sx={{ mb: 2 }} />
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </Typography>
          </Alert>
          <Box sx={{ mt: 2 }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Enhanced Suspense wrapper with error boundary
const SuspenseWrapper: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ErrorBoundary>
    <Suspense fallback={fallback || <LoadingFallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Home page - highest priority */}
              <Route 
                path="/" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading homepage..." />}>
                    <Home />
                  </SuspenseWrapper>
                } 
              />
              
              {/* Search page */}
              <Route 
                path="/search" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading search..." />}>
                    <SearchComponent />
                  </SuspenseWrapper>
                } 
              />
              
              {/* Product pages */}
              <Route 
                path="/product/:id" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading product details..." />}>
                    <Product />
                  </SuspenseWrapper>
                } 
              />
              
              {/* Cart and checkout flow */}
              <Route 
                path="/cart" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading cart..." />}>
                    <Cart />
                  </SuspenseWrapper>
                } 
              />
              
              <Route 
                path="/checkout" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading checkout..." />}>
                    <Checkout />
                  </SuspenseWrapper>
                } 
              />
              
              <Route 
                path="/order-confirmation" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading confirmation..." />}>
                    <OrderConfirmation />
                  </SuspenseWrapper>
                } 
              />
              
              {/* Auth pages - separate chunk */}
              <Route 
                path="/login" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading login page..." />}>
                    <LoginPage />
                  </SuspenseWrapper>
                } 
              />
              
              <Route 
                path="/register" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading registration..." />}>
                    <RegisterPage />
                  </SuspenseWrapper>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading profile..." />}>
                    <ProfilePage />
                  </SuspenseWrapper>
                } 
              />
              
              {/* Admin pages - separate chunk for role-based access */}
              <Route 
                path="/admin" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading admin dashboard..." />}>
                    <AdminDashboard />
                  </SuspenseWrapper>
                } 
              />
              
              {/* User management pages */}
              <Route 
                path="/users" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading user list..." />}>
                    <UserListPage />
                  </SuspenseWrapper>
                } 
              />
              
              <Route 
                path="/user/:id" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading user details..." />}>
                    <UserPage />
                  </SuspenseWrapper>
                } 
              />
              
              {/* Category routes - can be dynamically loaded */}
              <Route 
                path="/category/:category" 
                element={
                  <SuspenseWrapper fallback={<LoadingFallback message="Loading category..." />}>
                    <SearchComponent />
                  </SuspenseWrapper>
                } 
              />
              
              {/* 404 fallback */}
              <Route 
                path="*" 
                element={
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                      404 - Page Not Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      The page you're looking for doesn't exist.
                    </Typography>
                  </Box>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;