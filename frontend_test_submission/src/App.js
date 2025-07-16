import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Navigation from './components/Navigation';
import UrlShortener from './components/UrlShortener';
import Statistics from './components/Statistics';
import Logger from './Logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [logger] = useState(new Logger());

  useEffect(() => {
    const initializeApp = async () => {
      await logger.info('frontend', 'page', 'URL Shortener app started');
    };
    
    initializeApp();
  }, [logger]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Navigation />
          
          <Routes>
            <Route path="/" element={<UrlShortener />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
