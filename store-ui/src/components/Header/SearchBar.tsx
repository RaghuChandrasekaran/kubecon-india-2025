import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
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
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
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
