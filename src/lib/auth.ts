// Authentication utility functions

const AUTH_KEY = 'isAuthenticated';

export const isAuthenticated = (): boolean => {
  try {
    const authStatus = sessionStorage.getItem(AUTH_KEY);
    return authStatus === 'true';
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const setAuthenticated = (status: boolean): void => {
  try {
    sessionStorage.setItem(AUTH_KEY, status.toString());
  } catch (error) {
    console.error('Error setting authentication:', error);
  }
};

export const logout = (): void => {
  try {
    sessionStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
