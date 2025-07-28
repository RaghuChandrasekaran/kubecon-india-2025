import * as React from 'react';
import { useParams } from "react-router-dom";
import getProductByVariantSku from "../../api/products"
import {addToCart} from "../../api/cart"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { 
  Typography, 
  Divider, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Rating,
  Stack,
  Alert,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaidIcon from '@mui/icons-material/Paid';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TextField from '@mui/material/TextField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DiscountIcon from '@mui/icons-material/Discount';
import { useNavigate } from "react-router-dom";
import ImageOptimizer from '../../components/ImageOptimizer';
import SEO from '../../components/SEO';

const Product = () => {
    const { id } = useParams()
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [product, setProduct] = React.useState({} as any)
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [textQuantity, setQuantity] = React.useState<number>(1);
    const [expanded, setExpanded] = React.useState<string | false>('panel1');
    const [addingToCart, setAddingToCart] = React.useState(false);
    const [addedToCart, setAddedToCart] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState(0);

    // Calculate savings if there's a list price that's higher than the current price
    const hasDiscount = product?.listPrice && product.listPrice > product.price;
    const discount = hasDiscount 
        ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100) 
        : 0;

    const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };
    
    const handleAdd = () => setQuantity(textQuantity + 1);
    const handleMinus = () => setQuantity(Math.max(1, textQuantity - 1));

    const handleAddToCart = () => {
        setAddingToCart(true);
        const item = {
            productId: product?._id,
            sku: product?.variants[0]?.sku,
            title: product?.title,
            quantity: textQuantity,
            price: product?.price,
            currency: product?.currency
        }
        addToCart(item).then((result) => {
            setAddingToCart(false);
            setAddedToCart(true);
            setTimeout(() => {
                setAddedToCart(false);
            }, 3000);
        });
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    const handleAccordionChange = 
      (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
      };

    // run on load
    React.useEffect(() => {
        setLoading(true);
        getProductByVariantSku(id)
            .then(result => {
                setProduct(result);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load product details. Please try again later.');
                setLoading(false);
            });
    }, [id]);

    // Scroll accordion into view when expanded on mobile
    React.useEffect(() => {
        if (isMobile && expanded) {
            const element = document.getElementById(`${expanded}-header`);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [expanded, isMobile]);

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5">Loading product details...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">{error}</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        );
    }

    if (!product || Object.keys(product).length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" color="error" gutterBottom>
                        Product Not Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Sorry, the product you're looking for doesn't exist or may have been removed.
                    </Typography>
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
                        <Button 
                            variant="contained" 
                            onClick={() => navigate('/')}
                            startIcon={<ShoppingCartIcon />}
                        >
                            Continue Shopping
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    // Sample images for demo - in a real app these would come from the product data
    const productImages = [
        product.thumbnail || '/assets/images/deals/mobile.webp',
        product.images?.[0] || '/assets/images/deals/shoes.jpg',
        product.images?.[1] || '/assets/images/deals/oven.webp',
    ].filter(Boolean); // Remove any undefined/null values

    // If no images at all, provide a default placeholder
    const displayImages = productImages.length > 0 ? productImages : [
        '/assets/images/deals/mobile.webp',
        '/assets/images/deals/shoes.jpg', 
        '/assets/images/deals/oven.webp'
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1200px', mx: 'auto' }}>
            <SEO 
                title={`${product.title} | Clusterly`}
                description={product.description?.substring(0, 160) || `Buy ${product.title} online with free shipping on orders over $50.`}
                keywords={`${product.title}, ${product?.attributes?.brand || ''}, online shopping, buy now, e-commerce`}
                image={product.thumbnail}
                type="product"
                url={`https://yourdomain.com/products/${id}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.title,
                    "image": product.thumbnail,
                    "description": product.description,
                    "brand": {
                        "@type": "Brand",
                        "name": product?.attributes?.brand || "Clusterly"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": `https://yourdomain.com/products/${id}`,
                        "priceCurrency": product.currency || "USD",
                        "price": product.price,
                        "availability": "https://schema.org/InStock",
                        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": product.rating || 4.5,
                        "reviewCount": Math.floor(Math.random() * 500) + 50
                    }
                }}
            />
            <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <Grid container spacing={0}>
                    {/* Product Image Section */}
                    <Grid item xs={12} md={5} sx={{ 
                        p: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 35, 40, 0.8)' : '#f7f7f7',
                        borderRight: { md: `1px solid ${theme.palette.divider}` }
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {/* Main Product Image with Discount Badge */}
                            <Box sx={{ 
                                width: '100%', 
                                height: '350px', 
                                position: 'relative',
                                mb: 2,
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(40, 44, 52, 0.5)' : '#ffffff',
                                borderRadius: 2,
                                padding: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}>
                                {hasDiscount && (
                                    <Badge
                                        badgeContent={`${discount}% OFF`}
                                        color="error"
                                        sx={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 16,
                                            zIndex: 1,
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.9rem',
                                                height: '28px',
                                                minWidth: '28px',
                                                padding: '0 8px',
                                                borderRadius: '4px'
                                            }
                                        }}
                                    />
                                )}
                                
                                {displayImages[selectedImage] && (
                                    <ImageOptimizer 
                                        src={displayImages[selectedImage]} 
                                        alt={product.title || 'Product image'}
                                        priority
                                        objectFit="contain"
                                    />
                                )}
                            </Box>
                            
                            {/* Thumbnail selection */}
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 1, 
                                mt: 1, 
                                justifyContent: 'center',
                                width: '100%'
                            }}>
                                {displayImages.map((img, index) => (
                                    <Box 
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        sx={{ 
                                            width: 70, 
                                            height: 70, 
                                            border: '2px solid',
                                            borderColor: selectedImage === index 
                                                ? 'primary.main' 
                                                : 'divider',
                                            borderRadius: 1,
                                            opacity: selectedImage === index ? 1 : 0.6,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                opacity: 0.9,
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <ImageOptimizer 
                                            src={img} 
                                            alt={`Thumbnail ${index + 1}`}
                                            objectFit="cover"
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Grid>
                    
                    {/* Product Info Section */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ p: { xs: 2, md: 3 } }}>
                            {/* Product Title and Brand */}
                            <Typography 
                                variant="h4" 
                                component="h1" 
                                gutterBottom
                                sx={{ fontWeight: 'bold' }}
                            >
                                {product?.title}
                            </Typography>
                            
                            {product?.attributes?.brand && (
                                <Typography 
                                    variant="h6" 
                                    color="text.secondary" 
                                    gutterBottom
                                    sx={{ mb: 2 }}
                                >
                                    By {product.attributes.brand}
                                </Typography>
                            )}
                            
                            {/* Rating */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Rating 
                                    value={product?.rating || 0} 
                                    readOnly 
                                    precision={0.5}
                                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                />
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                >
                                    {product?.rating} ({Math.floor(Math.random() * 500) + 50} reviews)
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Price and Purchase Section - Enhanced for visual hierarchy */}
                            <Card 
                                elevation={0} 
                                sx={{ 
                                    my: 3, 
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 2,
                                    position: 'sticky',
                                    top: { md: 20 },
                                    zIndex: 10,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    {/* Price display with original price if there's a discount */}
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                                        <Typography 
                                            variant="h3" 
                                            component="div" 
                                            sx={{ 
                                                fontWeight: 'bold', 
                                                color: 'primary.main',
                                                mr: 2
                                            }}
                                        >
                                            {product?.currency} {typeof product?.price === 'number' 
                                                ? product.price.toFixed(2) 
                                                : parseFloat(product?.price || '0').toFixed(2)}
                                        </Typography>
                                        
                                        {hasDiscount && (
                                            <Typography 
                                                variant="h6" 
                                                component="span" 
                                                sx={{ 
                                                    textDecoration: 'line-through',
                                                    color: 'text.secondary',
                                                    mr: 1
                                                }}
                                            >
                                                {product?.currency} {product.listPrice.toFixed(2)}
                                            </Typography>
                                        )}
                                        
                                        {hasDiscount && (
                                            <Chip 
                                                icon={<DiscountIcon />} 
                                                label={`Save ${discount}%`} 
                                                color="error" 
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        )}
                                    </Box>
                                    
                                    {/* Stock status and delivery estimate */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        mb: 2,
                                        gap: 2,
                                        flexWrap: 'wrap'
                                    }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            color: 'success.main'
                                        }}>
                                            <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="body2" fontWeight="medium">
                                                In Stock
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            color: 'text.secondary'
                                        }}>
                                            <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="body2">
                                                Delivery in 2-3 business days
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    {/* Quantity selector */}
                                    <Grid container alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                        <Grid item>
                                            <IconButton 
                                                color="primary" 
                                                aria-label="decrease quantity" 
                                                onClick={handleMinus}
                                                disabled={textQuantity <= 1}
                                                size="small"
                                                sx={{ border: `1px solid ${theme.palette.divider}` }}
                                            >
                                                <RemoveCircleIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                sx={{ width: '8ch' }}
                                                required
                                                id="quantity"
                                                label="Quantity"
                                                size="small"
                                                onChange={onQuantityChange}
                                                value={textQuantity}
                                                inputProps={{ 
                                                    min: 1, 
                                                    'aria-label': 'Product quantity'
                                                }}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <IconButton 
                                                color="primary" 
                                                aria-label="increase quantity" 
                                                onClick={handleAdd}
                                                size="small"
                                                sx={{ border: `1px solid ${theme.palette.divider}` }}
                                            >
                                                <AddCircleIcon />
                                            </IconButton>
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <Typography 
                                                variant="body2" 
                                                color="error"
                                                sx={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mt: 1
                                                }}
                                            >
                                                <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                Only {Math.floor(Math.random() * 10) + 3} left in stock - order soon!
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    
                                    {/* CTA buttons with enhanced visual hierarchy */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Button 
                                                variant="contained" 
                                                fullWidth
                                                size="large"
                                                startIcon={<ShoppingCartIcon />} 
                                                onClick={handleAddToCart}
                                                disabled={addingToCart}
                                                sx={{ 
                                                    py: 1.2,
                                                    fontWeight: 500,
                                                    fontSize: '1rem',
                                                    bgcolor: '#FF9800',
                                                    '&:hover': {
                                                        bgcolor: '#F57C00',
                                                    }
                                                }}
                                            >
                                                {addingToCart ? 'Adding...' : 'Add to Cart'}
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button 
                                                variant="outlined" 
                                                fullWidth
                                                size="large"
                                                startIcon={<PaidIcon />}
                                                onClick={handleBuyNow}
                                                sx={{ 
                                                    py: 1.2,
                                                    fontWeight: 500,
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Buy Now
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    
                                    {addedToCart && (
                                        <Alert 
                                            severity="success" 
                                            sx={{ mt: 2 }}
                                            icon={<CheckCircleIcon fontSize="inherit" />}
                                        >
                                            <Typography variant="body2" fontWeight="medium">
                                                Product added to cart successfully!
                                            </Typography>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                            
                            {/* Enhanced Trust Signals */}
                            <Card 
                                elevation={0}
                                sx={{ 
                                    mb: 3, 
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 2
                                }}
                            >
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Why Shop With Us
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={6} sm={3}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center'
                                            }}>
                                                <LocalShippingIcon 
                                                    color="primary" 
                                                    sx={{ fontSize: 32, mb: 1 }} 
                                                />
                                                <Typography variant="body2" fontWeight="medium">
                                                    Free Shipping
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    On orders over $50
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center'
                                            }}>
                                                <AssignmentReturnIcon 
                                                    color="primary" 
                                                    sx={{ fontSize: 32, mb: 1 }} 
                                                />
                                                <Typography variant="body2" fontWeight="medium">
                                                    Easy Returns
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    30-day money back
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center'
                                            }}>
                                                <SecurityIcon 
                                                    color="primary" 
                                                    sx={{ fontSize: 32, mb: 1 }} 
                                                />
                                                <Typography variant="body2" fontWeight="medium">
                                                    Secure Checkout
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    100% protected
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center'
                                            }}>
                                                <CreditCardIcon 
                                                    color="primary" 
                                                    sx={{ fontSize: 32, mb: 1 }} 
                                                />
                                                <Typography variant="body2" fontWeight="medium">
                                                    Payment Options
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    All major cards
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                            
                            {/* Product details in sticky accordions */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Product Information
                                </Typography>
                                
                                <Accordion 
                                    expanded={expanded === 'panel1'} 
                                    onChange={handleAccordionChange('panel1')}
                                    elevation={0}
                                    sx={{ 
                                        mb: 1.5,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        '&:before': {
                                            display: 'none',
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1-content"
                                        id="panel1-header"
                                        sx={{ 
                                            backgroundColor: expanded === 'panel1' 
                                                ? 'rgba(0, 0, 0, 0.03)' 
                                                : 'transparent'
                                        }}
                                    >
                                        <Typography fontWeight="bold">Product Description</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2">
                                            {product?.description || 'No description available'}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                                
                                <Accordion 
                                    expanded={expanded === 'panel2'} 
                                    onChange={handleAccordionChange('panel2')}
                                    elevation={0}
                                    sx={{ 
                                        mb: 1.5,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        '&:before': {
                                            display: 'none',
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel2-content"
                                        id="panel2-header"
                                        sx={{ 
                                            backgroundColor: expanded === 'panel2' 
                                                ? 'rgba(0, 0, 0, 0.03)' 
                                                : 'transparent'
                                        }}
                                    >
                                        <Typography fontWeight="bold">Specifications</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {product?.attributes && Object.entries(product.attributes).map(([key, value]: [string, any]) => (
                                                <React.Fragment key={key}>
                                                    <Grid item xs={4} sm={3}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={8} sm={9}>
                                                        <Typography variant="body2">
                                                            {value}
                                                        </Typography>
                                                    </Grid>
                                                </React.Fragment>
                                            ))}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                                
                                <Accordion 
                                    expanded={expanded === 'panel3'} 
                                    onChange={handleAccordionChange('panel3')}
                                    elevation={0}
                                    sx={{ 
                                        mb: 1.5,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        '&:before': {
                                            display: 'none',
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel3-content"
                                        id="panel3-header"
                                        sx={{ 
                                            backgroundColor: expanded === 'panel3' 
                                                ? 'rgba(0, 0, 0, 0.03)' 
                                                : 'transparent'
                                        }}
                                    >
                                        <Typography fontWeight="bold">Shipping & Returns</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack spacing={2}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                Free Shipping
                                            </Typography>
                                            <Typography variant="body2">
                                                Orders over $50 qualify for free shipping. Standard delivery in 3-5 business days.
                                            </Typography>
                                            
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                30-Day Returns
                                            </Typography>
                                            <Typography variant="body2">
                                                Not satisfied with your purchase? Return it within 30 days for a full refund.
                                                Items must be in original condition with tags attached.
                                            </Typography>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                                
                                <Accordion 
                                    expanded={expanded === 'panel4'} 
                                    onChange={handleAccordionChange('panel4')}
                                    elevation={0}
                                    sx={{ 
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        '&:before': {
                                            display: 'none',
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel4-content"
                                        id="panel4-header"
                                        sx={{ 
                                            backgroundColor: expanded === 'panel4' 
                                                ? 'rgba(0, 0, 0, 0.03)' 
                                                : 'transparent'
                                        }}
                                    >
                                        <Typography fontWeight="bold">Payment Options</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack spacing={2}>
                                            <Typography variant="body2">
                                                We accept all major credit cards, PayPal, and Apple Pay. All payments are securely processed.
                                            </Typography>
                                            
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                Installment Options
                                            </Typography>
                                            <Typography variant="body2">
                                                Pay in 4 interest-free installments for orders over $50 with PayPal or Affirm.
                                            </Typography>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default Product;