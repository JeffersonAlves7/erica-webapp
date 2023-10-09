import axios from "axios";
import { tokenService } from "./token.service";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {
    const token = tokenService.getLocalAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (originalConfig.url !== "/auth/login" && err.response) {
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          const rs = await axios.post(
            "/auth/refresh",
            {
              refresh_token: tokenService.getLocalRefreshToken()
            },
            {
              baseURL: "http://localhost:3000/api",
              headers: {
                "Content-Type": "application/json"
              },
              withCredentials: true
            }
          );

          const { access_token } = rs.data;
          tokenService.updateLocalAccessToken(access_token);
          return api(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }
  }
);

export default api;