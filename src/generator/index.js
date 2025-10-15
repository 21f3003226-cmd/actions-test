const getLicense = require('./license');
const getReadme = require('./readme');
const getHtml = require('./html');
const { decodeAttachments } = require('./attachments');

function generateApp(request) {
  const { brief, task, attachments } = request;

  const files = [
    { name: 'LICENSE', content: getLicense() },
    { name: 'README.md', content: getReadme(brief, task) },
    { name: 'index.html', content: getHtml(brief, attachments) },
  ];

  const decodedAttachments = decodeAttachments(attachments);
  decodedAttachments.forEach(att => {
    files.push({ name: att.name, content: att.content }); // Keep content as buffer
  });

  return files;
}

module.exports = generateApp;