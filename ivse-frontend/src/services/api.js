import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});


// ============================================================
// ADICIONAR TOKEN JWT AUTOMATICAMENTE
// ============================================================

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem('ivse_token');


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    return config;

  },

  (error) => {

    return Promise.reject(error);

  }
);


// ============================================================
// TRATAR TOKEN EXPIRADO / INVÁLIDO
// ============================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {

    if (
      error.response?.status === 401
    ) {

      localStorage.removeItem(
        'ivse_token'
      );

      localStorage.removeItem(
        'ivse_usuario'
      );

    }


    return Promise.reject(error);

  }
);


export default api;