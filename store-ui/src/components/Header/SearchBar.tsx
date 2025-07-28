import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  '&:focus-within': {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: '#FF9800',
    boxShadow: `0 0 0 2px rgba(255, 152, 0, 0.2)`,
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: '500px',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.95rem',
    fontWeight: 400,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
      opacity: 1,
    },
    [theme.breakpoints.up('md')]: {
      width: '350px',
    },
  },
}));

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (event: React.KeyboardEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  inputRef,
  fullWidth = false
}) => {
  return (
    <Search sx={fullWidth ? { width: '100%' } : {}}>
      <SearchIconWrapper>
        <SearchIcon aria-hidden="true" />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search products…"
        inputProps={{ 
          'aria-label': 'search products',
          'aria-describedby': fullWidth ? 'mobile-search-help' : undefined
        }}
        sx={fullWidth ? { width: '100%' } : {}}
        value={searchQuery}
        onChange={onSearchChange}
        onKeyPress={onSearch}
        ref={inputRef}
      />
    </Search>
  );
};

export default SearchBar;
