const assert = require('assert');

// Set dummy environment variables for testing
process.env.SECRET = 'test_secret';
process.env.GITHUB_TOKEN = 'test_token';

try {
  require('../index.js');
  console.log('Server test passed.');
} catch (error) {
  assert.fail('Server failed to start:', error);
}
// The server will keep running, so we need to exit the process
process.exit(0);