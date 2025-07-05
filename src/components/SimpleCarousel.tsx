'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
}

interface CarouselProps {
  images: CarouselImage[];
  autoplaySpeed?: number;
}

export default function SimpleCarousel({ images, autoplaySpeed = 3000 }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (images.length === 0) return; // Don't start timer if no images
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, autoplaySpeed);

    return () => clearInterval(timer);
  }, [images.length, autoplaySpeed]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    if (images.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    if (images.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-lg bg-background-secondary flex items-center justify-center text-text-secondary">No images to display</div>;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
      {/* Slides */}
      <div className="relative h-full w-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 transform ${
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Overlay for better text readability, lighter than before */}
            <div className="absolute inset-0 bg-gradient-to-b from-text-primary/20 via-text-primary/10 to-text-primary/40 z-10" />
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-4">
              <h2 className="text-white text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in shadow-sm">
                {image.title}
              </h2>
              <div className="w-20 h-1 bg-primary-DEFAULT rounded-full animate-fade-in" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-background-primary/70 hover:bg-background-secondary/90 backdrop-blur-sm transition-all duration-200 group"
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6 text-text-primary transform group-hover:-translate-x-1 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-background-primary/70 hover:bg-background-secondary/90 backdrop-blur-sm transition-all duration-200 group"
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6 text-text-primary transform group-hover:translate-x-1 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-primary-DEFAULT w-8' // Active dot
                : 'bg-background-primary/50 hover:bg-background-primary/75' // Inactive dots
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
