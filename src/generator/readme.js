function getReadme(brief, task) {
  return `# ${task}

## Summary

This project is a web application generated to solve the following brief: "${brief}".

## Setup

To set up the project, simply open the \`index.html\` file in your web browser.

## Usage

[Add usage instructions here, for example: "Navigate to the deployed GitHub Pages URL. The application will display the captcha image and the solved text."]

## Code Explanation

The application consists of a single HTML file that fetches a captcha image, sends it to a solving service (simulated in this case), and displays the result.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
`;
}

module.exports = getReadme;