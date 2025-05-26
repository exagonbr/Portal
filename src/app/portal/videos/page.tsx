'use client';

import React from 'react';
import Carousel from '../../../components/Carousel';
import VideoCard from '../../../components/VideoCard';
import SimpleCarousel from "@/components/SimpleCarousel";
import { mockVideos } from '@/constants/mockData';

const carouselSettings = {
  slidesToShow: 6,
  slidesToScroll: 1,
  infinite: true,
  dots: true,
  arrows: true,
  autoplay: true,
  autoplaySpeed: 5000,
  responsive: [
    {
      breakpoint: 1536,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

const carouselImages = [
  {
    src: '/carousel-images/education1.jpg',
    alt: 'Educação e Tecnologia',
    title: 'Inovação na Educação'
  },
  {
    src: '/carousel-images/education2.jpg',
    alt: 'Cultura e Aprendizagem',
    title: 'Cultura e Sabedoria'
  },
  {
    src: '/carousel-images/education3.jpg',
    alt: 'Desenvolvimento Educacional',
    title: 'Aprendizagem Contínua'
  }
];

export default function VideosPage() {
  // Filter videos for different sections
  const continueWatching = mockVideos.filter(video => video.progress && video.progress > 0);
  const recommendations = mockVideos.filter((_, index) => index < 15);
  const newReleases = mockVideos.slice(0, 10);
  const popular = mockVideos.slice(10, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Featured Carousel */}
      <section className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gradient-to-b from-gray-900 to-gray-800">
        <SimpleCarousel images={carouselImages} autoplaySpeed={3000} />
      </section>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Continue Watching Section */}
        {continueWatching.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Continue Assistindo</h2>
                <p className="text-sm text-gray-600 mt-1">Retome de onde parou</p>
              </div>
            </div>
            <div className="relative">
              <Carousel settings={carouselSettings}>
                {continueWatching.map(video => (
                  <div key={video.id} className="px-2">
                    <VideoCard
                      thumbnail={video.thumbnail}
                      title={video.title}
                      duration={video.duration}
                      progress={video.progress}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </section>
        )}

        {/* Recommendations Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recomendados para Você</h2>
              <p className="text-sm text-gray-600 mt-1">Com base nos seus interesses</p>
            </div>
          </div>
          <div className="relative">
            <Carousel settings={carouselSettings}>
              {recommendations.map(video => (
                <div key={video.id} className="px-2">
                  <VideoCard
                    thumbnail={video.thumbnail}
                    title={video.title}
                    duration={video.duration}
                    progress={video.progress}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* New Releases Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Novidades</h2>
              <p className="text-sm text-gray-600 mt-1">Adições recentes ao nosso acervo</p>
            </div>
          </div>
          <div className="relative">
            <Carousel settings={carouselSettings}>
              {newReleases.map(video => (
                <div key={video.id} className="px-2">
                  <VideoCard
                    thumbnail={video.thumbnail}
                    title={video.title}
                    duration={video.duration}
                    progress={video.progress}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Popular Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mais Populares</h2>
              <p className="text-sm text-gray-600 mt-1">Os conteúdos mais assistidos da biblioteca</p>
            </div>
          </div>
          <div className="relative">
            <Carousel settings={carouselSettings}>
              {popular.map(video => (
                <div key={video.id} className="px-2">
                  <VideoCard
                    thumbnail={video.thumbnail}
                    title={video.title}
                    duration={video.duration}
                    progress={video.progress}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      </div>
    </div>
  );
}
