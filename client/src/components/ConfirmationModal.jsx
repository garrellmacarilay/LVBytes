import React from 'react'
import Modal from './Modal'
import { AlertTriangle, CheckCircle, Info, XCircle } from './Icons'

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // default, danger, success, info
  isLoading = false
}) => {
  const typeConfig = {
    default: {
      icon: Info,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-900/50',
      confirmButton: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400',
      modalBg: 'bg-slate-800',
      textColor: 'text-slate-100',
      subtextColor: 'text-slate-300'
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-900/50',
      confirmButton: 'bg-red-600 hover:bg-red-500 text-white border border-red-400',
      modalBg: 'bg-red-950',
      textColor: 'text-red-100',
      subtextColor: 'text-red-200'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-900/50',
      confirmButton: 'bg-green-600 hover:bg-green-500 text-white border border-green-400',
      modalBg: 'bg-green-950',
      textColor: 'text-green-100',
      subtextColor: 'text-green-200'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-900/50',
      confirmButton: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400',
      modalBg: 'bg-slate-800',
      textColor: 'text-slate-100',
      subtextColor: 'text-slate-300'
    }
  }

  const config = typeConfig[type]
  const IconComponent = config.icon

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      customZIndex="z-[9995]"
      isDanger={type === 'danger'}
    >
      <div className={`p-6 ${config.modalBg}`}>
        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 rounded-full ${config.iconBg}`}>
            <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className={`text-lg font-semibold mb-2 ${config.textColor}`}>
            {title}
          </h3>
          <p className={`mb-6 ${config.subtextColor}`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              type === 'danger' 
                ? 'text-red-200 bg-red-900/50 hover:bg-red-800/50 border border-red-700' 
                : 'text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${config.confirmButton}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationModal