import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  Button,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

interface Category {
  name: string;
  path: string;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (event: React.KeyboardEvent) => void;
  firstFocusableElementRef: React.RefObject<HTMLInputElement>;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  onKeyDown,
  categories,
  searchQuery,
  onSearchChange,
  onSearch,
  firstFocusableElementRef,
  menuButtonRef
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCategoryClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Main navigation menu"
      onKeyDown={onKeyDown}
      id="mobile-navigation-drawer"
      ModalProps={{
        disableEnforceFocus: false,
        onClose: () => {
          onClose();
          if (menuButtonRef.current) {
            menuButtonRef.current.focus();
          }
        }
      }}
    >
      <Box
        sx={{ width: 250 }}
        role="navigation"
        aria-label="Main navigation"
      >
        <List component="nav" aria-label="Category navigation">
          <ListItem>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSearch={onSearch}
              inputRef={firstFocusableElementRef}
              fullWidth
            />
            {/* Hidden help text for screen readers */}
            <Box 
              id="mobile-search-help" 
              sx={{ 
                position: 'absolute', 
                left: '-10000px',
                top: 'auto',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
              }}
            >
              Press Enter to search for products
            </Box>
          </ListItem>
          <Divider />
          {categories.map((category) => (
            <ListItem 
              key={category.name} 
              disablePadding
            >
              <Button
                fullWidth
                onClick={() => handleCategoryClick(category.path)}
                role="menuitem"
                aria-label={`Navigate to ${category.name} category`}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  py: 1.5,
                  px: 2,
                  color: 'text.primary',
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: '-2px',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                {category.name}
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;
