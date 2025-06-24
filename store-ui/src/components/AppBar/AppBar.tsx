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
  Zoom
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
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../layout/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeContext from '../layout/ThemeContext';

// Styled components
const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease'
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '0.5px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #f06, #3cf)' 
    : 'linear-gradient(45deg, #3f51b5, #f50057)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  textTransform: 'uppercase'
}));

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
  '&:hover::after': {
    width: '70%',
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

const ProfileButton = styled(IconButton)(({ theme }) => ({
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
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

  const renderMobileDrawer = () => (
    <MobileDrawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Logo variant="h6" onClick={() => handleNavigation('/')}>
            EShop
          </Logo>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {isLoggedIn && (
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 'bold',
                mr: 2
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
        
        <List component="nav" sx={{ flexGrow: 1 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenCategories(!openCategories)}>
              <ListItemIcon>
                <StorefrontIcon />
              </ListItemIcon>
              <ListItemText primary="Shop by Category" />
              {openCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={openCategories} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {categories.map((category) => (
                <ListItem key={category.name} disablePadding>
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => handleNavigation(category.path)}
                  >
                    <ListItemText primary={category.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenHelp(!openHelp)}>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Help & Support" />
              {openHelp ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={openHelp} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {helpLinks.map((link) => (
                <ListItem key={link.name} disablePadding>
                  <ListItemButton 
                    sx={{ pl: 4 }}
                    onClick={() => handleNavigation(link.path)}
                  >
                    <ListItemText primary={link.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/contact')}>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText primary="Contact Us" />
            </ListItemButton>
          </ListItem>
          
          {isLoggedIn ? (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation('/profile')}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation('/orders')}>
                  <ListItemIcon>
                    <LocalShippingIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Orders" />
                </ListItemButton>
              </ListItem>
              
              {user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'Admin' ? (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigation('/admin')}>
                    <ListItemIcon>
                      <AdminPanelSettings />
                    </ListItemIcon>
                    <ListItemText primary="Admin Dashboard" />
                  </ListItemButton>
                </ListItem>
              ) : null}
              
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation('/login')}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation('/register')}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign Up" />
                </ListItemButton>
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
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar sx={{ py: { xs: 1, md: 0.5 } }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Fade in={true} timeout={800}>
              <Logo
                variant="h6"
                noWrap
                sx={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => navigate('/')}
              >
                EShop
              </Logo>
            </Fade>
            
            {!isMobile && (
              <>
                <Box sx={{ ml: 4, display: 'flex', gap: 0.5 }}>
                  <NavLink onClick={() => navigate('/')}>Home</NavLink>
                  
                  <Box sx={{ position: 'relative' }}>
                    <NavLink
                      endIcon={<ExpandMoreIcon />}
                      onClick={() => setOpenCategories(!openCategories)}
                    >
                      Categories
                    </NavLink>
                    {openCategories && (
                      <Fade in={openCategories} timeout={200}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 1000,
                            minWidth: 180,
                            bgcolor: 'background.paper',
                            boxShadow: 3,
                            borderRadius: 1,
                            overflow: 'hidden',
                            mt: 0.5
                          }}
                        >
                          {categories.map((category) => (
                            <MenuItem 
                              key={category.name}
                              onClick={() => {
                                navigate(category.path);
                                setOpenCategories(false);
                              }}
                              sx={{ py: 1.5 }}
                            >
                              {category.name}
                            </MenuItem>
                          ))}
                        </Box>
                      </Fade>
                    )}
                  </Box>
                  
                  <NavLink onClick={() => navigate('/deals')}>Deals</NavLink>
                  <NavLink onClick={() => navigate('/new-arrivals')}>New Arrivals</NavLink>
                  
                  <Box sx={{ position: 'relative' }}>
                    <NavLink
                      endIcon={<ExpandMoreIcon />}
                      onClick={() => setOpenHelp(!openHelp)}
                    >
                      Help
                    </NavLink>
                    {openHelp && (
                      <Fade in={openHelp} timeout={200}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 1000,
                            minWidth: 180,
                            bgcolor: 'background.paper',
                            boxShadow: 3,
                            borderRadius: 1,
                            overflow: 'hidden',
                            mt: 0.5
                          }}
                        >
                          {helpLinks.map((link) => (
                            <MenuItem 
                              key={link.name}
                              onClick={() => {
                                navigate(link.path);
                                setOpenHelp(false);
                              }}
                              sx={{ py: 1.5 }}
                            >
                              {link.name}
                            </MenuItem>
                          ))}
                        </Box>
                      </Fade>
                    )}
                  </Box>
                </Box>
                
                <SearchWrapper>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search products…"
                    inputProps={{ 'aria-label': 'search' }}
                  />
                </SearchWrapper>
              </>
            )}
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {!isMobile && (
                <Tooltip title="Toggle theme">
                  <IconButton 
                    onClick={colorMode.toggleColorMode} 
                    color="inherit"
                    sx={{ mr: 1 }}
                  >
                    {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Admin Users Icon - Only visible to admin users */}
              {isLoggedIn && (user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'Admin') && (
                <Tooltip title="User Management">
                  <IconButton 
                    color="inherit" 
                    onClick={() => navigate('/users')}
                    sx={{ mr: 1 }}
                  >
                    <AdminPanelSettings />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="Wishlist">
                <IconButton color="inherit" onClick={() => navigate('/wishlist')}>
                  <FavoriteIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Shopping Cart">
                <IconButton 
                  color="inherit" 
                  onClick={() => navigate('/cart')}
                  sx={{ mx: 0.5 }}
                >
                  <StyledBadge badgeContent={cartCount} color="error">
                    <ShoppingCartIcon />
                  </StyledBadge>
                </IconButton>
              </Tooltip>
              
              {isLoggedIn ? (
                <Box>
                  <Tooltip title="Account settings">
                    <ProfileButton
                      onClick={handleProfileClick}
                      aria-controls={open ? 'account-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? 'true' : undefined}
                      sx={{
                        ml: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 'bold',
                          width: 34,
                          height: 34
                        }}
                      >
                        {getInitial()}
                      </Avatar>
                    </ProfileButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                        mt: 1.5,
                        width: 220,
                        borderRadius: 2,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1.5 }}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="My Profile" />
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/orders')} sx={{ py: 1.5 }}>
                      <ListItemIcon>
                        <LocalShippingIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="My Orders" />
                    </MenuItem>
                    {user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'Admin' ? (
                      <MenuItem onClick={() => navigate('/admin')} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                          <AdminPanelSettings fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Admin Dashboard" />
                      </MenuItem>
                    ) : null}
                    <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5 }}>
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Account Settings" />
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  {!isMobile && (
                    <>
                      <Button
                        variant="text"
                        onClick={() => navigate('/login')}
                        sx={{
                          mr: 1,
                          color: 'text.primary',
                          fontWeight: 500,
                          textTransform: 'none'
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/register')}
                        sx={{
                          borderRadius: '20px',
                          textTransform: 'none',
                          fontWeight: 500,
                          boxShadow: 2,
                          px: 2
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                  {isMobile && (
                    <IconButton
                      color="inherit"
                      onClick={() => navigate('/login')}
                    >
                      <PersonIcon />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>
      
      {isMobile && renderMobileDrawer()}
      
      {/* Optional secondary navbar for categories on desktop */}
      {!isMobile && (
        <Box 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', py: 0.5, overflowX: 'auto' }}>
              {categories.map((category) => (
                <Button
                  key={category.name}
                  sx={{
                    color: 'text.secondary',
                    mx: 1,
                    py: 0.5,
                    minWidth: 'auto',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.main'
                    }
                  }}
                  onClick={() => navigate(category.path)}
                >
                  {category.name}
                </Button>
              ))}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default AppBar;
