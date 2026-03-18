'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/select'
import Header from '@/components/ui/header'

interface TeamMember {
  id: number
  name: string
  role: string
  avatar: string
  lastActive: string
  status: 'active' | 'inactive'
}

const TeamManagement: React.FC = () => {
  const [defaultAccess, setDefaultAccess] = useState('View Only')
  const [dataRetention, setDataRetention] = useState('90 Days')
  const [allowExternal, setAllowExternal] = useState(false)

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Admin',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKTIGr7KffTwXvDHTNK9FZovps3tTQ0h88GBeGO1PbS-yq5aAYopln6mJBHEgoBq-wUnFPdPzvyK0B3x0JUPkTY7DHKkHoVGsQ3UNaUwJcL6P48XdMBnRGU_8VGVls7Nx6fZdj685LLAZasWKrgbH7Vxj7Z4K8ZXNuKF4A3jnGLKKlT2nS1QA0xUgOB3CV9MyEIJA-XUBz6kJUsjtqIOVmCvgQHyP80CJmUEU-y9e3bd5xkDm6Yx3yk0tVIX7GUPM7yLmzh7FM1AE',
      lastActive: '2m ago',
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Developer',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXKXfZlllhLeojkx54rPCPl3Y3TBpN4aeOIro91nOtDiTlqZSXBkI-ZcNXJwuNyzNMxHBk2pp5Z0-ZItR1frxF_KWovOa_96hotD1xcVAho1YtwmV8SeOLL7QyKxruUUyvGXj8FHCwemD2DTKViIlieTkj12ffoilAR9CIttHVxr1NE3wRA-ArvXU1q3PIhDmG2oqWiG-DjPHWY2ffFYusT_wn5J3zHdEXFDp6J5l5DB88IUvRZKemoAdS0W_dFakdPc_lBT1MkV8',
      lastActive: '1h ago',
      status: 'active'
    },
    {
      id: 3,
      name: 'David Kim',
      role: 'Viewer',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa3k_NNqp0zwy7fHBDjx3ID1mfHXvJFQigInTABawL5o4PTCKUmAF8cnzFkfd3Q-WUAuPh_69Xj4I_qTDHGj2i77xSPDk3tkdqvr8i-1lakByOTtOMfTvfHvSNGvxxoeClKEZo5wo5gNXQEg8XCgUf6I3iI8zubNttt_dIqmbe4rZiPoWVCT8i08Nf1LE0YyGz7M94gFzRgSlBG0vXP4wpYJz4ozCeN6JIhZNgqvFs2Sf7Lg8aAq2b54siRoJv4Mi11SEqqsmfM50',
      lastActive: '1h ago',
      status: 'inactive'
    },
    {
      id: 4,
      name: 'Emily Davis',
      role: 'Developer',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBww4bZlLtNKSLScbEBZx4XMQTPsEuTg8X3O_lAFDONQMqE7Wro5mttucYqdXiYYzyWQF50FiIa3t8QhZpmLsne86wfliILrsrziuhPOxQ0g3bRSWKGzOJkJadphz29xzDtHVi80lgptlljOlvBceRtLQx8KdZlcUmcX3GGYAYBOhB1E4TePKDk3EOi-gLw4uMskz2fgdB2q7TrQDhO63T19tuyTEr6FcMoxyVgpD_Zqj1RAT1RbTMa54wVbHZGSP0_RYm8OcJ-sOs',
      lastActive: '1h ago',
      status: 'active'
    },
    {
      id: 5,
      name: 'Alex Johnson',
      role: 'Viewer',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuG0UFXlMc65OZndUKmaqnCC3LS2Vg-jWC7gMuJdUexKBPkJ8QJNhT1vIoy416SDWSh3gNboWhVN17qhNQErGiRY0WRkLB9issd8_R5dL4yUTo7DNRG0Z4ofOc8gGaXvONAwmVTRxwIYc6_WXsVDcs9olEkQ2cpvdLdqiK9SPqpQj8JtXdiBzA3oiAGBypwmKc5AK5hZFdFtjWUxiybrvJLNPqAM09G5ngaoLH9ubdEg58PUQ2W1OGZakqoVgJ88Si-Pw_ioV02oQ',
      lastActive: '1h ago',
      status: 'inactive'
    }
  ]

  const accessOptions = [
    { value: 'View Only', label: 'View Only' },
    { value: 'Editor', label: 'Editor' },
    { value: 'Admin', label: 'Admin' }
  ]

  const retentionOptions = [
    { value: '90 Days', label: '90 Days' },
    { value: '180 Days', label: '180 Days' },
    { value: '1 Year', label: '1 Year' }
  ]

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-blue-100 text-blue-600'
      case 'Developer':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusDot = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-slate-400'
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100">
      <Header 
        title="Team Management"
        actions={
          <div className="flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Invite Member
            </Button>
            <Button variant="secondary" className="bg-slate-400 hover:bg-slate-500">
              Manage Permissions
            </Button>
          </div>
        }
      />
      
      <div className="px-8 pb-8 space-y-6">
        {/* Workspace Settings Card */}
        <Card className="bg-white border-gray-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Shared Workspace Settings</h2>
          <div className="flex flex-wrap items-center gap-8 text-slate-600">
            <div className="flex items-center gap-3">
              <span className="font-medium whitespace-nowrap">Default Project Access:</span>
              <Select
                value={defaultAccess}
                onChange={(e) => setDefaultAccess(e.target.value)}
                options={accessOptions}
                className="bg-slate-50 min-w-[140px] border-gray-300"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium whitespace-nowrap">Data Retention:</span>
              <Select
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                options={retentionOptions}
                className="bg-slate-50 min-w-[140px] border-gray-300"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium whitespace-nowrap">Allow External Collaborators: {allowExternal ? 'On' : 'Off'}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={allowExternal}
                  onChange={(e) => setAllowExternal(e.target.checked)}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Team Members Table */}
        <Card className="bg-white border-gray-200 overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-slate-800">Team Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 font-medium text-sm border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                          src={member.avatar}
                        />
                        <span className="font-semibold">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getRoleBadgeClass(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{member.lastActive}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusDot(member.status)}`}></span>
                        <span className="text-sm capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TeamManagement
