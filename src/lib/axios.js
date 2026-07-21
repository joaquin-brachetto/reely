import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

// Cliente base configurado con credentials para que mantenga la sesión con las cookies HttpOnly
export const apiClient = axios.create({
    baseURL,
    withCredentials: true,
});

// Interceptor genérico para manejo de respuestas (opcional pero recomendado)
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        return Promise.reject(error);
    }
);
