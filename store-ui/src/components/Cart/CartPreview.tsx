import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Avatar,
  Divider,
  IconButton,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../layout/CartContext';
import { formatPrice } from '../../utils/currency';
import ImageOptimizer from '../ImageOptimizer';

interface CartItem {
  productId: string;
  sku: string;
  title: string;
  quantity: number;
  price: number;
  currency: string;
  thumbnail?: string;
}

interface CartPreviewProps {
  open: boolean;
  onClose: () => void;
  addedItem: CartItem | null;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const CartPreview: React.FC<CartPreviewProps> = ({ open, onClose, addedItem }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open && addedItem) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, addedItem]);

  const handleGoToCart = () => {
    onClose();
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: isMobile ? 20 : 100,
          right: isMobile ? 10 : 40,
          left: isMobile ? 10 : 'auto',
          m: 0,
          maxWidth: isMobile ? 'calc(100vw - 20px)' : 400,
          width: isMobile ? 'calc(100vw - 20px)' : 400,
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'transparent'
        }
      }}
    >
      <Box sx={{ 
        position: 'relative',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)'
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          pb: 1,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showSuccess ? (
              <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 24 }} />
            ) : (
              <ShoppingCartIcon sx={{ color: '#FF9800', fontSize: 24 }} />
            )}
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: isDarkMode ? '#e0e0e0' : '#2c2c2c'
              }}
            >
              {showSuccess ? 'Added to Cart!' : 'Cart Preview'}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{
              color: isDarkMode ? '#ccc' : '#666',
              '&:hover': {
                backgroundColor: 'rgba(255,152,0,0.1)',
                color: '#FF9800'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

        <DialogContent sx={{ p: 2 }}>
          {/* Recently Added Item */}
          {addedItem && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  color: '#4CAF50',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Just Added
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                p: 2,
                backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}>
                <Avatar
                  sx={{ 
                    width: 60, 
                    height: 60,
                    borderRadius: 2
                  }}
                >
                  {addedItem.thumbnail ? (
                    <ImageOptimizer
                      src={addedItem.thumbnail}
                      alt={addedItem.title}
                      width={60}
                      height={60}
                      objectFit="cover"
                    />
                  ) : (
                    <ShoppingCartIcon />
                  )}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: isDarkMode ? '#e0e0e0' : '#2c2c2c',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {addedItem.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? '#ccc' : '#666',
                      mb: 0.5
                    }}
                  >
                    Qty: {addedItem.quantity}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#FF9800',
                      fontWeight: 700
                    }}
                  >
                    {formatPrice(addedItem.price)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Cart Summary */}
          <Box sx={{ 
            p: 2,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRadius: 2,
            border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: isDarkMode ? '#e0e0e0' : '#2c2c2c',
                  fontWeight: 500
                }}
              >
                Cart Items:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#FF9800',
                  fontWeight: 600
                }}
              >
                {cartCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: isDarkMode ? '#e0e0e0' : '#2c2c2c',
                  fontWeight: 700
                }}
              >
                Total:
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FF9800',
                  fontWeight: 700
                }}
              >
                {formatPrice(cartTotal)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            onClick={handleContinueShopping}
            variant="outlined"
            sx={{
              borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              color: isDarkMode ? '#e0e0e0' : '#2c2c2c',
              '&:hover': {
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255,152,0,0.1)'
              }
            }}
          >
            Continue Shopping
          </Button>
          <Button
            onClick={handleGoToCart}
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            sx={{
              background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
              }
            }}
          >
            View Cart
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CartPreview;
