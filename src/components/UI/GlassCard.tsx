import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'none';
}

export function GlassCard({
  children,
  className,
  hover = false,
  gradient = 'none',
  ...props
}: GlassCardProps) {
  const gradientStyles = {
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    pink: 'from-pink-500/10 to-orange-500/10 border-pink-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    green: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
    orange: 'from-orange-500/10 to-yellow-500/10 border-orange-500/20',
    none: 'bg-white/5 border-white/10',
  };

  return (
    <motion.div
      className={cn(
        'rounded-2xl backdrop-blur-xl border',
        gradient !== 'none'
          ? `bg-gradient-to-br ${gradientStyles[gradient]}`
          : gradientStyles.none,
        hover && 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10',
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
