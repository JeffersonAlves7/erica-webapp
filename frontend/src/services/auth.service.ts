import api from "./api";
import { tokenService } from "./token.service";

class AuthService {
  async login(username: string, password: string) {
    return api.post("/auth/login", { username, password }).then((response) => {
      if (response.data.access_token) {
        tokenService.updateLocalAccessToken(response.data.access_token);
      }
      return response.data;
    });
  }

  async logout() {
    return api.post("/auth/logout").then((response) => {
      tokenService.removeLocalAccessToken();
      tokenService.removeLocalRefreshToken();
      return response.data;
    });
  }

  async register(username: string, email: string, password: string){
    return api
      .post("/auth/register", { username, email, password })
      .then((response) => {
        return response.data;
      });
  }
}

export const authService = new AuthService();