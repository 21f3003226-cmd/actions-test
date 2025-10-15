function getHtml(brief, attachments) {
  // Find the sample image from attachments, or use a placeholder
  const sampleImage = attachments.find(att => att.name === 'sample.png');
  const defaultImageUrl = sampleImage ? sampleImage.url : 'https://via.placeholder.com/150';

  // Mock captcha solver
  function solveCaptcha(imageUrl) {
    // In a real application, this would involve a call to a captcha solving service.
    // For this example, we'll return a mock solution based on the image URL.
    if (imageUrl.includes('sample.png')) {
      return 'mock-solution-for-sample';
    }
    return 'mock-solution';
  }

  const solvedText = solveCaptcha(defaultImageUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Captcha Solver</title>
  <style>
    body { font-family: sans-serif; text-align: center; }
    img { border: 1px solid #ccc; margin: 20px; }
    #solution { font-weight: bold; }
  </style>
</head>
<body>
  <h1>Captcha Solver</h1>
  <p>Brief: ${brief}</p>
  <img id="captcha-image" src="" alt="Captcha Image">
  <p>Solved Text: <span id="solution">Loading...</span></p>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const imageUrl = urlParams.get('url') || '${defaultImageUrl}';
      document.getElementById('captcha-image').src = imageUrl;

      // Simulate solving the captcha
      setTimeout(() => {
        document.getElementById('solution').textContent = '${solvedText}';
      }, 5000); // Simulate a 5-second delay
    });
  </script>
</body>
</html>`;
}

module.exports = getHtml;