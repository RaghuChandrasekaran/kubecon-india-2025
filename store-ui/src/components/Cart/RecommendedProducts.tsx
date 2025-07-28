import { Box, Typography, Card, CardContent, CardMedia, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../api/cart';

interface RecommendedProduct {
    id: string;
    title: string;
    price: number;
    image: string;
    vendor?: string;
}

interface RecommendedProductsProps {
    products?: RecommendedProduct[];
}

const RecommendedProducts = ({ products = [] }: RecommendedProductsProps) => {
    const navigate = useNavigate();

    // Mock recommended products if none provided
    const defaultProducts: RecommendedProduct[] = [
        {
            id: '1',
            title: 'Wireless Bluetooth Headphones',
            price: 2999,
            image: '/assets/images/deals/mobile.webp',
            vendor: 'TechBrand'
        },
        {
            id: '2',
            title: 'Smart Fitness Watch',
            price: 5999,
            image: '/assets/images/deals/mobile.webp',
            vendor: 'FitTech'
        },
        {
            id: '3',
            title: 'Portable Power Bank',
            price: 1499,
            image: '/assets/images/deals/mobile.webp',
            vendor: 'PowerPlus'
        },
        {
            id: '4',
            title: 'USB-C Fast Charger',
            price: 899,
            image: '/assets/images/deals/mobile.webp',
            vendor: 'ChargeMax'
        }
    ];

    const displayProducts = products.length > 0 ? products : defaultProducts;

    const handleProductClick = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    if (displayProducts.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Recommended for You
            </Typography>
            
            <Grid container spacing={2}>
                {displayProducts.slice(0, 4).map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={product.id}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }
                            }}
                            onClick={() => handleProductClick(product.id)}
                        >
                            <CardMedia
                                component="img"
                                height="160"
                                image={product.image}
                                alt={product.title}
                                sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ 
                                flexGrow: 1, 
                                display: 'flex', 
                                flexDirection: 'column',
                                p: 2
                            }}>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        mb: 1,
                                        fontWeight: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        lineHeight: 1.3
                                    }}
                                >
                                    {product.title}
                                </Typography>
                                
                                {product.vendor && (
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                    >
                                        {product.vendor}
                                    </Typography>
                                )}
                                
                                <Box sx={{ mt: 'auto' }}>
                                    <Typography 
                                        variant="h6" 
                                        color="primary"
                                        sx={{ 
                                            fontWeight: 600,
                                            mb: 1,
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        {formatCurrency(product.price)}
                                    </Typography>
                                    
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        fullWidth
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default RecommendedProducts;
