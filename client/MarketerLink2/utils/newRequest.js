import axios from "axios";

const newRequest = axios.create({
  baseURL: "https://marketerlinkmarketerlink-backend.onrender.com/api",
  withCredentials: false,
});

export default newRequest;