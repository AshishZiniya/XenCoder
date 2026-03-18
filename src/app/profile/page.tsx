"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileSidebar from "@/components/profile/ProfileSidebar"
import ProfileForm from "@/components/profile/ProfileForm"
import MaterialIcon from "@/components/MaterialIcon"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal")

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-pulse flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full" />
          <div className="h-4 w-32 bg-white/5 rounded" />
        </motion.div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-barlow selection:bg-primary/30 text-[16px]">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-8 relative"
      >
        {/* Header/Nav */}
        <header className="flex items-center justify-between mb-12">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-sm text-white/80 hover:text-white transition-all"
          >
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <MaterialIcon name="arrow_back" className="text-lg group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Back to Canvas
          </Link>
          <div className="text-right">
            <h1 className="text-xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-[10px] text-white/80 uppercase tracking-[0.2em]">Manage your digital workspace</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <ProfileSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={() => router.push("/auth/logout")}
        />

          {/* Main Content Area */}
          <main className="space-y-6">
            <ProfileHeader 
              name={session?.user?.name ?? undefined}
              email={session?.user?.email ?? undefined}
              image={session?.user?.image ?? undefined}
            />

            <AnimatePresence mode="wait">
              <motion.section 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm min-h-[400px]"
              >
                <ProfileForm 
                  activeTab={activeTab}
                  userName={session?.user?.name ?? undefined}
                  userEmail={session?.user?.email ?? undefined}
                />
              </motion.section>
            </AnimatePresence>
          </main>
        </div>

        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-white uppercase tracking-[0.4em] font-light">
            XenCoder Systems • Intelligence Matrix
          </p>
        </footer>
      </motion.div>
    </div>
  )
}
