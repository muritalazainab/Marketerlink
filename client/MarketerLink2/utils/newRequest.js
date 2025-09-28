import axios from "axios";

const newRequest = axios.create({
  baseURL: "https://marketerlinkmarketerlink-backend.onrender.com",
  withCredentials: true,
});

export default newRequest;