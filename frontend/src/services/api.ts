import axios from "axios";
import { tokenService } from "./tokenService";

const BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api";

export const apiWithoutInterceptor = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

apiWithoutInterceptor.interceptors.request.use(
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

const api = axios.create({
  baseURL: BASE_URL,
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
              baseURL: BASE_URL,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          const { access_token } = rs.data;
          tokenService.updateLocalAccessToken(access_token);
          return api(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      } else {
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export async function refreshToken() {
  const rs = await axios.post(
    "/auth/refresh",
    {
      refresh_token: tokenService.getLocalRefreshToken()
    },
    {
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  const { access_token } = rs.data;
  tokenService.updateLocalAccessToken(access_token);
}

export const handleError401 = (err: any): void => {
  try {
    if (err?.response?.status === 401) {
      tokenService.removeLocalAccessToken();
      tokenService.removeLocalRefreshToken();
      window.location.reload();
    }
  } catch {}
};

export default api;
