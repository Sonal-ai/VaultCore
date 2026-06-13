/**
 * VaultCore — SPA Router & Application State
 * Client-side routing and state management for the banking dashboard.
 */

const App = (() => {
    // ── State ──
    let state = {
        user: null,
        token: null,
        accounts: [],
        selectedAccount: null,
        selectedBalance: null,
        transactions: [],
        currentPage: 'landing',
        loading: false,
    };

    const contentEl = () => document.getElementById('app-content');
    const navEl = () => document.getElementById('app-nav');

    // ── Initialization ──
    function init() {
        const token = localStorage.getItem('vc_token');
        const userStr = localStorage.getItem('vc_user');

        if (token && userStr) {
            try {
                state.token = token;
                state.user = JSON.parse(userStr);
                navigate('dashboard');
            } catch (e) {
                clearAuth();
                navigate('landing');
            }
        } else {
            navigate('landing');
        }
    }

    // ── Auth Helpers ──
    function setAuth(user, token) {
        state.user = user;
        state.token = token;
        localStorage.setItem('vc_token', token);
        localStorage.setItem('vc_user', JSON.stringify(user));
    }

    function clearAuth() {
        state.user = null;
        state.token = null;
        state.accounts = [];
        state.selectedAccount = null;
        state.selectedBalance = null;
        state.transactions = [];
        localStorage.removeItem('vc_token');
        localStorage.removeItem('vc_user');
    }

    function isLoggedIn() {
        return !!state.token;
    }

    // ── Navigation ──
    function navigate(page) {
        state.currentPage = page;
        renderNav();
        renderPage();
    }

    function renderNav() {
        const loggedIn = isLoggedIn();
        navEl().innerHTML = `
            <div class="navbar-inner">
                <div class="navbar-brand" onclick="App.navigate('${loggedIn ? 'dashboard' : 'landing'}')">
                    <div class="brand-icon">🏛</div>
                    VaultCore
                </div>
                <ul class="navbar-nav">
                    ${loggedIn ? `
                        <li><button class="nav-link ${state.currentPage === 'dashboard' ? 'active' : ''}" 
                            onclick="App.navigate('dashboard')">Dashboard</button></li>
                        <li><button class="nav-link ${state.currentPage === 'accounts' ? 'active' : ''}" 
                            onclick="App.navigate('accounts')">Accounts</button></li>
                        <li><button class="nav-link ${state.currentPage === 'transfer' ? 'active' : ''}" 
                            onclick="App.navigate('transfer')">Transfer</button></li>
                        <li><button class="nav-link ${state.currentPage === 'transactions' ? 'active' : ''}" 
                            onclick="App.navigate('transactions')">History</button></li>
                        <li><button class="nav-link nav-link--danger" 
                            onclick="App.handleLogout()">Sign Out</button></li>
                    ` : `
                        <li><button class="nav-link" onclick="App.navigate('login')">Sign In</button></li>
                        <li><button class="btn btn-primary btn-sm" onclick="App.navigate('register')">Get Started</button></li>
                    `}
                </ul>
            </div>
        `;
    }

    async function renderPage() {
        const el = contentEl();

        switch (state.currentPage) {
            case 'landing':
                el.innerHTML = Components.renderLanding();
                break;

            case 'login':
                el.innerHTML = Components.renderLogin();
                break;

            case 'register':
                el.innerHTML = Components.renderRegister();
                break;

            case 'dashboard':
                if (!isLoggedIn()) return navigate('login');
                el.innerHTML = Components.renderDashboardSkeleton();
                await loadDashboardData();
                el.innerHTML = Components.renderDashboard({
                    user: state.user,
                    accounts: state.accounts,
                    selectedAccount: state.selectedAccount,
                    balance: state.selectedBalance,
                    transactions: state.transactions
                });
                break;

            case 'accounts':
                if (!isLoggedIn()) return navigate('login');
                el.innerHTML = Components.renderLoading();
                await loadAccountsWithBalances();
                el.innerHTML = Components.renderAccounts(state.accounts);
                break;

            case 'transfer':
                if (!isLoggedIn()) return navigate('login');
                await loadAccountsWithBalances();
                el.innerHTML = Components.renderTransfer(state.accounts);
                break;

            case 'transactions':
                if (!isLoggedIn()) return navigate('login');
                el.innerHTML = Components.renderTransactions(state.transactions);
                break;

            default:
                el.innerHTML = Components.renderLanding();
        }
    }

    // ── Data Loading ──
    async function loadDashboardData() {
        try {
            const data = await API.getAccounts();
            state.accounts = data.accounts || [];

            // Load balances for all accounts
            for (const acc of state.accounts) {
                try {
                    const balData = await API.getBalance(acc._id);
                    acc._balance = balData.balance;
                } catch (e) {
                    acc._balance = 0;
                }
            }

            if (state.accounts.length > 0) {
                if (!state.selectedAccount || !state.accounts.find(a => a._id === state.selectedAccount._id)) {
                    state.selectedAccount = state.accounts[0];
                } else {
                    state.selectedAccount = state.accounts.find(a => a._id === state.selectedAccount._id);
                }
                state.selectedBalance = state.selectedAccount._balance || 0;
            }
        } catch (err) {
            if (err.status === 401) {
                clearAuth();
                navigate('login');
                Components.showToast('error', 'Session Expired', 'Please sign in again');
            } else {
                Components.showToast('error', 'Error', err.message);
            }
        }
    }

    async function loadAccountsWithBalances() {
        try {
            const data = await API.getAccounts();
            state.accounts = data.accounts || [];
            for (const acc of state.accounts) {
                try {
                    const balData = await API.getBalance(acc._id);
                    acc._balance = balData.balance;
                } catch (e) {
                    acc._balance = 0;
                }
            }
        } catch (err) {
            if (err.status === 401) {
                clearAuth();
                navigate('login');
            }
        }
    }

    // ── Event Handlers ──
    async function handleLogin(e) {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div> Signing in...';

        try {
            const data = await API.login(email, password);
            setAuth(data.user, data.token);
            Components.showToast('success', 'Welcome back!', `Signed in as ${data.user.name}`);
            navigate('dashboard');
        } catch (err) {
            Components.showToast('error', 'Sign In Failed', err.message);
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const btn = document.getElementById('register-btn');
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div> Creating account...';

        try {
            const data = await API.register(name, email, password);
            setAuth(data.user, data.token);
            Components.showToast('success', 'Account Created!', 'Welcome to VaultCore');
            navigate('dashboard');
        } catch (err) {
            Components.showToast('error', 'Registration Failed', err.message);
            btn.disabled = false;
            btn.textContent = 'Create Account →';
        }
    }

    async function handleLogout() {
        try {
            await API.logout();
        } catch (e) {
            // logout even if API call fails
        }
        clearAuth();
        Components.showToast('info', 'Signed Out', 'You have been signed out successfully');
        navigate('landing');
    }

    async function handleTransfer(e) {
        e.preventDefault();
        const btn = document.getElementById('transfer-btn');
        const fromAccount = document.getElementById('from-account').value;
        const toAccount = document.getElementById('to-account').value.trim();
        const amount = parseFloat(document.getElementById('transfer-amount').value);

        if (!fromAccount || !toAccount || !amount) {
            Components.showToast('error', 'Missing Fields', 'Please fill in all fields');
            return;
        }

        if (fromAccount === toAccount) {
            Components.showToast('error', 'Invalid Transfer', 'Cannot transfer to the same account');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div> Processing...';

        try {
            const idempotencyKey = Components.generateIdempotencyKey();
            const data = await API.createTransaction(fromAccount, toAccount, amount, idempotencyKey);
            Components.showToast('success', 'Transfer Complete!', 
                `${Components.formatCurrency(amount)} sent successfully`);
            navigate('dashboard');
        } catch (err) {
            Components.showToast('error', 'Transfer Failed', err.message);
            btn.disabled = false;
            btn.textContent = 'Send Money →';
        }
    }

    async function createNewAccount() {
        try {
            const data = await API.createAccount();
            Components.showToast('success', 'Account Created', 
                `Account ${Components.shortId(data.account._id)} created successfully`);
            navigate('dashboard');
        } catch (err) {
            Components.showToast('error', 'Error', err.message);
        }
    }

    async function selectAccount(accountId) {
        const acc = state.accounts.find(a => a._id === accountId);
        if (acc) {
            state.selectedAccount = acc;
            state.selectedBalance = acc._balance || 0;
            navigate('dashboard');
        }
    }

    // ── Public API ──
    return {
        init,
        navigate,
        handleLogin,
        handleRegister,
        handleLogout,
        handleTransfer,
        createNewAccount,
        selectAccount,
    };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', App.init);
