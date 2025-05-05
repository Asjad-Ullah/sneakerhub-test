import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';
// Import slick carousel styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// Import fallback images directly
import slide1 from '../assets/slide1.jpg';
import slide2 from '../assets/slide2.jpg';
import slide3 from '../assets/slide3.jpg';

// Define fallback slides with imported images
const fallbackSlides = [
  {
    image: slide1,
    alt: 'Sneaker 1',
    caption: 'New Arrivals',
    buttonText: 'Shop Now',
    buttonLink: '/new',
  },
  {
    image: slide2,
    alt: 'Sneaker 2',
    caption: 'Performance Collection',
    buttonText: 'Explore',
    buttonLink: '/men',
  },
  {
    image: slide3,
    alt: 'Sneaker 3',
    caption: 'Lifestyle Sneakers',
    buttonText: 'Discover',
    buttonLink: '/women',
  },
];

// Custom CSS to override Slick's default styles
const customSliderStyles = {
  // Container to ensure proper stacking context
  sliderContainer: {
    position: 'relative',
    height: '600px',
    width: '100%',
    overflow: 'hidden'
  },
  // Force dots to be positioned within the slideshow
  dotsContainer: `
    .slick-dots {
      position: absolute;
      bottom: 20px;
      z-index: 30;
    }
    .slick-dots li button:before {
      color: white;
      opacity: 0.7;
      font-size: 10px;
    }
    .slick-dots li.slick-active button:before {
      color: white;
      opacity: 1;
    }
    .slick-prev, .slick-next {
      z-index: 30;
    }
  `
};

const Slideshow = () => {
  const [slides, setSlides] = useState(fallbackSlides);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        // The API doesn't have a specific endpoint for latest products,
        // but we can sort by createdAt in descending order
        const response = await axios.get('/api/products?limit=3');
        console.log('API Response:', response.data); // Debug log
        
        if (response.data.success && response.data.products && response.data.products.length > 0) {
          // Sort products by createdAt in descending order (newest first)
          const sortedProducts = response.data.products.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Take the 3 newest products
          const latestProducts = sortedProducts.slice(0, 3);
          
          const productSlides = latestProducts.map(product => ({
            image: product.images && product.images[0] ? product.images[0].url : fallbackSlides[0].image,
            alt: product.name || 'Product Image',
            productId: product._id,
            caption: product.name || 'New Arrival',
            description: `NEW! ${product.category ? 
              `${product.category.gender.charAt(0).toUpperCase() + product.category.gender.slice(1)}'s ${product.category.type.charAt(0).toUpperCase() + product.category.type.slice(1)}` : 
              'Stylish footwear for any occasion'}`,
            price: product.price,
            buttonText: 'Shop Now',
            buttonLink: `/product/${product._id}`,
            isNew: true
          }));
          
          setSlides(productSlides);
          console.log('Latest product slides created:', productSlides); // Debug log
        } else {
          console.log('Using fallback slides'); // Debug log
        }
      } catch (err) {
        console.error('Error fetching latest products for slideshow:', err);
        // Keep using fallback slides in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  // Force slider to play after component mounts
  useEffect(() => {
    if (sliderRef.current && !loading) {
      // Small delay to ensure slider is fully initialized
      const timer = setTimeout(() => {
        sliderRef.current.slickPlay();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [loading, sliderRef.current]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    pauseOnHover: false,
    lazyLoad: 'ondemand',
    cssEase: 'ease-in-out',
    useCSS: true,
    useTransform: true
  };

  return (
    <div style={customSliderStyles.sliderContainer}>
      {/* Add style tag with custom CSS for dots */}
      <style>{customSliderStyles.dotsContainer}</style>
      
      {loading ? (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <p>Loading slideshow...</p>
        </div>
      ) : (
        <div className="h-full relative">
          <Slider ref={sliderRef} {...settings} className="h-full">
            {slides.map((slide, index) => (
              <div key={index} className="outline-none relative h-[600px]">
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
                
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    console.error(`Failed to load image: ${slide.alt}`);
                    e.target.src = fallbackSlides[index % fallbackSlides.length].image;
                  }}
                />
                
                <div className="absolute inset-0 flex flex-col items-start justify-center text-white z-20 px-8 md:px-16 lg:px-24">
                  <div className="max-w-lg">
                    {slide.isNew ? (
                      <div className="bg-green-500 text-white text-xs uppercase font-bold px-3 py-1 rounded-full mb-4 inline-block tracking-wider">Just Added</div>
                    ) : (
                      <div className="bg-red-500 text-white text-xs uppercase font-bold px-3 py-1 rounded-full mb-4 inline-block tracking-wider">Featured</div>
                    )}
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 drop-shadow-lg">{slide.caption}</h2>
                    {slide.description && (
                      <p className="text-xl md:text-2xl text-gray-200 mb-6">{slide.description}</p>
                    )}
                    {slide.price && (
                      <p className="text-2xl md:text-3xl font-bold mb-6">${slide.price.toFixed(2)}</p>
                    )}
                    <Link
                      to={slide.buttonLink}
                      className="bg-red-500 text-white px-8 py-3 rounded-full font-medium hover:bg-red-600 transition-colors inline-flex items-center group"
                    >
                      {slide.buttonText}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default Slideshow;