import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import MaterialIcon from '../MaterialIcon'

interface ProfileHeaderProps {
  name?: string
  email?: string
  image?: string
}

export default function ProfileHeader({ name, email, image }: ProfileHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10">
      <div className="h-32 bg-linear-to-r from-primary/20 via-primary/5 to-transparent relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>
      
      <div className="px-8 pb-8 -mt-12 relative">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <div className="relative group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="absolute -inset-1 bg-linear-to-r from-primary to-primary rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"
            />
            <div className="size-32 rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-[#111] relative">
              {image ? (
                <Image 
                  src={image} 
                  alt={name || "Profile"} 
                  width={128}
                  height={128}
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-white/10">
                  <MaterialIcon name="account_circle" className="text-7xl" />
                </div>
              )}
              <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MaterialIcon name="photo_camera" className="text-2xl" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 pb-2">
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight mb-1"
            >
              {name}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 text-sm flex items-center gap-2"
            >
              <MaterialIcon name="mail" className="text-base" />
              {email}
            </motion.p>
          </div>

          <button className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
          {[
            { label: "Status", value: "Active Entity", icon: "verified" },
            { label: "Level", value: "Xen-Pro", icon: "workspace_premium" },
            { label: "Established", value: "March 2024", icon: "calendar_today" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.04)" }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/2 transition-colors"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <MaterialIcon name={stat.icon} className="text-xl" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">{stat.label}</p>
                <p className="text-sm font-medium">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
