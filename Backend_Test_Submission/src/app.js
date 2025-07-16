const express = require('express');
const cors = require('cors');
const urlRoutes = require('./routes/urlRoutes');
const DatabaseConnection = require('./config/database');
const Logger = require('./Logger');

class UrlShortenerApp {
  constructor() {
    this.app = express();
    this.logger = new Logger();
    this.database = new DatabaseConnection();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      next();
    });
  }

  setupRoutes() {
    this.app.get('/health', async (req, res) => {
      await this.logger.info('backend', 'route', 'Health check endpoint accessed');
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: this.database.getConnectionStatus() ? 'connected' : 'disconnected'
      });
    });

    this.app.use('/', urlRoutes);
  }

  setupErrorHandling() {
    this.app.use('*', async (req, res) => {
      await this.logger.warn('backend', 'route', `Route not found: ${req.originalUrl}`);
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });

    this.app.use(async (error, req, res, next) => {
      await this.logger.fatal('backend', 'middleware', `Unhandled error: ${error.message}`);
      res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });
  }

  async start(port) {
    try {
      await this.database.connect();
      
      this.app.listen(port, async () => {
        await this.logger.info('backend', 'handler', `URL Shortener service started on port ${port}`);
        console.log(`🚀 URL Shortener running on http://localhost:${port}`);
        console.log(`📊 Health check: http://localhost:${port}/health`);
      });

    } catch (error) {
      await this.logger.fatal('backend', 'handler', `Failed to start server: ${error.message}`);
      process.exit(1);
    }
  }
}

module.exports = UrlShortenerApp;