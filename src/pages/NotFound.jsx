import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0c] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto w-full">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-6 backdrop-blur-sm">
          <Compass size={14} className="text-blue-400" />
          <span>Error 404</span>
        </div>

        {/* Massive 404 Text */}
        <h1 className="text-[7rem] sm:text-[10rem] font-black leading-none tracking-tighter bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl select-none mb-4 sm:mb-2">
          404
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
          Lost your way?
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed mb-10 px-2 sm:px-4">
          The page you’re looking for doesn’t exist or has been moved. Let’s get you back on the right career path.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 group w-full sm:w-auto text-base"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <Link
            to="/chat"
            className="flex items-center justify-center gap-2 bg-[#111116] hover:bg-white/5 text-white px-8 py-3.5 rounded-xl font-medium border border-white/10 transition-all w-full sm:w-auto text-base shadow-xl"
          >
            <Sparkles size={18} className="text-purple-400" />
            AI Workspace
          </Link>
        </div>

        {/* Footer hint */}
        <p className="text-gray-600 text-[10px] sm:text-xs mt-16 sm:mt-20 font-medium tracking-widest uppercase">
          NirVexa · AI Career Platform
        </p>
      </div>
    </div>
  )
}