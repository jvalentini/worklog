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

	const activeHours = hourlyData.filter((h) => h > 0).length;
	const peakHour = hourlyData.indexOf(Math.max(...hourlyData, 0));
	const avgPerHour = activeHours > 0 ? (total / activeHours).toFixed(1) : "0";

	// Find work sessions (consecutive hours with activity)
	let sessions = 0;
	let inSession = false;
	let longestStreak = 0;
	let currentStreak = 0;
	for (const count of hourlyData) {
		if (count > 0) {
			if (!inSession) {
				sessions++;
				inSession = true;
			}
			currentStreak++;
			longestStreak = Math.max(longestStreak, currentStreak);
		} else {
			inSession = false;
			currentStreak = 0;
		}
	}

	// Calculate focus score (higher when work is concentrated in fewer sessions)
	const focusScore =
		sessions > 0
			? Math.min(
					100,
					Math.round(
						(longestStreak / sessions) * 50 + (activeHours > 0 ? (total / activeHours) * 10 : 0),
					),
				)
			: 0;

	const morningActivity = hourlyData.slice(6, 12).reduce((a, b) => a + b, 0);
	const afternoonActivity = hourlyData.slice(12, 18).reduce((a, b) => a + b, 0);
	const eveningActivity = hourlyData.slice(18, 24).reduce((a, b) => a + b, 0);
	const nightActivity = hourlyData.slice(0, 6).reduce((a, b) => a + b, 0);

	const diversityScore =
		sourceGroups.size > 0
			? Math.round((1 - Math.max(...chartData.map((d) => d.percentage)) / 100) * 100)
			: 0;

	const recentItems = [...summary.items]
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
		.slice(0, 20);

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WORKLOG // Command Center - ${summary.dateRange.start.toDateString()}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }

        :root {
            --bg-primary: #0d1117;
            --bg-secondary: #161b22;
            --bg-tertiary: #21262d;
            --bg-elevated: #1c2128;
            --border-primary: #30363d;
            --border-secondary: #21262d;
            --text-primary: #e6edf3;
            --text-secondary: #8b949e;
            --text-muted: #6e7681;
            --accent-blue: #58a6ff;
            --accent-green: #3fb950;
            --accent-cyan: #39d353;
            --accent-amber: #d29922;
            --accent-orange: #f0883e;
            --accent-purple: #a371f7;
            --accent-pink: #db61a2;
            --accent-red: #f85149;
            --chart-1: #58a6ff;
            --chart-2: #3fb950;
            --chart-3: #a371f7;
            --chart-4: #f0883e;
            --chart-5: #db61a2;
            --chart-6: #39d353;
            --chart-7: #d29922;
            --chart-8: #f85149;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.5;
        }

        .mono {
            font-family: 'JetBrains Mono', 'Consolas', monospace;
        }

        /* HEADER BAR */
        .header-bar {
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-primary);
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
            animation: fadeIn 0.4s ease-out;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .logo {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.5px;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .logo-icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        .status-indicators {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .status-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--text-secondary);
            font-family: 'JetBrains Mono', monospace;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }

        .status-dot.active { background: var(--accent-green); }
        .status-dot.warning { background: var(--accent-amber); }
        .status-dot.info { background: var(--accent-blue); }

        .header-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .date-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            padding: 6px 12px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-primary);
            border-radius: 4px;
            color: var(--text-secondary);
        }

        .date-badge span {
            color: var(--accent-cyan);
        }

        /* MAIN CONTAINER */
        .container {
            max-width: 1600px;
            margin: 0 auto;
            padding: 24px;
        }

        /* PRIMARY METRICS GRID */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

        @media (max-width: 1200px) {
            .metrics-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 768px) {
            .metrics-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .metric-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 8px;
            padding: 16px;
            animation: fadeIn 0.4s ease-out backwards;
        }

        .metric-card:nth-child(1) { animation-delay: 0.05s; }
        .metric-card:nth-child(2) { animation-delay: 0.1s; }
        .metric-card:nth-child(3) { animation-delay: 0.15s; }
        .metric-card:nth-child(4) { animation-delay: 0.2s; }
        .metric-card:nth-child(5) { animation-delay: 0.25s; }
        .metric-card:nth-child(6) { animation-delay: 0.3s; }

        .metric-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .metric-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            font-weight: 500;
        }

        .metric-icon {
            font-size: 14px;
            opacity: 0.6;
        }

        .metric-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 32px;
            font-weight: 600;
            line-height: 1;
            color: var(--text-primary);
        }

        .metric-value.accent-blue { color: var(--accent-blue); }
        .metric-value.accent-green { color: var(--accent-green); }
        .metric-value.accent-amber { color: var(--accent-amber); }
        .metric-value.accent-purple { color: var(--accent-purple); }
        .metric-value.accent-pink { color: var(--accent-pink); }
        .metric-value.accent-cyan { color: var(--accent-cyan); }

        .metric-detail {
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 4px;
            font-family: 'JetBrains Mono', monospace;
        }

        /* SECONDARY METRICS BAR */
        .secondary-metrics {
            display: flex;
            gap: 24px;
            padding: 16px 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 8px;
            margin-bottom: 24px;
            flex-wrap: wrap;
            animation: fadeIn 0.4s ease-out 0.35s backwards;
        }

        .secondary-metric {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .secondary-metric-label {
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .secondary-metric-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .secondary-metric-bar {
            width: 60px;
            height: 4px;
            background: var(--bg-tertiary);
            border-radius: 2px;
            overflow: hidden;
        }

        .secondary-metric-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 0.6s ease-out;
        }

        .secondary-metric-fill.blue { background: var(--accent-blue); }
        .secondary-metric-fill.green { background: var(--accent-green); }
        .secondary-metric-fill.amber { background: var(--accent-amber); }
        .secondary-metric-fill.purple { background: var(--accent-purple); }

        /* MAIN GRID LAYOUT */
        .main-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 380px;
            gap: 24px;
        }

        @media (max-width: 1400px) {
            .main-grid { grid-template-columns: 1fr 1fr; }
            .activity-log { grid-column: span 2; }
        }

        @media (max-width: 900px) {
            .main-grid { grid-template-columns: 1fr; }
            .activity-log { grid-column: span 1; }
        }

        /* PANEL STYLES */
        .panel {
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 8px;
            overflow: hidden;
            animation: fadeIn 0.4s ease-out backwards;
        }

        .panel:nth-child(1) { animation-delay: 0.4s; }
        .panel:nth-child(2) { animation-delay: 0.45s; }
        .panel:nth-child(3) { animation-delay: 0.5s; }

        .panel-header {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-primary);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-elevated);
        }

        .panel-title {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .panel-title::before {
            content: '//';
            color: var(--accent-blue);
        }

        .panel-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            padding: 3px 8px;
            background: var(--bg-tertiary);
            border-radius: 3px;
            color: var(--text-muted);
        }

        .panel-body {
            padding: 16px;
        }

        /* CHART CONTAINERS */
        .chart-container {
            position: relative;
            height: 280px;
        }

        /* SOURCE BREAKDOWN */
        .source-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .source-row {
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out backwards;
        }

        .source-row:nth-child(1) { animation-delay: 0.55s; }
        .source-row:nth-child(2) { animation-delay: 0.6s; }
        .source-row:nth-child(3) { animation-delay: 0.65s; }
        .source-row:nth-child(4) { animation-delay: 0.7s; }
        .source-row:nth-child(5) { animation-delay: 0.75s; }
        .source-row:nth-child(6) { animation-delay: 0.8s; }

        .source-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            flex-shrink: 0;
        }

        .source-info {
            flex: 1;
            min-width: 0;
        }

        .source-name {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .source-bar-container {
            height: 6px;
            background: var(--bg-tertiary);
            border-radius: 3px;
            overflow: hidden;
        }

        .source-bar {
            height: 100%;
            border-radius: 3px;
            transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .source-stats {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
            min-width: 60px;
        }

        .source-count {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .source-percent {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            color: var(--text-muted);
        }

        /* ACTIVITY LOG */
        .activity-log .panel-body {
            padding: 0;
            max-height: 600px;
            overflow-y: auto;
        }

        .activity-log .panel-body::-webkit-scrollbar {
            width: 6px;
        }

        .activity-log .panel-body::-webkit-scrollbar-track {
            background: var(--bg-secondary);
        }

        .activity-log .panel-body::-webkit-scrollbar-thumb {
            background: var(--border-primary);
            border-radius: 3px;
        }

        .activity-item {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-secondary);
            display: flex;
            gap: 12px;
            transition: background 0.15s ease;
            animation: slideIn 0.3s ease-out backwards;
        }

        .activity-item:hover {
            background: var(--bg-elevated);
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-time {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: var(--text-muted);
            min-width: 52px;
            flex-shrink: 0;
        }

        .activity-source {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 3px;
            background: var(--bg-tertiary);
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
            flex-shrink: 0;
        }

        .activity-content {
            flex: 1;
            min-width: 0;
        }

        .activity-title {
            font-size: 13px;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* TIME DISTRIBUTION */
        .time-distribution {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }

        .time-block {
            text-align: center;
            padding: 12px;
            background: var(--bg-tertiary);
            border-radius: 6px;
        }

        .time-block-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: var(--text-muted);
            margin-bottom: 4px;
        }

        .time-block-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .time-block-hours {
            font-size: 10px;
            color: var(--text-secondary);
            margin-top: 2px;
        }

        /* FILTERS */
        .filters-section {
            margin-bottom: 24px;
            animation: fadeIn 0.4s ease-out 0.35s backwards;
        }

        .filters-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }

        .filters-label {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
        }

        .filter-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .filter-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: var(--text-secondary);
        }

        .filter-chip:hover {
            border-color: var(--accent-blue);
            color: var(--text-primary);
        }

        .filter-chip.active {
            background: rgba(88, 166, 255, 0.1);
            border-color: var(--accent-blue);
            color: var(--accent-blue);
        }

        .filter-chip input {
            display: none;
        }

        .filter-dot {
            width: 8px;
            height: 8px;
            border-radius: 2px;
        }

        /* FOOTER */
        .footer {
            text-align: center;
            padding: 24px;
            margin-top: 24px;
            border-top: 1px solid var(--border-secondary);
        }

        .footer-text {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: var(--text-muted);
        }

        .footer-text span {
            color: var(--text-secondary);
        }

        /* SCROLLBAR */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg-primary);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--border-primary);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }

        /* SELECTION */
        ::selection {
            background: var(--accent-blue);
            color: white;
        }
    </style>
