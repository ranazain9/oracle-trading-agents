/**
 * Institutional Chart Engine 3.0 - Multi-Scenario Payoff Modeler
 */

const PayoffChart = {
    chartInstance: null,
    gaugeInstance: null,
    currentSymbol: 'SPX',
    currentSpotPrice: 5183.45,
    currentIV: 45,
    currentDTE: 14,
    currentScenario: 'base',

    init() {
        this.renderPayoff('SPX', 5183.45, 45, 14, 'base');
        this.renderDrawdownGauge(-0.42);
    },

    setScenario(scenarioKey) {
        this.currentScenario = scenarioKey;
        document.querySelectorAll('.btn-scenario').forEach(btn => {
            if (btn.dataset.scenario === scenarioKey) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        let iv = 45;
        let spot = this.currentSpotPrice;

        if (scenarioKey === 'bull') {
            spot = spot * 1.015;
            iv = 35;
        } else if (scenarioKey === 'bear') {
            spot = spot * 0.985;
            iv = 55;
        } else if (scenarioKey === 'high_iv') {
            iv = 75;
        } else if (scenarioKey === 'low_iv') {
            iv = 25;
        }

        this.renderPayoff(this.currentSymbol, spot, iv, this.currentDTE, scenarioKey);
    },

    renderPayoff(symbol = 'SPX', spotPrice = 5183.45, iv = 45, dte = 14, scenario = 'base') {
        this.currentSymbol = symbol;
        this.currentSpotPrice = spotPrice;
        this.currentIV = iv;
        this.currentDTE = dte;

        const ctx = document.getElementById('payoffCanvas');
        if (!ctx) return;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Expected move calculation
        const em = spotPrice * (iv / 100) * Math.sqrt(Math.max(1, dte) / 365);
        const shortStrike = Math.round((spotPrice + em * 0.25) / 5) * 5;
        const longStrike = Math.round((spotPrice + em * 0.55) / 5) * 5;

        // Strikes range
        const strikes = [
            Math.round(spotPrice - em * 1.2),
            Math.round(spotPrice - em * 0.6),
            Math.round(spotPrice - em * 0.2),
            Math.round(spotPrice),
            shortStrike,
            Math.round((shortStrike + longStrike) / 2),
            longStrike,
            Math.round(spotPrice + em * 1.1)
        ].sort((a, b) => a - b);

        const payoffValues = [];
        const probabilityCurve = [];

        const maxProfit = +(12.45 * (iv / 45)).toFixed(2);
        const maxLoss = -(24.10 * (iv / 45)).toFixed(2);

        // Update Legend
        const legProfit = document.getElementById('legend-profit');
        const legLoss = document.getElementById('legend-loss');
        if (legProfit) legProfit.innerText = `+$${(maxProfit * 1000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (legLoss) legLoss.innerText = `-$${(Math.abs(maxLoss) * 1000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        strikes.forEach(p => {
            const stdDev = Math.max(10, em * 0.5);
            const z = (p - spotPrice) / stdDev;
            const prob = Math.exp(-0.5 * z * z) * 60;
            probabilityCurve.push(prob);

            if (p <= shortStrike) {
                payoffValues.push(maxProfit);
            } else if (p >= longStrike) {
                payoffValues.push(maxLoss);
            } else {
                const slope = maxProfit - ((p - shortStrike) / Math.max(1, (longStrike - shortStrike))) * (maxProfit - maxLoss);
                payoffValues.push(slope);
            }
        });

        const gradientProb = ctx.getContext('2d').createLinearGradient(0, 0, 0, 220);
        gradientProb.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
        gradientProb.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: strikes.map(s => s === Math.round(spotPrice) ? `${s} (Spot)` : String(s)),
                datasets: [
                    {
                        label: 'Gaussian Probability (%)',
                        data: probabilityCurve,
                        borderColor: '#06B6D4',
                        backgroundColor: gradientProb,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Spread Payoff ($k)',
                        data: payoffValues,
                        borderColor: '#10B981',
                        segment: {
                            borderColor: ctx => ctx.p1.raw >= 0 ? '#10B981' : '#EF4444',
                            backgroundColor: ctx => ctx.p1.raw >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'
                        },
                        borderWidth: 3,
                        fill: true,
                        tension: 0.15,
                        pointRadius: 0,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 250 },
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(10, 15, 23, 0.95)',
                        titleColor: '#06B6D4',
                        bodyColor: '#FFFFFF',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        callbacks: {
                            label: (ctx) => {
                                if (ctx.datasetIndex === 0) return `Probability: ${ctx.raw.toFixed(1)}%`;
                                return `Payoff: ${ctx.raw >= 0 ? '+' : ''}$${ctx.raw.toFixed(2)}k`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: {
                            color: '#64748B',
                            font: { family: 'JetBrains Mono', size: 9 },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        position: 'left',
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: {
                            color: '#94A3B8',
                            font: { family: 'JetBrains Mono', size: 9 },
                            callback: (v) => `${v >= 0 ? '+' : ''}${v}k`
                        }
                    },
                    y1: {
                        position: 'right',
                        display: false,
                        grid: { display: false }
                    }
                }
            }
        });
    },

    renderDrawdownGauge(currentDD = -0.42) {
        const ctx = document.getElementById('drawdownGaugeCanvas');
        if (!ctx) return;

        if (this.gaugeInstance) {
            this.gaugeInstance.destroy();
        }

        const absDD = Math.min(Math.abs(currentDD), 2.0);
        const remaining = 2.0 - absDD;

        this.gaugeInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [absDD, remaining],
                    backgroundColor: ['#06B6D4', 'rgba(255, 255, 255, 0.05)'],
                    borderColor: 'transparent',
                    circumference: 270,
                    rotation: 225
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '78%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }
};

window.PayoffChart = PayoffChart;
