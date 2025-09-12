import React from "react";

export const SplashScreen = (): JSX.Element => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blueblue-500 via-light-bluelight-blue-500 to-blueblue-700">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-16 w-24 h-24 bg-white/5 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-white/5 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        
        {/* Floating paw prints */}
        <div className="absolute top-1/4 left-1/4 text-white/10 text-4xl animate-float">🐾</div>
        <div className="absolute top-3/4 right-1/4 text-white/10 text-3xl animate-float delay-500">🐾</div>
        <div className="absolute top-1/2 left-1/6 text-white/10 text-2xl animate-float delay-1000">🐾</div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col items-center justify-center gap-8 px-6 relative z-10">
        <div className="relative">
          {/* Logo glow effect */}
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-110"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <img
              className="w-24 h-36 object-cover"
              alt="eDog Logo"
              src="/logo-1.png"
            />
          </div>
        </div>
        
        {/* App title and tagline */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">eDog</h1>
          <p className="text-white/90 text-lg font-medium">Digital Dog Passport</p>
          <p className="text-white/70 text-sm">Your pet's life, organized</p>
        </div>
        
        {/* Loading indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};
