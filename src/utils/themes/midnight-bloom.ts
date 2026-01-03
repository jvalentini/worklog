import type { DashboardTheme } from "./types.ts";

export const midnightBloomTheme: DashboardTheme = {
	id: "midnight-bloom",
	name: "Midnight Bloom",
	description: "Editorial warmth meets midnight elegance",
	colors: {
		bgPrimary: "#0F172A",
		bgSecondary: "#1E293B",
		bgTertiary: "#334155",
		bgElevated: "#1E293B",
		borderPrimary: "#FB718540",
		borderSecondary: "#FB718530",
		textPrimary: "#F8FAFC",
		textSecondary: "#94A3B8",
		textMuted: "#64748B",
		accentBlue: "#38BDF8",
		accentGreen: "#4ADE80",
		accentCyan: "#22D3EE",
		accentAmber: "#FEF3C7",
		accentOrange: "#EA580C",
		accentPurple: "#C4B5FD",
		accentPink: "#FB7185",
		accentRed: "#F43F5E",
		chartColors: [
			"#FB7185",
			"#EA580C",
			"#C4B5FD",
			"#38BDF8",
			"#FEF3C7",
			"#4ADE80",
			"#22D3EE",
			"#F43F5E",
		],
	},
	fonts: {
		primary: "'Fraunces', 'Georgia', serif",
		mono: "'JetBrains Mono', monospace",
	},
	customCSS: `
        /* GEOMETRIC NIGHT GARDEN - Clean, luminous, no rotation */
        [data-theme="midnight-bloom"] body {
            background: 
                radial-gradient(circle at 20% 80%, rgba(251, 113, 133, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.04) 0%, transparent 40%),
                linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
        }

        [data-theme="midnight-bloom"] .header-bar {
            background: linear-gradient(90deg, rgba(251, 113, 133, 0.06), rgba(234, 88, 12, 0.04));
            border-bottom: 1px solid #FB718550;
            backdrop-filter: blur(12px);
        }

        [data-theme="midnight-bloom"] .logo-icon {
            background: linear-gradient(135deg, #FB7185, #EA580C);
            color: #0F172A;
            border-radius: 12px;
            box-shadow: 0 0 24px rgba(251, 113, 133, 0.4),
                        0 0 8px rgba(251, 113, 133, 0.6);
            animation: bloomPulse 4s ease-in-out infinite;
        }

        [data-theme="midnight-bloom"] .container {
            max-width: 1800px;
        }

        /* METRICS GRID - Asymmetric Masonry (NO ROTATION) */
        [data-theme="midnight-bloom"] .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: minmax(100px, auto);
            gap: 20px;
            margin-bottom: 40px;
        }

        /* Large hero cards */
        [data-theme="midnight-bloom"] .metric-card:nth-child(1) {
            grid-column: 1 / 3;
            grid-row: span 2;
        }

        [data-theme="midnight-bloom"] .metric-card:nth-child(2) {
            grid-column: 3;
            grid-row: span 1;
        }

        [data-theme="midnight-bloom"] .metric-card:nth-child(3) {
            grid-column: 3;
            grid-row: span 1;
        }

        [data-theme="midnight-bloom"] .metric-card:nth-child(4) {
            grid-column: 1;
            grid-row: span 1;
        }

        [data-theme="midnight-bloom"] .metric-card:nth-child(5) {
            grid-column: 2;
            grid-row: span 1;
        }

        [data-theme="midnight-bloom"] .metric-card:nth-child(6) {
            grid-column: 3;
            grid-row: span 1;
        }

        /* Base card styling - clean geometric with glow */
        [data-theme="midnight-bloom"] .metric-card {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
            border: 1px solid transparent;
            border-radius: 12px;
            padding: 28px;
            position: relative;
            overflow: hidden;
            animation: bloomFadeIn 0.8s ease-out backwards;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Gradient border glow effect */
        [data-theme="midnight-bloom"] .metric-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 12px;
            padding: 1px;
            background: linear-gradient(135deg, 
                rgba(251, 113, 133, 0.3), 
                rgba(56, 189, 248, 0.2),
                rgba(251, 113, 133, 0.1)
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.6;
            pointer-events: none;
        }

        /* Inner glow */
        [data-theme="midnight-bloom"] .metric-card::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 12px;
            background: radial-gradient(
                circle at 50% 0%,
                rgba(251, 113, 133, 0.08) 0%,
                transparent 70%
            );
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        [data-theme="midnight-bloom"] .metric-card:hover::after {
            opacity: 1;
        }

        /* Stagger entrance animations */
        [data-theme="midnight-bloom"] .metric-card:nth-child(1) { animation-delay: 0.05s; }
        [data-theme="midnight-bloom"] .metric-card:nth-child(2) { animation-delay: 0.1s; }
        [data-theme="midnight-bloom"] .metric-card:nth-child(3) { animation-delay: 0.15s; }
        [data-theme="midnight-bloom"] .metric-card:nth-child(4) { animation-delay: 0.2s; }
        [data-theme="midnight-bloom"] .metric-card:nth-child(5) { animation-delay: 0.25s; }
        [data-theme="midnight-bloom"] .metric-card:nth-child(6) { animation-delay: 0.3s; }

        /* Hover glow bloom */
        [data-theme="midnight-bloom"] .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 0 40px rgba(251, 113, 133, 0.2),
                0 8px 32px rgba(251, 113, 133, 0.15),
                inset 0 1px 0 rgba(251, 113, 133, 0.1);
        }

        [data-theme="midnight-bloom"] .metric-card:hover::before {
            opacity: 1;
        }

        [data-theme="midnight-bloom"] .metric-value {
            text-shadow: 0 0 16px rgba(251, 113, 133, 0.4);
            letter-spacing: -0.03em;
            position: relative;
            z-index: 2;
        }

        [data-theme="midnight-bloom"] .metric-label {
            text-shadow: 0 0 8px rgba(251, 113, 133, 0.3);
            letter-spacing: 0.05em;
            position: relative;
            z-index: 2;
        }

        [data-theme="midnight-bloom"] .metric-header,
        [data-theme="midnight-bloom"] .metric-detail {
            position: relative;
            z-index: 2;
        }

        /* Hero card special styling */
        [data-theme="midnight-bloom"] .metric-card:nth-child(1) {
            padding: 48px 40px;
        }

        [data-theme="midnight-bloom"] .metric-card:nth-child(1) .metric-value {
            font-size: 64px;
            font-weight: 300;
            letter-spacing: -0.05em;
        }

        [data-theme="midnight-bloom"] .metric-card:nth-child(1) .metric-label {
            font-size: 14px;
            font-family: var(--font-primary);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        /* MAIN GRID - Asymmetric but structured */
        [data-theme="midnight-bloom"] .main-grid {
            display: grid;
            grid-template-columns: 1.3fr 1fr;
            grid-template-rows: auto auto;
            gap: 24px;
            margin-bottom: 32px;
        }

        /* Panel 1 - Large primary */
        [data-theme="midnight-bloom"] .panel:nth-child(1) {
            grid-column: 1;
            grid-row: 1 / 3;
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
            border: 1px solid transparent;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            animation: bloomFadeIn 0.8s ease-out 0.35s backwards;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Panel 2 - Secondary */
        [data-theme="midnight-bloom"] .panel:nth-child(2) {
            grid-column: 2;
            grid-row: 1;
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
            border: 1px solid transparent;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            animation: bloomFadeIn 0.8s ease-out 0.4s backwards;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Panel 3 - HORIZONTAL TIMELINE */
        [data-theme="midnight-bloom"] .panel:nth-child(3) {
            grid-column: 1 / -1;
            grid-row: 3;
            background: linear-gradient(90deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
            border: 1px solid transparent;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            animation: bloomFadeIn 0.8s ease-out 0.45s backwards;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 320px;
        }

        /* Gradient borders for panels */
        [data-theme="midnight-bloom"] .panel::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 16px;
            padding: 1px;
            background: linear-gradient(135deg, 
                rgba(251, 113, 133, 0.3), 
                rgba(56, 189, 248, 0.2),
                rgba(234, 88, 12, 0.2)
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.5;
            pointer-events: none;
            z-index: 1;
        }

        /* Inner luminosity */
        [data-theme="midnight-bloom"] .panel::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 16px;
            background: radial-gradient(
                circle at 50% 0%,
                rgba(251, 113, 133, 0.06) 0%,
                transparent 60%
            );
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s ease;
            z-index: 1;
        }

        [data-theme="midnight-bloom"] .panel:hover::after {
            opacity: 1;
        }

        [data-theme="midnight-bloom"] .panel:hover {
            box-shadow: 
                0 0 48px rgba(251, 113, 133, 0.15),
                0 12px 40px rgba(251, 113, 133, 0.12),
                inset 0 1px 0 rgba(251, 113, 133, 0.08);
        }

        [data-theme="midnight-bloom"] .panel:hover::before {
            opacity: 0.8;
        }

        /* Horizontal timeline styling */
        [data-theme="midnight-bloom"] .panel:nth-child(3) .panel-body {
            overflow-x: auto;
            overflow-y: hidden;
            display: flex;
            gap: 16px;
            padding: 20px 24px;
            scroll-behavior: smooth;
        }

        [data-theme="midnight-bloom"] .panel:nth-child(3) .panel-body::-webkit-scrollbar {
            height: 8px;
        }

        [data-theme="midnight-bloom"] .panel:nth-child(3) .panel-body::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.4);
            border-radius: 4px;
            margin: 0 24px;
        }

        [data-theme="midnight-bloom"] .panel:nth-child(3) .panel-body::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, rgba(251, 113, 133, 0.5), rgba(234, 88, 12, 0.4));
            border-radius: 4px;
            box-shadow: 0 0 8px rgba(251, 113, 133, 0.3);
        }

        [data-theme="midnight-bloom"] .panel:nth-child(3) .panel-body::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(90deg, rgba(251, 113, 133, 0.7), rgba(234, 88, 12, 0.6));
        }

        /* Timeline activity cards */
        [data-theme="midnight-bloom"] .panel:nth-child(3) .activity-item {
            flex: 0 0 auto;
            min-width: 300px;
            max-width: 340px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 18px 20px;
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(51, 65, 85, 0.5) 100%);
            border: 1px solid rgba(251, 113, 133, 0.15);
            border-radius: 10px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            animation: slideIn 0.4s ease-out backwards;
        }

        /* Luminous border on hover */
        [data-theme="midnight-bloom"] .panel:nth-child(3) .activity-item::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 10px;
            padding: 1px;
            background: linear-gradient(135deg, 
                rgba(251, 113, 133, 0.4), 
                rgba(56, 189, 248, 0.3)
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
        }

        [data-theme="midnight-bloom"] .panel:nth-child(3) .activity-item:hover {
            transform: translateY(-4px);
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.7) 100%);
            border-color: rgba(251, 113, 133, 0.3);
            box-shadow: 
                0 0 24px rgba(251, 113, 133, 0.2),
                0 8px 24px rgba(0, 0, 0, 0.3);
        }

        [data-theme="midnight-bloom"] .panel:nth-child(3) .activity-item:hover::before {
            opacity: 1;
        }

        [data-theme="midnight-bloom"] .panel-header {
            background: linear-gradient(90deg, rgba(251, 113, 133, 0.1), rgba(234, 88, 12, 0.06));
            border-bottom: 1px solid rgba(251, 113, 133, 0.2);
            border-radius: 16px 16px 0 0;
            position: relative;
            z-index: 2;
        }

        [data-theme="midnight-bloom"] .panel-title {
            text-shadow: 0 0 12px rgba(251, 113, 133, 0.4);
            letter-spacing: 0.02em;
            font-weight: 500;
            font-family: var(--font-primary);
            position: relative;
            z-index: 2;
        }

        [data-theme="midnight-bloom"] .panel-title::before {
            content: '✦';
            margin-right: 0.5em;
            text-shadow: 0 0 16px rgba(251, 113, 133, 0.6);
            color: #FB7185;
        }

        [data-theme="midnight-bloom"] .panel-body {
            position: relative;
            z-index: 2;
        }

        /* Enhanced status elements */
        [data-theme="midnight-bloom"] .status-dot {
            box-shadow: 0 0 12px currentColor, 0 0 4px currentColor;
            animation: bloomPulse 3s ease-in-out infinite;
        }

        [data-theme="midnight-bloom"] .filter-chip {
            border: 1px solid rgba(251, 113, 133, 0.3);
            border-radius: 8px;
            background: rgba(251, 113, 133, 0.06);
            transition: all 0.3s ease;
        }

        [data-theme="midnight-bloom"] .filter-chip:hover {
            border-color: rgba(251, 113, 133, 0.5);
            background: rgba(251, 113, 133, 0.12);
            box-shadow: 0 0 20px rgba(251, 113, 133, 0.2);
        }

        [data-theme="midnight-bloom"] .filter-chip.active {
            background: rgba(251, 113, 133, 0.18);
            border-color: #FB7185;
            color: #FB7185;
            box-shadow: 0 0 24px rgba(251, 113, 133, 0.3);
        }

        [data-theme="midnight-bloom"] .source-bar {
            box-shadow: 0 0 12px currentColor;
            border-radius: 8px;
        }

        [data-theme="midnight-bloom"] .footer-text {
            text-shadow: 0 0 8px rgba(251, 113, 133, 0.3);
            letter-spacing: 0.02em;
        }

        [data-theme="midnight-bloom"] ::selection {
            background: #FB7185;
            color: #0F172A;
        }

        /* Subtle atmospheric texture */
        [data-theme="midnight-bloom"] body::before {
            content: '';
            position: fixed;
            inset: 0;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100" height="100" filter="url(%23noise)" opacity="0.03"/></svg>');
            pointer-events: none;
            z-index: 9999;
            opacity: 0.5;
        }

        /* Responsive */
        @media (max-width: 1200px) {
            [data-theme="midnight-bloom"] .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            [data-theme="midnight-bloom"] .metric-card:nth-child(1) {
                grid-column: 1 / -1;
                grid-row: span 1;
            }

            [data-theme="midnight-bloom"] .metric-card:nth-child(2),
            [data-theme="midnight-bloom"] .metric-card:nth-child(3),
            [data-theme="midnight-bloom"] .metric-card:nth-child(4),
            [data-theme="midnight-bloom"] .metric-card:nth-child(5),
            [data-theme="midnight-bloom"] .metric-card:nth-child(6) {
                grid-column: auto;
                grid-row: span 1;
            }

            [data-theme="midnight-bloom"] .main-grid {
                grid-template-columns: 1fr;
                grid-template-rows: auto auto auto;
            }

            [data-theme="midnight-bloom"] .panel:nth-child(1) {
                grid-column: 1;
                grid-row: 1;
            }

            [data-theme="midnight-bloom"] .panel:nth-child(2) {
                grid-column: 1;
                grid-row: 2;
            }

            [data-theme="midnight-bloom"] .panel:nth-child(3) {
                grid-column: 1;
                grid-row: 3;
            }
        }

        @media (max-width: 768px) {
            [data-theme="midnight-bloom"] .metrics-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            [data-theme="midnight-bloom"] .panel:nth-child(3) .activity-item {
                min-width: 260px;
            }
        }
    `,
	animations: `
        @keyframes bloomPulse {
            0%, 100% { 
                box-shadow: 
                    0 0 24px rgba(251, 113, 133, 0.4),
                    0 0 8px rgba(251, 113, 133, 0.6);
                filter: brightness(1);
            }
            50% { 
                box-shadow: 
                    0 0 32px rgba(251, 113, 133, 0.6),
                    0 0 12px rgba(251, 113, 133, 0.8);
                filter: brightness(1.1);
            }
        }

        @keyframes bloomFadeIn {
            0% {
                opacity: 0;
                transform: translateY(20px);
                filter: blur(4px);
            }
            60% {
                opacity: 1;
            }
            100% {
                opacity: 1;
                transform: translateY(0);
                filter: blur(0);
            }
        }

        @keyframes slideIn {
            0% {
                opacity: 0;
                transform: translateX(-30px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `,
};
