import type { WorkSummary } from "../types.ts";

export function generateDashboardHTML(summary: WorkSummary): string {
	const sourceGroups = new Map<string, typeof summary.items>();
	for (const item of summary.items) {
		const existing = sourceGroups.get(item.source) || [];
		existing.push(item);
		sourceGroups.set(item.source, existing);
	}

	const total = summary.items.length;
	const chartData = Array.from(sourceGroups.entries()).map(([source, items]) => ({
		source,
		count: items.length,
		percentage: total === 0 ? 0 : Math.round((items.length / total) * 100),
	}));

	const hourlyData = Array.from({ length: 24 }, () => 0);
	for (const item of summary.items) {
		const hour = item.timestamp.getHours();
		const current = hourlyData[hour] ?? 0;
		hourlyData[hour] = current + 1;
	}

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Worklog Dashboard - ${summary.dateRange.start.toDateString()}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --bg-primary: #f5f5f5;
            --bg-secondary: white;
            --bg-card: #f8f9fa;
            --text-primary: #000000;
            --text-secondary: #666;
            --text-tertiary: #999;
            --border-color: #e0e0e0;
            --border-light: #eee;
            --accent-color: #007acc;
            --accent-hover: #005999;
            --shadow: rgba(0,0,0,0.1);
        }

        [data-theme="dark"] {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --bg-card: #3a3a3a;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --text-tertiary: #808080;
            --border-color: #404040;
            --border-light: #333;
            --accent-color: #4da6ff;
            --accent-hover: #3399ff;
            --shadow: rgba(0,0,0,0.3);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: var(--bg-primary);
            color: var(--text-primary);
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--bg-secondary);
            border-radius: 8px;
            box-shadow: 0 2px 10px var(--shadow);
            padding: 20px;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
        }
        .theme-toggle {
            position: absolute;
            top: 0;
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 1.2em;
            transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .theme-toggle:hover {
            background: var(--border-color);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: var(--bg-card);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            transition: background-color 0.3s ease;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: var(--accent-color);
            transition: color 0.3s ease;
        }
        .stat-label {
            color: var(--text-secondary);
            margin-top: 5px;
            transition: color 0.3s ease;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-container {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .chart-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        .source-breakdown {
            margin-top: 30px;
        }
        .source-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid var(--border-light);
            transition: border-color 0.3s ease;
        }
        .source-name {
            font-weight: bold;
        }
        .source-count {
            color: var(--accent-color);
            font-weight: bold;
            transition: color 0.3s ease;
        }
        .filters-section {
            margin-bottom: 30px;
            padding: 20px;
            background: var(--bg-card);
            border-radius: 8px;
            transition: background-color 0.3s ease;
        }
        .filters-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .filter-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }
        .filter-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        .filter-checkbox:hover {
            background: var(--border-light);
        }
        .filter-checkbox input[type="checkbox"] {
            cursor: pointer;
            width: 18px;
            height: 18px;
        }
        .filter-checkbox label {
            cursor: pointer;
            user-select: none;
        }
        .generated-at {
            text-align: center;
            color: var(--text-secondary);
            margin-top: 30px;
            font-size: 0.9em;
            transition: color 0.3s ease;
        }
        .item-detail {
            margin-left: 20px;
            color: var(--text-secondary);
            font-size: 0.9em;
            transition: color 0.3s ease;
        }
        .item-more {
            margin-left: 20px;
            color: var(--text-tertiary);
            font-size: 0.8em;
            transition: color 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">🌙</button>
            <h1>📊 Worklog Dashboard</h1>
            <p>${summary.dateRange.start.toLocaleDateString()} - ${summary.dateRange.end.toLocaleDateString()}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="totalActivities">${summary.items.length}</div>
                <div class="stat-label">Total Activities</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="activeSources">${sourceGroups.size}</div>
                <div class="stat-label">Active Sources</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="peakHourActivity">${hourlyData.length === 0 ? 0 : Math.max(...hourlyData, 0)}</div>
                <div class="stat-label">Peak Hour Activity</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="activeHours">${hourlyData.filter((h) => h > 0).length}</div>
                <div class="stat-label">Active Hours</div>
            </div>
        </div>

        <div class="filters-section">
            <div class="filters-title">🔍 Filter by Source</div>
            <div class="filter-controls">
                ${Array.from(sourceGroups.keys())
									.map(
										(source) => `
                    <div class="filter-checkbox">
                        <input type="checkbox" id="filter-${source}" value="${source}" checked>
                        <label for="filter-${source}">${source.toUpperCase()}</label>
                    </div>
                `,
									)
									.join("")}
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-container">
                <div class="chart-title">Activity by Source</div>
                <canvas id="sourceChart" width="400" height="300"></canvas>
            </div>
            <div class="chart-container">
                <div class="chart-title">Hourly Activity Distribution</div>
                <canvas id="hourlyChart" width="400" height="300"></canvas>
            </div>
        </div>

        <div class="source-breakdown">
            <h2>📋 Detailed Breakdown</h2>
            ${Array.from(sourceGroups.entries())
							.map(
								([source, items]) => `
                <div class="source-item">
                    <span class="source-name">${source.toUpperCase()}</span>
                    <span class="source-count">${items.length} activities</span>
                </div>
                ${items
									.slice(0, 3)
									.map(
										(item) => `
                    <div class="item-detail">
                        ${item.timestamp.toLocaleTimeString()} - ${item.title}
                    </div>
                `,
									)
									.join("")}
                ${items.length > 3 ? `<div class="item-more">...and ${items.length - 3} more</div>` : ""}
            `,
							)
							.join("")}
        </div>

        <div class="generated-at">
            Generated at ${summary.generatedAt.toLocaleString()}
        </div>
    </div>

    <script>
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;
        
        const savedTheme = localStorage.getItem('worklog-theme') || 'light';
        html.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        
        const getChartColors = (isDark) => ({
            doughnut: isDark ? [
                '#FF6B8A', '#4FC3F7', '#FFD54F', '#4DD0E1',
                '#BA68C8', '#FFB74D', '#FF6B8A', '#BDBDBD',
                '#4DD0E1', '#FF6B8A'
            ] : [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                '#4BC0C0', '#FF6384'
            ],
            barBg: isDark ? '#4FC3F7' : '#007acc',
            barBorder: isDark ? '#29B6F6' : '#005999'
        });
        
        const isDark = savedTheme === 'dark';
        const colors = getChartColors(isDark);

        const allItems = ${JSON.stringify(
					summary.items.map((item) => ({
						source: item.source,
						timestamp: item.timestamp.toISOString(),
					})),
				)};
        const sourceData = ${JSON.stringify(chartData)};
        const originalHourlyData = ${JSON.stringify(hourlyData)};

        const sourceCtx = document.getElementById('sourceChart').getContext('2d');
        const sourceChart = new Chart(sourceCtx, {
            type: 'doughnut',
            data: {
                labels: sourceData.map(d => d.source.toUpperCase()),
                datasets: [{
                    data: sourceData.map(d => d.count),
                    backgroundColor: colors.doughnut,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });

        const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
        const hourlyChart = new Chart(hourlyCtx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => \`\${i}:00\`),
                datasets: [{
                    label: 'Activities',
                    data: originalHourlyData,
                    backgroundColor: colors.barBg,
                    borderColor: colors.barBorder,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        function updateCharts() {
            const checkedSources = Array.from(document.querySelectorAll('.filter-checkbox input:checked'))
                .map(cb => cb.value);
            
            const filteredSourceData = sourceData.filter(d => checkedSources.includes(d.source));
            
            sourceChart.data.labels = filteredSourceData.map(d => d.source.toUpperCase());
            sourceChart.data.datasets[0].data = filteredSourceData.map(d => d.count);
            sourceChart.update();
            
            const filteredItems = allItems.filter(item => checkedSources.includes(item.source));
            const newHourlyData = Array.from({length: 24}, () => 0);
            for (const item of filteredItems) {
                const hour = new Date(item.timestamp).getHours();
                newHourlyData[hour]++;
            }
            
            hourlyChart.data.datasets[0].data = newHourlyData;
            hourlyChart.update();
            
            const totalActivities = filteredItems.length;
            const activeSources = checkedSources.length;
            const peakHourActivity = newHourlyData.length === 0 ? 0 : Math.max(...newHourlyData, 0);
            const activeHours = newHourlyData.filter(h => h > 0).length;
            
            document.getElementById('totalActivities').textContent = totalActivities;
            document.getElementById('activeSources').textContent = activeSources;
            document.getElementById('peakHourActivity').textContent = peakHourActivity;
            document.getElementById('activeHours').textContent = activeHours;
        }
        
        document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', updateCharts);
        });

        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('worklog-theme', newTheme);
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            
            const newColors = getChartColors(newTheme === 'dark');
            sourceChart.data.datasets[0].backgroundColor = newColors.doughnut;
            sourceChart.update();
            
            hourlyChart.data.datasets[0].backgroundColor = newColors.barBg;
            hourlyChart.data.datasets[0].borderColor = newColors.barBorder;
            hourlyChart.update();
        });
    </script>
</body>
</html>`;

	return html;
}
