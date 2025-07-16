import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as LinkIcon, ContentCopy } from '@mui/icons-material';
import urlService from '../services/urlService';
import Logger from '../Logger';

const UrlShortener = () => {
  const [urls, setUrls] = useState([
    { id: 1, url: '', validity: '', shortcode: '', result: null, loading: false, error: '' }
  ]);
  const [logger] = useState(new Logger());

  const handleAddUrl = async () => {
    if (urls.length < 5) {
      await logger.info('frontend', 'component', 'User adding new URL field');
      setUrls([...urls, { 
        id: Date.now(), 
        url: '', 
        validity: '', 
        shortcode: '', 
        result: null, 
        loading: false, 
        error: '' 
      }]);
    }
  };

  const handleRemoveUrl = async (id) => {
    if (urls.length > 1) {
      await logger.info('frontend', 'component', 'User removing URL field');
      setUrls(urls.filter(item => item.id !== id));
    }
  };

  const handleInputChange = (id, field, value) => {
    setUrls(urls.map(item => 
      item.id === id ? { ...item, [field]: value, error: '' } : item
    ));
  };

  const validateUrl = (url) => {
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(url);
  };

  const validateValidity = (validity) => {
    if (!validity) return true;
    const num = parseInt(validity);
    return !isNaN(num) && num > 0;
  };

  const validateShortcode = (shortcode) => {
    if (!shortcode) return true;
    const pattern = /^[a-zA-Z0-9]{3,10}$/;
    return pattern.test(shortcode);
  };

  const handleShortenUrl = async (urlItem) => {
    try {
      await logger.info('frontend', 'component', 'User initiated URL shortening');

      if (!validateUrl(urlItem.url)) {
        setUrls(urls.map(item => 
          item.id === urlItem.id ? { ...item, error: 'Please enter a valid URL starting with http:// or https://' } : item
        ));
        return;
      }

      if (!validateValidity(urlItem.validity)) {
        setUrls(urls.map(item => 
          item.id === urlItem.id ? { ...item, error: 'Validity must be a positive number' } : item
        ));
        return;
      }

      if (!validateShortcode(urlItem.shortcode)) {
        setUrls(urls.map(item => 
          item.id === urlItem.id ? { ...item, error: 'Shortcode must be 3-10 alphanumeric characters' } : item
        ));
        return;
      }

      setUrls(urls.map(item => 
        item.id === urlItem.id ? { ...item, loading: true, error: '' } : item
      ));

      const requestData = {
        url: urlItem.url,
        validity: urlItem.validity ? parseInt(urlItem.validity) : undefined,
        shortcode: urlItem.shortcode || undefined
      };

      const result = await urlService.createShortUrl(requestData);

      setUrls(urls.map(item => 
        item.id === urlItem.id ? { ...item, result, loading: false } : item
      ));

      await logger.info('frontend', 'component', 'URL shortened successfully');

    } catch (error) {
      await logger.error('frontend', 'component', `URL shortening failed: ${error.message}`);
      
      setUrls(urls.map(item => 
        item.id === urlItem.id ? { 
          ...item, 
          loading: false, 
          error: error.response?.data?.error || 'Failed to shorten URL' 
        } : item
      ));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      await logger.info('frontend', 'component', 'Short URL copied to clipboard');
    } catch (error) {
      await logger.error('frontend', 'component', 'Failed to copy URL to clipboard');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <LinkIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            URL Shortener
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={4}>
          Shorten up to 5 URLs at once. Add custom expiry times and shortcodes as needed.
        </Typography>

        {urls.map((urlItem, index) => (
          <Card key={urlItem.id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    URL {index + 1}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Long URL"
                    placeholder="https://example.com/very-long-url"
                    value={urlItem.url}
                    onChange={(e) => handleInputChange(urlItem.id, 'url', e.target.value)}
                    error={!!urlItem.error && urlItem.error.includes('URL')}
                    helperText={urlItem.error && urlItem.error.includes('URL') ? urlItem.error : ''}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    placeholder="30"
                    type="number"
                    value={urlItem.validity}
                    onChange={(e) => handleInputChange(urlItem.id, 'validity', e.target.value)}
                    error={!!urlItem.error && urlItem.error.includes('Validity')}
                    helperText={urlItem.error && urlItem.error.includes('Validity') ? urlItem.error : 'Leave empty for default (30 minutes)'}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode"
                    placeholder="mycode123"
                    value={urlItem.shortcode}
                    onChange={(e) => handleInputChange(urlItem.id, 'shortcode', e.target.value)}
                    error={!!urlItem.error && urlItem.error.includes('Shortcode')}
                    helperText={urlItem.error && urlItem.error.includes('Shortcode') ? urlItem.error : 'Optional: 3-10 alphanumeric characters'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      onClick={() => handleShortenUrl(urlItem)}
                      disabled={urlItem.loading || !urlItem.url}
                      startIcon={urlItem.loading ? <CircularProgress size={20} /> : <LinkIcon />}
                    >
                      {urlItem.loading ? 'Shortening...' : 'Shorten URL'}
                    </Button>

                    {urls.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemoveUrl(urlItem.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Grid>

                {urlItem.error && !urlItem.error.includes('URL') && !urlItem.error.includes('Validity') && !urlItem.error.includes('Shortcode') && (
                  <Grid item xs={12}>
                    <Alert severity="error">{urlItem.error}</Alert>
                  </Grid>
                )}

                {urlItem.result && (
                  <Grid item xs={12}>
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Short URL Created Successfully!
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {urlItem.result.shortLink}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => copyToClipboard(urlItem.result.shortLink)}
                          startIcon={<ContentCopy />}
                        >
                          Copy
                        </Button>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Expires: {new Date(urlItem.result.expiry).toLocaleString()}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}

        {urls.length < 5 && (
          <Button
            variant="outlined"
            onClick={handleAddUrl}
            sx={{ mt: 2 }}
          >
            Add Another URL ({urls.length}/5)
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default UrlShortener;