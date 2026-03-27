const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const DEFAULT_API_ORIGIN = 'http://localhost:5000';
const API_ORIGIN = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_ORIGIN);

export const API_BASE_URL = `${API_ORIGIN}/api`;
export const AUTH_API_BASE_URL = `${API_BASE_URL}/auth`;
export const PORTFOLIO_API_BASE_URL = `${API_BASE_URL}/portfolio`;
export const AUTH_GITHUB_URL = `${AUTH_API_BASE_URL}/github`;
