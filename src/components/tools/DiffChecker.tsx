'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/select'
import Header from '@/components/ui/header'

const DiffChecker: React.FC = () => {
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true)
  const [language, setLanguage] = useState('Python')

  const languages = [
    { value: 'Python', label: 'Python' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'JSON', label: 'JSON' },
    { value: 'HTML', label: 'HTML' },
    { value: 'CSS', label: 'CSS' },
    { value: 'C++', label: 'C++' }
  ]

  const originalCode = `def process_data(data):
    # Original implementation
    result = {}
    for item in data:
        if item['type'] == 'user':
            result[item['id']] = item
        else:
            continue
    return result`

  const modifiedCode = `def process_data(data):
    # Updated implementation using list comprehension
    users = [item for item in data if item['type'] == 'user']
    result = {u['id']: u for u in users}
    return result`

  const handleCompare = () => {
    console.log('Comparing files...')
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
      <Header 
        title="Diff Checker"
        actions={
          <div className="flex items-center space-x-6">
            {/* Whitespace Toggle */}
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  type="checkbox" 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">Ignore Whitespace</span>
              </label>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Language</span>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={languages}
                className="bg-[#1e1e1e] border-gray-700 min-w-[120px]"
              />
            </div>

            <Button onClick={handleCompare}>
              Compare
            </Button>
          </div>
        }
      />
      
      <div className="p-8">
        <div className="grid grid-cols-2 h-full border border-gray-800 rounded-lg overflow-hidden bg-[#1e1e1e] shadow-2xl">
          {/* Left Pane: Original */}
          <div className="flex flex-col border-r border-gray-800">
            <div className="bg-[#252525] px-6 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">Original File (old.py)</span>
            </div>
            <div className="flex-1 font-mono text-sm leading-relaxed overflow-y-auto py-4 bg-[#1e1e1e] custom-scrollbar">
              {/* Line 1 */}
              <div className="flex items-start">
                <span className="line-number">1</span>
                <span className="diff-sign"></span>
                <pre className="text-blue-400">def <span className="text-yellow-400">process_data</span>(data):</pre>
              </div>
              {/* Line 2 */}
              <div className="flex items-start">
                <span className="line-number">2</span>
                <span className="diff-sign"></span>
                <pre className="text-gray-500 italic ml-4"># Original implementation</pre>
              </div>
              {/* Line 3 */}
              <div className="flex items-start">
                <span className="line-number">3</span>
                <span className="diff-sign"></span>
                <pre className="text-white ml-4">result = {}</pre>
              </div>
              {/* Line 4 */}
              <div className="flex items-start">
                <span className="line-number">4</span>
                <span className="diff-sign"></span>
                <pre className="text-purple-400 ml-4">for <span className="text-white">item</span> in <span className="text-white">data:</span></pre>
              </div>
              {/* Line 5 */}
              <div className="flex items-start">
                <span className="line-number">5</span>
                <span className="diff-sign"></span>
                <pre className="text-purple-400 ml-8">if <span className="text-white">item[</span><span className="text-orange-300">'type'</span><span className="text-white">] == </span><span className="text-orange-300">'user'</span><span className="text-white">:</span></pre>
              </div>
              {/* Line 6 */}
              <div className="flex items-start">
                <span className="line-number">6</span>
                <span className="diff-sign"></span>
                <pre className="text-white ml-12">result[item[<span className="text-orange-300">'id'</span>]] = item</pre>
              </div>
              {/* Line 7 */}
              <div className="flex items-start">
                <span className="line-number">7</span>
                <span className="diff-sign"></span>
                <pre className="text-purple-400 ml-8">else:</pre>
              </div>
              {/* Line 8 */}
              <div className="flex items-start">
                <span className="line-number">8</span>
                <span className="diff-sign"></span>
                <pre className="text-purple-400 ml-12">continue</pre>
              </div>
              {/* Line 9 */}
              <div className="flex items-start">
                <span className="line-number">9</span>
                <span className="diff-sign"></span>
                <pre className="text-purple-400 ml-4">return <span className="text-white">result</span></pre>
              </div>
            </div>
          </div>

          {/* Right Pane: Modified */}
          <div className="flex flex-col">
            <div className="bg-[#252525] px-6 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">Modified File (new.py)</span>
            </div>
            <div className="flex-1 font-mono text-sm leading-relaxed overflow-y-auto py-4 bg-[#1e1e1e] custom-scrollbar">
              {/* Line 1: No change */}
              <div className="flex items-start">
                <span className="line-number">1</span>
                <span className="diff-sign"></span>
                <pre className="text-blue-400">def <span className="text-yellow-400">process_data</span>(data):</pre>
              </div>
              {/* Line 2: Removed */}
              <div className="flex items-start bg-red-900/20">
                <span className="line-number">2</span>
                <span className="diff-sign text-red-400">-</span>
                <pre className="text-gray-500 italic ml-4"># Updated implementation using list comprehension</pre>
              </div>
              {/* Line 3: Removed */}
              <div className="flex items-start bg-red-900/20">
                <span className="line-number">3</span>
                <span className="diff-sign text-red-400">-</span>
                <pre className="text-white ml-4">result = {}</pre>
              </div>
              {/* Line 4: No change */}
              <div className="flex items-start">
                <span className="line-number">4</span>
                <span className="diff-sign"></span>
                <pre className="text-purple-400 ml-4">for <span className="text-white">item</span> in <span className="text-white">data:</span></pre>
              </div>
              {/* Line 5: Removed */}
              <div className="flex items-start bg-red-900/20">
                <span className="line-number">5</span>
                <span className="diff-sign text-red-400">-</span>
                <pre className="text-gray-500 italic ml-8"># Updated implementation using list comprehension</pre>
              </div>
              {/* Line 6: Added */}
              <div className="flex items-start bg-green-900/20">
                <span className="line-number">6</span>
                <span className="diff-sign text-green-400">+</span>
                <pre className="text-white ml-8">users = [item <span className="text-purple-400">for</span> item <span className="text-purple-400">in</span> data <span className="text-purple-400">if</span> item[<span className="text-orange-300">'type'</span>] == <span className="text-orange-300">'user'</span>]</pre>
              </div>
              {/* Line 7: Added */}
              <div className="flex items-start bg-green-900/20">
                <span className="line-number">7</span>
                <span className="diff-sign text-green-400">+</span>
                <pre className="text-white ml-8">result = {`{`}u[<span className="text-orange-300">'id'</span>]: u <span className="text-purple-400">for</span> u <span className="text-purple-400">in</span> users{`}`}</pre>
              </div>
              {/* Line 7 (original): No change positionally */}
              <div className="flex items-start">
                <span className="line-number">7</span>
                <span className="diff-sign"></span>
                <pre className="text-purple-400 ml-8">else:</pre>
              </div>
              {/* Line 8: Removed */}
              <div className="flex items-start bg-red-900/20">
                <span className="line-number">8</span>
                <span className="diff-sign text-red-400">-</span>
                <pre className="text-purple-400 ml-12">continue</pre>
              </div>
              {/* Line 9: No change */}
              <div className="flex items-start">
                <span className="line-number">9</span>
                <span className="diff-sign"></span>
                <pre className="text-purple-400 ml-4">return <span className="text-white">result</span></pre>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500 text-xs uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span>Line Sync Enabled</span>
        </div>
      </div>
    </div>
  )
}

export default DiffChecker
