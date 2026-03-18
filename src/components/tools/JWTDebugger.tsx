'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/input'
import Header from '@/components/ui/header'

const JWTDebugger: React.FC = () => {
  const [encodedToken, setEncodedToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
  const [secretKey, setSecretKey] = useState('••••••••••••••••••••••••••••••••')
  const [signatureVerified, setSignatureVerified] = useState(true)

  const decodedHeader = {
    alg: "HS256",
    typ: "JWT"
  }

  const decodedPayload = {
    sub: "1234567890",
    name: "John Doe",
    iat: 1516239022,
    exp: 1516242622,
    role: "admin"
  }

  const handleDecode = () => {
    // Simulate decode
    console.log('Decoding token...')
  }

  const handleVerify = () => {
    // Simulate verification
    setSignatureVerified(true)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f172a]">
      <Header title="JWT Debugger" />
      
      <div className="p-8 space-y-8">
        {/* Three-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          {/* Encoded Column */}
          <Card className="flex flex-col bg-[#1e293b] border-slate-700">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-3">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              <h3 className="font-medium text-white">Encoded</h3>
            </div>
            <div className="flex-1 flex flex-col p-4 space-y-4">
              <div className="flex-1 bg-[#0f172a] rounded border border-teal-500 p-3 font-mono text-sm break-all overflow-y-auto custom-scrollbar">
                <span className="text-red-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>
                <span className="text-slate-200">.</span>
                <span className="text-blue-400">eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsInJvbGUiOiJhZG1pbiJ9</span>
                <span className="text-slate-200">.</span>
                <span className="text-orange-400">SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
              </div>
              <Button 
                onClick={handleDecode}
                className="w-full bg-[#1e293b] border border-slate-600 hover:bg-slate-700"
              >
                Decode
              </Button>
            </div>
          </Card>

          {/* Decoded Header Column */}
          <Card className="flex flex-col bg-[#1e293b] border-slate-700">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-3">
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
              <h3 className="font-medium text-white">Decoded Header</h3>
            </div>
            <div className="flex-1 bg-[#0f172a] p-4 font-mono text-sm overflow-y-auto custom-scrollbar relative">
              <div className="flex">
                <div className="w-8 text-slate-600 select-none pr-4 text-right">
                  1<br/>2<br/>3<br/>4
                </div>
                <div className="flex-1">
                  <span className="text-slate-300">{`{`}</span><br/>
                  <span className="ml-4 text-orange-400">"alg"</span>
                  <span className="text-slate-300">:</span> 
                  <span className="text-teal-500">"HS256"</span>
                  <span className="text-slate-300">,</span><br/>
                  <span className="ml-4 text-orange-400">"typ"</span>
                  <span className="text-slate-300">:</span> 
                  <span className="text-teal-500">"JWT"</span><br/>
                  <span className="text-slate-300">{`}`}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Decoded Payload Column */}
          <Card className="flex flex-col bg-[#1e293b] border-slate-700">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-3">
              <div className="w-1 h-5 bg-green-500 rounded-full"></div>
              <h3 className="font-medium text-white">Decoded Payload</h3>
            </div>
            <div className="flex-1 bg-[#0f172a] p-4 font-mono text-sm overflow-y-auto custom-scrollbar relative">
              <div className="flex">
                <div className="w-8 text-slate-600 select-none pr-4 text-right">
                  1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7
                </div>
                <div className="flex-1">
                  <span className="text-slate-300">{`{`}</span><br/>
                  <span className="ml-4 text-orange-400">"sub"</span>
                  <span className="text-slate-300">:</span> 
                  <span className="text-teal-500">"1234567890"</span>
                  <span className="text-slate-300">,</span><br/>
                  <span className="ml-4 text-orange-400">"name"</span>
                  <span className="text-slate-300">:</span> 
                  <span className="text-teal-500">"John Doe"</span>
                  <span className="text-slate-300">,</span><br/>
                  <span className="ml-4 text-orange-400">"iat"</span>
                  <span className="text-slate-300">:</span> 
                  <span className="text-purple-400">1516239022</span>
                  <span className="text-slate-300">,</span><br/>
                  <span className="ml-4 text-orange-400">"exp"</span>
                  <span className="text-slate-300">:</span> 
                  <span className="text-purple-400">1516242622</span>
                  <span className="text-slate-300">,</span><br/>
                  <span className="ml-4 text-orange-400">"role"</span>
                  <span className="text-slate-300">:</span> 
                  <span className="text-teal-500">"admin"</span><br/>
                  <span className="text-slate-300">{`}`}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Signature Verification Section */}
        <Card className="bg-[#1e293b] border-slate-700">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-3">
            <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
            <h3 className="font-medium text-white">Verify Signature</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Your-256-bit-secret
                  </label>
                  <Input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="bg-[#0f172a] border-slate-700"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="base64-secret" className="w-4 h-4 bg-[#0f172a] border-slate-700 rounded text-teal-500" />
                  <label className="text-sm text-slate-400" htmlFor="base64-secret">
                    Secret base64 encoded
                  </label>
                </div>
                <div className="pt-2">
                  <p className="text-green-500 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Signature Verified: {signatureVerified ? 'True' : 'False'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleVerify} className="flex-1 bg-[#334155] hover:bg-[#475569]">
                  Verify
                </Button>
                <Button variant="outline" className="flex-1 border-slate-600 hover:bg-slate-700">
                  Share Token
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default JWTDebugger
