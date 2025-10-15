const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function createRepo(name) {
  console.log(`Creating repository: ${name}`);
  const response = await octokit.repos.createForAuthenticatedUser({
    name,
    private: false,
  });
  return response.data;
}

async function uploadFile(owner, repo, path, content) {
  console.log(`Uploading file to ${owner}/${repo}/${path}`);
  const contentEncoded = Buffer.isBuffer(content) ? content.toString('base64') : Buffer.from(content).toString('base64');
  const response = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `feat: Add ${path}`,
    content: contentEncoded,
  });
  return response.data.commit.sha;
}

async function enablePages(owner, repo) {
  console.log(`Enabling GitHub Pages for ${owner}/${repo}`);
  await octokit.repos.createPagesSite({
    owner,
    repo,
    source: {
      branch: 'main',
      path: '/',
    },
  });
}

async function getRepo(owner, repo) {
    return await octokit.repos.get({
        owner,
        repo,
    });
}

module.exports = { createRepo, uploadFile, enablePages, getRepo, octokit };