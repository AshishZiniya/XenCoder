'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/button'
import Select from '@/components/ui/select'
import Textarea from '@/components/ui/textarea'
import Header from '@/components/ui/header'

const SQLFormatter: React.FC = () => {
  const [dialect, setDialect] = useState('MySQL')
  const [indentation, setIndentation] = useState('2 spaces')
  const [inputSQL, setInputSQL] = useState('SELECT * FROM users WHERE id=1 AND status=\'active\' ORDER BY created_at DESC;')
  const [formattedSQL, setFormattedSQL] = useState('SELECT\n  *\nFROM\n  users\nWHERE\n  id = 1\n  AND status = \'active\'\nORDER BY\n  created_at DESC;')
  const [hasError, setHasError] = useState(false)

  const dialects = [
    { value: 'MySQL', label: 'MySQL' },
    { value: 'PostgreSQL', label: 'PostgreSQL' },
    { value: 'SQLite', label: 'SQLite' },
    { value: 'Oracle', label: 'Oracle' },
    { value: 'MariaDB', label: 'MariaDB' }
  ]

  const indentations = [
    { value: '2 spaces', label: '2 spaces' },
    { value: '4 spaces', label: '4 spaces' },
    { value: 'Tab', label: 'Tab' }
  ]

  const handleFormat = () => {
    // Simulate SQL formatting
    const formatted = `SELECT
  *
FROM
  users
WHERE
  id = 1
  AND status = 'active'
ORDER BY
  created_at DESC;`
    
    setFormattedSQL(formatted)
    setHasError(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSQL)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#111827]">
      <Header title="SQL Formatter & Validator" />
      
      <div className="p-8 space-y-8">
        {/* Header & Controls */}
        <Card className="bg-[#1a2233] border-gray-800">
          <div className="flex items-end space-x-6 p-5">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-400">Dialect</label>
              <Select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                options={dialects}
                className="bg-gray-900 border-gray-700 w-48"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-400">Indentation</label>
              <Select
                value={indentation}
                onChange={(e) => setIndentation(e.target.value)}
                options={indentations}
                className="bg-gray-900 border-gray-700 w-40"
              />
            </div>
            <Button onClick={handleFormat} className="bg-blue-600 hover:bg-blue-700">
              Format
            </Button>
          </div>
        </Card>

        {/* Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
          {/* Input SQL Panel */}
          <Card className="bg-[#222d3d] border-gray-800">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Input SQL</span>
            </div>
            <div className="relative p-4 bg-[#1e1e1e] font-mono text-sm text-gray-300">
              <Textarea
                value={inputSQL}
                onChange={(e) => setInputSQL(e.target.value)}
                className="absolute inset-0 w-full h-full bg-transparent p-4 outline-none border-none resize-none font-mono whitespace-pre overflow-auto z-10 text-transparent caret-white"
                rows={10}
              />
              <div className="relative z-0 pointer-events-none font-mono text-sm leading-relaxed">
                <span className="text-blue-500 font-bold">SELECT</span> * <br/>
                <span className="text-blue-500 font-bold">FROM</span> users <br/>
                <span className="text-blue-500 font-bold">WHERE</span> id=1 <span className="text-blue-500 font-bold">AND</span> status=<span className="text-orange-300">'active'</span> <br/>
                <span className="text-blue-500 font-bold">ORDER BY</span> created_at <span className="text-blue-500 font-bold">DESC</span>;
              </div>
            </div>
          </Card>

          {/* Formatted Result Panel */}
          <Card className="bg-[#222d3d] border-gray-800">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Formatted Result</span>
              <Button 
                variant="ghost" 
                onClick={handleCopy}
                className="text-gray-400 hover:text-white p-2"
                title="Copy to Clipboard"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </Button>
            </div>
            <div className="p-4 bg-[#1e1e1e] font-mono text-sm text-gray-300 whitespace-pre overflow-auto custom-scrollbar">
              <span className="text-blue-500 font-bold">SELECT</span>
              {'  *\n'}
              <span className="text-blue-500 font-bold">FROM</span>
              {'  users\n'}
              <span className="text-blue-500 font-bold">WHERE</span>
              {'  id = '}
              <span className="text-green-400">1</span>
              {'\n  '}
              <span className="text-blue-500 font-bold">AND</span>
              {' status = '}
              <span className="text-orange-300">'active'</span>
              {'\n'}
              <span className="text-blue-500 font-bold">ORDER BY</span>
              {'  created_at '}
              <span className="text-blue-500 font-bold">DESC</span>;
            </div>
          </Card>
        </div>

        {/* Issues Panel */}
        {hasError && (
          <Card className="border-red-900/50 bg-red-900/10">
            <div className="bg-red-900/20 px-4 py-2 border-b border-red-900/30">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Issues</span>
            </div>
            <div className="p-6">
              <h4 className="text-red-500 font-bold mb-2">Validation Errors (1):</h4>
              <p className="text-red-400/80 text-sm font-mono">Line 1, Column 16: Syntax error near "id=1". Expected an operator.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SQLFormatter
