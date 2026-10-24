import { Heart, LogOut, Menu, Moon, Sun, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'

import { OfflineBanner } from '@/components/offline-banner'
import { Toaster } from '@/components/toaster'
import { Button } from '@/components/ui/button'
import { WelcomeBanner } from '@/components/welcome-banner'
import { useCurrentUser, useSignOut } from '@/features/auth/api/use-auth'
import { useFavorites } from '@/features/favorites/api/use-favorites'
import { useI18n, type Lang } from '@/lib/i18n'
import type { MessageKey } from '@/lib/messages'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

type NavItem = { to: string; label: MessageKey; roles?: ('curator' | 'admin')[] }

const links: NavItem[] = [
  { to: '/', label: 'nav.home' },
  { to: '/exhibitions', label: 'nav.exhibitions' },
  { to: '/collections', label: 'nav.collections' },
  { to: '/videos', label: 'nav.videos' },
  { to: '/about', label: 'nav.about' },
  { to: '/studio', label: 'nav.studio', roles: ['curator', 'admin'] },
  { to: '/admin', label: 'nav.admin', roles: ['admin'] },
]

export function AppLayout() {
  const { t, lang, setLang } = useI18n()
  const user = useCurrentUser()
  const signOut = useSignOut()
  const { ids } = useFavorites()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  const visible = links.filter(
    (link) => !link.roles || (user && (link.roles as string[]).includes(user.role)),
  )

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        {t('nav.skip')}
      </a>
      <header className="sticky top-0 z-40 bg-ink text-on-ink">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3"
          aria-label={t('nav.main')}
        >
          <Link to="/" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-ring">
            <span className="shrink-0 rounded-md bg-plate p-1.5 shadow-md">
              <img
                src="/nbcg-logo.png"
                alt={t('app.org')}
                width={128}
                height={64}
                className="h-12 w-auto lg:h-16"
              />
            </span>
            <span className="hidden flex-col leading-tight min-[480px]:flex">
              <span className="font-heading text-xl font-semibold whitespace-nowrap text-accent">
                {t('app.name')}
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-5 xl:flex">
            {visible.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative whitespace-nowrap py-1 text-[0.72rem] font-medium uppercase tracking-[0.12em] opacity-80 transition-opacity hover:opacity-100',
                      'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:scale-x-100',
                      isActive && 'text-accent opacity-100 after:scale-x-100',
                    )
                  }
                >
                  {t(link.label)}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <div
              role="group"
              aria-label={t('nav.language')}
              className="flex overflow-hidden rounded-full border border-on-ink/30 text-[0.7rem] font-medium tracking-wider"
            >
              {(['me', 'en'] as Lang[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={lang === code}
                  onClick={() => setLang(code)}
                  className={cn(
                    'px-2 py-1 uppercase',
                    lang === code ? 'bg-accent text-accent-foreground' : 'opacity-80 hover:opacity-100',
                  )}
                >
                  {code === 'me' ? 'cg' : 'en'}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={t('nav.theme')}
              className="hover:bg-on-ink/10"
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            <Button asChild variant="ghost" size="icon" className="relative hover:bg-on-ink/10">
              <Link to="/favorites" aria-label={t('nav.favorites')}>
                <Heart />
                {ids.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[0.6rem] font-bold text-accent-foreground">
                    {ids.length}
                  </span>
                )}
              </Link>
            </Button>
            {user ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden hover:bg-on-ink/10 sm:inline-flex"
                >
                  <Link to="/profile" aria-label={`${t('nav.profile')}: ${user.name}`}>
                    <UserRound />
                    {user.name.split(' ')[0]}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  aria-label={t('nav.signOut')}
                  className="hidden hover:bg-on-ink/10 sm:inline-flex"
                >
                  <LogOut />
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="ml-1 hidden rounded-full border-accent bg-transparent px-4 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-accent-foreground sm:inline-flex"
              >
                <Link to="/sign-in">{t('nav.signIn')}</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden hover:bg-on-ink/10"
              aria-expanded={open}
              aria-label={t('nav.menu')}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </nav>
        <div aria-hidden="true" className="h-[3px] border-y border-accent/40" />

        {open && (
          <ul className="flex flex-col gap-1 px-4 py-4 xl:hidden">
            {visible.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className="block border-b border-on-ink/10 py-3 font-heading text-2xl"
                >
                  {t(link.label)}
                </NavLink>
              </li>
            ))}
            {user && (
              <li>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block border-b border-on-ink/10 py-3 font-heading text-2xl"
                >
                  {t('nav.profile')}
                </NavLink>
              </li>
            )}
            <li>
              {user ? (
                <button type="button" onClick={signOut} className="py-2">
                  {t('nav.signOut')} ({user.name}, {t(`role.${user.role}`)})
                </button>
              ) : (
                <Link to="/sign-in" onClick={() => setOpen(false)} className="block py-2 text-accent">
                  {t('nav.signIn')}
                </Link>
              )}
            </li>
          </ul>
        )}
      </header>

      <OfflineBanner />
      <WelcomeBanner />

      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <Toaster />

      <footer className="border-t bg-ink text-on-ink">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3">
              <span className="rounded-md bg-plate p-2">
                <img src="/nbcg-logo.png" alt="" width={144} height={72} className="h-16 w-auto" />
              </span>
              {t('app.org')}
            </p>
            <p>
              <a
                href="https://nb-cg.me"
                className="text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                nb-cg.me
              </a>{' '}
              ·{' '}
              <a
                href="https://dlib.me"
                className="text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                dlib.me
              </a>
            </p>
          </div>
          <p className="border-t border-on-ink/20 pt-4 text-xs opacity-80">{t('footer.note')}</p>
        </div>
      </footer>
    </div>
  )
}
