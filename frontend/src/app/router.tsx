import { createBrowserRouter } from 'react-router'

import { About } from '@/app/routes/about'
import { Admin } from '@/app/routes/admin'
import { Collections } from '@/app/routes/collections'
import { AppLayout } from '@/app/app-layout'
import { Exhibition } from '@/app/routes/exhibition'
import { Exhibitions } from '@/app/routes/exhibitions'
import { Favorites } from '@/app/routes/favorites'
import { Home } from '@/app/routes/home'
import { NotFound } from '@/app/routes/not-found'
import { SignIn } from '@/app/routes/sign-in'
import { Videos } from '@/app/routes/videos'
import { Studio } from '@/app/routes/studio'
import { StudioEditor } from '@/app/routes/studio-editor'
import { RequireRole } from '@/app/require-role'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/exhibitions', element: <Exhibitions /> },
      { path: '/exhibitions/:slug', element: <Exhibition /> },
      { path: '/collections', element: <Collections /> },
      { path: '/videos', element: <Videos /> },
      { path: '/about', element: <About /> },
      { path: '/favorites', element: <Favorites /> },
      { path: '/sign-in', element: <SignIn /> },
      {
        path: '/studio',
        element: (
          <RequireRole roles={['curator', 'admin']}>
            <Studio />
          </RequireRole>
        ),
      },
      {
        path: '/studio/new',
        element: (
          <RequireRole roles={['curator', 'admin']}>
            <StudioEditor />
          </RequireRole>
        ),
      },
      {
        path: '/studio/:id/edit',
        element: (
          <RequireRole roles={['curator', 'admin']}>
            <StudioEditor />
          </RequireRole>
        ),
      },
      {
        path: '/admin',
        element: (
          <RequireRole roles={['admin']}>
            <Admin />
          </RequireRole>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
