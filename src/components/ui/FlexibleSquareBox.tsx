import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface FlexibleSquareBoxProps {
  children: React.ReactNode;
  size?: number; // Tamanho em pixels ou rem
  unit?: 'px' | 'rem' | 'vw' | 'vh';
  className?: string;
  showOverlay?: boolean;
  onOverlayClick?: () => void;
  animation?: boolean;
  glass?: boolean;
  shadow?: boolean;
  rounded?: boolean;
  borderWidth?: number;
  padding?: number;
  backgroundColor?: string;
  borderColor?: string;
}

const FlexibleSquareBox: React.FC<FlexibleSquareBoxProps> = ({
  children,
  size = 20,
  unit = 'rem',
  className = '',
  showOverlay = true,
  onOverlayClick,
  animation = true,
  glass = false,
  shadow = true,
  rounded = true,
  borderWidth = 1,
  padding = 1.5,
  backgroundColor,
  borderColor
}) => {
  const { theme } = useTheme();

  const boxSize = `${size}${unit}`;
  const paddingSize = `${padding}rem`;

  const boxStyle: React.CSSProperties = {
    width: boxSize,
    height: boxSize,
    padding: paddingSize,
    backgroundColor: backgroundColor || (glass 
      ? theme.type === 'modern' 
        ? 'rgba(26, 26, 26, 0.85)' 
        : 'rgba(255, 255, 255, 0.85)'
      : theme.colors.background.card),
    borderColor: borderColor || theme.colors.border.DEFAULT,
    borderWidth: `${borderWidth}px`,
    borderRadius: rounded ? '1rem' : '0',
    boxShadow: shadow ? (theme.shadows?.xl || '0 25px 50px -12px rgba(0, 0, 0, 0.25)') : 'none',
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
      rotate: -5,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      rotate: 5,
      y: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
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

      {/* Flexible Square Box */}
      <BoxComponent
        className={`
          relative border flex items-center justify-center
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

export default FlexibleSquareBox; 