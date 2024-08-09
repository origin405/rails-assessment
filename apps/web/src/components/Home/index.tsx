// apps/web/src/components/home/index.tsx

import React from 'react';
import AuthPage from '../../app/auth/(auth)/page';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome to Rails
          </h1>
          <p className="text-xl text-gray-600">
            Your collaborative task management solution
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why choose Rails?
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Effortlessly organize your tasks</li>
              <li>Collaborate with your team in real-time</li>
              <li>Streamline your workflow</li>
              <li>Boost productivity with intuitive design</li>
            </ul>
          </div>
          
          <div className="md:w-1/2 bg-white shadow-md rounded-lg p-6">
            <AuthPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;