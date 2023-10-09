interface TokenServiceInterface {
  getLocalAccessToken(): string | null;
  getLocalRefreshToken(): string | null;

  updateLocalAccessToken(token: string): void;
  updateLocalRefreshToken(token: string): void;

  removeLocalAccessToken(): void;
  removeLocalRefreshToken(): void;
}

class TokenService implements TokenServiceInterface {
  getLocalAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  getLocalRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  updateLocalAccessToken(token: string): void {
    localStorage.setItem("access_token", token);
  }

  updateLocalRefreshToken(token: string): void {
    localStorage.setItem("refresh_token", token);
  }

  removeLocalAccessToken(): void {
    localStorage.removeItem("access_token");
  }

  removeLocalRefreshToken(): void {
    localStorage.removeItem("refresh_token");
  }
}

export const tokenService = new TokenService();
