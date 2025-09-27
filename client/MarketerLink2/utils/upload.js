import axios from "axios";

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "Marketlink");

  try {
    const res = await axios.post(
     "https://api.cloudinary.com/v1_1/djhamxmxv/image/upload", data);

     const { secure_url } = res.data;
  return secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
};


export default upload;