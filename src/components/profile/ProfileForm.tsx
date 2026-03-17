import React from 'react'
import { motion } from 'framer-motion'
import FormInput from '../ui/FormInput'
import Button from '../ui/Button'
import MaterialIcon from '../MaterialIcon'

interface ProfileFormProps {
  activeTab: string;
  userName?: string;
  userEmail?: string;
}

export default function ProfileForm({ activeTab, userName, userEmail }: ProfileFormProps) {
  const tabs = [
    { id: "personal", label: "Personal Information", icon: "person" },
    { id: "security", label: "Security & Privacy", icon: "shield" },
    { id: "preferences", label: "Preferences", icon: "settings" },
    { id: "billing", label: "Billing & Plans", icon: "payments" },
  ]

  const currentTab = tabs.find(t => t.id === activeTab)

  if (activeTab === 'personal') {
    return (
      <div className="max-w-2xl">
        <h3 className="text-xl font-semibold mb-2">{currentTab?.label}</h3>
        <p className="text-sm text-white/40 mb-8">
          Update your {activeTab} information and manage how your data is displayed.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              id="name"
              name="name"
              type="text"
              label="Full Identity"
              placeholder="Your identity name"
              defaultValue={userName || ""}
            />
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Communication Channel"
              placeholder="name@example.com"
              defaultValue={userEmail || ""}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/30 uppercase tracking-widest ml-1">Account Bio</label>
            <textarea 
              rows={4}
              placeholder="Share a bit about yourself..."
              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:bg-white/5 outline-none transition-all resize-none placeholder:text-white/10"
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button variant="ghost">
              Discard Changes
            </Button>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
            >
              Save Evolution
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-semibold mb-2">{currentTab?.label}</h3>
      <p className="text-sm text-white/40 mb-8">
        Manage your {activeTab} settings and preferences.
      </p>
      
      <div className="bg-white/2 border border-white/5 rounded-xl p-8 text-center">
        <MaterialIcon name={currentTab?.icon || "settings"} className="text-6xl text-white/20 mb-4" />
        <p className="text-white/40">
          {activeTab === 'security' && 'Security settings coming soon...'}
          {activeTab === 'preferences' && 'Preferences panel coming soon...'}
          {activeTab === 'billing' && 'Billing management coming soon...'}
        </p>
      </div>
    </div>
  )
}
