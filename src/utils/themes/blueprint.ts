import type { DashboardTheme } from "./types.ts";

export const blueprintTheme: DashboardTheme = {
	id: "blueprint",
	name: "Blueprint",
	description: "Technical drawing precision",
	colors: {
		bgPrimary: "#1E3A5F",
		bgSecondary: "#152238",
		bgTertiary: "#2A4A6F",
		bgElevated: "#1A2F4A",
		borderPrimary: "#7DD3FC80",
		borderSecondary: "#3B6EA560",
		textPrimary: "#F8FAFC",
		textSecondary: "#7DD3FC",
		textMuted: "#3B6EA5",
		accentBlue: "#7DD3FC",
		accentGreen: "#34D399",
		accentCyan: "#22D3EE",
		accentAmber: "#FDE68A",
		accentOrange: "#FDBA74",
		accentPurple: "#C4B5FD",
		accentPink: "#F9A8D4",
		accentRed: "#FCA5A5",
		chartColors: [
			"#7DD3FC",
			"#34D399",
			"#FDE68A",
			"#22D3EE",
			"#FDBA74",
			"#C4B5FD",
			"#F9A8D4",
			"#FCA5A5",
		],
	},
	fonts: {
		primary: "'IBM Plex Mono', monospace",
		mono: "'IBM Plex Mono', monospace",
	},
	customCSS: `
        /* FLAT ORTHOGONAL ENGINEERING DRAWING THEME */
        
        [data-theme="blueprint"] body {
            background: linear-gradient(180deg, #1E3A5F 0%, #152238 100%);
            font-family: var(--font-mono);
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        /* VISIBLE ALIGNMENT GRID - Like Figma/Sketch */
        [data-theme="blueprint"] body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 19px,
                    rgba(125, 211, 252, 0.25) 19px,
                    rgba(125, 211, 252, 0.25) 20px
                ),
                repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 19px,
                    rgba(125, 211, 252, 0.25) 19px,
                    rgba(125, 211, 252, 0.25) 20px
                );
            pointer-events: none;
            z-index: 0;
        }

        /* CENTER-LINE MARKERS - Long-short-long dashed pattern */
        [data-theme="blueprint"] body::after {
            content: '';
            position: fixed;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: repeating-linear-gradient(
                90deg,
                #7DD3FC60 0,
                #7DD3FC60 20px,
                transparent 20px,
                transparent 25px,
                #7DD3FC60 25px,
                #7DD3FC60 30px,
                transparent 30px,
                transparent 35px,
                #7DD3FC60 35px,
                #7DD3FC60 55px,
                transparent 55px,
                transparent 60px
            );
            pointer-events: none;
            z-index: 1;
        }

        /* HEADER BAR - Title block style */
        [data-theme="blueprint"] .header-bar {
            background: rgba(125, 211, 252, 0.03);
            border-bottom: 2px solid #7DD3FC80;
            border-top: 1px solid #7DD3FC40;
            position: relative;
        }

        [data-theme="blueprint"] .header-bar::before {
            content: 'DWG-2026-001';
            position: absolute;
            top: 2px;
            right: 24px;
            font-size: 8px;
            color: #3B6EA5;
            letter-spacing: 0.15em;
        }

        [data-theme="blueprint"] .logo-icon {
            background: transparent;
            border: 2px solid #7DD3FC;
            color: #7DD3FC;
            border-radius: 0;
            box-shadow: none;
            font-weight: 300;
        }

        [data-theme="blueprint"] .logo {
            font-weight: 300;
            letter-spacing: 0.2em;
        }

        /* METRICS GRID - Strict 6-column alignment */
        [data-theme="blueprint"] .metrics-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 24px;
            margin-bottom: 32px;
            margin-top: 40px;
        }

        /* METRIC CARDS - With dimension callouts */
        [data-theme="blueprint"] .metric-card {
            background: #152238;
            border: 1px solid #7DD3FC80;
            border-radius: 0;
            box-shadow: none;
            position: relative;
            animation: blueprintFadeIn 0.6s ease-out backwards;
        }

        [data-theme="blueprint"] .metric-card:nth-child(1) { animation-delay: 0.1s; }
        [data-theme="blueprint"] .metric-card:nth-child(2) { animation-delay: 0.15s; }
        [data-theme="blueprint"] .metric-card:nth-child(3) { animation-delay: 0.2s; }
        [data-theme="blueprint"] .metric-card:nth-child(4) { animation-delay: 0.25s; }
        [data-theme="blueprint"] .metric-card:nth-child(5) { animation-delay: 0.3s; }
        [data-theme="blueprint"] .metric-card:nth-child(6) { animation-delay: 0.35s; }

        /* Dimension line - horizontal with arrows */
        [data-theme="blueprint"] .metric-card::after {
            content: '← ' attr(data-dimension) ' →';
            position: absolute;
            bottom: -24px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
            color: #3B6EA5;
            font-family: var(--font-mono);
            letter-spacing: 0.15em;
            text-transform: uppercase;
            white-space: nowrap;
        }

        /* Detail marker - top right corner */
        [data-theme="blueprint"] .metric-card::before {
            content: 'DETAIL ' counter(detail-counter);
            counter-increment: detail-counter;
            position: absolute;
            top: -20px;
            right: 0;
            font-size: 7px;
            color: #3B6EA5;
            font-family: var(--font-mono);
            letter-spacing: 0.2em;
            padding: 2px 6px;
            border: 1px dashed #3B6EA560;
            background: #1E3A5F;
        }

        /* Cross-section marker - top left */
        [data-theme="blueprint"] .metric-card .metric-header::before {
            content: '';
            position: absolute;
            top: -8px;
            left: -8px;
            width: 16px;
            height: 16px;
            border: 1px solid #7DD3FC;
            border-radius: 50%;
            background: #152238;
            z-index: 10;
        }

        [data-theme="blueprint"] .metric-card .metric-header::after {
            content: 'A';
            position: absolute;
            top: -8px;
            left: -8px;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            color: #7DD3FC;
            font-weight: 600;
            z-index: 11;
        }

        [data-theme="blueprint"] .metric-card:nth-child(2) .metric-header::after { content: 'B'; }
        [data-theme="blueprint"] .metric-card:nth-child(3) .metric-header::after { content: 'C'; }
        [data-theme="blueprint"] .metric-card:nth-child(4) .metric-header::after { content: 'D'; }
        [data-theme="blueprint"] .metric-card:nth-child(5) .metric-header::after { content: 'E'; }
        [data-theme="blueprint"] .metric-card:nth-child(6) .metric-header::after { content: 'F'; }

        [data-theme="blueprint"] .metric-card:hover {
            border-color: #7DD3FC;
            box-shadow: 0 0 0 1px #7DD3FC40;
            transition: all 0.2s ease;
        }

        /* METRIC TEXT - Technical lettering */
        [data-theme="blueprint"] .metric-value {
            text-shadow: none;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-weight: 300;
        }

        [data-theme="blueprint"] .metric-label {
            text-shadow: none;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            font-size: 9px;
            font-weight: 300;
        }

        [data-theme="blueprint"] .metric-label::before {
            content: '// ';
            color: #3B6EA5;
        }

        [data-theme="blueprint"] .metric-label::after {
            content: '';
        }

        [data-theme="blueprint"] .metric-detail {
            font-weight: 300;
            letter-spacing: 0.1em;
        }

        /* MAIN GRID - 3-column strict layout */
        [data-theme="blueprint"] .main-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
        }

        /* PANELS - Section labels and dimensions */
        [data-theme="blueprint"] .panel {
            background: #152238;
            border: 1px solid #7DD3FC80;
            border-radius: 0;
            box-shadow: none;
            position: relative;
            animation: blueprintFadeIn 0.6s ease-out backwards;
        }

        [data-theme="blueprint"] .panel:nth-child(1) { animation-delay: 0.4s; }
        [data-theme="blueprint"] .panel:nth-child(2) { animation-delay: 0.5s; }
        [data-theme="blueprint"] .panel:nth-child(3) { animation-delay: 0.6s; }

        /* Section label - top of panel */
        [data-theme="blueprint"] .panel::before {
            content: 'SECTION A-A';
            position: absolute;
            top: -22px;
            left: 0;
            font-size: 8px;
            color: #7DD3FC;
            font-family: var(--font-mono);
            letter-spacing: 0.2em;
            font-weight: 600;
        }

        [data-theme="blueprint"] .panel:nth-child(2)::before { content: 'SECTION B-B'; }
        [data-theme="blueprint"] .panel:nth-child(3)::before { content: 'SECTION C-C'; }

        /* Vertical dimension line - right side */
        [data-theme="blueprint"] .panel::after {
            content: '↕';
            position: absolute;
            top: 50%;
            right: -18px;
            transform: translateY(-50%);
            font-size: 10px;
            color: #3B6EA560;
            font-family: var(--font-mono);
        }

        /* PANEL HEADER - Section title */
        [data-theme="blueprint"] .panel-header {
            background: rgba(125, 211, 252, 0.03);
            border-bottom: 1px solid #3B6EA560;
            border-radius: 0;
            position: relative;
        }

        [data-theme="blueprint"] .panel-title {
            text-shadow: none;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            font-weight: 300;
        }

        [data-theme="blueprint"] .panel-title::before {
            content: '§ ';
            color: #7DD3FC;
            text-shadow: none;
        }

        /* Revision marker - top right of panel */
        [data-theme="blueprint"] .panel-header::after {
            content: 'REV. A';
            position: absolute;
            top: 8px;
            right: 16px;
            font-size: 7px;
            color: #3B6EA5;
            letter-spacing: 0.2em;
            padding: 2px 6px;
            border: 1px dashed #3B6EA540;
        }

        /* STATUS DOTS - Square indicators */
        [data-theme="blueprint"] .status-dot {
            box-shadow: none;
            border-radius: 0;
            clip-path: none;
            width: 8px;
            height: 8px;
            border: 1px solid currentColor;
        }

        /* FILTER CHIPS - Technical buttons */
        [data-theme="blueprint"] .filter-chip {
            border: 1px dashed #7DD3FC60;
            border-radius: 0;
            background: rgba(125, 211, 252, 0.02);
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-weight: 300;
        }

        [data-theme="blueprint"] .filter-chip:hover {
            border-style: solid;
            border-color: #7DD3FC;
            box-shadow: none;
            background: rgba(125, 211, 252, 0.05);
        }

        [data-theme="blueprint"] .filter-chip.active {
            background: rgba(125, 211, 252, 0.08);
            border-style: solid;
            border-color: #7DD3FC;
            color: #7DD3FC;
            box-shadow: none;
        }

        [data-theme="blueprint"] .filter-dot {
            border-radius: 0;
        }

        /* SOURCE BARS - No glow */
        [data-theme="blueprint"] .source-bar {
            box-shadow: none;
            border-radius: 0;
        }

        [data-theme="blueprint"] .source-name {
            font-weight: 300;
            letter-spacing: 0.1em;
        }

        /* ACTIVITY LOG */
        [data-theme="blueprint"] .activity-item {
            border-bottom: 1px dashed #3B6EA540;
        }

        [data-theme="blueprint"] .activity-item:hover {
            background: rgba(125, 211, 252, 0.03);
            border-radius: 0;
            border-bottom: 1px solid #7DD3FC40;
        }

        [data-theme="blueprint"] .activity-source {
            border: 1px solid #3B6EA540;
            border-radius: 0;
            font-weight: 300;
        }

        [data-theme="blueprint"] .activity-time {
            font-weight: 300;
        }

        /* SECONDARY METRICS */
        [data-theme="blueprint"] .secondary-metrics {
            border: 1px solid #7DD3FC60;
            border-radius: 0;
            position: relative;
        }

        [data-theme="blueprint"] .secondary-metrics::before {
            content: 'TEMPORAL DISTRIBUTION';
            position: absolute;
            top: -20px;
            left: 0;
            font-size: 8px;
            color: #3B6EA5;
            letter-spacing: 0.2em;
        }

        [data-theme="blueprint"] .secondary-metric-label {
            font-weight: 300;
            letter-spacing: 0.12em;
        }

        [data-theme="blueprint"] .secondary-metric-value {
            font-weight: 300;
        }

        [data-theme="blueprint"] .secondary-metric-bar {
            border-radius: 0;
        }

        [data-theme="blueprint"] .secondary-metric-fill {
            border-radius: 0;
        }

        /* FOOTER - Title block style */
        [data-theme="blueprint"] .footer {
            border-top: 2px solid #7DD3FC80;
            border-bottom: 1px solid #7DD3FC40;
            background: rgba(125, 211, 252, 0.02);
            position: relative;
            padding: 20px 24px;
        }

        [data-theme="blueprint"] .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-left: 1px solid #7DD3FC40;
            border-right: 1px solid #7DD3FC40;
            pointer-events: none;
        }

        /* Title block compartments */
        [data-theme="blueprint"] .footer::after {
            content: 'DRAWN: AI SYSTEM | CHECKED: USER | SCALE: 1:1';
            position: absolute;
            bottom: 4px;
            left: 24px;
            font-size: 7px;
            color: #3B6EA5;
            letter-spacing: 0.15em;
        }

        [data-theme="blueprint"] .footer-text {
            text-shadow: none;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            font-weight: 300;
        }

        /* DATE BADGE */
        [data-theme="blueprint"] .date-badge {
            border: 1px solid #7DD3FC60;
            border-radius: 0;
            font-weight: 300;
            letter-spacing: 0.12em;
        }

        /* THEME BUTTON */
        [data-theme="blueprint"] .theme-btn {
            border: 1px solid #7DD3FC60;
            border-radius: 0;
            font-weight: 300;
            letter-spacing: 0.12em;
        }

        /* ALL TEXT - Monospace technical */
        [data-theme="blueprint"] * {
            font-family: var(--font-mono);
        }

        /* SELECTION */
        [data-theme="blueprint"] ::selection {
            background: #7DD3FC;
            color: #1E3A5F;
        }

        /* Counter reset for detail markers */
        [data-theme="blueprint"] .metrics-grid {
            counter-reset: detail-counter;
        }

        /* RESPONSIVE - Maintain strict grid */
        @media (max-width: 1200px) {
            [data-theme="blueprint"] .metrics-grid {
                grid-template-columns: repeat(3, 1fr);
            }
            [data-theme="blueprint"] .main-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            [data-theme="blueprint"] .panel:nth-child(3) {
                grid-column: span 2;
            }
        }

        @media (max-width: 768px) {
            [data-theme="blueprint"] .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            [data-theme="blueprint"] .main-grid {
                grid-template-columns: 1fr;
            }
            [data-theme="blueprint"] .panel:nth-child(3) {
                grid-column: span 1;
            }
        }
    `,
	animations: `
        @keyframes blueprintFadeIn {
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }
    `,
};
