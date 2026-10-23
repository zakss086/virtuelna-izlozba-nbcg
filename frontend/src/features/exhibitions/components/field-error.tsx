import { useI18n } from '@/lib/i18n'
import type { MessageKey } from '@/lib/messages'

type FieldErrorProps = {
  /** The error message from react-hook-form; nothing is rendered when it is missing. */
  message: string | undefined
  /** Translation key to show instead of the generic "required" text. */
  messageKey?: MessageKey
}

export function FieldError({ message, messageKey = 'editor.required' }: FieldErrorProps) {
  const { t } = useI18n()
  if (!message) return null

  return (
    <p role="alert" className="text-sm text-destructive">
      {t(messageKey)}
    </p>
  )
}
