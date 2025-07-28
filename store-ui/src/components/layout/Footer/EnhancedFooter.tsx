import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { label: 'Electronics', href: '/category/electronics' },
        { label: 'Fashion', href: '/category/fashion' },
        { label: 'Home & Garden', href: '/category/home' },
        { label: 'Sports & Outdoors', href: '/category/sports' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'Track Your Order', href: '/track-order' },
        { label: 'Returns & Exchanges', href: '/returns' },
        { label: 'Shipping Info', href: '/shipping' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Clusterly', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Sustainability', href: '/sustainability' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/clusterly', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/clusterly', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/clusterly', label: 'Instagram' },
    { icon: LinkedIn, href: 'https://linkedin.com/company/clusterly', label: 'LinkedIn' }
  ];

  return (
    <Box 
      component="footer" 
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
        color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700',
        mt: 'auto',
        pt: { xs: 4, md: 6 },
        pb: { xs: 2, md: 3 }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                  mb: 2
                }}
              >
                Clusterly
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                Your premier destination for quality products at great prices. 
                Discover everything you need from electronics to fashion, all in one place.
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">support@clusterly.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">1-800-CLUSTER</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">San Francisco, CA</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Footer Links Sections */}
          {footerSections.map((section, index) => (
            <Grid item xs={6} md={2.67} key={index}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                {section.title}
              </Typography>
              <Box component="nav">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    sx={{
                      display: 'block',
                      color: 'inherit',
                      textDecoration: 'none',
                      mb: 1,
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: theme.palette.primary.main,
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Link 
                href="/privacy" 
                sx={{ 
                  color: 'inherit', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                sx={{ 
                  color: 'inherit', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Terms of Service
              </Link>
              <Link 
                href="/cookies" 
                sx={{ 
                  color: 'inherit', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Cookie Policy
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'center', md: 'flex-end' },
              alignItems: 'center',
              gap: 1
            }}>
              {/* Social Media Links */}
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.label} page`}
                  sx={{
                    color: 'inherit',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <social.icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ textAlign: 'center', mt: 3, pt: 2 }}>
          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} Clusterly. All rights reserved. | 
            Made with ❤️ for better shopping experience
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
