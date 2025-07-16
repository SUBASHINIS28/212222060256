import axios from 'axios';
import Logger from '../Logger';

class UrlApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
    this.logger = new Logger();
  }

  async createShortUrl(urlData) {
    try {
      await this.logger.info('frontend', 'api', 'Starting URL shortening request');
      
      const response = await axios.post(`${this.baseURL}/shorturls`, urlData);
      
      await this.logger.info('frontend', 'api', 'URL shortened successfully');
      return response.data;
      
    } catch (error) {
      await this.logger.error('frontend', 'api', `URL shortening failed: ${error.message}`);
      throw error;
    }
  }

  async getUrlStatistics(shortcode) {
    try {
      await this.logger.info('frontend', 'api', `Fetching statistics for: ${shortcode}`);
      
      const response = await axios.get(`${this.baseURL}/shorturls/${shortcode}`);
      
      await this.logger.info('frontend', 'api', 'Statistics retrieved successfully');
      return response.data;
      
    } catch (error) {
      await this.logger.error('frontend', 'api', `Failed to get statistics: ${error.message}`);
      throw error;
    }
  }
}

const urlService = new UrlApiService();
export default urlService;