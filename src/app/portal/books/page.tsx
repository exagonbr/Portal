'use client';

import React from 'react';
import Carousel from '../../../components/Carousel';
import BookCard from '../../../components/BookCard';
import SimpleCarousel from "@/components/SimpleCarousel";
import { mockBooks } from '@/constants/mockData';

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
    alt: 'Literatura e Conhecimento',
    title: 'Explore Novos Horizontes'
  },
  {
    src: '/carousel-images/education2.jpg',
    alt: 'Biblioteca Digital',
    title: 'Biblioteca Virtual'
  },
  {
    src: '/carousel-images/education3.jpg',
    alt: 'Leitura e Aprendizagem',
    title: 'Aprendizagem Contínua'
  }
];

export default function BooksPage() {
  // Filter books for different sections
  const continueReading = mockBooks.filter(book => book.progress && book.progress > 0 && book.progress < 100);
  const recommendations = mockBooks.filter((_, index) => index < 15); // First 15 books for recommendations
  const newReleases = mockBooks
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 10); // Random 10 books for new releases
  const popular = mockBooks
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 10); // Random 10 books for popular

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Hero Section with Featured Carousel */}
      <section className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gradient-to-b from-gray-900 to-gray-800">
        <SimpleCarousel images={carouselImages} autoplaySpeed={3000} />
      </section>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Continue Reading Section */}
        {continueReading.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Continue a Leitura</h2>
                <p className="text-sm text-gray-600 mt-1">Retome de onde parou</p>
              </div>
            </div>
            <div className="relative">
              <Carousel settings={carouselSettings}>
                {continueReading.map(book => (
                  <div key={book.id} className="px-2">
                    <BookCard
                      thumbnail={book.thumbnail}
                      title={book.title}
                      author={book.author}
                      publisher={book.publisher}
                      synopsis={book.synopsis}
                      duration={book.duration}
                      progress={book.progress}
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
              {recommendations.map(book => (
                <div key={book.id} className="px-2">
                  <BookCard
                    thumbnail={book.thumbnail}
                    title={book.title}
                    author={book.author}
                    publisher={book.publisher}
                    synopsis={book.synopsis}
                    duration={book.duration}
                    progress={book.progress}
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
              {newReleases.map(book => (
                <div key={book.id} className="px-2">
                  <BookCard
                    thumbnail={book.thumbnail}
                    title={book.title}
                    author={book.author}
                    publisher={book.publisher}
                    synopsis={book.synopsis}
                    duration={book.duration}
                    progress={book.progress}
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
              <p className="text-sm text-gray-600 mt-1">Os títulos mais lidos da biblioteca</p>
            </div>
          </div>
          <div className="relative">
            <Carousel settings={carouselSettings}>
              {popular.map(book => (
                <div key={book.id} className="px-2">
                  <BookCard
                    thumbnail={book.thumbnail}
                    title={book.title}
                    author={book.author}
                    publisher={book.publisher}
                    synopsis={book.synopsis}
                    duration={book.duration}
                    progress={book.progress}
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
