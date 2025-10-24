// Authentication utility functions

const AUTH_KEY = 'isAuthenticated';

export const isAuthenticated = (): boolean => {
  try {
    const authStatus = localStorage.getItem(AUTH_KEY);
    return authStatus === 'true';
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const setAuthenticated = (status: boolean): void => {
  try {
    localStorage.setItem(AUTH_KEY, status.toString());
  } catch (error) {
    console.error('Error setting authentication:', error);
  }
};

export const logout = (): void => {
  try {
    localStorage.removeItem(AUTH_KEY);
    // Optionally clear other user data
    // localStorage.clear();
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
