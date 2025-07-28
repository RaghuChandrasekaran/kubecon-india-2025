import React from 'react';
import { 
  IconButton, 
  Button, 
  Badge, 
  Box,
  useTheme 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

// Styled enhanced cart badge wrapper with improved touch target
const EnhancedCartBadge = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '44px',
  minHeight: '44px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.4)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(255, 152, 0, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(255, 152, 0, 0)',
    },
  },
}));

interface UserActionsProps {
  cartCount: number;
  colorMode: {
    toggleColorMode: () => void;
  };
}

const UserActions: React.FC<UserActionsProps> = ({ cartCount, colorMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Theme Toggle */}
      <IconButton
        size="large"
        color="inherit"
        onClick={colorMode.toggleColorMode}
        aria-label={theme.palette.mode === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        sx={{
          borderRadius: '8px',
          padding: '8px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            transform: 'scale(1.05)'
          }
        }}
      >
        {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>

      {/* Enhanced Cart Badge */}
      <EnhancedCartBadge>
        <IconButton
          size="large"
          color="inherit"
          onClick={() => navigate('/cart')}
          aria-label={`Shopping cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          sx={{
            position: 'relative',
            animation: cartCount > 0 ? 'pulse 2s infinite' : 'none',
            minWidth: '44px',
            minHeight: '44px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              transform: 'scale(1.05)'
            }
          }}
        >
          <Badge 
            badgeContent={cartCount} 
            color="error"
            showZero
            sx={{
              '& .MuiBadge-badge': {
                minWidth: '20px',
                height: '20px',
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '10px',
                transform: 'scale(1) translate(50%, -50%)',
                padding: '0 4px',
                border: '2px solid #1a1a1a',
                backgroundColor: '#FF4444',
                color: 'white',
                boxShadow: '0 2px 8px rgba(255, 68, 68, 0.3)',
              }
            }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            componentsProps={{
              badge: { 'aria-live': 'polite' }
            }}
          >
            <ShoppingCartIcon fontSize="medium" />
          </Badge>
        </IconButton>
      </EnhancedCartBadge>

      {/* Login Button */}
      <Button 
        color="inherit" 
        onClick={() => navigate('/login')}
        startIcon={<PersonIcon />}
        sx={{ 
          display: { xs: 'none', sm: 'flex' },
          minHeight: '40px',
          borderRadius: '8px',
          padding: '8px 16px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            transform: 'translateY(-1px)'
          }
        }}
        aria-label="Login or view account"
      >
        Login
      </Button>
    </Box>
  );
};

export default UserActions;
