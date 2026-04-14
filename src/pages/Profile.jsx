import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../utils/helpers'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

import { 
  Settings, 
  MapPin, 
  Briefcase, 
  Zap, 
  ShieldCheck, 
  History, 
  ArrowRight,
  BrainCircuit
} from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-12 font-sans selection:bg-indigo-500/30">
        
        {/* Ambient Glow (optimized blur) */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-10 z-10 relative">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Account Workspace
            </h1>
            <p className="text-gray-400 font-light mt-1">
              Manage your professional identity and AI preferences.
            </p>
          </div>

          <Button 
            variant="secondary" 
            size="sm" 
            className="gap-2"
            onClick={() => toast("Public profile coming soon")}
          >
            View Public Profile <ArrowRight size={14} />
          </Button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative">

          {/* USER TILE */}
          <div className="md:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10 group">
            <div className="flex items-start justify-between">

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-purple-500/20 border border-white/10">
                  {getInitials(user?.name || "U")}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {user?.name || "User"}
                  </h2>
                  <p className="text-gray-400 text-base font-light">
                    {user?.email || "No email available"}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    {/* Placeholder badge */}
                    <span className="badge-blue text-xs px-3 py-1">
                      Member
                    </span>
                    <span className="text-gray-600 text-xs font-medium">
                      Joined recently
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                size="sm" 
                variant="secondary" 
                className="gap-2"
                onClick={() => toast("Edit profile coming soon")}
              >
                <Settings size={14} /> Edit Details
              </Button>
            </div>
          </div>

          {/* SECURITY */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col justify-between transition-all hover:border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-emerald-400" size={20} />
                <h3 className="text-white font-semibold text-lg tracking-tight">
                  Security
                </h3>
              </div>

              <p className="text-gray-400 text-sm font-light mb-5">
                Keep your account secure. We recommend changing passwords regularly.
              </p>
            </div>

            <Button 
              variant="secondary" 
              className="w-full justify-center"
              onClick={() => toast("Password change coming soon")}
            >
              Change Password
            </Button>
          </div>

          {/* SKILLS */}
          <div className="md:col-span-3 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-blue-400" size={20} />
                <h3 className="text-white font-semibold text-lg tracking-tight">
                  Professional Skills
                </h3>
              </div>

              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => toast("Update skills coming soon")}
              >
                Update Tech Stack
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {user?.skills?.length ? (
                user.skills.map((skill, i) => (
                  <span key={i} className="group relative transition-all duration-300 hover:scale-105">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                    <span className="relative bg-dark-700 border border-white/5 text-gray-200 text-sm font-medium px-5 py-2.5 rounded-full inline-block group-hover:border-transparent transition-colors">
                      {skill}
                    </span>
                  </span>
                ))
              ) : (
                <div className="text-center py-6 w-full bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                  <p className="text-gray-500 text-sm">
                    No skills mapped to your profile yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PREFERENCES */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <h3 className="text-white font-semibold text-lg tracking-tight mb-6 flex items-center gap-3">
              <Settings className="text-gray-400" size={18} /> Career Preferences
            </h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-gray-500" />
                  <p className="text-gray-400 text-sm">Preferred Location</p>
                </div>
                <p className="text-white font-medium text-sm">
                  {user?.preferred_location || "Remote"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-gray-500" />
                  <p className="text-gray-400 text-sm">Job Type</p>
                </div>
                <p className="text-white font-medium text-sm">
                  {user?.job_type || "Full-time"}
                </p>
              </div>
            </div>
          </div>

          {/* JOB ALERTS */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-amber-400" size={20} />
              <h3 className="text-white font-semibold text-lg tracking-tight">
                AI Job Alerts
              </h3>
            </div>

            <p className="text-gray-400 text-sm font-light mb-6">
              NirVexa AI scans multiple platforms daily and finds jobs tailored to your skills.
            </p>

            <Button 
              className="w-full justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-purple-500/20"
              onClick={() => toast("Job alerts coming soon")}
            >
              <Zap size={14} /> Configure AI Stream
            </Button>
          </div>

          {/* INTERVIEW HISTORY */}
          <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10">
            <div className="flex items-center gap-3 mb-5">
              <History className="text-purple-400" size={20} />
              <h3 className="text-white font-semibold text-lg tracking-tight">
                Interview History
              </h3>
            </div>

            <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
              <BrainCircuit size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm font-light">
                No AI mock interview sessions recorded yet.
              </p>

              <Button 
                size="sm" 
                variant="secondary" 
                className="mt-4"
                onClick={() => toast("Interview module coming soon")}
              >
                Start Practice
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}