import type { DashboardTheme } from "./types.ts";

export const forestTheme: DashboardTheme = {
	id: "forest",
	name: "Forest",
	description: "Descend into a misty grove",
	colors: {
		bgPrimary: "#1A2F1A",
		bgSecondary: "#2D2418",
		bgTertiary: "#223322",
		bgElevated: "#1F2B1F",
		borderPrimary: "#4ADE8040",
		borderSecondary: "#22C55E30",
		textPrimary: "#ECFDF5",
		textSecondary: "#86EFAC",
		textMuted: "#4ADE80",
		accentBlue: "#22D3EE",
		accentGreen: "#4ADE80",
		accentCyan: "#6EE7B7",
		accentAmber: "#FEF3C7",
		accentOrange: "#FB923C",
		accentPurple: "#C4B5FD",
		accentPink: "#F9A8D4",
		accentRed: "#F87171",
		chartColors: [
			"#4ADE80",
			"#78716C",
			"#FEF3C7",
			"#22C55E",
			"#FB923C",
			"#6EE7B7",
			"#A78BFA",
			"#F87171",
		],
	},
	fonts: {
		primary: "'Literata', 'Georgia', serif",
		mono: "'JetBrains Mono', monospace",
	},
	customCSS: `
        [data-theme="forest"] body {
            background: radial-gradient(ellipse at bottom, #1A2F1A 0%, #0F1F0F 100%);
            overflow-x: hidden;
        }

        [data-theme="forest"] .forest-parallax-bg {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        }

        [data-theme="forest"] .forest-layer {
            position: absolute;
            width: 100%;
            height: 100%;
            will-change: transform;
        }

        [data-theme="forest"] .mountain-range {
            position: absolute;
            bottom: 0;
            width: 100%;
            fill: currentColor;
        }

        [data-theme="forest"] .mountain-range.far {
            color: #0A1A0A;
            opacity: 0.6;
        }

        [data-theme="forest"] .mountain-range.mid {
            color: #152815;
            opacity: 0.75;
        }

        [data-theme="forest"] .mountain-range.near {
            color: #1F3A1F;
            opacity: 0.85;
        }

        [data-theme="forest"] .tree-silhouette {
            position: absolute;
            fill: currentColor;
        }

        [data-theme="forest"] .tree-layer-1 {
            color: #0D1D0D;
            opacity: 0.5;
        }

        [data-theme="forest"] .tree-layer-2 {
            color: #1A2F1A;
            opacity: 0.7;
        }

        [data-theme="forest"] .tree-layer-3 {
            color: #2D5A2D;
            opacity: 0.85;
        }

        [data-theme="forest"] .forest-mist {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100vh;
            background: linear-gradient(
                180deg,
                rgba(26, 47, 26, 0.85) 0%,
                rgba(26, 47, 26, 0.5) 25%,
                rgba(26, 47, 26, 0.2) 60%,
                transparent 90%
            );
            opacity: var(--mist-opacity, 1);
            transition: opacity 0.2s ease-out;
        }

        [data-theme="forest"] .header-bar {
            background: rgba(26, 47, 26, 0.9);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid #4ADE8030;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        [data-theme="forest"] .logo-icon {
            background: #4ADE80;
            color: #1A2F1A;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
        }

        [data-theme="forest"] .container {
            position: relative;
            z-index: 1;
        }

        [data-theme="forest"] .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

        [data-theme="forest"] .metric-card {
            background: linear-gradient(
                180deg,
                rgba(34, 51, 34, 0.8) 0%,
                rgba(45, 36, 24, 0.6) 100%
            );
            border: 1px solid #4ADE8030;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
            transform: scale(var(--depth-scale, 0.92)) translateY(var(--depth-y, 20px));
            opacity: var(--depth-opacity, 0.4);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.3s ease;
        }

        [data-theme="forest"] .metric-card.revealed {
            --depth-scale: 1;
            --depth-y: 0px;
            --depth-opacity: 1;
        }

        [data-theme="forest"] .metric-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
                180deg,
                rgba(74, 222, 128, 0.05) 0%,
                transparent 50%
            );
            pointer-events: none;
        }

        [data-theme="forest"] .metric-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(26, 47, 26, var(--mist-overlay, 0.3));
            pointer-events: none;
            transition: background 0.4s ease;
        }

        [data-theme="forest"] .metric-card.revealed::after {
            --mist-overlay: 0;
        }

        [data-theme="forest"] .metric-card:hover {
            box-shadow: 0 8px 30px rgba(74, 222, 128, 0.2);
            border-color: #4ADE8050;
        }

        [data-theme="forest"] .metric-value {
            text-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
        }

        [data-theme="forest"] .secondary-metrics {
            background: linear-gradient(
                90deg,
                rgba(34, 51, 34, 0.7) 0%,
                rgba(45, 36, 24, 0.5) 100%
            );
            border: 1px solid #4ADE8030;
            border-radius: 12px;
            transform: scale(var(--depth-scale, 0.92)) translateY(var(--depth-y, 20px));
            opacity: var(--depth-opacity, 0.4);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-theme="forest"] .secondary-metrics.revealed {
            --depth-scale: 1;
            --depth-y: 0px;
            --depth-opacity: 1;
        }

        [data-theme="forest"] .filters-section {
            transform: scale(var(--depth-scale, 0.92)) translateY(var(--depth-y, 20px));
            opacity: var(--depth-opacity, 0.4);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-theme="forest"] .filters-section.revealed {
            --depth-scale: 1;
            --depth-y: 0px;
            --depth-opacity: 1;
        }

        [data-theme="forest"] .main-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 380px;
            gap: 24px;
        }

        [data-theme="forest"] .panel {
            background: linear-gradient(
                180deg,
                rgba(34, 51, 34, 0.85) 0%,
                rgba(45, 36, 24, 0.7) 100%
            );
            border: 1px solid #4ADE8030;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            position: relative;
            overflow: hidden;
            transform: scale(var(--depth-scale, 0.88)) translateY(var(--depth-y, 40px));
            opacity: var(--depth-opacity, 0.3);
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.3s ease;
        }

        [data-theme="forest"] .panel.revealed {
            --depth-scale: 1;
            --depth-y: 0px;
            --depth-opacity: 1;
        }

        [data-theme="forest"] .panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(26, 47, 26, var(--mist-overlay, 0.4));
            pointer-events: none;
            transition: background 0.5s ease;
        }

        [data-theme="forest"] .panel.revealed::before {
            --mist-overlay: 0;
        }

        [data-theme="forest"] .panel:hover {
            box-shadow: 0 12px 40px rgba(74, 222, 128, 0.15);
        }

        [data-theme="forest"] .panel-header {
            background: linear-gradient(
                90deg,
                rgba(74, 222, 128, 0.08) 0%,
                transparent 100%
            );
            border-bottom: 1px solid #22C55E20;
            position: relative;
            z-index: 1;
        }

        [data-theme="forest"] .panel-title {
            text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
        }

        [data-theme="forest"] .panel-title::before {
            content: '🌲';
            margin-right: 0.5em;
        }

        [data-theme="forest"] .panel-body {
            position: relative;
            z-index: 1;
        }

        [data-theme="forest"] .filter-chip {
            border: 1px solid #4ADE8030;
            border-radius: 8px;
            background: rgba(34, 51, 34, 0.5);
            transition: all 0.2s ease;
        }

        [data-theme="forest"] .filter-chip:hover {
            border-color: #4ADE80;
            background: rgba(74, 222, 128, 0.1);
            box-shadow: 0 0 12px rgba(74, 222, 128, 0.2);
        }

        [data-theme="forest"] .filter-chip.active {
            background: rgba(74, 222, 128, 0.15);
            border-color: #4ADE80;
            color: #86EFAC;
        }

        [data-theme="forest"] .source-bar {
            border-radius: 6px;
            box-shadow: 0 0 8px currentColor;
        }

        [data-theme="forest"] .activity-item {
            transition: all 0.2s ease;
            border-radius: 6px;
        }

        [data-theme="forest"] .activity-item:hover {
            background: rgba(74, 222, 128, 0.05);
            transform: translateX(4px);
        }

        [data-theme="forest"] .footer {
            position: relative;
            z-index: 1;
        }

        [data-theme="forest"] .footer-text {
            text-shadow: 0 0 8px rgba(74, 222, 128, 0.2);
        }

        [data-theme="forest"] ::selection {
            background: #4ADE80;
            color: #1A2F1A;
        }

        [data-theme="forest"] ::-webkit-scrollbar {
            width: 8px;
        }

        [data-theme="forest"] ::-webkit-scrollbar-track {
            background: #1A2F1A;
        }

        [data-theme="forest"] ::-webkit-scrollbar-thumb {
            background: #4ADE8040;
            border-radius: 4px;
        }

        [data-theme="forest"] ::-webkit-scrollbar-thumb:hover {
            background: #4ADE8060;
        }

        @media (max-width: 1200px) {
            [data-theme="forest"] .metrics-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (max-width: 768px) {
            [data-theme="forest"] .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `,
	animations: `
        @keyframes mistDrift {
            0%, 100% {
                transform: translateX(0) translateY(0);
            }
            50% {
                transform: translateX(10px) translateY(-5px);
            }
        }
    `,
	customJS: `
        (function() {
            const bg = document.createElement('div');
            bg.className = 'forest-parallax-bg';
            bg.innerHTML = \`
                <div class="forest-layer" data-speed="0.15">
                    <svg class="mountain-range far" viewBox="0 0 1400 300" preserveAspectRatio="none" style="height: 35vh;">
                        <path d="M0,300 L0,180 Q150,120 280,160 L350,140 Q450,110 550,135 L620,125 Q720,95 820,120 L900,110 Q1000,85 1100,115 L1180,105 Q1280,75 1400,110 L1400,300 Z"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-1" style="bottom: 35vh; left: 8%; width: 80px; height: 120px;" viewBox="0 0 40 60">
                        <polygon points="20,0 5,35 15,35 0,55 20,55 20,60 20,60 20,55 40,55 25,35 35,35"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-1" style="bottom: 35vh; right: 12%; width: 70px; height: 110px;" viewBox="0 0 40 60">
                        <polygon points="20,5 10,30 15,30 5,50 20,50 20,60 20,60 20,50 35,50 25,30 30,30"/>
                    </svg>
                </div>
                
                <div class="forest-layer" data-speed="0.3">
                    <svg class="mountain-range mid" viewBox="0 0 1400 280" preserveAspectRatio="none" style="height: 40vh;">
                        <path d="M0,280 L0,150 Q100,100 200,130 L280,110 Q380,75 480,105 L560,95 Q660,60 760,90 L840,80 Q940,50 1040,85 L1120,75 Q1220,45 1320,80 L1400,70 L1400,280 Z"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-2" style="bottom: 40vh; left: 15%; width: 100px; height: 150px;" viewBox="0 0 40 60">
                        <polygon points="20,0 8,28 14,28 2,48 18,48 18,60 22,60 22,48 38,48 26,28 32,28"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-2" style="bottom: 40vh; left: 25%; width: 90px; height: 140px;" viewBox="0 0 40 60">
                        <polygon points="20,3 10,25 16,25 6,45 18,45 18,60 22,60 22,45 34,45 24,25 30,25"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-2" style="bottom: 40vh; right: 20%; width: 110px; height: 160px;" viewBox="0 0 40 60">
                        <polygon points="20,0 6,32 13,32 0,52 18,52 18,60 22,60 22,52 40,52 27,32 34,32"/>
                    </svg>
                </div>

                <div class="forest-layer" data-speed="0.5">
                    <svg class="mountain-range near" viewBox="0 0 1400 260" preserveAspectRatio="none" style="height: 45vh;">
                        <path d="M0,260 L0,120 Q80,70 160,100 L230,85 Q320,50 410,80 L480,70 Q570,35 660,65 L730,55 Q820,25 910,60 L980,50 Q1070,20 1160,55 L1230,45 Q1320,15 1400,50 L1400,260 Z"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-3" style="bottom: 45vh; left: 5%; width: 130px; height: 180px;" viewBox="0 0 40 60">
                        <polygon points="20,0 5,35 12,35 0,55 18,55 18,60 22,60 22,55 40,55 28,35 35,35"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-3" style="bottom: 45vh; left: 35%; width: 120px; height: 170px;" viewBox="0 0 40 60">
                        <polygon points="20,2 7,30 13,30 3,50 18,50 18,60 22,60 22,50 37,50 27,30 33,30"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-3" style="bottom: 45vh; right: 8%; width: 140px; height: 190px;" viewBox="0 0 40 60">
                        <polygon points="20,0 4,38 11,38 0,58 18,58 18,60 22,60 22,58 40,58 29,38 36,38"/>
                    </svg>
                    <svg class="tree-silhouette tree-layer-3" style="bottom: 45vh; right: 30%; width: 115px; height: 165px;" viewBox="0 0 40 60">
                        <polygon points="20,1 9,28 15,28 5,48 18,48 18,60 22,60 22,48 35,48 25,28 31,28"/>
                    </svg>
                </div>

                <div class="forest-mist"></div>
            \`;
            document.body.insertBefore(bg, document.body.firstChild);

            const mist = bg.querySelector('.forest-mist');
            const layers = bg.querySelectorAll('[data-speed]');

            const depthElements = document.querySelectorAll(
                '.metric-card, .secondary-metrics, .filters-section, .panel'
            );

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            depthElements.forEach(el => observer.observe(el));

            let ticking = false;
            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const scrollY = window.scrollY;
                        const maxScroll = document.body.scrollHeight - window.innerHeight;
                        const scrollProgress = Math.min(scrollY / Math.max(maxScroll, 1), 1);

                        const mistOpacity = Math.max(0, 1 - scrollProgress * 2.5);
                        mist.style.setProperty('--mist-opacity', mistOpacity);

                        layers.forEach(layer => {
                            const speed = parseFloat(layer.getAttribute('data-speed')) || 0.3;
                            const offset = scrollY * speed;
                            layer.style.transform = 'translateY(' + (-offset) + 'px)';
                        });

                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
        })();
    `,
};
