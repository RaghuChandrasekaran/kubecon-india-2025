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
            title: 'Premium Kitchen Oven',
            price: 2999,
            image: '/assets/images/default-image.webp',
            vendor: 'KitchenPro'
        },
        {
            id: '2',
            title: 'Traditional Kurtha Collection',
            price: 5999,
            image: '/assets/images/default-image.webp',
            vendor: 'EthnicWear'
        },
        {
            id: '3',
            title: 'Stylish Running Shoes',
            price: 1499,
            image: '/assets/images/default-image.webp',
            vendor: 'SportMax'
        },
        {
            id: '4',
            title: 'Latest Smartphone Pro',
            price: 899,
            image: '/assets/images/default-image.webp',
            vendor: 'TechZone'
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
        <Box sx={{ mt: 0 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
                Recommended for You
            </Typography>
            
            <Grid container spacing={1}>
                {displayProducts.slice(0, 4).map((product) => (
                    <Grid item xs={12} key={product.id}>
                        <Card 
                            sx={{ 
                                display: 'flex',
                                flexDirection: 'row',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                mb: 1.5,
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }
                            }}
                            onClick={() => handleProductClick(product.id)}
                        >
                            <CardMedia
                                component="img"
                                image={product.image}
                                alt={product.title}
                                sx={{ 
                                    width: 80,
                                    height: 80,
                                    objectFit: 'cover',
                                    flexShrink: 0,
                                    borderRadius: '4px 0 0 4px'
                                }}
                            />
                            <CardContent sx={{ 
                                flexGrow: 1, 
                                display: 'flex', 
                                flexDirection: 'column',
                                p: 1.5,
                                '&:last-child': { pb: 1.5 }
                            }}>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontWeight: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        lineHeight: 1.2,
                                        fontSize: '0.8rem',
                                        mb: 0.5
                                    }}
                                >
                                    {product.title}
                                </Typography>
                                
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ fontSize: '0.7rem', mb: 0.5 }}
                                >
                                    {product.vendor}
                                </Typography>
                                
                                <Typography 
                                    variant="subtitle2" 
                                    color="primary"
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        mt: 'auto'
                                    }}
                                >
                                    {formatCurrency(product.price)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default RecommendedProducts;
