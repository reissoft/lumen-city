'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { X, Bot, Sparkles, Settings, Edit2, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface VirtualFriendProps {
  studentName: string
}

const FRIEND_OPTIONS = [
  'bear', 'buffalo', 'chick', 'chicken', 'cow', 'crocodile', 'dog', 'duck',
  'elephant', 'frog', 'giraffe', 'goat', 'gorilla', 'hippo', 'horse', 'monkey',
  'moose', 'narwhal', 'owl', 'panda', 'parrot', 'penguin', 'pig', 'rabbit',
  'rhino', 'sloth', 'snake', 'walrus', 'whale', 'zebra'
]

export default function VirtualFriend({ studentName }: VirtualFriendProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [friendName, setFriendName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isTextInputOpen, setIsTextInputOpen] = useState(false)
  const [textInputValue, setTextInputValue] = useState('')
  const [textInputRef, setTextInputRef] = useState<HTMLInputElement | null>(null)
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
        setFriendName(state.friendName || '')
        setSelectedAvatar(state.selectedAvatar || 'bear')
      } catch (e) {
        console.error('Error loading virtual friend state:', e)
      }
    } else {
      // Set default values if no saved state
      setFriendName('Meu Amigo')
      setSelectedAvatar('bear')
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (!mounted) return
    const state = { isVisible, position, friendName, selectedAvatar }
    localStorage.setItem('virtualFriendState', JSON.stringify(state))
  }, [isVisible, position, friendName, selectedAvatar, mounted])

  // Focus text input when it opens
  useEffect(() => {
    if (isTextInputOpen && textInputRef) {
      textInputRef.focus()
    }
  }, [isTextInputOpen, textInputRef])

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

  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Save to database
      const response = await fetch('/api/virtual-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          virtualFriendName: friendName,
          virtualFriendAvatar: selectedAvatar
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Configurações do amigo virtual salvas com sucesso!')
        setIsSettingsOpen(false)
      } else {
        toast.error(result.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Error saving virtual friend settings:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
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
      className="fixed z-[9999] text-white p-3 cursor-move select-none group"
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
          <div className="w-12 h-12 rounded-full flex items-center justify-center">
            <img 
              src={`/friends/${selectedAvatar}.png`} 
              alt={selectedAvatar}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to Bot icon if image fails to load
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = '<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>'
                }
              }}
            />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="font-bold text-sm">{friendName || 'Amigo Virtual'}</h3>
            <p className="text-[10px] opacity-80">Olá, {studentName}!</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={handleOpenSettings}
            title="Configurar Amigo"
          >
            <Settings size={14} />
          </Button>
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
      </div>
      
      <div 
        className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-center mt-1 cursor-pointer hover:text-yellow-300"
        onClick={() => setIsTextInputOpen(!isTextInputOpen)}
      >
        💡 IA - Estou aqui para te ajudar. Clique em mim!
      </div>

      {/* Text Input Field */}
      {isTextInputOpen && (
        <div
          className="mt-2 opacity-100 transition-opacity pointer-events-auto flex gap-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Input
            ref={setTextInputRef}
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="bg-white/10 border-white/30 text-white placeholder-white/50 text-xs flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Handle message submission
                console.log('Message sent:', textInputValue);
                setTextInputValue('');
              }
            }}
          />
          <Button
            onClick={() => {
              // Handle message submission
              console.log('Message sent:', textInputValue);
              setTextInputValue('');
              setIsTextInputOpen(false);
            }}
            className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2"
            size="sm"
            title="Enviar mensagem"
          >
            <Send size={14} />
          </Button>
        </div>
      )}
    </div>
  )

  // Settings Modal
  const settingsModal = isSettingsOpen && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Configurar Amigo Virtual</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={handleCloseSettings}
            title="Fechar"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <Label htmlFor="friendName" className="text-sm font-semibold mb-2 block">Nome do Amigo</Label>
          <Input
            id="friendName"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className="bg-white/10 border-white/30 text-white placeholder-white/50"
            placeholder="Digite o nome do seu amigo"
          />
        </div>

        {/* Avatar Selection */}
        <div className="mb-6">
          <Label className="text-sm font-semibold mb-2 block">Escolha o Avatar</Label>
          <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
            {FRIEND_OPTIONS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  selectedAvatar === avatar 
                    ? 'border-white/50 bg-white/20' 
                    : 'border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
                title={avatar.charAt(0).toUpperCase() + avatar.slice(1)}
              >
                <img 
                  src={`/friends/${avatar}.png`} 
                  alt={avatar}
                  className="w-8 h-8 object-contain mx-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSaveSettings}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg"
          >
            Salvar
          </Button>
          <Button
            variant="outline"
            onClick={handleCloseSettings}
            className="flex-1 border-white/30 text-white hover:bg-white/10 font-semibold rounded-lg"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )

  // Renderiza o conteúdo usando createPortal, direto na body
  return createPortal(
    <>
      {content}
      {settingsModal}
    </>,
    document.body
  )
}
