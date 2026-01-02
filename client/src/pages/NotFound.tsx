import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle, ArrowLeft, Search, Sparkles } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-600 text-slate-100 relative overflow-hidden px-4">
      {/* Product Sans Font */}
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/product-sans');
        
        * {
          font-family: 'Product Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-60px) translateX(-15px); }
          75% { transform: translateY(-30px) translateX(15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.2); }
          50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.4); }
        }
      `}</style>

      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-4 sm:space-y-6 relative z-10 max-w-xl">
        {/* 404 Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-slate-50 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl sm:text-7xl font-bold text-slate-50 mb-3 tracking-tight">
          404
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
          <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-white/30"></div>
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-slate-50" />
          <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-white/30"></div>
        </div>

        {/* Error Message */}
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-50">
            Oops! Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-slate-100 max-w-sm mx-auto leading-relaxed px-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          {/* Attempted Path */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs sm:text-sm text-slate-50 backdrop-blur-sm">
            <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate max-w-[180px] sm:max-w-xs">{location.pathname}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-stretch sm:items-center pt-3 sm:pt-4">
          <Link to="/me" className="w-full sm:w-auto">
            <button className="group w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-blue-600 font-medium text-sm rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Return to Home
            </button>
          </Link>

          <button 
            onClick={() => window.history.back()}
            className="group w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-slate-50 font-medium text-sm rounded-lg border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>

        {/* Helper Text */}
        <div className="pt-6 sm:pt-8 border-t border-white/10 mt-6 sm:mt-8">
          <p className="text-xs text-slate-200">
            <span className="text-slate-50 font-medium">404_NOT_FOUND</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;