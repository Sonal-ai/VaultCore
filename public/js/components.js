/**
 * VaultCore — UI Components
 * Pure JS component renderers for the banking dashboard.
 */

const Components = (() => {

    // ── Toast Notifications ──
    function showToast(type, title, message) {
        const container = document.getElementById('toast-container');
        const icons = { success: '✓', error: '✕', info: 'ℹ' };
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <span class="toast__icon">${icons[type] || 'ℹ'}</span>
            <div class="toast__content">
                <div class="toast__title">${title}</div>
                <div class="toast__message">${message}</div>
            </div>
            <button class="toast__close" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast--removing');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ── Helper: Format currency ──
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    // ── Helper: Truncate ID ──
    function shortId(id) {
        if (!id) return '—';
        return id.slice(0, 4) + '…' + id.slice(-4);
    }

    // ── Helper: Format date ──
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }

    // ── Helper: Generate idempotency key ──
    function generateIdempotencyKey() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    }

    // ── Landing Page ──
    function renderLanding() {
        return `
        <div class="page-enter">
            <section class="hero">
                <div class="hero__badge">⚡ Next-gen banking infrastructure</div>
                <h1 class="hero__title">
                    Banking That's<br>
                    <span class="gradient-text">Built Different</span>
                </h1>
                <p class="hero__subtitle">
                    VaultCore is a production-grade banking transaction system featuring 
                    double-entry ledger accounting, idempotent transfers, and real-time 
                    email notifications — all powered by MongoDB ACID transactions.
                </p>
                <div class="hero__actions">
                    <button class="btn btn-primary btn-lg" onclick="App.navigate('register')">
                        Get Started →
                    </button>
                    <button class="btn btn-secondary btn-lg" onclick="App.navigate('login')">
                        Sign In
                    </button>
                </div>
            </section>

            <section class="features-grid">
                <div class="feature-card">
                    <div class="feature-card__icon">🔐</div>
                    <h3 class="feature-card__title">Secure by Design</h3>
                    <p class="feature-card__desc">
                        JWT authentication with token blacklisting, bcrypt password hashing, 
                        and httpOnly cookies for maximum security.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-card__icon">📒</div>
                    <h3 class="feature-card__title">Double-Entry Ledger</h3>
                    <p class="feature-card__desc">
                        Every transaction creates matching debit and credit entries with 
                        immutable ledger records — just like real banking.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-card__icon">⚡</div>
                    <h3 class="feature-card__title">ACID Transactions</h3>
                    <p class="feature-card__desc">
                        MongoDB sessions ensure atomicity — transfers either complete fully 
                        or roll back entirely, preventing data corruption.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-card__icon">🔁</div>
                    <h3 class="feature-card__title">Idempotent Transfers</h3>
                    <p class="feature-card__desc">
                        Unique idempotency keys prevent duplicate transactions, making the 
                        system safe for retries and network failures.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-card__icon">📧</div>
                    <h3 class="feature-card__title">Email Notifications</h3>
                    <p class="feature-card__desc">
                        Automatic email alerts via Gmail OAuth2 for registration and 
                        transaction events using Nodemailer.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-card__icon">🏦</div>
                    <h3 class="feature-card__title">Multi-Account</h3>
                    <p class="feature-card__desc">
                        Users can create and manage multiple accounts, each with independent 
                        balances derived from the ledger.
                    </p>
                </div>
            </section>
        </div>`;
    }

    // ── Auth: Login ──
    function renderLogin() {
        return `
        <div class="auth-container page-enter">
            <div class="auth-card">
                <div class="auth-card__header">
                    <h2 class="auth-card__title">Welcome Back</h2>
                    <p class="auth-card__subtitle">Sign in to your VaultCore account</p>
                </div>
                <form id="login-form" onsubmit="App.handleLogin(event)">
                    <div class="form-group">
                        <label class="form-label" for="login-email">Email Address</label>
                        <input class="form-input" type="email" id="login-email" 
                               placeholder="you@example.com" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="login-password">Password</label>
                        <input class="form-input" type="password" id="login-password" 
                               placeholder="••••••••" required autocomplete="current-password">
                    </div>
                    <button class="btn btn-primary btn-full btn-lg" type="submit" id="login-btn">
                        Sign In
                    </button>
                </form>
                <div class="auth-card__footer">
                    Don't have an account? 
                    <button onclick="App.navigate('register')">Create one</button>
                </div>
            </div>
        </div>`;
    }

    // ── Auth: Register ──
    function renderRegister() {
        return `
        <div class="auth-container page-enter">
            <div class="auth-card">
                <div class="auth-card__header">
                    <h2 class="auth-card__title">Create Account</h2>
                    <p class="auth-card__subtitle">Join VaultCore — your digital banking hub</p>
                </div>
                <form id="register-form" onsubmit="App.handleRegister(event)">
                    <div class="form-group">
                        <label class="form-label" for="reg-name">Full Name</label>
                        <input class="form-input" type="text" id="reg-name" 
                               placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="reg-email">Email Address</label>
                        <input class="form-input" type="email" id="reg-email" 
                               placeholder="you@example.com" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="reg-password">Password</label>
                        <input class="form-input" type="password" id="reg-password" 
                               placeholder="Min 6 characters" required minlength="6" autocomplete="new-password">
                    </div>
                    <button class="btn btn-primary btn-full btn-lg" type="submit" id="register-btn">
                        Create Account →
                    </button>
                </form>
                <div class="auth-card__footer">
                    Already have an account? 
                    <button onclick="App.navigate('login')">Sign in</button>
                </div>
            </div>
        </div>`;
    }

    // ── Dashboard ──
    function renderDashboard(data) {
        const { user, accounts, selectedAccount, balance, transactions } = data;
        const greeting = getGreeting();

        return `
        <div class="page-enter">
            <div class="dashboard-header">
                <div>
                    <h1 class="dashboard-header__greeting">
                        ${greeting}, <span>${user.name || 'User'}</span>
                    </h1>
                    <p class="text-muted text-sm mt-sm">Here's your financial overview</p>
                </div>
                <div class="flex gap-md">
                    <button class="btn btn-secondary" onclick="App.navigate('transfer')">
                        💸 Transfer
                    </button>
                    <button class="btn btn-primary" onclick="App.createNewAccount()">
                        + New Account
                    </button>
                </div>
            </div>

            ${selectedAccount ? renderBalanceCard(selectedAccount, balance) : ''}

            <div class="section-header mt-xl">
                <h2 class="section-title">Your Accounts</h2>
            </div>

            ${accounts.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state__icon">🏦</div>
                    <h3 class="empty-state__title">No Accounts Yet</h3>
                    <p class="empty-state__desc">Create your first bank account to get started</p>
                    <button class="btn btn-primary" onclick="App.createNewAccount()">
                        + Create Account
                    </button>
                </div>
            ` : `
                <div class="account-list">
                    ${accounts.map(acc => `
                        <div class="account-item ${selectedAccount && selectedAccount._id === acc._id ? 'selected' : ''}" 
                             onclick="App.selectAccount('${acc._id}')">
                            <div class="account-item__info">
                                <div class="account-item__icon">🏦</div>
                                <div>
                                    <div class="account-item__id">${shortId(acc._id)}</div>
                                    <div class="account-item__status">
                                        <span class="badge badge--${acc.status.toLowerCase()}">${acc.status}</span>
                                        · ${acc.currency}
                                    </div>
                                </div>
                            </div>
                            <div class="account-item__balance" id="bal-${acc._id}">
                                ${acc._balance !== undefined ? formatCurrency(acc._balance) : '...'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}

            <div class="section-header mt-xl">
                <h2 class="section-title">Quick Actions</h2>
            </div>
            <div class="quick-actions">
                <button class="quick-action-btn" onclick="App.navigate('transfer')">
                    <div class="quick-action-btn__icon" style="background:rgba(56,189,248,0.1);color:var(--accent-cyan)">💸</div>
                    <span class="quick-action-btn__label">Transfer</span>
                </button>
                <button class="quick-action-btn" onclick="App.createNewAccount()">
                    <div class="quick-action-btn__icon" style="background:rgba(52,211,153,0.1);color:var(--accent-green)">➕</div>
                    <span class="quick-action-btn__label">New Account</span>
                </button>
                <button class="quick-action-btn" onclick="App.navigate('accounts')">
                    <div class="quick-action-btn__icon" style="background:rgba(167,139,250,0.1);color:var(--accent-purple)">📊</div>
                    <span class="quick-action-btn__label">All Accounts</span>
                </button>
            </div>
        </div>`;
    }

    function renderBalanceCard(account, balance) {
        return `
        <div class="balance-card">
            <div class="balance-card__label">Total Balance · ${account.currency || 'INR'}</div>
            <div class="balance-card__amount">
                <span class="balance-card__currency">₹</span>${animateCounter(balance || 0)}
            </div>
            <div class="balance-card__meta">
                <div class="balance-card__meta-item">
                    <strong>${shortId(account._id)}</strong>
                    Account ID
                </div>
                <div class="balance-card__meta-item">
                    <strong><span class="badge badge--${account.status.toLowerCase()}">${account.status}</span></strong>
                    Status
                </div>
            </div>
        </div>`;
    }

    function animateCounter(value) {
        const formatted = Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `<span class="counter" data-target="${value}">${formatted}</span>`;
    }

    function getGreeting() {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    }

    // ── Accounts Page ──
    function renderAccounts(accounts) {
        return `
        <div class="page-enter">
            <div class="section-header">
                <h1 class="section-title" style="font-size:var(--font-2xl)">Your Accounts</h1>
                <button class="btn btn-primary" onclick="App.createNewAccount()">+ New Account</button>
            </div>

            ${accounts.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state__icon">🏦</div>
                    <h3 class="empty-state__title">No Accounts Yet</h3>
                    <p class="empty-state__desc">Create your first bank account to get started</p>
                    <button class="btn btn-primary" onclick="App.createNewAccount()">+ Create Account</button>
                </div>
            ` : `
                <div class="stats-grid mt-lg">
                    ${accounts.map(acc => `
                        <div class="stat-card" style="cursor:pointer" onclick="App.selectAccount('${acc._id}')">
                            <div class="stat-card__icon stat-card__icon--cyan">🏦</div>
                            <div class="stat-card__value" id="acct-bal-${acc._id}">
                                ${acc._balance !== undefined ? formatCurrency(acc._balance) : '—'}
                            </div>
                            <div class="stat-card__label">
                                <span class="text-mono">${shortId(acc._id)}</span>
                                · <span class="badge badge--${acc.status.toLowerCase()}">${acc.status}</span>
                                · ${acc.currency}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>`;
    }

    // ── Transfer Page ──
    function renderTransfer(accounts) {
        if (accounts.length === 0) {
            return `
            <div class="page-enter">
                <div class="empty-state">
                    <div class="empty-state__icon">💸</div>
                    <h3 class="empty-state__title">No Accounts Available</h3>
                    <p class="empty-state__desc">You need at least one account to make a transfer</p>
                    <button class="btn btn-primary" onclick="App.createNewAccount()">+ Create Account</button>
                </div>
            </div>`;
        }

        const options = accounts
            .filter(a => a.status === 'ACTIVE')
            .map(a => `<option value="${a._id}">${shortId(a._id)} — ${a.currency} ${a._balance !== undefined ? formatCurrency(a._balance) : ''}</option>`)
            .join('');

        return `
        <div class="transfer-container page-enter">
            <h1 style="font-size:var(--font-2xl);font-weight:700;margin-bottom:var(--space-sm)">Transfer Funds</h1>
            <p class="text-muted text-sm mb-lg">Send money between accounts securely</p>

            <div class="auth-card">
                <form id="transfer-form" onsubmit="App.handleTransfer(event)">
                    <div class="form-group">
                        <label class="form-label" for="from-account">From Account</label>
                        <select class="form-select" id="from-account" required>
                            <option value="">Select source account</option>
                            ${options}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="to-account">To Account (ID)</label>
                        <input class="form-input" type="text" id="to-account" 
                               placeholder="Paste recipient account ID" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="transfer-amount">Amount (₹)</label>
                        <input class="form-input" type="number" id="transfer-amount" 
                               placeholder="0.00" min="0.01" step="0.01" required>
                    </div>
                    <button class="btn btn-success btn-full btn-lg" type="submit" id="transfer-btn">
                        Send Money →
                    </button>
                </form>
            </div>
        </div>`;
    }

    // ── Transactions Page ──
    function renderTransactions(transactions) {
        return `
        <div class="page-enter">
            <div class="section-header">
                <h1 class="section-title" style="font-size:var(--font-2xl)">Transaction History</h1>
            </div>

            ${(!transactions || transactions.length === 0) ? `
                <div class="empty-state">
                    <div class="empty-state__icon">📋</div>
                    <h3 class="empty-state__title">No Transactions Yet</h3>
                    <p class="empty-state__desc">Your transaction history will appear here</p>
                    <button class="btn btn-primary" onclick="App.navigate('transfer')">Make a Transfer</button>
                </div>
            ` : `
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(tx => `
                                <tr>
                                    <td>${formatDate(tx.createdAt)}</td>
                                    <td class="text-mono">${shortId(tx._id)}</td>
                                    <td class="text-mono">${shortId(tx.fromAccount)}</td>
                                    <td class="text-mono">${shortId(tx.toAccount)}</td>
                                    <td><span class="amount">${formatCurrency(tx.amount)}</span></td>
                                    <td><span class="badge badge--${tx.status.toLowerCase()}">${tx.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>`;
    }

    // ── Loading States ──
    function renderLoading() {
        return `
        <div class="loading-container">
            <div class="spinner spinner--lg spinner--cyan"></div>
        </div>`;
    }

    function renderDashboardSkeleton() {
        return `
        <div class="page-enter">
            <div class="skeleton skeleton--title" style="width:40%"></div>
            <div class="skeleton skeleton--text" style="width:25%;margin-bottom:24px"></div>
            <div class="skeleton skeleton--card" style="margin-bottom:24px;height:160px"></div>
            <div class="stats-grid">
                <div class="skeleton skeleton--card"></div>
                <div class="skeleton skeleton--card"></div>
                <div class="skeleton skeleton--card"></div>
            </div>
        </div>`;
    }

    // Public API
    return {
        renderLanding,
        renderLogin,
        renderRegister,
        renderDashboard,
        renderAccounts,
        renderTransfer,
        renderTransactions,
        renderLoading,
        renderDashboardSkeleton,
        showToast,
        formatCurrency,
        shortId,
        formatDate,
        generateIdempotencyKey,
    };
})();
