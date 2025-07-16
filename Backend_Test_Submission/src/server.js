require('dotenv').config();
const UrlShortenerApp = require('./app');
const PORT = process.env.PORT || 3001;
const app = new UrlShortenerApp();
app.start(PORT);