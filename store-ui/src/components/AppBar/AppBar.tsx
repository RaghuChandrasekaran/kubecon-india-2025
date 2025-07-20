import React, { useState, useEffect } from 'react';
import {
  AppBar as MuiAppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  InputBase,
  alpha,
  Collapse,
  Fade,
  Zoom,
  Chip
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Settings,
  Logout,
  AdminPanelSettings,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Home as HomeIcon,
  Storefront as StorefrontIcon,
  Phone as PhoneIcon,
  Help as HelpIcon,
  LocalShipping as LocalShippingIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../layout/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeContext from '../layout/ThemeContext';

// Styled components
const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: '#263238', // Dark navy/gray color from screenshot
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  color: '#FFFFFF',
  transition: 'all 0.3s ease'
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.5px',
  color: '#FF9800', // Orange color from the screenshot
  fontSize: '1.4rem',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer'
}));

// Add keyboard focus styles to NavLink
const NavLink = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  color: theme.palette.text.primary,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: '0%',
    height: '2px',
    backgroundColor: theme.palette.primary.main,
    transition: 'all 0.3s ease',
    transform: 'translateX(-50%)',
  },
  '&:hover::after, &:focus-visible::after': {
    width: '70%',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  }
}));

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: `${(Number(theme.shape.borderRadius) * 5).toString()}px`,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.3s ease'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: '1em',
    width: '100%',
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

// Add keyboard focus styles to ProfileButton
const ProfileButton = styled(IconButton)(({ theme }) => ({
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 5,
    padding: '0 4px',
    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
    transition: 'all 0.2s ease',
    animation: 'pulse 1.5s infinite',
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.1)',
      },
      '100%': {
        transform: 'scale(1)',
      }
    }
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    paddingTop: theme.spacing(2),
    background: theme.palette.background.paper,
  },
}));

const MenuButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1, 2),
  width: '100%',
  color: theme.palette.text.primary,
  backgroundColor: 'transparent',
  borderRadius: 0,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  }
}));

// Enhance the ListItemButton keyboard accessibility
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '-2px',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  }
}));

