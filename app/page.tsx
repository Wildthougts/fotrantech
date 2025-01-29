import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { FaShieldAlt, FaClock, FaUserFriends } from "react-icons/fa";
import TestimonialSlider from "@/app/components/TestimonialSlider";

export default async function LandingPage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="animate-fade-in"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">FT Dashboard</span>
            </div>
            <SignInButton>
              <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Built For Artists
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-up animation-delay-200">
              We provide you the best tools to promote your music with streaming.
            </p>
            <div className="flex justify-center space-x-4 animate-fade-in-up animation-delay-400">
              <SignInButton>
                <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200">
                  Get Started
                </button>
              </SignInButton>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-gray-900 mb-4">
                <FaShieldAlt className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure and Fast</h3>
              <p className="text-gray-600">
                Our platform ensures your data is protected while delivering optimal performance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-gray-900 mb-4">
                <FaClock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Round-the-clock assistance to help you with any questions or concerns.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-gray-900 mb-4">
                <FaUserFriends className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Join a thriving community of artists and creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Optimal Quality at Unbeatable Costs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#0A0A0A] rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Spotify Win v1</h3>
              <p className="text-gray-300 text-sm mb-4">Best for Spotify, 1M+ Daily Streams</p>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">$35.00</span>
                <span className="text-gray-400 ml-2">/mo</span>
              </div>
              <button className="w-full bg-white text-black py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Details
              </button>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Spotify Desktop</h3>
              <p className="text-gray-300 text-sm mb-4">Desktop App for Streaming</p>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">$49.00</span>
                <span className="text-gray-400 ml-2">/mo</span>
              </div>
              <button className="w-full bg-white text-black py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Details
              </button>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Spotify Desktop Creator</h3>
              <p className="text-gray-300 text-sm mb-4">Advanced Desktop Features</p>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">$49.00</span>
                <span className="text-gray-400 ml-2">/mo</span>
              </div>
              <button className="w-full bg-white text-black py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Details
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Support and Tools Sections */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Support Card */}
            <div className="relative">
              <div className="bg-[#0A0A0A] rounded-xl p-8 text-white relative z-10">
                <h2 className="text-3xl font-bold mb-6">24/5 Exceptional Support</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3">We'll answer your questions within 24hrs or less</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3">Our team is ready to help you with any issues</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3">We'll ensure the functionality of all your plans</span>
                  </li>
                </ul>
                <button className="mt-8 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Get Started
                </button>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-5 rounded-xl transform rotate-3"></div>
            </div>

            {/* Tools Card */}
            <div className="relative">
              <div className="bg-[#0A0A0A] rounded-xl p-8 text-white relative z-10">
                <h2 className="text-3xl font-bold mb-6">Undetectable Tools with Distinctive Fingerprinting</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3">Our tools get you the best results without detection</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3">Unique fingerprinting for each session</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3">Regular updates to maintain effectiveness</span>
                  </li>
                </ul>
                <button className="mt-8 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Get Started
                </button>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-5 rounded-xl transform -rotate-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet our Happy Clients</h2>
          <TestimonialSlider />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">© 2024 FT Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
