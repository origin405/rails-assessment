// apps/web/src/components/home/index.tsx

import React from "react";
import AuthPage from "../../app/auth/(auth)/page";
import { CheckCircle } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-6xl w-full space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Welcome to Mini on Rails
          </h1>
          <p className="text-2xl text-gray-300">
            Your collaborative task management solution
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 bg-gray-800 shadow-lg rounded-3xl p-8 order-2 lg:order-1 border border-gray-700">
            <h2 className="text-3xl font-bold text-center mb-6 text-purple-400">
              Why choose Mini on Rails?
            </h2>
            <ul className="space-y-4">
              {[
                "Drag and drop for seamless task management",
                "Real-time updates for effortless collaboration",
                "Lightning-fast responsiveness for smooth workflow",
                "Reliable and secure for peace of mind",
                "Because it's Awesome!",
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 bg-gray-800 shadow-lg rounded-3xl p-8 order-1 lg:order-2 border border-gray-700">
            <AuthPage />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
