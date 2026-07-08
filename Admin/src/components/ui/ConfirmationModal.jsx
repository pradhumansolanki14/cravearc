import React from 'react'
import { FiAlertTriangle, FiInfo } from 'react-icons/fi'
import Card from './Card'
import Button from './Button'

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger"
}) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(5px)" }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <Card 
        variant="default" 
        radius="3xl" 
        padding="none" 
        className="bg-white shadow-2xl w-full max-w-sm overflow-hidden animate-fadeUp"
      >
        <div className={`h-1.5 w-full ${variant === 'danger' ? 'bg-rose-500' : 'bg-amber-500'}`} />
        
        <div className="p-6 text-center space-y-4">
          <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border ${
            variant === 'danger' 
              ? 'bg-rose-50 border-rose-100 text-rose-600' 
              : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
            {variant === 'danger' ? <FiAlertTriangle size={20} /> : <FiInfo size={20} />}
          </div>

          <div>
            <h3 className="font-poppins font-extrabold text-base text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={onCancel} 
              variant="outline" 
              size="sm" 
              className="flex-1 font-bold"
            >
              {cancelText}
            </Button>
            <Button 
              onClick={onConfirm} 
              variant={variant === 'danger' ? 'danger' : 'primary'} 
              size="sm" 
              className="flex-1 font-bold shadow-sm"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ConfirmationModal
