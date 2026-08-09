import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  console.log("FILE:", file);
  console.log("FORM DATA:", formData.get("image"));

  const response = await api.post("/api/upload", formData ,{
    headers:{"Content-Type":"multipart/form-data"}
  });
  return response.data;
};

export default api;
