const UrlService = require('../services/UrlService');
const Logger = require('../Logger');

class UrlController {
  constructor() {
    this.urlService = new UrlService();
    this.logger = new Logger();
  }

  async createShortUrl(req, res) {
    try {
      await this.logger.info('backend', 'controller', 'Received request to create short URL');

      const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const result = await this.urlService.createShortUrl(req.body, clientIp);

      await this.logger.info('backend', 'controller', 'Short URL created successfully');
      
      res.status(201).json(result);

    } catch (error) {
      await this.logger.error('backend', 'controller', `Create short URL failed: ${error.message}`);
      
      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async redirectToOriginal(req, res) {
    try {
      const { shortcode } = req.params;
      const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const referrer = req.get('Referrer') || req.get('Referer');

      await this.logger.debug('backend', 'controller', `Processing redirect for shortcode: ${shortcode}`);

      const originalUrl = await this.urlService.redirectToOriginal(shortcode, clientIp, referrer);
      
      await this.logger.info('backend', 'controller', `Redirecting user to: ${originalUrl}`);
      res.redirect(originalUrl);

    } catch (error) {
      await this.logger.error('backend', 'controller', `Redirect failed: ${error.message}`);
      
      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const { shortcode } = req.params;
      
      await this.logger.debug('backend', 'controller', `Getting statistics for: ${shortcode}`);

      const stats = await this.urlService.getUrlStatistics(shortcode);
      
      await this.logger.info('backend', 'controller', `Statistics retrieved for: ${shortcode}`);
      res.status(200).json(stats);

    } catch (error) {
      await this.logger.error('backend', 'controller', `Get statistics failed: ${error.message}`);
      
      const statusCode = this.getErrorStatusCode(error.message);
      res.status(statusCode).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  getErrorStatusCode(errorMessage) {
    if (errorMessage.includes('not found')) return 404;
    if (errorMessage.includes('expired')) return 410;
    if (errorMessage.includes('already exists')) return 409;
    if (errorMessage.includes('invalid') || errorMessage.includes('valid')) return 400;
    return 500;
  }
}

module.exports = UrlController;