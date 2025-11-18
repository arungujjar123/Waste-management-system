import axios from "./axiosInstance";

export const loginUser = async (data) => {
  const res = await axios.post("/auth/login", data);
  return res.data; // server should return token + user info
};

export const registerUser = async (data) => {
  const res = await axios.post("/auth/signup", data);
  return res.data; // server should return token + user info
};
