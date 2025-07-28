import { Box, Typography, Button, Paper } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

const EmptyCart = () => {
    const navigate = useNavigate();

    return (
        <Paper sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            border: '1px solid #e0e0e0'
        }}>
            <ShoppingCartIcon sx={{ 
                fontSize: 64, 
                color: 'grey.400',
                mb: 2
            }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                Your Cart is Empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Looks like you haven't added any items to your cart yet.
            </Typography>
            <Button 
                variant="contained" 
                color="primary"
                size="large"
                onClick={() => navigate('/')}
                sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '1rem'
                }}
            >
                Continue Shopping
            </Button>
        </Paper>
    );
};

export default EmptyCart;
