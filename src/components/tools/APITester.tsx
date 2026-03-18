'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Header from '@/components/ui/header'

interface APIResponse {
  status: number
  statusText: string
  time: number
  size: string
  data: any
}

const APITester: React.FC = () => {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://api.example.com/v1/users/123')
  const [response, setResponse] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const methods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'PATCH', label: 'PATCH' }
  ]

  const handleSendRequest = async () => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setResponse({
        status: 200,
        statusText: 'OK',
        time: 145,
        size: '2.1 KB',
        data: {
          id: 123,
          username: 'jdoe',
          email: 'jdoe@example.com',
          roles: ['admin', 'user']
        }
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f172a]">
      <Header title="API Tester Tool" />
      
      <div className="px-8 pb-8 space-y-6">
        {/* Request Section */}
        <Card>
          <div className="flex gap-4 mb-8">
            <div className="relative min-w-[120px]">
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                options={methods}
                className="bg-gray-800"
              />
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter API URL"
              className="flex-1"
            />
            <Button 
              onClick={handleSendRequest}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>

          {/* Request Tabs */}
          <div className="mb-4">
            <div className="flex space-x-2">
              <button className="px-4 py-1.5 rounded-full text-sm font-medium border border-blue-500 bg-blue-500/10 text-blue-400">
                Params
              </button>
              <button className="px-4 py-1.5 rounded-full text-sm font-medium border border-slate-700 text-slate-400 hover:border-slate-600 transition-colors">
                Headers
              </button>
              <button className="px-4 py-1.5 rounded-full text-sm font-medium border border-slate-700 text-slate-400 hover:border-slate-600 transition-colors">
                Body
              </button>
              <button className="px-4 py-1.5 rounded-full text-sm font-medium border border-slate-700 text-slate-400 hover:border-slate-600 transition-colors">
                Auth
              </button>
            </div>
          </div>

          {/* Params Table */}
          <div className="border border-slate-700 rounded-lg overflow-hidden bg-gray-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/80 text-slate-400 font-medium border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-1/3">Key</th>
                  <th className="px-4 py-3 w-1/3">Value</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="px-4 py-3">userId</td>
                  <td className="px-4 py-3">123</td>
                  <td className="px-4 py-3">The ID of the user</td>
                </tr>
                <tr className="opacity-30">
                  <td className="px-4 py-3">Key</td>
                  <td className="px-4 py-3">Value</td>
                  <td className="px-4 py-3">Description</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Response Section */}
        {response && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Response</h3>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <span className="text-slate-400 mr-2">Status:</span>
                  <span className="text-green-500 font-bold">{response.status} {response.statusText}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-400 mr-2">Time:</span>
                  <span className="text-white">{response.time}ms</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-400 mr-2">Size:</span>
                  <span className="text-white">{response.size}</span>
                </div>
              </div>
            </div>

            {/* Code Viewer */}
            <div className="bg-[#0f172a] rounded-lg p-6 border border-slate-700 font-mono text-sm leading-relaxed overflow-x-auto">
              <div className="flex">
                <div className="line-number text-slate-600 text-right pr-4 select-none">1</div>
                <div className="text-white">{`{`}</div>
              </div>
              <div className="flex">
                <div className="line-number text-slate-600 text-right pr-4 select-none">2</div>
                <div className="pl-4">
                  <span className="text-blue-400">"id"</span>: <span className="text-green-400">{response.data.id}</span>,
                </div>
              </div>
              <div className="flex">
                <div className="line-number text-slate-600 text-right pr-4 select-none">3</div>
                <div className="pl-4">
                  <span className="text-blue-400">"username"</span>: <span className="text-orange-300">"{response.data.username}"</span>,
                </div>
              </div>
              <div className="flex">
                <div className="line-number text-slate-600 text-right pr-4 select-none">4</div>
                <div className="pl-4">
                  <span className="text-blue-400">"email"</span>: <span className="text-orange-300">"{response.data.email}"</span>,
                </div>
              </div>
              <div className="flex">
                <div className="line-number text-slate-600 text-right pr-4 select-none">5</div>
                <div className="pl-4">
                  <span className="text-blue-400">"roles"</span>: [{response.data.roles.map((role: string) => `<span class="text-orange-300">"${role}"</span>`).join(', ')}]
                </div>
              </div>
              <div className="flex">
                <div className="line-number text-slate-600 text-right pr-4 select-none">6</div>
                <div className="text-white">{`}`}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default APITester
