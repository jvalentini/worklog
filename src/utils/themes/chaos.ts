import type { DashboardTheme } from "./types.ts";

export const chaosTheme: DashboardTheme = {
	id: "chaos",
	name: "CHAOS MODE",
	description: "Cyberpunk neon with isometric depth",
	colors: {
		bgPrimary: "#0a0a0f",
		bgSecondary: "#12121a",
		bgTertiary: "#1a1a25",
		bgElevated: "#15151f",
		borderPrimary: "#ff00ff40",
		borderSecondary: "#00ffff30",
		textPrimary: "#ffffff",
		textSecondary: "#00ffff",
		textMuted: "#ff00ff80",
		accentBlue: "#00ffff",
		accentGreen: "#00ff88",
		accentCyan: "#00ffff",
		accentAmber: "#ffff00",
		accentOrange: "#ff8800",
		accentPurple: "#ff00ff",
		accentPink: "#ff0088",
		accentRed: "#ff0044",
		chartColors: [
			"#00ffff",
			"#ff00ff",
			"#00ff88",
			"#ffff00",
			"#ff0088",
			"#00ffff",
			"#ff8800",
			"#ff0044",
		],
	},
	fonts: {
		primary: "'JetBrains Mono', 'Consolas', monospace",
		mono: "'JetBrains Mono', 'Consolas', monospace",
	},
	customCSS: `
        /* ISOMETRIC DEPTH SYSTEM */
        [data-theme="chaos"] html {
            --iso-perspective: 1200px;
            --iso-tilt: 8deg;
            --depth-scale: 0.92;
            --depth-fade: 0.85;
        }

        [data-theme="chaos"] body {
            background: linear-gradient(180deg, #0a0a0f 0%, #0d0515 30%, #0a0a0f 100%);
            overflow-x: hidden;
            perspective: var(--iso-perspective);
            perspective-origin: 50% 0%;
        }

        /* Isometric ground plane grid */
        [data-theme="chaos"] body::before {
            content: '';
            position: fixed;
            top: 0;
            left: -50%;
            right: -50%;
            bottom: -100%;
            background: 
                linear-gradient(90deg, transparent 49.5%, rgba(255, 0, 255, 0.08) 50%, transparent 50.5%),
                linear-gradient(0deg, transparent 49.5%, rgba(0, 255, 255, 0.05) 50%, transparent 50.5%);
            background-size: 80px 80px;
            transform: rotateX(75deg);
            transform-origin: top center;
            pointer-events: none;
            z-index: -1;
            animation: gridPulse 4s ease-in-out infinite;
        }

        /* Scanline overlay */
        [data-theme="chaos"] body::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 255, 0.015) 2px,
                rgba(0, 255, 255, 0.015) 4px
            );
            pointer-events: none;
            z-index: 9999;
        }

        [data-theme="chaos"] .header-bar {
            background: linear-gradient(90deg, rgba(255,0,255,0.15), rgba(0,0,0,0.8), rgba(0,255,255,0.15));
            border-bottom: 2px solid;
            border-image: linear-gradient(90deg, #ff00ff, transparent 20%, transparent 80%, #00ffff) 1;
            backdrop-filter: blur(10px);
        }

        [data-theme="chaos"] .logo-icon {
            background: linear-gradient(135deg, #ff00ff, #00ffff);
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
            animation: logoGlow 2s ease-in-out infinite;
        }

        /* ISOMETRIC CONTAINER */
        [data-theme="chaos"] .container {
            transform-style: preserve-3d;
            transform: rotateX(var(--iso-tilt));
            transform-origin: top center;
        }

        /* METRICS GRID - Isometric stepped layout */
        [data-theme="chaos"] .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            padding: 40px 20px;
            transform-style: preserve-3d;
        }

        [data-theme="chaos"] .metric-card {
            border: 1px solid transparent;
            background: linear-gradient(var(--bg-secondary), var(--bg-secondary)) padding-box,
                        linear-gradient(180deg, #ff00ff60, #00ffff30) border-box;
            box-shadow: 
                0 4px 20px rgba(0, 0, 0, 0.5),
                0 0 30px rgba(255, 0, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            transform-style: preserve-3d;
            transition: transform 0.4s ease, box-shadow 0.4s ease;
            animation: cardEmerge 0.6s ease-out backwards;
        }

        /* Staggered depth - cards recede into distance */
        [data-theme="chaos"] .metric-card:nth-child(1) {
            transform: translateZ(60px);
            animation-delay: 0.1s;
        }
        [data-theme="chaos"] .metric-card:nth-child(2) {
            transform: translateZ(40px);
            animation-delay: 0.15s;
        }
        [data-theme="chaos"] .metric-card:nth-child(3) {
            transform: translateZ(20px);
            animation-delay: 0.2s;
        }
        [data-theme="chaos"] .metric-card:nth-child(4) {
            transform: translateZ(0px);
            animation-delay: 0.25s;
        }
        [data-theme="chaos"] .metric-card:nth-child(5) {
            transform: translateZ(-20px);
            animation-delay: 0.3s;
        }
        [data-theme="chaos"] .metric-card:nth-child(6) {
            transform: translateZ(-40px);
            animation-delay: 0.35s;
        }

        [data-theme="chaos"] .metric-card:hover {
            transform: translateZ(80px) scale(1.02) !important;
            box-shadow: 
                0 8px 40px rgba(0, 0, 0, 0.6),
                0 0 50px rgba(255, 0, 255, 0.3),
                0 0 80px rgba(0, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            z-index: 100;
        }

        [data-theme="chaos"] .metric-value {
            text-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
        }

        /* SECONDARY METRICS - Floating plane */
        [data-theme="chaos"] .secondary-metrics {
            border: 1px solid transparent;
            background: linear-gradient(rgba(18, 18, 26, 0.95), rgba(18, 18, 26, 0.95)) padding-box,
                        linear-gradient(90deg, #ff00ff40, #00ffff40) border-box;
            transform: translateZ(-60px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
            animation: planeSlide 0.7s ease-out 0.4s backwards;
        }

        /* FILTERS - Receding plane */
        [data-theme="chaos"] .filters-section {
            transform: translateZ(-80px);
            animation: planeSlide 0.7s ease-out 0.5s backwards;
        }

        [data-theme="chaos"] .filter-chip {
            border: 1px solid #ff00ff40;
            transition: all 0.3s ease;
        }

        [data-theme="chaos"] .filter-chip:hover {
            border-color: #00ffff;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
            transform: translateZ(10px);
        }

        [data-theme="chaos"] .filter-chip.active {
            background: rgba(0, 255, 255, 0.15);
            border-color: #00ffff;
            color: #00ffff;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }

        /* MAIN GRID - Deep perspective panels */
        [data-theme="chaos"] .main-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 380px;
            gap: 24px;
            transform-style: preserve-3d;
        }

        [data-theme="chaos"] .panel {
            border: 1px solid transparent;
            background: linear-gradient(var(--bg-secondary), var(--bg-secondary)) padding-box,
                        linear-gradient(180deg, #00ffff40, #ff00ff20) border-box;
            box-shadow: 
                0 10px 40px rgba(0, 0, 0, 0.5),
                0 0 20px rgba(0, 255, 255, 0.05);
            transform-style: preserve-3d;
            transition: transform 0.5s ease, box-shadow 0.5s ease;
            animation: panelEmerge 0.6s ease-out backwards;
        }

        /* Panels at increasing depth - receding into distance */
        [data-theme="chaos"] .panel:nth-child(1) {
            transform: translateZ(-100px);
            animation-delay: 0.6s;
        }

        [data-theme="chaos"] .panel:nth-child(2) {
            transform: translateZ(-140px);
            animation-delay: 0.7s;
        }

        [data-theme="chaos"] .panel:nth-child(3) {
            transform: translateZ(-180px);
            animation-delay: 0.8s;
        }

        [data-theme="chaos"] .panel:hover {
            transform: translateZ(-60px) !important;
            box-shadow: 
                0 15px 60px rgba(0, 0, 0, 0.6),
                0 0 40px rgba(255, 0, 255, 0.2),
                0 0 60px rgba(0, 255, 255, 0.1);
        }

        [data-theme="chaos"] .panel-header {
            background: linear-gradient(90deg, rgba(0,255,255,0.1), rgba(255,0,255,0.05));
            border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        }

        [data-theme="chaos"] .panel-title::before {
            content: '▸';
            color: #00ffff;
            text-shadow: 0 0 10px #00ffff;
            margin-right: 4px;
        }

        /* ACTIVITY LOG items with depth cascade */
        [data-theme="chaos"] .activity-item {
            transition: all 0.3s ease;
            animation: itemSlide 0.4s ease-out backwards;
            border-left: 2px solid transparent;
        }

        [data-theme="chaos"] .activity-item:nth-child(1) { animation-delay: 0.9s; }
        [data-theme="chaos"] .activity-item:nth-child(2) { animation-delay: 0.95s; }
        [data-theme="chaos"] .activity-item:nth-child(3) { animation-delay: 1.0s; }
        [data-theme="chaos"] .activity-item:nth-child(4) { animation-delay: 1.05s; }
        [data-theme="chaos"] .activity-item:nth-child(5) { animation-delay: 1.1s; }
        [data-theme="chaos"] .activity-item:nth-child(6) { animation-delay: 1.15s; }
        [data-theme="chaos"] .activity-item:nth-child(7) { animation-delay: 1.2s; }
        [data-theme="chaos"] .activity-item:nth-child(8) { animation-delay: 1.25s; }

        [data-theme="chaos"] .activity-item:hover {
            background: linear-gradient(90deg, rgba(255,0,255,0.1), transparent);
            border-left-color: #ff00ff;
            padding-left: 18px;
        }

        [data-theme="chaos"] .status-dot {
            box-shadow: 0 0 10px currentColor;
            animation: pulse 2s ease-in-out infinite;
        }

        [data-theme="chaos"] .source-bar {
            box-shadow: 0 0 15px currentColor;
        }

        /* FOOTER - Deepest plane */
        [data-theme="chaos"] .footer {
            transform: translateZ(-220px);
            opacity: 0.8;
        }

        [data-theme="chaos"] .footer-text {
            text-shadow: 0 0 8px #ff00ff;
        }

        [data-theme="chaos"] ::selection {
            background: #ff00ff;
            color: #000;
        }

        /* Horizon glow effect */
        [data-theme="chaos"] .container::after {
            content: '';
            position: absolute;
            bottom: -200px;
            left: -10%;
            right: -10%;
            height: 400px;
            background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255, 0, 255, 0.15), transparent 60%),
                        radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 255, 255, 0.1), transparent 50%);
            pointer-events: none;
            transform: translateZ(-300px);
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
            [data-theme="chaos"] .metrics-grid { 
                grid-template-columns: repeat(3, 1fr); 
            }
            [data-theme="chaos"] .main-grid { 
                grid-template-columns: 1fr 1fr;
            }
            [data-theme="chaos"] .panel:nth-child(3) {
                grid-column: span 2;
            }
        }

        @media (max-width: 768px) {
            [data-theme="chaos"] html {
                --iso-tilt: 5deg;
                --iso-perspective: 800px;
            }
            [data-theme="chaos"] .metrics-grid { 
                grid-template-columns: repeat(2, 1fr); 
            }
            [data-theme="chaos"] .main-grid { 
                grid-template-columns: 1fr;
            }
            [data-theme="chaos"] .panel:nth-child(3) {
                grid-column: span 1;
            }
        }
    `,
	animations: `
        @keyframes logoGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 255, 0.5); }
            50% { box-shadow: 0 0 35px rgba(0, 255, 255, 0.7); }
        }

        @keyframes gridPulse {
            0%, 100% { 
                opacity: 1;
            }
            50% { 
                opacity: 0.7;
            }
        }

        @keyframes cardEmerge {
            0% {
                opacity: 0;
                transform: translateZ(-200px) translateY(40px);
            }
            100% {
                opacity: 1;
            }
        }

        @keyframes planeSlide {
            0% {
                opacity: 0;
                transform: translateZ(-300px) translateY(30px);
            }
            100% {
                opacity: 1;
            }
        }

        @keyframes panelEmerge {
            0% {
                opacity: 0;
                transform: translateZ(-400px) translateY(50px);
            }
            100% {
                opacity: 1;
            }
        }

        @keyframes itemSlide {
            0% {
                opacity: 0;
                transform: translateX(-20px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }

        @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
            52% { opacity: 1; }
            54% { opacity: 0.9; }
        }
    `,
};
