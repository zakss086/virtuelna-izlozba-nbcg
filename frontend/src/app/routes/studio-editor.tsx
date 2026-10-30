import { useParams } from 'react-router'

import { useCurrentUser } from '@/features/auth/api/use-auth'
import { EditorLoader } from '@/features/exhibitions/components/editor-loader'
import { MediaPicker } from '@/features/media/components/media-picker'
import { useI18n } from '@/lib/i18n'

export function StudioEditor() {
  const { t } = useI18n()
  const { id } = useParams()
  const user = useCurrentUser()

  if (!user) return null

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-4xl font-semibold">{id ? t('editor.titleEdit') : t('editor.titleNew')}</h1>
      <EditorLoader
        id={id}
        authorId={user.id}
        authorName={user.name}
        isAdmin={user.role === 'admin'}
        renderImagePicker={(props) => <MediaPicker {...props} />}
      />
    </section>
  )
}
