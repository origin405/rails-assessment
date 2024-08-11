import React from "react";
import AuthPage from "../../app/auth/(auth)/page";
import { CheckCircle, ExternalLink } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-6xl w-full space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Trello on Rails
          </h1>
          <p className="text-2xl text-gray-300">
            Welcome to the assessment app for <a
            href="https://www.on-rails.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            Rails <ExternalLink className="ml-2 h-4 w-4" />
          </a>, a next-gen CRM startup
            company
          </p>
          
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 bg-gray-800 shadow-lg rounded-3xl p-8 order-2 lg:order-1 border border-gray-700">
            <h2 className="text-3xl font-bold text-center mb-6 text-purple-400">
              Why choose Trello on Rails?
            </h2>
            <ul className="space-y-4">
              {[
                "Drag and drop for seamless task management",
                "Real-time updates for effortless collaboration",
                "Lightning-fast responsiveness for smooth workflow",
                "Reliable and secure for peace of mind",
                "Developed for Rails as part of their interview assesment",
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
        <footer className="text-center text-gray-400 text-sm">
          <p>
            This is an assessment application. For the full Rails CRM
            experience, please visit the website!
          </p>
          <a
            href="https://www.on-rails.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            Visit Rails website <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Home;
