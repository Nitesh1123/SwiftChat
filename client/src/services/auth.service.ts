import api from "@/api/api";

export const loginApi = (payload: { email: string; password: string }) => {
  return api.post("/auth/login", payload);
};

export const registerApi = (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  return api.post("/auth/register", payload);
};

export const logoutApi = () => {
  return api.post("/auth/logout");
};

export const meApi = () => {
    return api.get('auth/me');
}