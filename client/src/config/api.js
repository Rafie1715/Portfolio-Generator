const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const ensureOriginProtocol = (value = '') => {
	const raw = String(value || '').trim();
	if (!raw) return '';
	if (/^https?:\/\//i.test(raw)) return raw;

	const withoutLeadingSlash = raw.replace(/^\/+/, '');
	if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(withoutLeadingSlash)) {
		return `http://${withoutLeadingSlash}`;
	}

	return `https://${withoutLeadingSlash}`;
};

const DEFAULT_API_ORIGIN = 'http://localhost:5000';
const configuredApiOrigin = ensureOriginProtocol(import.meta.env.VITE_API_BASE_URL);
const API_ORIGIN = trimTrailingSlash(configuredApiOrigin || DEFAULT_API_ORIGIN);

export const API_BASE_URL = `${API_ORIGIN}/api`;
export const AUTH_API_BASE_URL = `${API_BASE_URL}/auth`;
export const PORTFOLIO_API_BASE_URL = `${API_BASE_URL}/portfolio`;
export const AUTH_GITHUB_URL = `${AUTH_API_BASE_URL}/github`;
