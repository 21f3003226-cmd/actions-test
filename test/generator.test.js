const assert = require('assert');
const generateApp = require('../src/generator');

const mockRequest = {
  email: 'student@example.com',
  secret: '...',
  task: 'captcha-solver-test',
  round: 1,
  nonce: 'ab12-...',
  brief: 'Create a captcha solver that handles ?url=https://.../image.png. Default to attached sample.',
  checks: [],
  evaluation_url: 'https://example.com/notify',
  attachments: [{ name: 'sample.png', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }]
};

const files = generateApp(mockRequest);

assert.strictEqual(files.length, 4, 'Should generate 4 files');
assert.ok(files.find(f => f.name === 'LICENSE'), 'Should include LICENSE');
assert.ok(files.find(f => f.name === 'README.md'), 'Should include README.md');
assert.ok(files.find(f => f.name === 'index.html'), 'Should include index.html');
assert.ok(files.find(f => f.name === 'sample.png'), 'Should include sample.png');

console.log('Generator test passed.');