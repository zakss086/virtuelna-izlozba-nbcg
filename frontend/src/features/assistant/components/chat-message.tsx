import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import { useI18n } from '@/lib/i18n'
import type { KnowledgeDoc } from '@/lib/knowledge'

import type { ChatEntry } from '../types'

const SNIPPET_LENGTH = 140

function snippet(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > SNIPPET_LENGTH ? `${clean.slice(0, SNIPPET_LENGTH).trimEnd()}…` : clean
}

function DocLink({ doc }: { doc: KnowledgeDoc }) {
  const { t } = useI18n()
  const body = (
    <>
      <span className="text-xs tracking-widest text-gold uppercase">{t(`assistant.kind.${doc.kind}`)}</span>
      <span className="flex items-center gap-1 font-medium">
        {doc.title}
        <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
      </span>
      <span className="text-sm text-muted-foreground">{snippet(doc.text)}</span>
    </>
  )
  const classes =
    'flex flex-col gap-0.5 rounded-md border bg-background p-3 hover:border-accent focus-visible:outline-2 focus-visible:outline-ring'

  return doc.external ? (
    <a href={doc.href} target="_blank" rel="noreferrer" className={classes}>
      {body}
    </a>
  ) : (
    <Link to={doc.href} className={classes}>
      {body}
    </Link>
  )
}

type ChatMessageProps = { entry: ChatEntry }

// One bubble of the conversation. Assistant replies are stored as data and worded here, in the current language.
export function ChatMessage({ entry }: ChatMessageProps) {
  const { t, l } = useI18n()

  if (entry.role === 'user') {
    return (
      <div className="ml-8 self-end rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
        {entry.text}
      </div>
    )
  }

  const { reply } = entry
  return (
    <div className="mr-4 flex flex-col gap-2 self-start rounded-lg bg-secondary px-3 py-2 text-sm">
      {reply.type === 'greeting' && <p>{t('assistant.greeting')}</p>}
      {reply.type === 'help' && <p>{t('assistant.help')}</p>}
      {reply.type === 'none' && <p>{t('assistant.none')}</p>}
      {reply.type === 'guide' && (
        <>
          <p>{l(reply.guide.answer)}</p>
          {reply.guide.href && (
            <Link to={reply.guide.href} className="flex w-fit items-center gap-1 text-gold underline">
              {t('assistant.go')}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          )}
          {reply.related.length > 0 && (
            <>
              <p className="mt-1 text-muted-foreground">{t('assistant.related')}</p>
              {reply.related.map((doc) => (
                <DocLink key={doc.id} doc={doc} />
              ))}
            </>
          )}
        </>
      )}
      {reply.type === 'matches' && (
        <>
          <p>{t('assistant.found')}</p>
          {reply.matches.map((match) => (
            <DocLink key={match.doc.id} doc={match.doc} />
          ))}
        </>
      )}
    </div>
  )
}
