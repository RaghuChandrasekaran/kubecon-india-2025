import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import StarIcon from '@mui/icons-material/Star';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import axiosClient, { productsUrl } from '../../api/config';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ImageOptimizer from '../ImageOptimizer';
import { Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { addToCart } from '../../api/cart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Custom VisuallyHidden component for screen readers
const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    component="span"
    sx={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
  >
    {children}
  </Box>
);

// Define proper types for deals
interface Deal {
    dealId: string;
    variantSku: string;
    name: string;
    shortDescription: string;
    thumbnail: string;
    price: number;
    rating: number;
}

// Fallback image URLs for when thumbnails fail to load
const FALLBACK_IMAGES = {
    product: '/assets/images/deals/mobile.webp', // Use one of your existing images as fallback
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNNzUgNzVMMTI1IDc1TTEwMCA1MEwxMDAgMTAwIiBzdHJva2U9IiNDQ0MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+'
};

// Helper function to get image source with fallback
const getImageSource = (thumbnail: string, dealName: string) => {
    if (!thumbnail || thumbnail.trim() === '') {
        return FALLBACK_IMAGES.product;
    }
    return thumbnail;
};

// Mock data for fallback when API returns empty results
const MOCK_DEALS: Deal[] = [
    {
        dealId: 'mock-1',
        variantSku: 'mock-sku-1',
        name: 'Special Offer',
        shortDescription: 'Great deals coming soon!',
        thumbnail: '/assets/images/deals/mobile.webp',
        price: 99.99,
        rating: 4.5
    },
    {
        dealId: 'mock-2',
        variantSku: 'mock-sku-2',
        name: 'Featured Product',
        shortDescription: 'Amazing products at great prices',
        thumbnail: '/assets/images/deals/oven.webp',
        price: 199.99,
        rating: 4.8
    },
    {
        dealId: 'mock-3',
        variantSku: 'mock-sku-3',
        name: 'Best Seller',
        shortDescription: 'Customer favorite items',
        thumbnail: '/assets/images/deals/kurtha.webp',
        price: 49.99,
        rating: 4.3
    }
];

const Deals = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    // Check if we're on a mobile device
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});

    const loadDeals = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosClient.get(productsUrl + 'deals');
            
            // Handle empty response or invalid data structure
            if (response.data && Array.isArray(response.data)) {
                setDeals(response.data);
            } else {
                // If response is not an array or is null/undefined, set empty array
                setDeals([]);
                console.warn("Invalid deals data structure received:", response.data);
            }
        } catch (err: any) {
            setError(err);
            setDeals([]); // Ensure deals is empty on error
            console.error("Error fetching deals:", err);
        } finally {
            setLoading(false);
        }
    }

    // run on load
    useEffect(() => {
        loadDeals();
    }, []);

    // Handle keyboard navigation for card links
    const handleCardKeyPress = (event: React.KeyboardEvent, variantSku: string) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate(`/product/${variantSku}`);
        }
    };

    // Retry loading if there was an error
    const handleRetry = () => {
        loadDeals();
    };

    const handleAddToCart = (product: any) => {
        const item = {
            productId: product?._id || product?.id || `product-${Math.random().toString(36).substr(2, 9)}`,
            sku: product?.variants?.[0]?.sku || `sku-${Math.random().toString(36).substr(2, 9)}`,
            title: product?.title,
            quantity: 1,
            price: product?.price,
            currency: product?.currency || 'USD'
        };
        addToCart(item);
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return (
            <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress aria-label="Loading deals" />
                <VisuallyHidden>Loading deals of the day</VisuallyHidden>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={3} sx={{ p: 2 }}>
                <Alert 
                    severity="error" 
                    action={
                        <Link 
                            component="button"
                            onClick={handleRetry}
                            aria-label="Retry loading deals"
                        >
                            Retry
                        </Link>
                    }
                >
                    Failed to load deals. Please try again later.
                </Alert>
            </Paper>
        );
    }

    // Use mock data if no deals are available
    const displayDeals = deals.length > 0 ? deals : MOCK_DEALS;

    return (
        <Box 
            component="section"
            aria-labelledby="deals-heading"
            sx={{ width: '100%' }}
        >
            <Box 
                sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#263238',
                    color: 'white',
                    p: isMobile ? 1 : 1.5,
                    mb: isMobile ? 1 : 2
                }}
            >
                <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    component="h2"
                    id="deals-heading"
                    sx={{ fontWeight: 'medium' }}
                >
                    Deals of the Day
                </Typography>
                <Typography 
                    variant="body2" 
                    sx={{ color: '#FF9800' }}
                >
                    Limited Time Offers
                </Typography>
            </Box>
            
            <Box sx={{ p: isMobile ? 1 : 2 }}>
                <Grid 
                    container 
                    spacing={isMobile ? 1 : 2} 
                    role="list"
                    sx={{ 
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',  // 2 columns for extra small screens
                            sm: 'repeat(3, 1fr)',  // 3 columns for small screens
                            md: 'repeat(4, 1fr)',  // 4 columns for medium screens
                            lg: 'repeat(5, 1fr)'   // 5 columns for large screens
                        },
                        gap: { xs: 1, sm: 2 },
                    }}
                >
                    {displayDeals.length === 0 ? (
                        <Grid item xs={12}>
                            <Typography variant="body1">No deals available at the moment.</Typography>
                        </Grid>
                    ) : (
                        displayDeals.slice(0, 5).map((deal: Deal, index: number) => (
                            <Box 
                                key={deal.dealId} 
                                role="listitem"
                                sx={{ 
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        position: 'relative',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: 'none',
                                        borderRadius: 1,
                                        overflow: 'visible',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)'
                                        }
                                    }}
                                    component="article"
                                    aria-label={`${deal.name}: ${deal.shortDescription}`}
                                >
                                    {index === 1 && (
                                        <Chip 
                                            label="Sale" 
                                            color="error" 
                                            size="small" 
                                            sx={{ 
                                                position: 'absolute', 
                                                top: 5, 
                                                right: 5, 
                                                zIndex: 1,
                                                fontWeight: 500,
                                                fontSize: isMobile ? '0.625rem' : '0.75rem',
                                                height: isMobile ? '20px' : '24px'
                                            }} 
                                        />
                                    )}
                                    
                                    <IconButton
                                        onClick={() => toggleFavorite(deal.dealId)}
                                        sx={{ 
                                            position: 'absolute',
                                            top: 5,
                                            right: index === 1 ? (isMobile ? 40 : 60) : 5,
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            width: isMobile ? 24 : 32,
                                            height: isMobile ? 24 : 32,
                                            padding: isMobile ? '4px' : '8px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)',
                                            }
                                        }}
                                        aria-label={favorites[deal.dealId] ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        {favorites[deal.dealId] ? (
                                            <FavoriteIcon fontSize={isMobile ? "small" : "medium"} color="primary" />
                                        ) : (
                                            <FavoriteBorderIcon fontSize={isMobile ? "small" : "medium"} />
                                        )}
                                    </IconButton>
                                    
                                    <Box
                                        onClick={() => navigate(`/product/${deal.variantSku}`)}
                                        sx={{ 
                                            cursor: 'pointer',
                                            pt: 1,
                                            px: 1,
                                            pb: 0
                                        }}
                                    >
                                        <Box 
                                            sx={{ 
                                                height: isMobile ? 120 : 200, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                mb: 1,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <ImageOptimizer 
                                                src={getImageSource(deal.thumbnail, deal.name)} 
                                                alt={deal.name}
                                                height={isMobile ? 100 : 150}
                                                width="100%"
                                                objectFit="contain"
                                                quality={85}
                                                placeholder="blur"
                                                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                            />
                                        </Box>
                                    </Box>
                                    
                                    <CardContent sx={{ 
                                        flexGrow: 1, 
                                        pt: 0,
                                        pb: 1, 
                                        px: isMobile ? 1 : 2,
                                        '&:last-child': { pb: 1 }
                                    }}>
                                        <Typography 
                                            gutterBottom 
                                            variant={isMobile ? "body2" : "subtitle1"} 
                                            component="div" 
                                            sx={{ 
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                height: isMobile ? 36 : 48,
                                                cursor: 'pointer',
                                                mb: 0.5
                                            }}
                                            onClick={() => navigate(`/product/${deal.variantSku}`)}
                                        >
                                            {deal.name}
                                        </Typography>
                                        
                                        <Typography 
                                            variant={isMobile ? "subtitle1" : "h6"} 
                                            color="primary" 
                                            sx={{ fontWeight: 600, mb: 1 }}
                                        >
                                            ${typeof deal.price === 'number' 
                                                ? deal.price.toFixed(2) 
                                                : parseFloat(String(deal.price || 0)).toFixed(2)}
                                        </Typography>
                                        
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            fullWidth
                                            size={isMobile ? "small" : "medium"}
                                            onClick={() => handleAddToCart(deal)}
                                            sx={{ 
                                                textTransform: 'none',
                                                backgroundColor: '#FF9800',
                                                '&:hover': {
                                                    backgroundColor: '#F57C00'
                                                },
                                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                                py: isMobile ? 0.5 : 1
                                            }}
                                        >
                                            {isMobile ? 'Add to Cart' : (
                                                <>
                                                    <ShoppingCartIcon fontSize="small" sx={{ mr: 1 }} />
                                                    Add to Cart
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

export default Deals;