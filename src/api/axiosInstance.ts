import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

export default api