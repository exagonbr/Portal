'use client';

import React from 'react';
import SlickSlider, { Settings as SlickSettings } from 'react-slick';
import '../styles/carousel.css';

interface CarouselProps {
  settings?: SlickSettings;
  children: React.ReactNode;
}

export default function Carousel({ settings, children }: CarouselProps) {
  const defaultSettings: SlickSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    ...settings,
  };

  return <SlickSlider {...defaultSettings}>{children}</SlickSlider>;
}
