import React from 'react'
import { motion } from 'framer-motion'
import MaterialIcon from '../MaterialIcon'

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

const tabs: Tab[] = [
  { id: "personal", label: "Personal Information", icon: "person" },
  { id: "security", label: "Security & Privacy", icon: "shield" },
  { id: "preferences", label: "Preferences", icon: "settings" },
  { id: "billing", label: "Billing & Plans", icon: "payments" },
]

export default function ProfileSidebar({ activeTab, onTabChange, onLogout }: ProfileSidebarProps) {
  return (
    <aside className="space-y-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
            activeTab === tab.id 
              ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
              : "text-white/40 hover:bg-white/5 hover:text-white/70"
          }`}
        >
          {activeTab === tab.id && (
            <motion.div 
              layoutId="activeTabBg"
              className="absolute inset-0 bg-white/5 -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <MaterialIcon 
            name={tab.icon} 
            className={`text-xl transition-colors duration-300 ${activeTab === tab.id ? "text-primary" : "text-inherit"}`} 
          />
          <span className="text-sm font-medium">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div 
              layoutId="activeTabIndicator"
              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" 
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
      
      <div className="pt-8 mt-8 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all group"
        >
          <MaterialIcon name="logout" className="text-xl" />
          <span className="text-sm font-medium">System Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
