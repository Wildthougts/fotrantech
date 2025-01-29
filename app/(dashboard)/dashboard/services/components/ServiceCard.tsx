'use client';

import { useState } from 'react';
import { Service } from '@/utils/supabase';
import toast from 'react-hot-toast';
import { FiShoppingCart } from 'react-icons/fi';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      
      // Create user service (pending payment)
      const userServiceRes = await fetch('/api/user-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: service.id,
        }),
      });

      if (!userServiceRes.ok) {
        throw new Error('Failed to create user service');
      }

      // Create payment
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: service.id,
        }),
      });

      if (!paymentRes.ok) {
        throw new Error('Failed to create payment');
      }

      const { payment_url } = await paymentRes.json();
      
      // Redirect to payment page
      window.location.href = payment_url;
    } catch (error) {
      console.error('Error purchasing service:', error);
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
          <span className="text-2xl font-bold text-indigo-600">${service.price}</span>
        </div>
        <p className="text-gray-600 mb-6">{service.description}</p>
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiShoppingCart className="w-5 h-5" />
          {isLoading ? 'Processing...' : 'Purchase Now'}
        </button>
      </div>
    </div>
  );
} 