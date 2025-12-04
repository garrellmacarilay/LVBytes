import React, { useEffect } from 'react'
import { X } from './Icons'

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title = '', 
  size = 'md', 
  showCloseButton = true,
  closeOnOverlayClick = true,
  customZIndex = 'z-[9990]',
  isDanger = false
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[95vw]'
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  return (
    <div 
      className={`fixed inset-0 ${customZIndex} overflow-hidden`}
      style={{ height: '100vh', width: '100vw' }}
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 backdrop-blur-sm ${isDanger ? 'bg-red-900/70' : 'bg-slate-900/50'}`} />
      
      {/* Modal Container */}
      <div className="relative flex items-center justify-center min-h-full p-4">
        {/* Modal Content */}
        <div 
          className={`
            relative rounded-2xl shadow-2xl
            w-full ${sizeClasses[size]} 
            max-h-[90vh] overflow-hidden
            transform transition-all duration-300 ease-out
            ${isDanger 
              ? 'bg-slate-900 border-2 border-red-500 shadow-red-500/30' 
              : 'bg-white border border-slate-200'
            }
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`flex items-center justify-between p-6 border-b ${
              isDanger 
                ? 'border-red-700 bg-red-950/50' 
                : 'border-slate-200 bg-slate-50/50'
            }`}>
              {title && (
                <h3 className={`text-lg font-semibold ${
                  isDanger ? 'text-red-100' : 'text-slate-900'
                }`}>
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${
                    isDanger 
                      ? 'hover:bg-red-800 text-red-300 hover:text-red-100' 
                      : 'hover:bg-slate-200 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal