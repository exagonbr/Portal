'use client';

import React from 'react';
import Slider from 'react-slick';
import type { Settings } from 'react-slick';
import '../styles/carousel.css';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface CarouselProps {
  settings?: Settings;
  children: React.ReactNode;
}

export default function Carousel({ settings, children }: CarouselProps) {
  const { theme } = useTheme();
  
  const defaultSettings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    ...settings,
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-[90rem] -mx-2 sm:-mx-3 md:-mx-4 carousel-container"
      style={{
        '--carousel-dot-color': theme.colors.text.tertiary,
        '--carousel-dot-active': theme.colors.primary.DEFAULT,
        '--carousel-arrow-color': theme.colors.text.secondary,
        '--carousel-arrow-hover': theme.colors.primary.DEFAULT,
      } as React.CSSProperties}
    >
      {/* @ts-ignore */}
      <Slider {...defaultSettings}>{children}</Slider>
    </motion.div>
  );
}
