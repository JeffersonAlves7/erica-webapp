import api from "./api";
import { tokenService } from "./token.service";

class AuthService {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });

    if (response?.data.access_token) {
      tokenService.updateLocalAccessToken(response.data.access_token);
      tokenService.updateLocalRefreshToken(response.data.refresh_token);
    }

    return response.data;
  }

  async logout() {
    return api.post("/auth/logout").then((response) => {
      tokenService.removeLocalAccessToken();
      tokenService.removeLocalRefreshToken();
      return response.data;
    });
  }

  async register(username: string, email: string, password: string) {
    return api
      .post("/auth/register", { username, email, password })
      .then((response) => {
        return response.data;
      });
  }

  async profile() {
    return api.get("/auth/profile").then((response) => {
      return response.data;
    });
  }
}

export const authService = new AuthService();
