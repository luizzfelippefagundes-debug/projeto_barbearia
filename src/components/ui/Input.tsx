import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const FIELD_CLASSES =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent-muted outline-none transition-colors'

export function Input({ label, id, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <input id={id} className={cn(FIELD_CLASSES, className)} {...props} />
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, id, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <textarea id={id} className={cn(FIELD_CLASSES, 'resize-none', className)} {...props} />
    </div>
  )
}

function FieldLabel({ children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="mb-1.5 block text-xs text-text-secondary" {...props}>
      {children}
    </label>
  )
}

export { FIELD_CLASSES }
