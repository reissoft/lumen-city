'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { X, Bot, Sparkles } from 'lucide-react'

interface VirtualFriendProps {
  studentName: string
}

export default function VirtualFriend({ studentName }: VirtualFriendProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const friendRef = useRef<HTMLDivElement>(null)

  // Load saved state from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedState = localStorage.getItem('virtualFriendState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        setIsVisible(state.isVisible)
        setPosition(state.position)
      } catch (e) {
        console.error('Error loading virtual friend state:', e)
      }
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (!mounted) return
    const state = { isVisible, position }
    localStorage.setItem('virtualFriendState', JSON.stringify(state))
  }, [isVisible, position, mounted])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (friendRef.current) {
      const rect = friendRef.current.getBoundingClientRect()
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleReopen = () => {
    setIsVisible(true)
  }

  // Não renderiza nada até que o componente esteja montado (evita hidration mismatch)
  if (!mounted) return null

  const content = !isVisible ? (
    <Button
      onClick={handleReopen}
      className="fixed bottom-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all"
      title="Reabrir Amigo Virtual"
    >
      <Sparkles size={24} />
    </Button>
  ) : (
    <div
      ref={friendRef}
      className="fixed z-[9999] bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl p-3 shadow-xl border border-white/20 backdrop-blur-sm cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '160px',
        userSelect: 'none',
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-xs">Amigo Virtual</h3>
            <p className="text-[10px] opacity-80">Olá, {studentName}!</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
          onClick={handleClose}
          title="Fechar"
        >
          <X size={14} />
        </Button>
      </div>
      
      <div className="text-[10px] opacity-80 leading-tight">
        Estou aqui para te ajudar. Clique em mim!
      </div>
      
      <div className="mt-1 flex justify-end">
        <div className="text-[9px] opacity-60">💡 IA</div>
      </div>
    </div>
  )

  // Renderiza o conteúdo usando createPortal, direto na body
  return createPortal(content, document.body)
}