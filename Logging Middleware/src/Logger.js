const axios = require('axios');
require('dotenv').config();
class Logger {
  constructor() {
    this.baseURL = 'http://20.244.56.144/evaluation-service';
    this.accessToken = process.env.ACCESS_TOKEN;
    this.tokenType = process.env.TOKEN_TYPE || 'Bearer';
    
    this.validStacks = ['backend', 'frontend'];
    this.validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    this.validPackages = {
      backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service', 'auth', 'config', 'middleware', 'utils'],
      frontend: ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils'],
      both: ['auth', 'config', 'middleware', 'utils']
    };
  }
  validateInputs(stack, level, packageName) {
    if (!this.validStacks.includes(stack)) {
      throw new Error(`Invalid stack: ${stack}. Must be one of: ${this.validStacks.join(', ')}`);
    } 
    if (!this.validLevels.includes(level)) {
      throw new Error(`Invalid level: ${level}. Must be one of: ${this.validLevels.join(', ')}`);
    }  
    const allValidPackages = [...this.validPackages.backend, ...this.validPackages.frontend];
    const uniquePackages = [...new Set(allValidPackages)];   
    if (!uniquePackages.includes(packageName)) {
      throw new Error(`Invalid package: ${packageName}. Must be one of valid packages for ${stack}`);
    } 
    if (stack === 'backend' && !this.validPackages.backend.includes(packageName)) {
      throw new Error(`Package ${packageName} not allowed for backend stack`);
    } 
    if (stack === 'frontend' && !this.validPackages.frontend.includes(packageName)) {
      throw new Error(`Package ${packageName} not allowed for frontend stack`);
    }
  }
  async log(stack, level, packageName, message) {
    try {
      this.validateInputs(stack, level, packageName);  
      const logData = {
        stack: stack.toLowerCase(),
        level: level.toLowerCase(),
        package: packageName.toLowerCase(),
        message: message
      };  
      const response = await axios.post(
        `${this.baseURL}/logs`,
        logData,
        {
          headers: {
            'Authorization': `${this.tokenType} ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );  
      if (response.status === 200) {
        console.log(`[${new Date().toISOString()}] Log sent successfully:`, response.data);
        return response.data;
      }  
    } catch (error) {
      if (error.response) {
        console.error(`[${new Date().toISOString()}] API Error:`, error.response.data);
        throw new Error(`Failed to send log: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error(`[${new Date().toISOString()}] Network Error:`, error.message);
        throw new Error('Network error: Unable to reach logging service');
      } else {
        console.error(`[${new Date().toISOString()}] Error:`, error.message);
        throw error;
      }
    }
  }
  debug(stack, packageName, message) {
    return this.log(stack, 'debug', packageName, message);
  }
  info(stack, packageName, message) {
    return this.log(stack, 'info', packageName, message);
  }
  warn(stack, packageName, message) {
    return this.log(stack, 'warn', packageName, message);
  }
  error(stack, packageName, message) {
    return this.log(stack, 'error', packageName, message);
  }
  fatal(stack, packageName, message) {
    return this.log(stack, 'fatal', packageName, message);
  }
}
module.exports = Logger;