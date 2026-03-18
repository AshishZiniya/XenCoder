'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/input'
import Header from '@/components/ui/header'

const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState('#FF0099')
  const [rgb, setRgb] = useState({ r: 255, g: 0, b: 153 })
  const [hsl, setHsl] = useState({ h: 324, s: 100, l: 50 })

  const handleHexChange = (value: string) => {
    setHex(value)
    // Convert hex to RGB and HSL (simplified)
    const r = parseInt(value.slice(1, 3), 16)
    const g = parseInt(value.slice(3, 5), 16)
    const b = parseInt(value.slice(5, 7), 16)
    setRgb({ r, g, b })
  }

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const newRgb = { ...rgb, [channel]: parseInt(value) || 0 }
    setRgb(newRgb)
    // Convert RGB to hex
    const hexValue = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`
    setHex(hexValue.toUpperCase())
  }

  const generateShades = () => {
    return [
      '#FF0099', '#D90082', '#B3006B', '#8C0054', '#66003D', 
      '#400026', '#1A0010', '#000000'
    ]
  }

  const generateTints = () => {
    return [
      '#FF0099', '#FF33AD', '#FF66C2', '#FF99D6', '#FFCCEB', 
      '#FFE6F5', '#FFFFFF'
    ]
  }

  const generateComplementary = () => {
    return [
      '#00FF66', '#1AFF75', '#33FF85', '#4DFF94', '#66FFA3', 
      '#80FFB2', '#99FFC2'
    ]
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f141a]">
      <Header title="Color Converter" />
      
      <div className="px-8 pb-8 space-y-8">
        {/* Converter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Color Wheel */}
          <div className="flex items-center justify-center">
            <div className="w-80 h-80 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-t from-black via-transparent to-white"></div>
              <div 
                className="absolute w-4 h-4 bg-white border-2 border-white rounded-full shadow-lg"
                style={{ top: '25%', right: '25%' }}
              ></div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-6">
            <Input
              label="Hex"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="bg-[#1e2631] border-slate-700"
            />

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">RGB</label>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                  className="bg-[#1e2631] border-slate-700 text-center"
                />
                <Input
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                  className="bg-[#1e2631] border-slate-700 text-center"
                />
                <Input
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                  className="bg-[#1e2631] border-slate-700 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">HSL</label>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  value={`${hsl.h}°`}
                  readOnly
                  className="bg-[#1e2631] border-slate-700 text-center"
                />
                <Input
                  value={`${hsl.s}%`}
                  readOnly
                  className="bg-[#1e2631] border-slate-700 text-center"
                />
                <Input
                  value={`${hsl.l}%`}
                  readOnly
                  className="bg-[#1e2631] border-slate-700 text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Check */}
        <Card>
          <h3 className="text-white font-semibold mb-4 text-xl">Accessibility (WCAG)</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] bg-black border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-white">14.9:1</span>
                <div className="flex items-center space-x-1 text-green-500 font-bold">
                  <span>AAA</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-4">Passes for large and normal text against black</p>
            </div>
            <div className="flex-1 min-w-[200px] bg-white rounded-xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-slate-900">1.5:1</span>
                <span className="text-red-500 font-bold">FAIL</span>
              </div>
              <p className="text-slate-400 text-sm mt-4 opacity-0">Hidden text for alignment</p>
            </div>
          </div>
        </Card>

        {/* Related Colors */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8">Related Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Shades */}
            <div>
              <h4 className="text-slate-400 mb-4 text-sm font-medium uppercase">Shades</h4>
              <div className="flex rounded-lg overflow-hidden h-12">
                {generateShades().map((shade, index) => (
                  <div key={index} className="flex-1" style={{ backgroundColor: shade }}></div>
                ))}
              </div>
            </div>

            {/* Tints */}
            <div>
              <h4 className="text-slate-400 mb-4 text-sm font-medium uppercase">Tints</h4>
              <div className="flex rounded-lg overflow-hidden h-12">
                {generateTints().map((tint, index) => (
                  <div key={index} className="flex-1" style={{ backgroundColor: tint }}></div>
                ))}
              </div>
            </div>

            {/* Complementary */}
            <div>
              <h4 className="text-slate-400 mb-4 text-sm font-medium uppercase">Complementary</h4>
              <div className="flex rounded-lg overflow-hidden h-12">
                {generateComplementary().map((comp, index) => (
                  <div key={index} className="flex-1" style={{ backgroundColor: comp }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorConverter
