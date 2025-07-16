const mongoose = require('mongoose');
const Logger = require('../Logger');
class DatabaseConnection {
  constructor() {
    this.logger = new Logger();
    this.isConnected = false;
  }
  async connect() {
    try {
      await this.logger.info('backend', 'db', 'Attempting to connect to MongoDB');
      
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener';
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      this.isConnected = true;
      await this.logger.info('backend', 'db', 'Successfully connected to MongoDB database');
      mongoose.connection.on('error', async (error) => {
        await this.logger.error('backend', 'db', `MongoDB connection error: ${error.message}`);
      });
      mongoose.connection.on('disconnected', async () => {
        await this.logger.warn('backend', 'db', 'MongoDB connection lost');
        this.isConnected = false;
      });
    } catch (error) {
      await this.logger.fatal('backend', 'db', `Failed to connect to database: ${error.message}`);
      throw error;
    }
  }
  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        await this.logger.info('backend', 'db', 'Database connection closed');
        this.isConnected = false;
      }
    } catch (error) {
      await this.logger.error('backend', 'db', `Error closing database connection: ${error.message}`);
    }
  }
  getConnectionStatus() {
    return this.isConnected;
  }
}
module.exports = DatabaseConnection;