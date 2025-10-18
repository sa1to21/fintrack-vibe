import { HTMLAttributes } from 'react';

/**
 * Временная обёртка для миграции с motion.div на обычные div
 * Сохраняет ту же структуру, но без анимаций
 */

interface OptimizedMotionProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // Принимаем motion пропсы, но игнорируем их
  initial?: any;
  animate?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
}

/**
 * Простая замена motion.div без анимаций
 * СИНТАКСИЧЕСКИ ИДЕНТИЧНА motion.div!
 */
export function OptimizedMotion({
  children,
  initial,
  animate,
  transition,
  whileHover,
  whileTap,
  ...htmlProps
}: OptimizedMotionProps) {
  // Просто возвращаем обычный div, игнорируя motion пропсы
  return <div {...htmlProps}>{children}</div>;
}
