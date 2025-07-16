const Logger = require('../src/Logger');

describe('Our Logging System', () => {
  let myLogger;

  beforeEach(() => {
    myLogger = new Logger();
  });

  test('should reject invalid stack names', () => {
    expect(() => {
      myLogger.validateInputs('mobile', 'info', 'handler');
    }).toThrow();
  });

  test('should reject invalid log levels', () => {
    expect(() => {
      myLogger.validateInputs('backend', 'critical', 'handler');
    }).toThrow();
  });

  test('should not allow frontend packages in backend', () => {
    expect(() => {
      myLogger.validateInputs('backend', 'info', 'component');
    }).toThrow();
  });

  test('should not allow backend packages in frontend', () => {
    expect(() => {
      myLogger.validateInputs('frontend', 'info', 'controller');
    }).toThrow();
  });

  test('should accept correct backend combinations', () => {
    expect(() => {
      myLogger.validateInputs('backend', 'error', 'handler');
    }).not.toThrow();
  });

  test('should accept correct frontend combinations', () => {
    expect(() => {
      myLogger.validateInputs('frontend', 'warn', 'component');
    }).not.toThrow();
  });

  test('should allow shared packages everywhere', () => {
    expect(() => {
      myLogger.validateInputs('backend', 'info', 'auth');
    }).not.toThrow();
    
    expect(() => {
      myLogger.validateInputs('frontend', 'debug', 'utils');
    }).not.toThrow();
  });

  test('logger should have all required methods', () => {
    expect(myLogger.debug).toBeDefined();
    expect(myLogger.info).toBeDefined();
    expect(myLogger.warn).toBeDefined();
    expect(myLogger.error).toBeDefined();
    expect(myLogger.fatal).toBeDefined();
  });
});