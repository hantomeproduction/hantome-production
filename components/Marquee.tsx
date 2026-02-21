import React from 'react';

interface MarqueeProps {
  items: string[];
  direction?: 'left' | 'right';
  speed?: number;
  className?: string;
  variant?: 'solid' | 'outline' | 'mixed';
  separator?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ 
  items, 
  direction = 'left', 
  speed = 100, // Default slow speed as requested
  className = '',
  variant = 'solid',
  separator = '✦'
}) => {
  // Multiply items to ensure the track is long enough to cover the screen width
  // This prevents "gaps" on large screens
  const repeatedItems = [...items, ...items, ...items, ...items];

  const animationClass = direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse';

  return (
    <div className={`w-full overflow-hidden flex bg-[#050505] border-y border-white/5 py-6 select-none relative z-20 ${className}`}>
        {/* Render two identical tracks for seamless looping */}
        {[0, 1].map((i) => (
            <div 
                key={i} 
                className={`flex items-center gap-16 px-8 shrink-0 min-w-full whitespace-nowrap will-change-transform ${animationClass}`}
                style={{ 
                    animationDuration: `${speed}s`,
                }}
            >
                {repeatedItems.map((text, idx) => (
                    <React.Fragment key={idx}>
                        <span 
                            className={`text-4xl md:text-6xl font-bold tracking-tighter uppercase transition-all duration-500
                               ${variant === 'outline' ? 'text-outline' : 
                                 variant === 'mixed' && idx % 2 !== 0 ? 'text-outline' : 'text-white/80'}
                               blur-[1.5px] opacity-70 hover:blur-0 hover:opacity-100
                            `}
                        >
                            {text}
                        </span>
                        <span className="text-white/20 text-2xl blur-[1px]">{separator}</span>
                    </React.Fragment>
                ))}
            </div>
        ))}
    </div>
  );
};