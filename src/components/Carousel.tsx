'use client';

import React from 'react';
import Slider from 'react-slick';
import type { Settings } from 'react-slick';
import '../styles/carousel.css';

interface CarouselProps {
  settings?: Settings;
  children: React.ReactNode;
}

export default function Carousel({ settings, children }: CarouselProps) {
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
    <div className="mx-auto max-w-[90rem] -mx-2 sm:-mx-3 md:-mx-4">
      {/* @ts-ignore */}
      <Slider {...defaultSettings}>{children}</Slider>
    </div>
  );
}
