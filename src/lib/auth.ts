const AUTH_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user'
};

export const authStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getAccessToken();
  }
};