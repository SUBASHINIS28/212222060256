import axios from 'axios';

class Logger {
  constructor() {
    this.baseURL = 'http://20.244.56.144/evaluation-service';
    this.accessToken = process.env.REACT_APP_ACCESS_TOKEN;
    this.tokenType = process.env.REACT_APP_TOKEN_TYPE || 'Bearer';
    
    this.validStacks = ['backend', 'frontend'];
    this.validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    this.validPackages = {
      frontend: ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils']
    };
  }

  validateInputs(stack, level, packageName) {
    if (!this.validStacks.includes(stack)) {
      throw new Error(`Invalid stack: ${stack}`);
    }
    
    if (!this.validLevels.includes(level)) {
      throw new Error(`Invalid level: ${level}`);
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
        console.log(`[${new Date().toISOString()}] Log sent:`, response.data);
        return response.data;
      }
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Logging failed:`, error.message);
    }
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

  debug(stack, packageName, message) {
    return this.log(stack, 'debug', packageName, message);
  }

  fatal(stack, packageName, message) {
    return this.log(stack, 'fatal', packageName, message);
  }
}

export default Logger;