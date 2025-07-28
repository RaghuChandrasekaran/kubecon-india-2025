import React, { useState, useRef, useEffect } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useTheme } from '@mui/material/styles';
import ThemeContext from '../ThemeContext';
import { Container, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';

// Import new modular components
import SearchBar from '../../Header/SearchBar';
import NavigationTabs from '../../Header/NavigationTabs';
import MobileDrawer from '../../Header/MobileDrawer';
import UserActions from '../../Header/UserActions';
import Logo from '../../Header/Logo';

// Styled skip link that properly handles focus state
const SkipLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  '&:focus': {
    position: 'fixed',
    top: '0',
    left: '0',
    width: 'auto',
    height: 'auto',
    padding: '12px',
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    zIndex: 9999,
    textDecoration: 'none',
    fontWeight: 'bold',
    borderRadius: '0 0 4px 0',
  }
}));

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount } = useCart();
    const theme = useTheme();
    const colorMode = React.useContext(ThemeContext);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const firstFocusableElementRef = useRef<HTMLInputElement>(null);

    const categories = [
        { name: 'Top Offers', path: '/' },
        { name: 'Electronics', path: '/category/electronics' },
        { name: 'Fashion', path: '/category/fashion' },
        { name: 'Grocery', path: '/category/grocery' },
        { name: 'Mobiles', path: '/category/mobiles' },
        { name: 'Appliances', path: '/category/appliances' },
        { name: 'Home', path: '/category/home' },
        { name: 'Toys', path: '/category/toys' }
    ];

    // Set active tab based on current route
    useEffect(() => {
        const currentPath = location.pathname;
        
        // Find the matching category index
        const activeTabIndex = categories.findIndex(category => 
            // Check for exact match or if we're on the home page
            category.path === currentPath || 
            // Special case for home page
            (category.path === '/' && currentPath === '/')
        );
        
        // If found, set it as current tab
        if (activeTabIndex !== -1) {
            setCurrentTab(activeTabIndex);
        } else {
            // If on a product page or other page, try to match the category from URL
            const categoryMatch = categories.findIndex(category => 
                currentPath.includes(category.path) && category.path !== '/'
            );
            
            if (categoryMatch !== -1) {
                setCurrentTab(categoryMatch);
            } else {
                // Default to home tab if no match
                setCurrentTab(0);
            }
        }
    }, [location.pathname]);

    // Store tab state in session storage
    useEffect(() => {
        try {
            sessionStorage.setItem('lastActiveTab', currentTab.toString());
        } catch (error) {
            console.error('Failed to save tab state:', error);
        }
    }, [currentTab]);

    // Load tab state from session storage on initial render
    useEffect(() => {
        try {
            const savedTab = sessionStorage.getItem('lastActiveTab');
            if (savedTab !== null) {
                const tabIndex = parseInt(savedTab, 10);
                // Only set if it's a valid index and not already set by the route matching
                if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < categories.length) {
                    setCurrentTab(tabIndex);
                }
            }
        } catch (error) {
            console.error('Failed to load tab state:', error);
        }
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        navigate(categories[newValue].path);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            setMobileMenuOpen(false);
        }
    };

    // Focus management for mobile drawer
    useEffect(() => {
        if (mobileMenuOpen && firstFocusableElementRef.current) {
            // Focus first element when drawer opens
            firstFocusableElementRef.current.focus();
        } else if (!mobileMenuOpen && menuButtonRef.current) {
            // Return focus to menu button when drawer closes
            menuButtonRef.current.focus();
        }
    }, [mobileMenuOpen]);

    const handleSearch = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Skip to content link for accessibility */}
            <SkipLink href="#main-content">
                Skip to main content
            </SkipLink>
            <MuiAppBar 
                position="static" 
                elevation={4}
                sx={{
                    backgroundColor: '#232F3E', // Amazon's dark navy color
                    color: '#fff'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar>
                        {isMobile && (
                            <IconButton
                                ref={menuButtonRef}
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="Main menu"
                                aria-controls="mobile-navigation-drawer"
                                aria-expanded={mobileMenuOpen}
                                onClick={toggleMobileMenu}
                                sx={{ mr: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        
                        <Logo />

                        {!isMobile && (
                            <SearchBar
                                searchQuery={searchQuery}
                                onSearchChange={handleSearchChange}
                                onSearch={handleSearch}
                                inputRef={searchInputRef}
                            />
                        )}

                        <Box sx={{ flexGrow: 1 }} />

                        <UserActions
                            cartCount={cartCount}
                            colorMode={colorMode}
                        />
                    </Toolbar>
                </Container>

                {!isMobile && (
                    <NavigationTabs
                        categories={categories}
                        currentTab={currentTab}
                        onTabChange={handleTabChange}
                    />
                )}
            </MuiAppBar>

            <MobileDrawer
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                onKeyDown={handleKeyDown}
                categories={categories}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSearch={handleSearch}
                firstFocusableElementRef={firstFocusableElementRef}
                menuButtonRef={menuButtonRef}
            />
            
            <main id="main-content" tabIndex={-1}>
                {/* Main content will be here */}
            </main>
        </Box>
    );
}

export default Header;