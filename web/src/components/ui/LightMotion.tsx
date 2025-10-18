import { motion, HTMLMotionProps } from 'framer-motion';

/**
 * Облегчённая версия motion.div для критичных анимаций
 * - Только простые анимации (opacity, scale)
 * - Быстрые transition (0.15s вместо 0.4s)
 * - Без задержек (delay)
 * - Без сложных эффектов
 */

interface LightMotionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export function LightMotion({
  children,
  initial,
  animate,
  whileTap,
  whileHover,
  transition,
  ...htmlProps
}: LightMotionProps) {
  // Упрощённый transition - быстрее и легче
  const lightTransition = {
    duration: 0.15, // Вместо 0.4s
    ease: 'easeOut', // Простой easing
    ...transition // Можно переопределить если нужно
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      whileTap={whileTap}
      whileHover={whileHover}
      transition={lightTransition}
      {...htmlProps}
    >
      {children}
    </motion.div>
  );
}