</head>
<body>
    <div class="header-bar">
        <div class="header-left">
            <div class="logo">
                <div class="logo-icon">⌘</div>
                WORKLOG
            </div>
            <div class="status-indicators">
                <div class="status-item">
                    <span class="status-dot active"></span>
                    <span>${sourceGroups.size} sources</span>
                </div>
                <div class="status-item">
                    <span class="status-dot info"></span>
                    <span>${total} events</span>
                </div>
                <div class="status-item">
                    <span class="status-dot ${focusScore >= 70 ? "active" : focusScore >= 40 ? "warning" : "info"}"></span>
                    <span>focus ${focusScore}%</span>
                </div>
            </div>
        </div>
        <div class="header-right">
            <div class="date-badge">
                <span>${summary.dateRange.start.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}</span>
                ${summary.dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                ${summary.dateRange.start.toDateString() !== summary.dateRange.end.toDateString() ? ` → ${summary.dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
            </div>
        </div>
    </div>

    <div class="container">
        <!-- PRIMARY METRICS -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-label">Total Events</span>
                    <span class="metric-icon">📊</span>
                </div>
                <div class="metric-value accent-blue" id="totalActivities">${total}</div>
                <div class="metric-detail">across ${sourceGroups.size} sources</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-label">Active Hours</span>
                    <span class="metric-icon">⏱</span>
                </div>
                <div class="metric-value accent-green" id="activeHours">${activeHours}</div>
                <div class="metric-detail">${avgPerHour} events/hour avg</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-label">Peak Hour</span>
                    <span class="metric-icon">📈</span>
                </div>
                <div class="metric-value accent-amber">${String(peakHour).padStart(2, "0")}:00</div>
                <div class="metric-detail">${Math.max(...hourlyData, 0)} events at peak</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-label">Work Sessions</span>
                    <span class="metric-icon">🔄</span>
                </div>
                <div class="metric-value accent-purple">${sessions}</div>
                <div class="metric-detail">${longestStreak}h longest streak</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-label">Focus Score</span>
                    <span class="metric-icon">🎯</span>
                </div>
                <div class="metric-value accent-pink">${focusScore}</div>
                <div class="metric-detail">concentration index</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-label">Diversity</span>
                    <span class="metric-icon">🔀</span>
                </div>
                <div class="metric-value accent-cyan">${diversityScore}%</div>
                <div class="metric-detail">source spread</div>
            </div>
        </div>

        <!-- SECONDARY METRICS BAR -->
        <div class="secondary-metrics">
            <div class="secondary-metric">
                <span class="secondary-metric-label">Morning (6-12)</span>
                <div class="secondary-metric-bar">
                    <div class="secondary-metric-fill blue" style="width: ${total > 0 ? (morningActivity / total) * 100 : 0}%"></div>
                </div>
                <span class="secondary-metric-value">${morningActivity}</span>
            </div>
            <div class="secondary-metric">
                <span class="secondary-metric-label">Afternoon (12-18)</span>
                <div class="secondary-metric-bar">
                    <div class="secondary-metric-fill green" style="width: ${total > 0 ? (afternoonActivity / total) * 100 : 0}%"></div>
                </div>
                <span class="secondary-metric-value">${afternoonActivity}</span>
            </div>
            <div class="secondary-metric">
                <span class="secondary-metric-label">Evening (18-24)</span>
                <div class="secondary-metric-bar">
                    <div class="secondary-metric-fill amber" style="width: ${total > 0 ? (eveningActivity / total) * 100 : 0}%"></div>
                </div>
                <span class="secondary-metric-value">${eveningActivity}</span>
            </div>
            <div class="secondary-metric">
                <span class="secondary-metric-label">Night (0-6)</span>
                <div class="secondary-metric-bar">
                    <div class="secondary-metric-fill purple" style="width: ${total > 0 ? (nightActivity / total) * 100 : 0}%"></div>
                </div>
                <span class="secondary-metric-value">${nightActivity}</span>
            </div>
        </div>

        <!-- FILTERS -->
        <div class="filters-section">
            <div class="filters-header">
                <span class="filters-label">Filter Sources</span>
            </div>
            <div class="filter-controls">
                ${Array.from(sourceGroups.keys())
									.map(
										(source, i) => `
                    <label class="filter-chip active">
                        <input type="checkbox" value="${source}" checked>
                        <span class="filter-dot" style="background: var(--chart-${(i % 8) + 1})"></span>
                        ${source.toUpperCase()}
                    </label>
                `,
									)
									.join("")}
            </div>
        </div>

        <!-- MAIN GRID -->
        <div class="main-grid">
            <!-- HOURLY CHART -->
            <div class="panel">
                <div class="panel-header">
                    <span class="panel-title">Hourly Distribution</span>
                    <span class="panel-badge">${activeHours}h active</span>
                </div>
                <div class="panel-body">
                    <div class="chart-container">
                        <canvas id="hourlyChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- SOURCE CHART + BREAKDOWN -->
            <div class="panel">
                <div class="panel-header">
                    <span class="panel-title">Source Distribution</span>
                    <span class="panel-badge">${sourceGroups.size} active</span>
                </div>
                <div class="panel-body">
                    <div class="source-list">
                        ${chartData
													.sort((a, b) => b.count - a.count)
													.map(
														(d, i) => `
                            <div class="source-row">
                                <div class="source-color" style="background: var(--chart-${(i % 8) + 1})"></div>
                                <div class="source-info">
                                    <div class="source-name">${d.source.toUpperCase()}</div>
                                    <div class="source-bar-container">
                                        <div class="source-bar" style="width: ${d.percentage}%; background: var(--chart-${(i % 8) + 1})"></div>
                                    </div>
                                </div>
                                <div class="source-stats">
                                    <span class="source-count">${d.count}</span>
                                    <span class="source-percent">${d.percentage}%</span>
                                </div>
                            </div>
                        `,
													)
													.join("")}
                    </div>
                </div>
            </div>

            <!-- ACTIVITY LOG -->
            <div class="panel activity-log">
                <div class="panel-header">
                    <span class="panel-title">Activity Log</span>
                    <span class="panel-badge">latest ${recentItems.length}</span>
                </div>
                <div class="panel-body">
                    ${recentItems
											.map(
												(item, i) => `
                        <div class="activity-item" style="animation-delay: ${0.6 + i * 0.03}s">
                            <span class="activity-time">${item.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                            <span class="activity-source">${item.source}</span>
                            <div class="activity-content">
                                <div class="activity-title">${item.title}</div>
                            </div>
                        </div>
                    `,
											)
											.join("")}
                    ${recentItems.length === 0 ? '<div class="activity-item"><span class="activity-title" style="color: var(--text-muted)">No recent activity</span></div>' : ""}
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="footer-text">
                Generated at <span>${summary.generatedAt.toLocaleString()}</span> • WORKLOG Command Center
            </div>
        </div>
    </div>

    <script>
        const allItems = ${JSON.stringify(
					summary.items.map((item) => ({
						source: item.source,
						timestamp: item.timestamp.toISOString(),
						title: item.title,
					})),
				)};
        const sourceData = ${JSON.stringify(chartData)};
        const originalHourlyData = ${JSON.stringify(hourlyData)};

        const chartColors = [
            '#58a6ff', '#3fb950', '#a371f7', '#f0883e',
            '#db61a2', '#39d353', '#d29922', '#f85149'
        ];

        Chart.defaults.color = '#8b949e';
        Chart.defaults.borderColor = '#21262d';
        Chart.defaults.font.family = "'JetBrains Mono', monospace";

        // Hourly Chart
        const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
        const gradient = hourlyCtx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, 'rgba(88, 166, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(88, 166, 255, 0.1)');

        const hourlyChart = new Chart(hourlyCtx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')),
                datasets: [{
                    label: 'Events',
                    data: originalHourlyData,
                    backgroundColor: gradient,
                    borderColor: '#58a6ff',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#161b22',
                        borderColor: '#30363d',
                        borderWidth: 1,
                        titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
                        bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: (items) => items[0].label + ':00',
                            label: (item) => item.raw + ' events'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(48, 54, 61, 0.5)', drawBorder: false },
                        ticks: { 
                            stepSize: 1,
                            font: { size: 10 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { 
                            font: { size: 10 },
                            maxRotation: 0
                        }
                    }
                }
            }
        });

        // Filter functionality
        function updateCharts() {
            const checkedSources = Array.from(document.querySelectorAll('.filter-chip input:checked'))
                .map(cb => cb.value);
            
            const filteredItems = allItems.filter(item => checkedSources.includes(item.source));
            const newHourlyData = Array.from({length: 24}, () => 0);
            for (const item of filteredItems) {
                const hour = new Date(item.timestamp).getHours();
                newHourlyData[hour]++;
            }
            
            hourlyChart.data.datasets[0].data = newHourlyData;
            hourlyChart.update();
            
            // Update metrics
            const total = filteredItems.length;
            const activeHours = newHourlyData.filter(h => h > 0).length;
            
            document.getElementById('totalActivities').textContent = total;
            document.getElementById('activeHours').textContent = activeHours;
        }
        
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = this.querySelector('input');
                    checkbox.checked = !checkbox.checked;
                }
                this.classList.toggle('active', this.querySelector('input').checked);
                updateCharts();
            });
        });
    </script>
</body>
</html>`;

	return html;
}
