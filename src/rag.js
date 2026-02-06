const fs = require('fs');
const path = require('path');

const bookPath = path.join(__dirname, '..', 'typescript-book.txt');
const bookContent = fs.readFileSync(bookPath, 'utf-8');

function search(query) {
  const fileContents = bookContent.split('\n---file-separator---\n');
  let bestMatch = {
    paragraph: '',
    score: 0
  };

  const queryWords = query.toLowerCase().split(' ');

  for (const content of fileContents) {
    const paragraphs = content.split('\n\n');
    for (const paragraph of paragraphs) {
      const lowerCaseParagraph = paragraph.toLowerCase();
      let score = 0;
      for (const word of queryWords) {
        if (lowerCaseParagraph.includes(word)) {
          score++;
        }
      }

      if (score > bestMatch.score) {
        bestMatch = {
          paragraph,
          score
        };
      }
    }
  }

  if (bestMatch.score > 0) {
    return bestMatch.paragraph;
  }

  return 'No answer found.';
}

module.exports = {
  search
};