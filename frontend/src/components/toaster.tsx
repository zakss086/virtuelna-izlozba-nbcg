import { cva } from 'class-variance-authority'
import { CircleAlert, CircleCheck, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { dismissToast, useToasts } from '@/lib/toast'

const toastVariants = cva(
  'pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 text-sm shadow-lg',
  {
    variants: { kind: { success: 'border-accent', error: 'border-destructive' } },
    defaultVariants: { kind: 'success' },
  },
)

// Confirmation and error messages for user actions (save, publish, delete...). Mounted once in the layout.
export function Toaster() {
  const { t } = useI18n()
  const toasts = useToasts()

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2 sm:left-auto sm:w-96"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.kind === 'error' ? 'alert' : 'status'}
          className={toastVariants({ kind: toast.kind })}
        >
          {toast.kind === 'error' ? (
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          ) : (
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
          )}
          <p className="flex-1">{toast.message}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-m-2 size-8"
            aria-label={t('viewer.close')}
            onClick={() => dismissToast(toast.id)}
          >
            <X />
          </Button>
        </div>
      ))}
    </div>
  )
}
