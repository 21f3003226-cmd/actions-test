function decodeAttachment(attachment) {
  const { name, url } = attachment;
  const base64Data = url.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  return { name, content: buffer };
}

function decodeAttachments(attachments) {
  return attachments.map(decodeAttachment);
}

module.exports = { decodeAttachments };