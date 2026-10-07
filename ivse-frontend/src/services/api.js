import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // O endereço do nosso backend Node.js
  timeout: 10000,
});

export default api;