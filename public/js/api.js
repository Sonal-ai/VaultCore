/**
 * VaultCore — API Client
 * Handles all communication with the backend REST API.
 */

const API = (() => {
    const BASE = '/api';

    async function request(method, path, body = null) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        };

        const token = localStorage.getItem('vc_token');
        if (token) {
            opts.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            opts.body = JSON.stringify(body);
        }

        const res = await fetch(`${BASE}${path}`, opts);
        const data = await res.json();

        if (!res.ok) {
            const err = new Error(data.message || 'Request failed');
            err.status = res.status;
            err.data = data;
            throw err;
        }

        return data;
    }

    return {
        // Auth
        register: (name, email, password) =>
            request('POST', '/auth/register', { name, email, password }),

        login: (email, password) =>
            request('POST', '/auth/login', { email, password }),

        logout: () =>
            request('POST', '/auth/logout'),

        // Accounts
        getAccounts: () =>
            request('GET', '/accounts'),

        createAccount: () =>
            request('POST', '/accounts'),

        getBalance: (accountId) =>
            request('GET', `/accounts/balance/${accountId}`),

        // Transactions
        createTransaction: (fromAccount, toAccount, amount, idempotencyKey) =>
            request('POST', '/transaction', { fromAccount, toAccount, amount, idempotencyKey }),
    };
})();