const AppBar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colorMode = React.useContext(ThemeContext);
  
  // Debug logging for admin role
  console.log("AppBar - User object:", user);
  console.log("AppBar - User role:", user?.role);
  console.log("AppBar - Is admin check:", user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'Admin');
  console.log("AppBar - Is logged in:", isLoggedIn);
  
  // Profile menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Category collapse states
  const [openCategories, setOpenCategories] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  
  // Add this at the beginning of the component
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  // Add state for screen reader announcements
  const [announcement, setAnnouncement] = useState('');
  
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };
  
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };
  
  // Get first letter of user name for avatar
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };
  
  const categories = [
    { name: 'Electronics', path: '/category/electronics' },
    { name: 'Clothing', path: '/category/clothing' },
    { name: 'Home & Kitchen', path: '/category/home' },
    { name: 'Beauty', path: '/category/beauty' },
    { name: 'Books', path: '/category/books' }
  ];
  
  const helpLinks = [
    { name: 'Customer Service', path: '/help/customer-service' },
    { name: 'Shipping Info', path: '/help/shipping' },
    { name: 'Returns & Refunds', path: '/help/returns' },
    { name: 'FAQ', path: '/help/faq' }
  ];

  // Add keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus search input when user presses '/' key
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setAnnouncement('Search box is now focused. Type to search products.');
      }
      
      // Add shortcut to go to cart (c key)
      if (event.key === 'c' && (event.ctrlKey || event.metaKey) && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        navigate('/cart');
        setAnnouncement('Navigated to shopping cart');
      }
      
      // Add shortcut to go to home (h key)
      if (event.key === 'h' && (event.ctrlKey || event.metaKey) && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        navigate('/');
        setAnnouncement('Navigated to home page');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
  
  // Clear announcement after it's been read
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [announcement]);
  
  // Handle search submission
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setDrawerOpen(false);
    }
  };

  const renderMobileDrawer = () => (
    <MobileDrawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 2,
          alignItems: 'center'
        }}>
          <Logo variant="h6" onClick={() => handleNavigation('/')}>
            EShop
          </Logo>
          <IconButton 
            onClick={toggleDrawer(false)}
            size="small"
            aria-label="Close menu"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {isLoggedIn && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            mb: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.1), 
            borderRadius: 1 
          }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 'bold',
                mr: 2,
                width: 32,
                height: 32
              }}
            >
              {getInitial()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
        )}
        
        <List component="nav" sx={{ flexGrow: 1, px: 0 }} aria-label="Main Navigation">
          <ListItem disablePadding>
            <StyledListItemButton 
              onClick={() => handleNavigation('/')} 
              aria-label="Home page"
              sx={{ py: 1 }}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </StyledListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <StyledListItemButton 
              onClick={() => setOpenCategories(!openCategories)}
              aria-expanded={openCategories}
              aria-controls="categories-submenu"
              sx={{ py: 1 }}
            >
              <ListItemIcon>
                <StorefrontIcon />
              </ListItemIcon>
              <ListItemText primary="Shop by Category" />
              {openCategories ? <ExpandLessIcon aria-hidden="true" /> : <ExpandMoreIcon aria-hidden="true" />}
            </StyledListItemButton>
          </ListItem>
          
          <Collapse in={openCategories} timeout="auto" unmountOnExit id="categories-submenu">
            <List component="div" disablePadding aria-label="Categories">
              {categories.map((category) => (
                <ListItem key={category.name} disablePadding>
                  <StyledListItemButton 
                    sx={{ pl: 4, py: 1 }}
                    onClick={() => handleNavigation(category.path)}
                    aria-label={`Browse ${category.name} category`}
                  >
                    <ListItemText primary={category.name} />
                  </StyledListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          {isLoggedIn ? (
            <>
              <ListItem disablePadding>
                <StyledListItemButton 
                  onClick={() => handleNavigation('/profile')}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </StyledListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <StyledListItemButton 
                  onClick={() => handleNavigation('/orders')}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <LocalShippingIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Orders" />
                </StyledListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <StyledListItemButton 
                  onClick={() => handleNavigation('/cart')}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <ShoppingCartIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>My Cart</span>
                        {cartCount > 0 && (
                          <Chip 
                            label={cartCount} 
                            size="small" 
                            color="error" 
                            sx={{ height: 20, fontSize: '0.75rem' }} 
                          />
                        )}
                      </Box>
                    } 
                  />
                </StyledListItemButton>
              </ListItem>
              
              {user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'Admin' ? (
                <ListItem disablePadding>
                  <StyledListItemButton 
                    onClick={() => handleNavigation('/admin')}
                    sx={{ py: 1 }}
                  >
                    <ListItemIcon>
                      <AdminPanelSettings />
                    </ListItemIcon>
                    <ListItemText primary="Admin Dashboard" />
                  </StyledListItemButton>
                </ListItem>
              ) : null}
              
              <ListItem disablePadding>
                <StyledListItemButton 
                  onClick={handleLogout}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </StyledListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <StyledListItemButton 
                  onClick={() => handleNavigation('/login')}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </StyledListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <StyledListItemButton 
                  onClick={() => handleNavigation('/register')}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign Up" />
                </StyledListItemButton>
              </ListItem>
            </>
          )}
        </List>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            onClick={colorMode.toggleColorMode}
            sx={{ mb: 2 }}
          >
            {theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </Box>
      </Box>
    </MobileDrawer>
  );

  return (
    <StyledAppBar position="sticky" aria-label="Main navigation">
      {/* Add live region for screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      
      <Container maxWidth="xl" disableGutters={isMobile}>
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: isMobile ? 48 : 64,
            px: isMobile ? 1 : 2 
          }}
        >
          {isMobile ? (
            <>
              <IconButton
                size="small"
                edge="start"
                color="inherit"
                aria-label="Open navigation menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                <Logo 
                  variant="body1" 
                  onClick={() => navigate('/')} 
                  tabIndex={0} 
                  role="button" 
                  aria-label="Go to homepage"
                  sx={{ fontSize: '1.25rem' }}
                >
                  EShop
                </Logo>
              </Box>
              
              <Box sx={{ display: 'flex' }}>
                <IconButton 
                  color="inherit" 
                  onClick={() => navigate('/cart')}
                  aria-label={`Shopping Cart with ${cartCount} items`}
                  size="small"
                  sx={{ ml: 0.5 }}
                >
                  <StyledBadge 
                    badgeContent={cartCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.65rem',
                        height: '16px',
                        minWidth: '16px',
                        padding: '0 4px'
                      }
                    }}
                  >
                    <ShoppingCartIcon fontSize="small" />
                  </StyledBadge>
                </IconButton>
              </Box>
            </>
          ) : (
            <>
              <Logo 
                variant="h6" 
                onClick={() => navigate('/')} 
                sx={{ mr: 2, cursor: 'pointer' }}
                tabIndex={0}
                role="button"
                aria-label="Go to homepage"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/');
                  }
                }}
              >
                EShop
              </Logo>
              
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                <NavLink 
                  onClick={() => navigate('/')}
                  aria-label="Home page"
                >
                  Home
                </NavLink>
                
                {/* Add keyboard accessibility to the menu items */}
                {categories.map((category) => (
                  <NavLink
                    key={category.name}
                    onClick={() => navigate(category.path)}
                    aria-label={`Browse ${category.name} category`}
                  >
                    {category.name}
                  </NavLink>
                ))}
              </Box>
              
              <form onSubmit={handleSearchSubmit} aria-label="Search products" role="search">
                <SearchWrapper>
                  <SearchIconWrapper>
                    <SearchIcon aria-hidden="true" />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search products…"
                    inputProps={{ 
                      'aria-label': 'search products',
                      ref: searchInputRef
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {/* Add a tooltip to show the keyboard shortcut */}
                  <Typography 
                    variant="caption" 
                    sx={{ opacity: 0.7, mr: 1 }}
                    aria-hidden="true"
                  >
                    Press /
                  </Typography>
                </SearchWrapper>
              </form>
              
              <Box sx={{ display: 'flex', ml: 1 }}>
                <Tooltip title="Toggle dark/light mode" arrow>
                  <IconButton 
                    onClick={colorMode.toggleColorMode} 
                    color="inherit"
                    aria-label={`Switch to ${theme.palette.mode === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Favorites" arrow>
                  <IconButton 
                    color="inherit"
                    aria-label="View favorites"
                    onClick={() => navigate('/favorites')}
                  >
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Shopping Cart" arrow>
                  <IconButton 
                    color="inherit" 
                    onClick={() => navigate('/cart')}
                    aria-label={`Shopping Cart with ${cartCount} items`}
                  >
                    <StyledBadge badgeContent={cartCount} color="error">
                      <ShoppingCartIcon />
                    </StyledBadge>
                  </IconButton>
                </Tooltip>
                
                {isLoggedIn ? (
                  <>
                    <Tooltip title="Account settings" arrow>
                      <ProfileButton
                        onClick={handleProfileClick}
                        aria-expanded={open ? 'true' : 'false'}
                        aria-haspopup="true"
                        aria-controls={open ? 'profile-menu' : undefined}
                        aria-label="Open user account menu"
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 'bold',
                            width: 32, 
                            height: 32 
                          }}
                        >
                          {getInitial()}
                        </Avatar>
                      </ProfileButton>
                    </Tooltip>
                    <Menu
                      id="profile-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      onClick={handleClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      PaperProps={{
                        elevation: 3,
                        sx: {
                          overflow: 'visible',
                          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                          mt: 1.5,
                          borderRadius: 2,
                          minWidth: 180,
                          '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1.5,
                            my: 0.25,
                            borderRadius: 1,
                          },
                        },
                      }}
                    >
                      <MenuItem 
                        onClick={() => navigate('/profile')}
                        aria-label="View your profile"
                      >
                        <ListItemIcon>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Profile</ListItemText>
                      </MenuItem>
                      
                      <MenuItem 
                        onClick={() => navigate('/orders')}
                        aria-label="View your orders"
                      >
                        <ListItemIcon>
                          <LocalShippingIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Orders</ListItemText>
                      </MenuItem>
                      
                      <MenuItem 
                        onClick={() => navigate('/settings')}
                        aria-label="View account settings"
                      >
                        <ListItemIcon>
                          <Settings fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Settings</ListItemText>
                      </MenuItem>
                      
                      {(user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'Admin') && (
                        <MenuItem 
                          onClick={() => navigate('/admin')}
                          aria-label="Go to admin dashboard"
                        >
                          <ListItemIcon>
                            <AdminPanelSettings fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Admin Panel</ListItemText>
                        </MenuItem>
                      )}
                      
                      <Divider />
                      
                      <MenuItem 
                        onClick={handleLogout}
                        aria-label="Log out of your account"
                      >
                        <ListItemIcon>
                          <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/login')}
                    sx={{ ml: 1 }}
                    aria-label="Log in to your account"
                  >
                    Login
                  </Button>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
      
      {/* Mobile drawer */}
      {renderMobileDrawer()}
      
      {/* Add keyboard shortcuts help dialog */}
      <Box sx={{ position: 'fixed', bottom: 0, right: 0, zIndex: 100, p: 2 }}>
        <Tooltip
          title={
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography variant="subtitle2" gutterBottom>Keyboard Shortcuts:</Typography>
              <li>/ - Focus search</li>
              <li>Ctrl+H - Home page</li>
              <li>Ctrl+C - Cart page</li>
            </Box>
          }
          arrow
          placement="top-end"
        >
          <IconButton 
            size="small" 
            sx={{ 
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              boxShadow: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
              }
            }}
            aria-label="Keyboard shortcuts help"
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>?</Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </StyledAppBar>
  );
};

// Add CSS for screen reader only content
const style = document.createElement('style');
style.textContent = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
document.head.appendChild(style);

export default AppBar;
