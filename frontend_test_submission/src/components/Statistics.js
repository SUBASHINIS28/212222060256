import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Analytics, Search, AccessTime, Link } from '@mui/icons-material';
import urlService from '../services/urlService';
import Logger from '../Logger';

const Statistics = () => {
  const [shortcode, setShortcode] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logger] = useState(new Logger());

  const handleGetStatistics = async () => {
    if (!shortcode.trim()) {
      setError('Please enter a shortcode');
      return;
    }

    try {
      await logger.info('frontend', 'page', 'User requesting URL statistics');
      
      setLoading(true);
      setError('');
      
      const result = await urlService.getUrlStatistics(shortcode.trim());
      setStats(result);
      
      await logger.info('frontend', 'page', 'Statistics loaded successfully');
      
    } catch (error) {
      await logger.error('frontend', 'page', `Failed to load statistics: ${error.message}`);
      setError(error.response?.data?.error || 'Failed to load statistics');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getLocationString = (location) => {
    if (!location) return 'Unknown';
    const parts = [location.city, location.region, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Analytics sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            URL Statistics
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={4}>
          Enter a shortcode to view detailed analytics and click data for any shortened URL.
        </Typography>

        <Box display="flex" gap={2} mb={4}>
          <TextField
            fullWidth
            label="Shortcode"
            placeholder="Enter shortcode (e.g., abcd1)"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGetStatistics()}
            error={!!error && !stats}
          />
          <Button
            variant="contained"
            onClick={handleGetStatistics}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Loading...' : 'Get Stats'}
          </Button>
        </Box>

        {error && !stats && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {stats && (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  URL Overview
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                  <Chip
                    icon={<Link />}
                    label={`Shortcode: ${stats.shortcode}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<AccessTime />}
                    label={stats.isExpired ? 'Expired' : 'Active'}
                    color={stats.isExpired ? 'error' : 'success'}
                  />
                  <Chip
                    label={`Total Clicks: ${stats.totalClicks}`}
                    color="info"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Original URL:</strong>
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    wordBreak: 'break-all', 
                    fontFamily: 'monospace',
                    backgroundColor: '#f5f5f5',
                    p: 1,
                    borderRadius: 1,
                    mb: 2
                  }}
                >
                  {stats.originalUrl}
                </Typography>

                <Box display="flex" gap={4} flexWrap="wrap">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(stats.createdAt)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Expires At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(stats.expiresAt)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Validity Period
                    </Typography>
                    <Typography variant="body2">
                      {stats.validityMinutes} minutes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Click Analytics ({stats.clicks.length} clicks)
                </Typography>

                {stats.clicks.length === 0 ? (
                  <Alert severity="info">
                    No clicks recorded yet for this URL.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Referrer</TableCell>
                          <TableCell>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.clicks.map((click, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {formatDate(click.timestamp)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={click.referrer}
                                size="small"
                                variant="outlined"
                                color={click.referrer === 'direct' ? 'default' : 'primary'}
                              />
                            </TableCell>
                            <TableCell>
                              {getLocationString(click.location)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Statistics;