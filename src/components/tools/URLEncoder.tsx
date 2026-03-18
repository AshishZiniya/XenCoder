'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/button'
import Textarea from '@/components/ui/textarea'
import Input from '@/components/ui/input'
import Header from '@/components/ui/header'

const URLEncoder: React.FC = () => {
  const [inputText, setInputText] = useState('Hello World! @#$%^&*()')
  const [encodedText, setEncodedText] = useState('Hello%20World%21%20%40%23%24%25%5E%26*%28%29')
  const [decodedText, setDecodedText] = useState('Hello World! @#$%^&*()')
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode')

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(inputText)
      setEncodedText(encoded)
    } catch (error) {
      setEncodedText('Error encoding text')
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(encodedText)
      setDecodedText(decoded)
    } catch (error) {
      setDecodedText('Error decoding text')
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f172a]">
      <Header title="URL Encoder/Decoder" />
      
      <div className="p-8 space-y-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('encode')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'encode'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setActiveTab('decode')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'decode'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Decode
          </button>
        </div>

        {activeTab === 'encode' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="bg-[#1e293b] border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Input Text</h3>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to encode..."
                rows={8}
                className="bg-[#0f172a] border-slate-600 text-white"
              />
              <div className="mt-4 flex gap-3">
                <Button onClick={handleEncode} className="flex-1">
                  Encode
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setInputText('')}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  Clear
                </Button>
              </div>
            </Card>

            {/* Output Section */}
            <Card className="bg-[#1e293b] border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Encoded Result</h3>
                <Button
                  variant="ghost"
                  onClick={() => handleCopy(encodedText)}
                  className="text-slate-400 hover:text-white p-2"
                  title="Copy to clipboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </Button>
              </div>
              <Textarea
                value={encodedText}
                readOnly
                rows={8}
                className="bg-[#0f172a] border-slate-600 text-white font-mono text-sm"
              />
              <div className="mt-4 text-sm text-slate-400">
                <p>Length: {encodedText.length} characters</p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="bg-[#1e293b] border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Encoded Text</h3>
              <Textarea
                value={encodedText}
                onChange={(e) => setEncodedText(e.target.value)}
                placeholder="Enter URL-encoded text to decode..."
                rows={8}
                className="bg-[#0f172a] border-slate-600 text-white font-mono text-sm"
              />
              <div className="mt-4 flex gap-3">
                <Button onClick={handleDecode} className="flex-1">
                  Decode
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEncodedText('')}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  Clear
                </Button>
              </div>
            </Card>

            {/* Output Section */}
            <Card className="bg-[#1e293b] border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Decoded Result</h3>
                <Button
                  variant="ghost"
                  onClick={() => handleCopy(decodedText)}
                  className="text-slate-400 hover:text-white p-2"
                  title="Copy to clipboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </Button>
              </div>
              <Textarea
                value={decodedText}
                readOnly
                rows={8}
                className="bg-[#0f172a] border-slate-600 text-white"
              />
              <div className="mt-4 text-sm text-slate-400">
                <p>Length: {decodedText.length} characters</p>
              </div>
            </Card>
          </div>
        )}

        {/* Reference Section */}
        <Card className="bg-[#1e293b] border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">URL Encoding Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Common Characters</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span>Space</span>
                  <span className="text-blue-400">%20</span>
                </div>
                <div className="flex justify-between">
                  <span>!</span>
                  <span className="text-blue-400">%21</span>
                </div>
                <div className="flex justify-between">
                  <span>@</span>
                  <span className="text-blue-400">%40</span>
                </div>
                <div className="flex justify-between">
                  <span>#</span>
                  <span className="text-blue-400">%23</span>
                </div>
                <div className="flex justify-between">
                  <span>$</span>
                  <span className="text-blue-400">%24</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Special Characters</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span>&amp;</span>
                  <span className="text-blue-400">%26</span>
                </div>
                <div className="flex justify-between">
                  <span>+</span>
                  <span className="text-blue-400">%2B</span>
                </div>
                <div className="flex justify-between">
                  <span>/</span>
                  <span className="text-blue-400">%2F</span>
                </div>
                <div className="flex justify-between">
                  <span>?</span>
                  <span className="text-blue-400">%3F</span>
                </div>
                <div className="flex justify-between">
                  <span>=</span>
                  <span className="text-blue-400">%3D</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default URLEncoder
