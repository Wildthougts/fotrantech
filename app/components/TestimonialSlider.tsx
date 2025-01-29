'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: "Alex M.",
    role: "Music Producer",
    content: "Best service I've used for my Spotify promotion. Highly recommended!",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah K.",
    role: "Independent Artist",
    content: "The support team is amazing and the results are outstanding.",
    rating: 5
  },
  {
    id: 3,
    name: "Mike R.",
    role: "DJ",
    content: "Incredible service that helped me grow my audience significantly.",
    rating: 5
  },
  {
    id: 4,
    name: "Emma L.",
    role: "Singer/Songwriter",
    content: "Professional, reliable, and effective. Exactly what I needed.",
    rating: 5
  }
];

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative h-[300px] max-w-3xl mx-auto">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute w-full"
        >
          <div className="bg-white rounded-xl shadow-sm p-8 mx-4">
            <div className="flex text-yellow-400 mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>
            <p className="text-gray-600 italic mb-6">"{testimonials[currentIndex].content}"</p>
            <div>
              <p className="font-semibold text-gray-900">{testimonials[currentIndex].name}</p>
              <p className="text-sm text-gray-500">{testimonials[currentIndex].role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-[-40px] left-0 right-0 flex justify-center space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentIndex ? "bg-gray-900" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
} 