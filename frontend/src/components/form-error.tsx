import { useI18n } from '@/lib/i18n'
import type { MessageKey } from '@/lib/messages'

type FormErrorProps = {
  /** Set when the field is invalid; nothing is drawn without it. */
  isInvalid: boolean
  messageKey: MessageKey
}

// The red line under a field of an admin form.
export function FormError({ isInvalid, messageKey }: FormErrorProps) {
  const { t } = useI18n()
  if (!isInvalid) return null

  return (
    <p role="alert" className="text-sm text-destructive">
      {t(messageKey)}
    </p>
  )
}
