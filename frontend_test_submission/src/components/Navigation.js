import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link as LinkIcon, Analytics } from '@mui/icons-material';

const Navigation = () => {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener App
        </Typography>
        
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<LinkIcon />}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ mr: 2 }}
          >
            Shortener
          </Button>
          
          <Button
            color="inherit"
            component={RouterLink}
            to="/statistics"
            startIcon={<Analytics />}
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;