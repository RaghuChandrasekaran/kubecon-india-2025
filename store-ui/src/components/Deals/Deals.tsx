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
import CartPreview from '../Cart/CartPreview';
import { formatPrice, createCartItem } from '../../utils/currency';
import { Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useCart } from '../layout/CartContext';
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

// Define proper types for deals that match the actual API response
interface Deal {
    _id: string;
    dealId: string;
    productId: string;
    variantSku: string;
    department: string;
    thumbnail: string;
    image: string;
    title: string;
    description: string;
    shortDescription: string;
    price: string;  // API returns price as string
    currency: string;
    rating: string; // API returns rating as string
    lastUpdated: string;
}

// Legacy interface for mock data
interface MockDeal {
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

// Mock data for fallback when API returns empty results (using legacy interface)
const MOCK_DEALS: MockDeal[] = [
    {
        dealId: 'deal-mobile-001',
        variantSku: 'SKU-MOBILE-001',
        name: 'Special Offer',
        shortDescription: 'Great deals coming soon!',
        thumbnail: '/assets/images/deals/mobile.webp',
        price: 8299.99,
        rating: 4.5
    },
    {
        dealId: 'deal-oven-001',
        variantSku: 'SKU-OVEN-001',
        name: 'Featured Product',
        shortDescription: 'Amazing products at great prices',
        thumbnail: '/assets/images/deals/oven.webp',
        price: 16599.99,
        rating: 4.8
    },
    {
        dealId: 'deal-kurtha-001',
        variantSku: 'SKU-KURTHA-001',
        name: 'Best Seller',
        shortDescription: 'Customer favorite items',
        thumbnail: '/assets/images/deals/kurtha.webp',
        price: 4149.99,
        rating: 4.3
    }
];

const Deals = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { addToCart } = useCart();
    // Check if we're on a mobile device
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDarkMode = theme.palette.mode === 'dark';

    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});
    const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
    const [addedItem, setAddedItem] = useState<any>(null);

    const loadDeals = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use the products service deals endpoint with proper configuration
            const response = await axiosClient.get(productsUrl + 'deals');
            
            // Handle empty response or invalid data structure
            if (response.data && Array.isArray(response.data)) {
                console.log('Loaded deals from API:', response.data);
                setDeals(response.data);
            } else if (response.data && response.data.deals && Array.isArray(response.data.deals)) {
                // In case the API returns { deals: [...] } structure
                console.log('Loaded deals from API (nested):', response.data.deals);
                setDeals(response.data.deals);
            } else {
                // If response is not an array or is null/undefined, convert mock data to API format
                console.warn("Invalid deals data structure received, using mock data:", response.data);
                const convertedMockDeals: Deal[] = MOCK_DEALS.map((mockDeal, index) => ({
                    _id: `mock-${index}`,
                    dealId: mockDeal.dealId,
                    productId: `prod-${index}`,
                    variantSku: mockDeal.variantSku,
                    department: 'General',
                    thumbnail: mockDeal.thumbnail,
                    image: mockDeal.thumbnail,
                    title: mockDeal.name,
                    description: mockDeal.shortDescription,
                    shortDescription: mockDeal.shortDescription,
                    price: mockDeal.price.toString(),
                    currency: 'INR',
                    rating: mockDeal.rating.toString(),
                    lastUpdated: new Date().toISOString()
                }));
                setDeals(convertedMockDeals);
            }
        } catch (err: any) {
            console.error("Error fetching deals, using mock data:", err);
            setError(err);
            // Convert mock data to API format as fallback when API fails
            const convertedMockDeals: Deal[] = MOCK_DEALS.map((mockDeal, index) => ({
                _id: `mock-${index}`,
                dealId: mockDeal.dealId,
                productId: `prod-${index}`,
                variantSku: mockDeal.variantSku,
                department: 'General',
                thumbnail: mockDeal.thumbnail,
                image: mockDeal.thumbnail,
                title: mockDeal.name,
                description: mockDeal.shortDescription,
                shortDescription: mockDeal.shortDescription,
                price: mockDeal.price.toString(),
                currency: 'INR',
                rating: mockDeal.rating.toString(),
                lastUpdated: new Date().toISOString()
            }));
            setDeals(convertedMockDeals);
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

    const handleAddToCart = async (deal: Deal) => {
        try {
            // Use the real API data structure
            const item = createCartItem({
                productId: deal.productId,  // Use productId from API
                sku: deal.variantSku,      // Use variantSku from API
                title: deal.title,         // Use title from API
                price: parseFloat(deal.price), // Convert string price to number
                thumbnail: deal.thumbnail  // Use thumbnail from API
            });
            
            console.log('Adding to cart from Deals page (REAL API DATA):', {
                productId: deal.productId,
                sku: deal.variantSku,
                title: deal.title,
                price: deal.price,
                source: 'deals-api',
                fullDeal: deal
            });
            
            await addToCart(item);
            
            // Show cart preview with the added item
            setAddedItem(item);
            setCartPreviewOpen(true);
            
        } catch (error) {
            console.error('Failed to add to cart from deals:', error);
            // You could add a toast notification here for errors
        }
    };

    const toggleFavorite = (id: string) => {
        setFavorites((prev: Record<string, boolean>) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return (
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '300px',
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#fafafa',
                    borderRadius: 3,
                    border: isDarkMode 
                        ? '1px solid rgba(255,255,255,0.12)' 
                        : '1px solid rgba(0,0,0,0.06)'
                }}
            >
                <CircularProgress 
                    size={40}
                    thickness={4}
                    sx={{ 
                        color: '#FF9800',
                        mb: 2
                    }}
                    aria-label="Loading deals" 
                />
                <Typography 
                    variant="body1" 
                    sx={{ 
                        color: isDarkMode ? '#e0e0e0' : 'text.secondary'
                    }}
                >
                    Loading amazing deals...
                </Typography>
                <VisuallyHidden>Loading deals of the day</VisuallyHidden>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3,
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#fafafa',
                    borderRadius: 3,
                    border: isDarkMode 
                        ? '1px solid rgba(255,255,255,0.12)' 
                        : '1px solid rgba(0,0,0,0.06)'
                }}
            >
                <Alert 
                    severity="warning"
                    sx={{
                        borderRadius: 2,
                        backgroundColor: isDarkMode ? '#2d2d2d' : 'inherit',
                        color: isDarkMode ? '#e0e0e0' : 'inherit',
                        '& .MuiAlert-icon': {
                            color: '#FF9800'
                        }
                    }}
                    action={
                        <Button
                            size="small"
                            onClick={handleRetry}
                            sx={{
                                color: '#FF9800',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: 'rgba(255,152,0,0.1)'
                                }
                            }}
                            aria-label="Retry loading deals"
                        >
                            Retry
                        </Button>
                    }
                >
                    Failed to load deals. Please try again later.
                </Alert>
            </Paper>
        );
    }

    // Use the actual deals from API, no more fallback to mock data unless API fails completely
    const displayDeals = deals;

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
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    color: 'white',
                    p: isMobile ? 2 : 3,
                    mb: isMobile ? 1 : 2,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)'
                    }
                }}
            >
                <Box>
                    <Typography 
                        variant={isMobile ? "h6" : "h5"} 
                        component="h2"
                        id="deals-heading"
                        sx={{ 
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #fff 0%, #f0f0f0 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                        }}
                    >
                        Deals of the Day
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#FF9800',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Limited Time Offers
                    </Typography>
                </Box>
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.7rem'
                        }}
                    >
                        HOT
                    </Typography>
                </Box>
            </Box>
            
            <Box sx={{ 
                p: isMobile ? 2 : 3,
                backgroundColor: isDarkMode ? '#121212' : '#fafafa',
                borderRadius: 2
            }}>
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
                                key={deal._id} 
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
                                        borderColor: isDarkMode 
                                            ? 'rgba(255,255,255,0.12)' 
                                            : 'rgba(0,0,0,0.08)',
                                        borderRadius: 3,
                                        overflow: 'visible',
                                        background: isDarkMode 
                                            ? 'linear-gradient(145deg, #1e1e1e 0%, #252525 100%)'
                                            : 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
                                        boxShadow: isDarkMode 
                                            ? '0 2px 12px rgba(0,0,0,0.3)'
                                            : '0 2px 12px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: isDarkMode 
                                                ? '0 8px 32px rgba(255,152,0,0.25)'
                                                : '0 8px 32px rgba(255,152,0,0.15)',
                                            borderColor: 'rgba(255,152,0,0.2)'
                                        }
                                    }}
                                    component="article"
                                    aria-label={`${deal.title}: ${deal.shortDescription}`}
                                >
                                    {index === 1 && (
                                        <Chip 
                                            label="Sale" 
                                            size="small" 
                                            sx={{ 
                                                position: 'absolute', 
                                                top: 8, 
                                                right: 8, 
                                                zIndex: 1,
                                                fontWeight: 700,
                                                fontSize: isMobile ? '0.625rem' : '0.75rem',
                                                height: isMobile ? '22px' : '26px',
                                                background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
                                                color: 'white',
                                                border: 'none',
                                                boxShadow: '0 2px 8px rgba(255,87,34,0.3)',
                                                '& .MuiChip-label': {
                                                    px: isMobile ? 1 : 1.5
                                                }
                                            }} 
                                        />
                                    )}
                                    
                                    <IconButton
                                        onClick={() => toggleFavorite(deal._id)}
                                        sx={{ 
                                            position: 'absolute',
                                            top: 8,
                                            right: index === 1 ? (isMobile ? 45 : 65) : 8,
                                            backgroundColor: isDarkMode 
                                                ? 'rgba(30,30,30,0.95)'
                                                : 'rgba(255,255,255,0.95)',
                                            backdropFilter: 'blur(10px)',
                                            width: isMobile ? 28 : 36,
                                            height: isMobile ? 28 : 36,
                                            padding: isMobile ? '4px' : '8px',
                                            border: '1px solid rgba(255,152,0,0.1)',
                                            zIndex: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,152,0,0.1)',
                                                borderColor: '#FF9800',
                                                transform: 'scale(1.1)',
                                            }
                                        }}
                                        aria-label={favorites[deal._id] ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        {favorites[deal._id] ? (
                                            <FavoriteIcon 
                                                fontSize={isMobile ? "small" : "medium"} 
                                                sx={{ color: '#FF9800' }} 
                                            />
                                        ) : (
                                            <FavoriteBorderIcon 
                                                fontSize={isMobile ? "small" : "medium"} 
                                                sx={{ 
                                                    color: isDarkMode ? '#ccc' : '#666',
                                                    '&:hover': { color: '#FF9800' }
                                                }} 
                                            />
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
                                                src={getImageSource(deal.thumbnail, deal.title)} 
                                                alt={deal.title}
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
                                            variant={isMobile ? "body1" : "subtitle1"} 
                                            component="div" 
                                            sx={{ 
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                height: isMobile ? 40 : 52,
                                                cursor: 'pointer',
                                                mb: 1,
                                                color: isDarkMode ? '#e0e0e0' : '#2c2c2c',
                                                lineHeight: 1.3,
                                                transition: 'color 0.2s ease',
                                                '&:hover': {
                                                    color: '#FF9800'
                                                }
                                            }}
                                            onClick={() => navigate(`/product/${deal.variantSku}`)}
                                        >
                                            {deal.title}
                                        </Typography>
                                        
                                        <Typography 
                                            variant={isMobile ? "h6" : "h5"} 
                                            sx={{ 
                                                fontWeight: 700,
                                                mb: 1.5,
                                                color: '#FF9800',
                                                background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}
                                        >
                                            {formatPrice(parseFloat(deal.price))}
                                        </Typography>
                                        
                                        <Button 
                                            variant="contained" 
                                            fullWidth
                                            size={isMobile ? "small" : "medium"}
                                            onClick={() => handleAddToCart(deal)}
                                            sx={{ 
                                                textTransform: 'none',
                                                background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                                                borderRadius: 2,
                                                py: isMobile ? 1 : 1.25,
                                                fontWeight: 600,
                                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                                boxShadow: '0 4px 16px rgba(255,152,0,0.3)',
                                                border: 'none',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(255,152,0,0.4)'
                                                },
                                                '&:active': {
                                                    transform: 'translateY(0)',
                                                    boxShadow: '0 2px 8px rgba(255,152,0,0.3)'
                                                }
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

            {/* Cart Preview Dialog */}
            <CartPreview
                open={cartPreviewOpen}
                onClose={() => setCartPreviewOpen(false)}
                addedItem={addedItem}
            />
        </Box>
    );
};

export default Deals;