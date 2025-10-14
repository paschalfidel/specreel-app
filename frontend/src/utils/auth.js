import { jwtDecode } from 'jwt-decode';

export function setToken(token) {
  localStorage.setItem('specreel_token', token);
  console.log('Token saved to localStorage');
}

export function getToken() {
  const token = localStorage.getItem('specreel_token');
  console.log('Retrieved token from localStorage:', token ? 'Yes' : 'No');
  return token;
}

export function removeToken() {
  localStorage.removeItem('specreel_token');
  console.log('Token removed from localStorage');
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) {
    console.log('No token found');
    return null;
  }
  try {
    const decoded = jwtDecode(token);
    console.log('Decoded user from token:', decoded);
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    removeToken();
    return null;
  }
}

export function isTokenExpired() {
  const user = getUserFromToken();
  if (!user || !user.exp) return true;
  const isExpired = Date.now() >= user.exp * 1000;
  console.log('Token expired:', isExpired);
  return isExpired;
}