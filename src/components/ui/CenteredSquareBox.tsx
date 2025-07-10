import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface CenteredSquareBoxProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOverlay?: boolean;
  onOverlayClick?: () => void;
  animation?: boolean;
  glass?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const CenteredSquareBox: React.FC<CenteredSquareBoxProps> = ({
  children,
  size = 'md',
  className = '',
  showOverlay = true,
  onOverlayClick,
  animation = true,
  glass = false,
  shadow = 'xl',
  rounded = 'xl'
}) => {
  const { theme } = useTheme();

  // Tamanhos quadrados baseados em viewport
  const sizeClasses = {
    sm: 'w-64 h-64',    // 16rem x 16rem
    md: 'w-80 h-80',    // 20rem x 20rem  
    lg: 'w-96 h-96',    // 24rem x 24rem
    xl: 'w-[28rem] h-[28rem]' // 28rem x 28rem
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  };

  const boxStyle: React.CSSProperties = {
    backgroundColor: glass 
      ? theme.type === 'modern' 
        ? 'rgba(26, 26, 26, 0.85)' 
        : 'rgba(255, 255, 255, 0.85)'
      : theme.colors.background.card,
    borderColor: theme.colors.border.DEFAULT,
    backdropFilter: glass ? 'blur(15px)' : 'none',
    WebkitBackdropFilter: glass ? 'blur(15px)' : 'none',
  };

  const overlayStyle: React.CSSProperties = {
    backgroundColor: showOverlay 
      ? theme.type === 'modern' 
        ? 'rgba(0, 0, 0, 0.7)' 
        : 'rgba(0, 0, 0, 0.5)'
      : 'transparent'
  };

  const boxVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const BoxComponent = animation ? motion.div : 'div';
  const OverlayComponent = animation ? motion.div : 'div';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <OverlayComponent
        className="absolute inset-0 backdrop-blur-sm"
        style={overlayStyle}
        onClick={onOverlayClick}
        {...(animation && {
          variants: overlayVariants,
          initial: "hidden",
          animate: "visible",
          exit: "exit"
        })}
      />

      {/* Square Box */}
      <BoxComponent
        className={`
          relative ${sizeClasses[size]} ${shadowClasses[shadow]} ${roundedClasses[rounded]}
          border flex items-center justify-center
          ${className}
        `}
        style={boxStyle}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        {...(animation && {
          variants: boxVariants,
          initial: "hidden",
          animate: "visible",
          exit: "exit"
        })}
      >
        {children}
      </BoxComponent>
    </div>
  );
};

export default CenteredSquareBox; 