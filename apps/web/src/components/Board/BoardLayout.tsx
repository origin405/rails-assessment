// import React, { useState } from 'react';
// import { Menu, X, ChevronRight } from 'lucide-react';

// const BoardLayout: React.FC = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Placeholder data
//   const boardName = "My Awesome Board";
//   const userName = "John Doe";
//   const boards = ["Board 1", "Board 2", "Board 3"];

//   return (
//     <div className="h-screen flex overflow-hidden bg-gradient-to-br from-orange-900 to-orange-500">
//       {/* Sidebar */}
//       <div 
//         className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform ${
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         } transition-transform duration-300 ease-in-out`}
//       >
//         <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
//           <h2 className="text-xl font-semibold text-gray-100">My Boards</h2>
//           <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-100">
//             <X size={24} />
//           </button>
//         </div>
//         <nav className="mt-5 px-2 space-y-1">
//           {boards.map((board, index) => (
//             <a
//               key={index}
//               href="#"
//               className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
//             >
//               {board}
//             </a>
//           ))}
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <header className="bg-gray-900 shadow-md">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
//             <div className="flex items-center">
//               <button 
//                 onClick={() => setSidebarOpen(true)} 
//                 className="mr-4 text-gray-400 hover:text-gray-100 focus:outline-none"
//               >
//                 <Menu size={24} />
//               </button>
//               <h1 className="text-2xl font-bold text-gray-100">{boardName}</h1>
//             </div>
//             <div className="flex items-center">
//               <span className="text-gray-100">{userName}</span>
//             </div>
//           </div>
//         </header>

//         {/* Board content */}
//         <main className="flex-1 overflow-x-auto overflow-y-hidden">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//             {/* Your board content will go here */}
//             <p className="text-gray-100">Your board content goes here.</p>
//           </div>
//         </main>
//       </div>

//       {/* Overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar toggle for larger screens */}
//       <div className="hidden lg:block fixed left-0 top-1/2 transform -translate-y-1/2">
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="bg-gray-900 text-gray-400 hover:text-gray-100 p-2 rounded-r-md focus:outline-none"
//         >
//           <ChevronRight size={24} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BoardLayout;