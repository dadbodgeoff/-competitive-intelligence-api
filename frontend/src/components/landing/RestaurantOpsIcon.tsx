import React from 'react';

interface RestaurantOpsIconProps {
  isLoaded: boolean;
}

export const RestaurantOpsIcon: React.FC<RestaurantOpsIconProps> = ({ isLoaded }) => {
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 20px rgba(176, 137, 104, 0.3))' }}
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A574" />
            <stop offset="50%" stopColor="#B08968" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2A2A" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>

          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(176, 137, 104, 0.4)" />
            <stop offset="100%" stopColor="rgba(176, 137, 104, 0.1)" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central hexagon - the unified platform */}
        <g 
          className="central-hex"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'scale(1)' : 'scale(0.5)',
            transformOrigin: '100px 100px',
            transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
          }}
        >
          <polygon
            points="100,35 145,60 145,110 100,135 55,110 55,60"
            fill="url(#darkGradient)"
            stroke="url(#goldGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />
          
          {/* Inner glow ring */}
          <polygon
            points="100,45 138,66 138,104 100,125 62,104 62,66"
            fill="none"
            stroke="rgba(176, 137, 104, 0.3)"
            strokeWidth="1"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: isLoaded ? 0 : 300,
              transition: 'stroke-dashoffset 2s ease-out 0.8s',
            }}
          />
        </g>

        {/* Analytics chart icon - top left */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translate(0, 0)' : 'translate(-30px, -30px)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s',
          }}
        >
          <circle cx="45" cy="45" r="22" fill="url(#darkGradient)" stroke="#B08968" strokeWidth="1.5" />
          {/* Bar chart */}
          <rect x="33" y="52" width="6" height="12" fill="#B08968" rx="1">
            <animate attributeName="height" values="0;12;12" dur="1.5s" begin="0.8s" fill="freeze" />
            <animate attributeName="y" values="64;52;52" dur="1.5s" begin="0.8s" fill="freeze" />
          </rect>
          <rect x="42" y="42" width="6" height="22" fill="#D4A574" rx="1">
            <animate attributeName="height" values="0;22;22" dur="1.5s" begin="1s" fill="freeze" />
            <animate attributeName="y" values="64;42;42" dur="1.5s" begin="1s" fill="freeze" />
          </rect>
          <rect x="51" y="48" width="6" height="16" fill="#B08968" rx="1">
            <animate attributeName="height" values="0;16;16" dur="1.5s" begin="1.2s" fill="freeze" />
            <animate attributeName="y" values="64;48;48" dur="1.5s" begin="1.2s" fill="freeze" />
          </rect>
          {/* Trend line */}
          <path
            d="M33 38 L42 33 L51 36 L60 30"
            fill="none"
            stroke="#B08968"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: 40,
              strokeDashoffset: isLoaded ? 0 : 40,
              transition: 'stroke-dashoffset 1s ease-out 1.4s',
            }}
          />
        </g>

        {/* Schedule/Calendar icon - top right */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translate(0, 0)' : 'translate(30px, -30px)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s',
          }}
        >
          <circle cx="155" cy="45" r="22" fill="url(#darkGradient)" stroke="#B08968" strokeWidth="1.5" />
          {/* Calendar grid */}
          <rect x="140" y="35" width="30" height="24" rx="3" fill="none" stroke="#B08968" strokeWidth="1.5" />
          <line x1="140" y1="42" x2="170" y2="42" stroke="#B08968" strokeWidth="1" />
          {/* Calendar dots */}
          <circle cx="147" cy="49" r="2" fill="#D4A574">
            <animate attributeName="opacity" values="0;1;1" dur="0.5s" begin="1.3s" fill="freeze" />
          </circle>
          <circle cx="155" cy="49" r="2" fill="#B08968">
            <animate attributeName="opacity" values="0;1;1" dur="0.5s" begin="1.4s" fill="freeze" />
          </circle>
          <circle cx="163" cy="49" r="2" fill="#D4A574">
            <animate attributeName="opacity" values="0;1;1" dur="0.5s" begin="1.5s" fill="freeze" />
          </circle>
          <circle cx="147" cy="55" r="2" fill="#B08968">
            <animate attributeName="opacity" values="0;1;1" dur="0.5s" begin="1.6s" fill="freeze" />
          </circle>
          <circle cx="155" cy="55" r="2" fill="#D4A574">
            <animate attributeName="opacity" values="0;1;1" dur="0.5s" begin="1.7s" fill="freeze" />
          </circle>
        </g>

        {/* Invoice/Receipt icon - bottom left */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translate(0, 0)' : 'translate(-30px, 30px)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s',
          }}
        >
          <circle cx="45" cy="155" r="22" fill="url(#darkGradient)" stroke="#B08968" strokeWidth="1.5" />
          {/* Receipt shape */}
          <path
            d="M35 142 L35 168 L38 165 L41 168 L44 165 L47 168 L50 165 L53 168 L55 165 L55 142 Z"
            fill="none"
            stroke="#B08968"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Receipt lines */}
          <line x1="39" y1="148" x2="51" y2="148" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="x2" values="39;51;51" dur="0.5s" begin="1.5s" fill="freeze" />
          </line>
          <line x1="39" y1="153" x2="48" y2="153" stroke="#B08968" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="x2" values="39;48;48" dur="0.5s" begin="1.6s" fill="freeze" />
          </line>
          <line x1="39" y1="158" x2="51" y2="158" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="x2" values="39;51;51" dur="0.5s" begin="1.7s" fill="freeze" />
          </line>
        </g>

        {/* Menu/Food icon - bottom right */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translate(0, 0)' : 'translate(30px, 30px)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s',
          }}
        >
          <circle cx="155" cy="155" r="22" fill="url(#darkGradient)" stroke="#B08968" strokeWidth="1.5" />
          {/* Plate */}
          <ellipse cx="155" cy="158" rx="14" ry="8" fill="none" stroke="#B08968" strokeWidth="1.5" />
          {/* Cloche/dome */}
          <path
            d="M143 158 Q143 145 155 143 Q167 145 167 158"
            fill="none"
            stroke="#D4A574"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: 50,
              strokeDashoffset: isLoaded ? 0 : 50,
              transition: 'stroke-dashoffset 1s ease-out 1.5s',
            }}
          />
          {/* Handle */}
          <line x1="155" y1="143" x2="155" y2="139" stroke="#D4A574" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="0;1;1" dur="0.3s" begin="1.8s" fill="freeze" />
          </line>
          <circle cx="155" cy="138" r="2" fill="#D4A574">
            <animate attributeName="opacity" values="0;1;1" dur="0.3s" begin="1.9s" fill="freeze" />
          </circle>
        </g>

        {/* Connection lines from corners to center */}
        <g style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease-out 1s' }}>
          {/* Top left to center */}
          <line x1="62" y1="62" x2="75" y2="75" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite" />
          </line>
          {/* Top right to center */}
          <line x1="138" y1="62" x2="125" y2="75" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite" />
          </line>
          {/* Bottom left to center */}
          <line x1="62" y1="138" x2="75" y2="125" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite" />
          </line>
          {/* Bottom right to center */}
          <line x1="138" y1="138" x2="125" y2="125" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite" />
          </line>
        </g>

        {/* Center "R" logo */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'scale(1)' : 'scale(0)',
            transformOrigin: '100px 85px',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s',
          }}
        >
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fill="url(#goldGradient)"
            fontSize="32"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            R
          </text>
        </g>

        {/* Orbiting particle */}
        <circle r="3" fill="#B08968" filter="url(#glow)">
          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            path="M100,35 C145,35 165,60 165,100 C165,140 145,165 100,165 C55,165 35,140 35,100 C35,60 55,35 100,35"
          />
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Pulse rings */}
        <circle
          cx="100"
          cy="85"
          r="50"
          fill="none"
          stroke="rgba(176, 137, 104, 0.2)"
          strokeWidth="1"
          style={{
            transformOrigin: '100px 85px',
            animation: isLoaded ? 'pulseRing 3s ease-out infinite' : 'none',
          }}
        />
        <circle
          cx="100"
          cy="85"
          r="50"
          fill="none"
          stroke="rgba(176, 137, 104, 0.2)"
          strokeWidth="1"
          style={{
            transformOrigin: '100px 85px',
            animation: isLoaded ? 'pulseRing 3s ease-out infinite 1.5s' : 'none',
          }}
        />
      </svg>

      <style>{`
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
