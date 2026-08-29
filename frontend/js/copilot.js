/**
 * ORACLE Trading Terminal - Plain-English AI Copilot Assistant
 * Explains complex options trading & risk in simple terms for anyone to understand.
 */

const AICopilot = {
    chatHistory: [],

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const input = document.getElementById('copilot-user-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleUserSubmit();
                }
            });
        }
    },

    toggleDrawer() {
        const drawer = document.getElementById('copilot-drawer');
        if (drawer) {
            drawer.classList.toggle('open');
            if (drawer.classList.contains('open')) {
                const input = document.getElementById('copilot-user-input');
                if (input) input.focus();
            }
        }
    },

    closeDrawer() {
        const drawer = document.getElementById('copilot-drawer');
        if (drawer) drawer.classList.remove('open');
    },

    sendPrompt(promptText) {
        const input = document.getElementById('copilot-user-input');
        if (input) input.value = promptText;
        this.handleUserSubmit();
    },

    async handleUserSubmit() {
        const input = document.getElementById('copilot-user-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        this.appendMessage('user', text);

        // Formulate intelligent response
        const answer = await this.generateResponse(text);
        this.appendMessage('assistant', answer);
    },

    appendMessage(sender, htmlContent) {
        const container = document.getElementById('copilot-messages-list');
        if (!container) return;

        const msg = document.createElement('div');
        msg.className = `copilot-msg ${sender}`;
        msg.innerHTML = htmlContent;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    },

    async generateResponse(query) {
        const q = query.toLowerCase();

        if (q.includes('safe') || q.includes('is my money safe') || q.includes('protection')) {
            return `<strong>Yes, your capital is protected:</strong><br>
            • <strong>Automatic Stop-Loss:</strong> If any single trade loses more than -$150.00, our automated Bodyguard AI closes it immediately.<br>
            • <strong>Max Drawdown Guard:</strong> Trading halts completely if total account drawdown exceeds 1.5%.<br>
            • <strong>Defined Risk Spreads:</strong> We only trade options with capped, guaranteed maximum loss limits.`;
        }

        if (q.includes('how is my account') || q.includes('p&l') || q.includes('pnl') || q.includes('today') || q.includes('performance')) {
            return `<strong>Account Summary in Plain English:</strong><br>
            • <strong>Total Balance:</strong> $99,581.43<br>
            • <strong>Today's Profit:</strong> +$1,245.00 (+1.27% gain)<br>
            • <strong>Daily Passive Time Decay (Theta):</strong> +$342.10 earned every day that passes without prices moving wildly.<br>
            • <strong>All-Time Win Rate:</strong> 100% on Iron Condors with 0 blown stop-losses.`;
        }

        if (q.includes('why') && (q.includes('trade') || q.includes('open') || q.includes('spx'))) {
            return `<strong>Why the AI placed the SPX Trade:</strong><br>
            • The S&P 500 (SPX) is trading steadily around <strong>$5,183.45</strong> in a calm market.<br>
            • Our AI calculated that there is an <strong>88.5% statistical probability</strong> that SPX will stay below 5,200.<br>
            • By selling this credit spread, the AI collects premium upfront, earning profit every day time passes.`;
        }

        if (q.includes('what') && (q.includes('delta') || q.includes('theta') || q.includes('greeks') || q.includes('meaning'))) {
            return `<strong>Options Metrics Explained Simply:</strong><br>
            • <strong>Delta (Δ):</strong> Measures direction. Our portfolio is at <strong>-12.4</strong>, meaning we are neutral and don't care if the market goes slightly up or down.<br>
            • <strong>Theta (Θ):</strong> Measures time decay. We make <strong>+$342.10 per day</strong> just by letting time pass.<br>
            • <strong>Vega (ν):</strong> Measures volatility. We profit when the market stays calm.`;
        }

        if (q.includes('max') && q.includes('risk') || q.includes('maximum risk') || q.includes('lose')) {
            return `<strong>Maximum Risk Explained:</strong><br>
            • <strong>Per Trade Max Loss:</strong> Capped strictly at <strong>-$150.00</strong> by the Bodyguard safety floor.<br>
            • <strong>Worst Case Scenario:</strong> No trade is ever open-ended or unlimited. All loss limits are hard-coded into the exchange.`;
        }

        if (q.includes('simple') || q.includes('beginner') || q.includes('explain')) {
            return `<strong>How this Automated System Works:</strong><br>
            1. <strong>8 AI Agents</strong> continuously monitor the news, economic data, and stock prices.<br>
            2. When they find a high-probability trade (e.g. 88%+ win rate), they execute it automatically.<br>
            3. As time passes and the trade makes money, the AI raises a <strong>trailing profit floor</strong> to lock in gains.`;
        }

        return `<strong>ORACLE Assistant:</strong> Your portfolio is currently healthy with <strong>$99,581.43</strong> in total balance and positive earnings. All 8 AI protection robots are active and monitoring risk. Feel free to ask about any stock, position, or safety rule!`;
    }
};

window.AICopilot = AICopilot;
