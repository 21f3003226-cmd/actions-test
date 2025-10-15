require('dotenv').config();
const express = require('express');
const { octokit } = require('./src/github');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Check for required environment variables
if (!SECRET || !GITHUB_TOKEN) {
  console.error('Error: Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

app.post('/api-endpoint', (req, res) => {
  const { secret, task, round, nonce, brief, checks, evaluation_url, attachments } = req.body;

  if (secret !== SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }

  // Generate app files
  const generateApp = require('./src/generator');
  const files = generateApp(req.body);

  // GitHub operations
  const github = require('./src/github');
  const repoName = req.body.task;
  let repoUrl;

  (async () => {
    try {
      const { data: { login: owner } } = await octokit.users.getAuthenticated();
      const repo = await github.createRepo(repoName);
      repoUrl = repo.html_url;

      let lastCommitSha;
      for (const file of files) {
        lastCommitSha = await github.uploadFile(owner, repoName, file.name, file.content);
      }
      const commitSha = lastCommitSha;

      await github.enablePages(owner, repoName);
      console.log('GitHub Pages enabled.');
      const pagesUrl = `https://${owner}.github.io/${repoName}/`;

      // Notify evaluation URL
      const sendNotification = require('./src/notify');
      const notificationPayload = {
        email: req.body.email,
        task: req.body.task,
        round: req.body.round,
        nonce: req.body.nonce,
        repo_url: repoUrl,
        commit_sha: commitSha,
        pages_url: pagesUrl,
      };
      await sendNotification(req.body.evaluation_url, notificationPayload);

      res.status(200).json({ message: 'App deployed and notification sent successfully', repo_url: repoUrl });
    } catch (error) {
      console.error('Error during GitHub operations:', error);
      res.status(500).json({ error: 'Failed to deploy app' });
    }
  })();
});

app.get('/', (req, res) => {
  res.send('App Generator is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});