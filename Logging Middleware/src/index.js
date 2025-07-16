const Logger = require('./Logger');
class AppDemo {
  constructor() {
    this.logger = new Logger();
  }
  async runDemo() {
    console.log('Testing our logging system...');  
    try {
      console.log('\n1. Testing app startup log...');
      await this.logger.info('backend', 'handler', 'Server started on port 5000'); 
      console.log('\n2. Testing database connection...');
      await this.logger.debug('backend', 'db', 'Connected to MongoDB successfully');
      console.log('\n3. Testing warning message...');
      await this.logger.warn('backend', 'cache', 'Memory usage is getting high - 85% used');
      console.log('\n4. Testing error scenario...');
      await this.logger.error('backend', 'handler', 'User provided invalid email format');
      console.log('\n5. Testing critical failure...');
      await this.logger.fatal('backend', 'db', 'Database connection lost - shutting down');
      console.log('\n Logs sent successfully!');  
    } catch (err) {
      console.error('Something error:', err.message);
    }
  }
}
if (require.main === module) {
  const demo = new AppDemo();
  demo.runDemo();
}
module.exports = AppDemo;