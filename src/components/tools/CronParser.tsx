'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Header from '@/components/ui/header'

const CronParser: React.FC = () => {
  const [cronExpression, setCronExpression] = useState('0 0 * * 1')
  const [parsedDescription, setParsedDescription] = useState('At 00:00 on Monday.')
  const [nextExecutions, setNextExecutions] = useState([
    'Mon, Jan 1, 2024, 00:00:00',
    'Mon, Jan 8, 2024, 00:00:00',
    'Mon, Jan 15, 2024, 00:00:00',
    'Mon, Jan 22, 2024, 00:00:00',
    'Mon, Jan 29, 2024, 00:00:00'
  ])

  const handleParse = () => {
    // Simulate parsing
    setParsedDescription('At 00:00 on Monday.')
    setNextExecutions([
      'Mon, Jan 1, 2024, 00:00:00',
      'Mon, Jan 8, 2024, 00:00:00',
      'Mon, Jan 15, 2024, 00:00:00',
      'Mon, Jan 22, 2024, 00:00:00',
      'Mon, Jan 29, 2024, 00:00:00'
    ])
  }

  const timelineDays = Array.from({ length: 31 }, (_, i) => i + 1)
  const executionDays = [1, 4, 8, 12, 16, 22, 24, 29]

  return (
    <div className="flex-1 overflow-y-auto bg-[#1f2937]">
      <Header title="Cron Expression Parser" />
      
      <div className="p-12 space-y-8">
        {/* Input Section */}
        <Card className="bg-[#151c27] border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Cron Expression
              </label>
              <span className="bg-slate-700 text-[10px] px-1.5 py-0.5 rounded text-slate-400">
                * * * * *
              </span>
            </div>
            <div className="flex gap-4">
              <Input
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="e.g. 0 0 * * *"
                className="flex-1 bg-slate-800/50 border-slate-600 font-mono text-lg"
              />
              <Button onClick={handleParse} className="bg-blue-600 hover:bg-blue-500">
                Parse
              </Button>
            </div>
          </div>

          {/* Human Readable Translation */}
          <div className="pt-6">
            <h3 className="text-4xl font-bold mb-2 text-white">{parsedDescription}</h3>
            <p className="text-slate-400">Matches every week on Monday at midnight.</p>
          </div>
        </Card>

        {/* Execution List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Next Executions
            </h4>
            <ul className="space-y-3 font-mono text-sm text-slate-300">
              {nextExecutions.map((execution, index) => (
                <li key={index} className="flex items-center gap-2">
                  {execution}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Visual Timeline */}
        <Card className="bg-[#151c27] border-slate-800 relative pt-6">
          <div className="relative flex items-center h-24 border border-slate-800 rounded-lg bg-slate-800/20 px-4">
            {/* Timeline Grid lines */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
              {timelineDays.map((_, i) => (
                <div key={i} className="w-px h-24 bg-slate-400"></div>
              ))}
            </div>

            {/* Timeline Axis */}
            <div className="absolute bottom-6 left-4 right-8 h-px bg-slate-700 flex items-center">
              <div className="absolute -right-1 w-2 h-2 border-t border-r border-slate-700 rotate-45"></div>
            </div>

            {/* Execution Points */}
            <div className="w-full flex justify-between items-end pb-8 relative z-10">
              {timelineDays.map((day) => (
                <div key={day} className="flex flex-col items-center gap-6">
                  <div className={`w-2 h-2 rounded-full ${executionDays.includes(day) ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-slate-600 invisible'}`}></div>
                  <span className="text-[10px] text-slate-500 font-mono">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CronParser
