const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:8000';

describe('RAG API', () => {
  it('should return "fat arrow" for the query "What does the author affectionately call the => syntax?"', async () => {
    const response = await axios.get(`${API_URL}/search?q=What does the author affectionately call the => syntax?`);
    assert(response.data.answer.toLowerCase().includes('fat arrow'));
  });

  it('should return "!!" for the query "Which operator converts any value into an explicit boolean?"', async () => {
    const response = await axios.get(`${API_URL}/search?q=Which operator converts any value into an explicit boolean?`);
    assert(response.data.answer.includes('!!'));
  });
});