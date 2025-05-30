'use client';

import React from 'react';
import Carousel from '../../../components/Carousel';
import VideoCard from '../../../components/VideoCard';
import SimpleCarousel from "@/components/SimpleCarousel";

const dummyVideos = [
  {
    id: '1',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/4bb8e8d8ab8ae3ba22c6e41cea29b66dbed7fb9479c3a6fac2bb163eda8a8c33.jpg',
    title: 'Matemática Aplicada',
    duration: '12:34',
    progress: 30,
  },
  {
    id: '2',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/4bb8e8d8ab8ae3ba22c6e41cea29b66dbed7fb9479c3a6fac2bb163eda8a8c33.jpg',
    title: 'Educação 4.0',
    duration: '08:20',
    progress: 0,
  },
  {
    id: '3',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/3c8692fc01fcb42e18a48adcd88b2df236f5e8c0621bccfb68d2ddb5bd3d9b42.jpg',
    title: 'Educação na Sala',
    duration: '15:10',
    progress: 75,
  },
  {
    id: '4',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/757947de28d51fe001f5e843e8d8c77bc2cdf2058af64460452b927517ae2e3f.jpg',
    title: 'Paulo Coelho',
    duration: '22:45',
    progress: 50,
  },
  {
    id: '5',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/8dc5a15a64dcffb030b342616e9d978da092c0ea60022c5bdfc0882cce1b4916.jpg',
    title: 'Educação Financeira',
    duration: '10:00',
    progress: 0,
  },
  {
    id: '6',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/6b28d6d7213cbd3c870ed490742417ff93ac9ebc2d5a36a4528fbc595f2498ee.jpg',
    title: 'Educação Fisica',
    duration: '09:30',
    progress: 0,
  },
  {
    id: '7',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 12,
  },
  {
    id: '8',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },
  {
    id: '9',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },
  {
    id: '10',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },
  {
    id: '11',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },
  {
    id: '12',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },
  {
    id: '13',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },
  {
    id: '14',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },
  {
    id: '7',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },  {
    id: '7',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },
  {
    id: '7',
    thumbnail: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/a628349509469c5ed5b1cfe5bc90992c4536e802bc00b665848db764227eba46.jpg',
    title: 'Quimica',
    duration: '11:15',
    progress: 0,
  },

];

const carouselSettings = {
  slidesToShow: 6,
  slidesToScroll: 1,
  infinite: true,
  dots: false,
  arrows: false,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export default function VideosPage() {

  const carouselImages = [
    {
      src: '/carousel-images/education1.jpg',
      alt: 'Educação e Tecnologia',
      title: 'Matemática Aplicada'
    },
    {
      src: '/carousel-images/education2.jpg',
      alt: 'Cultura e Aprendizado',
      title: 'Cultura e Religião'
    },
    {
      src: '/carousel-images/education3.jpg',
      alt: 'Desenvolvimento Educacional',
      title: 'O Alquimista'
    }
  ];


  return (
    <div className="p-6 space-y-10  min-h-screen text-black">
      <h1 className="text-4xl font-bold mb-6">Portal do Estudante</h1>

      <section>
        {/* Carousel Section */}
        <div className="w-full h-[400px] relative mb-8 mt-16">
          <SimpleCarousel images={carouselImages} autoplaySpeed={3000} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Continue Lendo</h2>
        <Carousel settings={carouselSettings}>
          {dummyVideos
            .filter(video => video.progress && video.progress > 0)
            .map(video => (
              <VideoCard
                key={video.id}
                id={video.id}
                thumbnail={video.thumbnail}
                title={video.title}
                duration={video.duration}
                progress={video.progress}
              />
            ))}
        </Carousel>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Sugestões</h2>
        <Carousel settings={carouselSettings}>
          {dummyVideos.map(video => (
            <VideoCard
              key={video.id}
              id={video.id}
              thumbnail={video.thumbnail}
              title={video.title}
              duration={video.duration}
            />
          ))}
        </Carousel>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Novos Livros Adicionados</h2>
        <Carousel settings={carouselSettings}>
          {dummyVideos.slice(0, 9).map(video => (
            <VideoCard
              key={video.id}
              id={video.id}
              thumbnail={video.thumbnail}
              title={video.title}
              duration={video.duration}
            />
          ))}
        </Carousel>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Populares</h2>
        <Carousel settings={carouselSettings}>
          {dummyVideos.slice(1, 10).map(video => (
            <VideoCard
              key={video.id}
              id={video.id}
              thumbnail={video.thumbnail}
              title={video.title}
              duration={video.duration}
            />
          ))}
        </Carousel>
      </section>
    </div>
  );
}