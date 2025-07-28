import { Box, Typography, IconButton, useTheme } from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatCurrency } from '../../api/cart';

interface CartItemProps {
    item: any;
    onUpdateQuantity: (item: any, quantity: number) => void;
    onRemoveItem: (sku: string) => void;
    isUpdating?: boolean;
}

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, isUpdating = false }: CartItemProps) => {
    const theme = useTheme();

    return (
        <Box sx={{ 
            p: 2, 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
        }}>
            {/* Product Image */}
            <Box sx={{ width: { xs: '100%', sm: '120px' }, maxWidth: '120px' }}>
                <img 
                    src={item.image || '/assets/images/deals/shoes.jpg'} 
                    alt={item.title}
                    style={{ 
                        width: '100%', 
                        height: 'auto',
                        borderRadius: '4px',
                        objectFit: 'cover'
                    }}
                />
            </Box>
            
            {/* Product Details */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 500, fontSize: '1.1rem' }}>
                    {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.vendor || 'Brand Name'}
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    mt: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ mr: 1 }}>Quantity:</Typography>
                        <IconButton 
                            size="small"
                            color="primary" 
                            onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            sx={{ p: 0.5 }}
                        >
                            <RemoveCircleIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ px: 1, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                        </Typography>
                        <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                            disabled={isUpdating}
                            sx={{ p: 0.5 }}
                        >
                            <AddCircleIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            color: theme.palette.primary.main
                        }}>
                            {formatCurrency(item.price * item.quantity)}
                        </Typography>
                        <IconButton 
                            color="error"
                            onClick={() => onRemoveItem(item.productId || item.sku)}
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CartItem;
