import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchUrl } from '../api/config';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  InputAdornment, 
  Chip, 
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Divider,
  useTheme,
  List,
  ListItem,
  ListItemText,
  InputBase,
  IconButton,
  styled,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CategoryIcon from '@mui/icons-material/Category';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// Styled search input similar to the screenshot
const SearchInput = styled(InputBase)(({ theme }) => ({
  width: '100%',
  fontSize: '0.95rem',
  padding: '8px 16px',
  transition: theme.transitions.create('width'),
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : '#f5f5f5',
  borderRadius: 4,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.15) : '#e5e5e5',
  },
  '&.Mui-focused': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.15) : '#e5e5e5',
  }
}));

const SearchResults = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  maxHeight: '400px',
  overflow: 'auto',
  zIndex: 1300,
  marginTop: '4px',
  borderRadius: 4,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
}));

const ProductCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  borderRadius: 4,
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  }
}));

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  price: number;
  thumbnail?: string;
}

const SearchComponent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get('query') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  
  // Debounce search suggestions
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  const fetchSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${searchUrl}?query=${encodeURIComponent(searchTerm)}&limit=5`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      // Extract unique terms from results
      const terms = data.results.map((item: any) => item.title).slice(0, 5);
      setSuggestions(terms);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to get suggestions');
      setLoading(false);
    }
  }, []);

  const debounceFetchSuggestions = (searchTerm: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    
    if (value.trim().length > 1) {
      setShowDropdown(true);
      debounceFetchSuggestions(value);
    } else {
      setShowDropdown(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    navigate(`/search?query=${encodeURIComponent(suggestion)}`);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    if (query.trim().length > 1) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding dropdown to allow clicking suggestions
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle keyboard navigation in dropdown
    if (!showDropdown) return;
    
    switch (event.key) {
      case 'Escape':
        setShowDropdown(false);
        break;
      case 'ArrowDown':
        // Navigate down in suggestions
        // Implementation for keyboard navigation would go here
        break;
      case 'ArrowUp':
        // Navigate up in suggestions
        break;
      case 'Enter':
        // Submit form will be handled by the form's onSubmit
        break;
    }
  };

  // Popular search terms
  const popularSearches = [
    'sneakers', 'running shoes', 'women\'s flats', 'shoe rack', 'shoe polish'
  ];

  return (
    <Box position="relative" width="100%" maxWidth={600} sx={{ mx: 'auto' }}>
      <form onSubmit={handleSearch} aria-label="Search products">
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <SearchInput
            inputRef={inputRef}
            placeholder="Search for shoes, sneakers and more..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            }
            endAdornment={
              query && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setQuery('')}
                    edge="end"
                    aria-label="Clear search"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
            fullWidth
            aria-label="Search products"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls={showDropdown ? 'search-suggestions' : undefined}
          />
          <Button 
            type="submit" 
            variant="contained"
            color="primary"
            sx={{ 
              ml: 1,
              backgroundColor: '#FF9800',
              '&:hover': {
                backgroundColor: '#F57C00',
              },
              minWidth: '80px',
              height: '40px'
            }}
          >
            Search
          </Button>
        </Box>
      </form>

      {showDropdown && (
        <SearchResults elevation={3} id="search-suggestions" role="listbox">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, color: 'error.main' }}>
              {error}
            </Box>
          ) : suggestions.length > 0 ? (
            <List sx={{ p: 0 }}>
              {suggestions.map((suggestion, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="option"
                  aria-selected={false}
                  divider
                >
                  <SearchIcon color="action" sx={{ mr: 1, fontSize: '1.1rem' }} />
                  <ListItemText 
                    primary={suggestion} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      style: { fontWeight: 500 }
                    }} 
                  />
                  <KeyboardArrowRightIcon color="action" fontSize="small" />
                </ListItem>
              ))}
            </List>
          ) : query.length > 1 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No suggestions found for "{query}"
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Popular Searches
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {popularSearches.map((term, index) => (
                  <Chip
                    key={index}
                    label={term}
                    size="small"
                    onClick={() => handleSuggestionClick(term)}
                    sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </SearchResults>
      )}
    </Box>
  );
};

export default SearchComponent;