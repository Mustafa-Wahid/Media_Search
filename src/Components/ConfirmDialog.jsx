import { AlertTriangle } from 'lucide-react'

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-[mm-fade_0.2s_ease-out]'
      onClick={(e) => { e.stopPropagation(); onCancel(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-sm bg-(--c1) border border-white/10 rounded-2xl shadow-2xl p-6 animate-[mm-scale_0.2s_ease-out]'
      >
        <div className='flex items-center gap-3 mb-3'>
          <div className={`shrink-0 rounded-full p-2 ${danger ? 'bg-red-500/15 text-red-400' : 'bg-indigo-500/15 text-indigo-400'}`}>
            <AlertTriangle size={20} />
          </div>
          <h3 className='text-lg font-semibold text-white'>{title}</h3>
        </div>
        {message && <p className='text-sm text-gray-300 mb-6'>{message}</p>}
        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 rounded-lg text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 transition cursor-pointer active:scale-95'
          >
            {cancelLabel}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition cursor-pointer active:scale-95 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
