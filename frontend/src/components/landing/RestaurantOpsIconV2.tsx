import React from 'react';

interface RestaurantOpsIconV2Props {
  isLoaded: boolean;
}

/**
 * Premium animated icon - Neural flame/spark representing AI-powered restaurant ops
 * Replaces the basic "R" with something that bangs harder
 */
export const RestaurantOpsIconV2: React.FC<RestaurantOpsIconV2Props> = ({ isLoaded }) => {
  return (
    <div className="relative w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 30px rgba(176, 137, 104, 0.4))' }}
      >
        <defs>
          {/* Premium gold gradient */}
          <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8C99B" />
            <stop offset="30%" stopColor="#D4A574" />
            <stop offset="60%" stopColor="#B08968" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          
          {/* Flame gradient */}
          <linearGradient id="flameGradient" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#B08968" />
            <stop offset="40%" stopColor="#D4A574" />
            <stop offset="70%" stopColor="#E8C99B" />
            <stop offset="100%" stopColor="#FFF5E6" />
          </linearGradient>

          {/* Inner glow */}
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(176, 137, 104, 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glowV2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Soft shadow */}
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer pulse rings */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="rgba(176, 137, 104, 0.15)"
          strokeWidth="1"
          style={{
            transformOrigin: '100px 100px',
            animation: isLoaded ? 'pulseRingV2 4s ease-out infinite' : 'none',
          }}
        />
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="rgba(176, 137, 104, 0.15)"
          strokeWidth="1"
          style={{
            transformOrigin: '100px 100px',
            animation: isLoaded ? 'pulseRingV2 4s ease-out infinite 2s' : 'none',
          }}
        />

        {/* Main hexagon container */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'scale(1)' : 'scale(0.7)',
            transformOrigin: '100px 100px',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
          }}
        >
          {/* Hexagon background */}
          <polygon
            points="100,25 155,55 155,115 100,145 45,115 45,55"
            fill="#1A1A1A"
            stroke="url(#premiumGold)"
            strokeWidth="2.5"
            filter="url(#softShadow)"
          />
          
          {/* Inner glow */}
          <polygon
            points="100,35 145,60 145,110 100,135 55,110 55,60"
            fill="url(#innerGlow)"
          />

          {/* Animated border trace */}
          <polygon
            points="100,25 155,55 155,115 100,145 45,115 45,55"
            fill="none"
            stroke="url(#premiumGold)"
            strokeWidth="2"
            style={{
              strokeDasharray: 400,
              strokeDashoffset: isLoaded ? 0 : 400,
              transition: 'stroke-dashoffset 2s ease-out 0.5s',
            }}
          />
        </g>

        {/* Central flame/spark icon - the "bang" */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s',
          }}
        >
          {/* Main flame shape */}
          <path
            d="M100 50 
               C100 50 85 70 85 85 
               C85 95 90 105 100 115 
               C110 105 115 95 115 85 
               C115 70 100 50 100 50Z"
            fill="url(#flameGradient)"
            filter="url(#glowV2)"
            style={{
              transformOrigin: '100px 85px',
              animation: isLoaded ? 'flameFlicker 2s ease-in-out infinite' : 'none',
            }}
          />
          
          {/* Inner flame */}
          <path
            d="M100 65 
               C100 65 92 78 92 88 
               C92 95 95 102 100 108 
               C105 102 108 95 108 88 
               C108 78 100 65 100 65Z"
            fill="#FFF5E6"
            opacity="0.8"
            style={{
              transformOrigin: '100px 88px',
              animation: isLoaded ? 'flameFlickerInner 1.5s ease-in-out infinite 0.2s' : 'none',
            }}
          />

          {/* Spark particles */}
          <circle cx="88" cy="70" r="2" fill="#E8C99B" opacity="0.8">
            <animate attributeName="cy" values="70;60;70" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="112" cy="68" r="1.5" fill="#D4A574" opacity="0.7">
            <animate attributeName="cy" values="68;55;68" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="55" r="2" fill="#FFF5E6" opacity="0.9">
            <animate attributeName="cy" values="55;42;55" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Orbiting module dots */}
        <g style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 1s ease-out 1s' }}>
          {/* Analytics */}
          <circle r="6" fill="#B08968" filter="url(#glowV2)">
            <animateMotion
              dur="12s"
              repeatCount="indefinite"
              path="M100,25 C155,25 175,55 175,100 C175,145 155,175 100,175 C45,175 25,145 25,100 C25,55 45,25 100,25"
            />
          </circle>
          {/* Schedule */}
          <circle r="5" fill="#D4A574" filter="url(#glowV2)">
            <animateMotion
              dur="12s"
              repeatCount="indefinite"
              begin="4s"
              path="M100,25 C155,25 175,55 175,100 C175,145 155,175 100,175 C45,175 25,145 25,100 C25,55 45,25 100,25"
            />
          </circle>
          {/* Invoice */}
          <circle r="4" fill="#E8C99B" filter="url(#glowV2)">
            <animateMotion
              dur="12s"
              repeatCount="indefinite"
              begin="8s"
              path="M100,25 C155,25 175,55 175,100 C175,145 155,175 100,175 C45,175 25,145 25,100 C25,55 45,25 100,25"
            />
          </circle>
        </g>

        {/* Corner accent icons */}
        {/* Top-left: Chart */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translate(0, 0)' : 'translate(-15px, -15px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s',
          }}
        >
          <circle cx="35" cy="35" r="16" fill="#1A1A1A" stroke="#B08968" strokeWidth="1.5" />
          <rect x="28" y="38" width="4" height="8" fill="#B08968" rx="1">
            <animate attributeName="height" values="0;8" dur="0.5s" begin="1s" fill="freeze" />
            <animate attributeName="y" values="46;38" dur="0.5s" begin="1s" fill="freeze" />
          </rect>
          <rect x="33" y="32" width="4" height="14" fill="#D4A574" rx="1">
            <animate attributeName="height" values="0;14" dur="0.5s" begin="1.1s" fill="freeze" />
            <animate attributeName="y" values="46;32" dur="0.5s" begin="1.1s" fill="freeze" />
          </rect>
          <rect x="38" y="35" width="4" height="11" fill="#B08968" rx="1">
            <animate attributeName="height" values="0;11" dur="0.5s" begin="1.2s" fill="freeze" />
            <animate attributeName="y" values="46;35" dur="0.5s" begin="1.2s" fill="freeze" />
          </rect>
        </g>

        {/* Top-right: Calendar */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translate(0, 0)' : 'translate(15px, -15px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s',
          }}
        >
          <circle cx="165" cy="35" r="16" fill="#1A1A1A" stroke="#B08968" strokeWidth="1.5" />
          <rect x="155" y="28" width="20" height="16" rx="2" fill="none" stroke="#B08968" strokeWidth="1.5" />
          <line x1="155" y1="33" x2="175" y2="33" stroke="#B08968" strokeWidth="1" />
          <circle cx="160" cy="38" r="1.5" fill="#D4A574" />
          <circle cx="165" cy="38" r="1.5" fill="#B08968" />
          <circle cx="170" cy="38" r="1.5" fill="#D4A574" />
        </g>

        {/* Bottom-left: Invoice */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translate(0, 0)' : 'translate(-15px, 15px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1s',
          }}
        >
          <circle cx="35" cy="165" r="16" fill="#1A1A1A" stroke="#B08968" strokeWidth="1.5" />
          <path
            d="M28 156 L28 174 L30 172 L32 174 L34 172 L36 174 L38 172 L40 174 L42 172 L42 156 Z"
            fill="none"
            stroke="#B08968"
            strokeWidth="1.5"
          />
          <line x1="30" y1="160" x2="40" y2="160" stroke="#D4A574" strokeWidth="1.5" />
          <line x1="30" y1="164" x2="38" y2="164" stroke="#B08968" strokeWidth="1.5" />
        </g>

        {/* Bottom-right: Sparkle/Creative */}
        <g
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translate(0, 0)' : 'translate(15px, 15px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s',
          }}
        >
          <circle cx="165" cy="165" r="16" fill="#1A1A1A" stroke="#B08968" strokeWidth="1.5" />
          <path
            d="M165 155 L167 162 L174 162 L168 167 L170 174 L165 170 L160 174 L162 167 L156 162 L163 162 Z"
            fill="url(#premiumGold)"
            style={{
              transformOrigin: '165px 165px',
              animation: isLoaded ? 'sparkleRotate 8s linear infinite' : 'none',
            }}
          />
        </g>

        {/* Connection lines */}
        <g style={{ opacity: isLoaded ? 0.6 : 0, transition: 'opacity 0.5s ease-out 1.2s' }}>
          <line x1="48" y1="48" x2="65" y2="65" stroke="url(#premiumGold)" strokeWidth="1" strokeDasharray="3 3">
            <animate attributeName="stroke-dashoffset" values="6;0" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="152" y1="48" x2="135" y2="65" stroke="url(#premiumGold)" strokeWidth="1" strokeDasharray="3 3">
            <animate attributeName="stroke-dashoffset" values="6;0" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="48" y1="152" x2="65" y2="135" stroke="url(#premiumGold)" strokeWidth="1" strokeDasharray="3 3">
            <animate attributeName="stroke-dashoffset" values="6;0" dur="1s" repeatCount="indefinite" />
          </line>
          <line x1="152" y1="152" x2="135" y2="135" stroke="url(#premiumGold)" strokeWidth="1" strokeDasharray="3 3">
            <animate attributeName="stroke-dashoffset" values="6;0" dur="1s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>

      <style>{`
        @keyframes pulseRingV2 {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          25% { transform: scaleY(1.05) scaleX(0.98); }
          50% { transform: scaleY(0.95) scaleX(1.02); }
          75% { transform: scaleY(1.03) scaleX(0.97); }
        }
        @keyframes flameFlickerInner {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.8; }
          50% { transform: scaleY(1.1) scaleX(0.95); opacity: 1; }
        }
        @keyframes sparkleRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
