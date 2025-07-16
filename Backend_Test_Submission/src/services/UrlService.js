const shortid = require('shortid');
const validator = require('validator');
const geoip = require('geoip-lite');
const UrlModel = require('../models/UrlModel');
const Logger = require('../Logger');
class UrlService {
  constructor() {
    this.logger = new Logger();
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    this.defaultValidity = parseInt(process.env.DEFAULT_VALIDITY_MINUTES) || 30;
  }
  async createShortUrl(urlData, clientIp) {
    try {
      await this.logger.info('backend', 'service', 'Starting URL shortening process');
      const { url, validity, shortcode } = urlData;
      if (!url || !validator.isURL(url)) {
        await this.logger.error('backend', 'handler', 'Invalid URL format provided by user');
        throw new Error('Please provide a valid URL');
      }
      const validityMinutes = validity || this.defaultValidity;
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + validityMinutes);
      let finalShortcode;
      if (shortcode) {
        await this.logger.debug('backend', 'service', 'User provided custom shortcode');  
        if (!this.isValidShortcode(shortcode)) {
          await this.logger.error('backend', 'handler', 'Custom shortcode contains invalid characters');
          throw new Error('Shortcode must be alphanumeric and 3-10 characters long');
        }
        const existingUrl = await UrlModel.findOne({ shortcode });
        if (existingUrl) {
          await this.logger.warn('backend', 'service', 'Requested shortcode already exists');
          throw new Error('Shortcode already exists, please choose another');
        }
        finalShortcode = shortcode;
      } else {
        finalShortcode = await this.generateUniqueShortcode();
        await this.logger.debug('backend', 'service', 'Generated automatic shortcode');
      }
      const newUrl = new UrlModel({
        originalUrl: url,
        shortcode: finalShortcode,
        expiresAt: expirationTime,
        validityMinutes: validityMinutes
      });
      await newUrl.save();
      await this.logger.info('backend', 'service', `Short URL created successfully with code: ${finalShortcode}`);

      return {
        shortLink: `${this.baseUrl}/${finalShortcode}`,
        expiry: expirationTime.toISOString()
      };

    } catch (error) {
      await this.logger.error('backend', 'service', `URL creation failed: ${error.message}`);
      throw error;
    }
  }

  async redirectToOriginal(shortcode, clientIp, referrer) {
    try {
      await this.logger.debug('backend', 'service', `Processing redirect request for: ${shortcode}`);

      const urlRecord = await UrlModel.findOne({ shortcode });
      
      if (!urlRecord) {
        await this.logger.warn('backend', 'service', `Shortcode not found: ${shortcode}`);
        throw new Error('Short URL not found');
      }

      if (urlRecord.isExpired()) {
        await this.logger.warn('backend', 'service', `Expired shortcode accessed: ${shortcode}`);
        throw new Error('Short URL has expired');
      }

      const locationData = this.getLocationFromIp(clientIp);
      
      const clickData = {
        timestamp: new Date(),
        referrer: referrer || 'direct',
        ipAddress: clientIp,
        location: locationData
      };

      await urlRecord.addClick(clickData);
      await this.logger.info('backend', 'service', `Successful redirect for ${shortcode} to ${urlRecord.originalUrl}`);

      return urlRecord.originalUrl;

    } catch (error) {
      await this.logger.error('backend', 'service', `Redirect failed for ${shortcode}: ${error.message}`);
      throw error;
    }
  }

  async getUrlStatistics(shortcode) {
    try {
      await this.logger.debug('backend', 'service', `Retrieving statistics for: ${shortcode}`);

      const urlRecord = await UrlModel.findOne({ shortcode });
      
      if (!urlRecord) {
        await this.logger.warn('backend', 'service', `Statistics requested for non-existent shortcode: ${shortcode}`);
        throw new Error('Short URL not found');
      }

      const stats = {
        shortcode: urlRecord.shortcode,
        originalUrl: urlRecord.originalUrl,
        createdAt: urlRecord.createdAt.toISOString(),
        expiresAt: urlRecord.expiresAt.toISOString(),
        totalClicks: urlRecord.totalClicks,
        isExpired: urlRecord.isExpired(),
        validityMinutes: urlRecord.validityMinutes,
        clicks: urlRecord.clicks.map(click => ({
          timestamp: click.timestamp.toISOString(),
          referrer: click.referrer,
          location: click.location
        }))
      };

      await this.logger.info('backend', 'service', `Statistics retrieved successfully for: ${shortcode}`);
      return stats;

    } catch (error) {
      await this.logger.error('backend', 'service', `Failed to get statistics for ${shortcode}: ${error.message}`);
      throw error;
    }
  }

  async generateUniqueShortcode() {
    let shortcode;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      shortcode = shortid.generate().substring(0, 6);
      attempts++;
      
      const existing = await UrlModel.findOne({ shortcode });
      if (!existing) break;

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique shortcode');
      }
    } while (attempts < maxAttempts);

    return shortcode;
  }

  isValidShortcode(shortcode) {
    const pattern = /^[a-zA-Z0-9]{3,10}$/;
    return pattern.test(shortcode);
  }

  getLocationFromIp(ipAddress) {
    try {
      const geo = geoip.lookup(ipAddress);
      if (geo) {
        return {
          country: geo.country || 'Unknown',
          region: geo.region || 'Unknown',
          city: geo.city || 'Unknown'
        };
      }
    } catch (error) {
      // Silently handle geo lookup errors
    }
    
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown'
    };
  }
}

module.exports = UrlService;