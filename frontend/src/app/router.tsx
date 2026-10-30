import { lazy, type ComponentType, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'

import { AppLayout } from '@/app/app-layout'
import { Home } from '@/app/routes/home'
import { NotFound } from '@/app/routes/not-found'
import { RequireRole } from '@/app/require-role'

// Every page except the home page is its own chunk, loaded when the visitor opens it (AppLayout shows a skeleton meanwhile).
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(async () => ({ default: (await load())[name] }))
}

const About = page(() => import('@/app/routes/about'), 'About')
const Admin = page(() => import('@/app/routes/admin'), 'Admin')
const AdminCollections = page(() => import('@/app/routes/admin-collections'), 'AdminCollections')
const AdminCollectionEditor = page(() => import('@/app/routes/admin-collections'), 'AdminCollectionEditor')
const AdminHistory = page(() => import('@/app/routes/admin-history'), 'AdminHistory')
const AdminContent = page(() => import('@/app/routes/admin-content'), 'AdminContent')
const AdminLibraries = page(() => import('@/app/routes/admin-libraries'), 'AdminLibraries')
const AdminLibraryEditor = page(() => import('@/app/routes/admin-libraries'), 'AdminLibraryEditor')
const Collections = page(() => import('@/app/routes/collections'), 'Collections')
const Exhibition = page(() => import('@/app/routes/exhibition'), 'Exhibition')
const Exhibitions = page(() => import('@/app/routes/exhibitions'), 'Exhibitions')
const Favorites = page(() => import('@/app/routes/favorites'), 'Favorites')
const MapPage = page(() => import('@/app/routes/map'), 'MapPage')
const Profile = page(() => import('@/app/routes/profile'), 'Profile')
const SignIn = page(() => import('@/app/routes/sign-in'), 'SignIn')
const Studio = page(() => import('@/app/routes/studio'), 'Studio')
const StudioEditor = page(() => import('@/app/routes/studio-editor'), 'StudioEditor')
const StudioMedia = page(() => import('@/app/routes/studio-media'), 'StudioMedia')
const Videos = page(() => import('@/app/routes/videos'), 'Videos')

const staff = (element: ReactNode) => <RequireRole roles={['curator', 'admin']}>{element}</RequireRole>
const admin = (element: ReactNode) => <RequireRole roles={['admin']}>{element}</RequireRole>

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/exhibitions', element: <Exhibitions /> },
      { path: '/exhibitions/:slug', element: <Exhibition /> },
      { path: '/collections', element: <Collections /> },
      { path: '/map', element: <MapPage /> },
      { path: '/videos', element: <Videos /> },
      { path: '/about', element: <About /> },
      { path: '/favorites', element: <Favorites /> },
      { path: '/sign-in', element: <SignIn /> },
      { path: '/profile', element: staff(<Profile />) },
      { path: '/studio', element: staff(<Studio />) },
      { path: '/studio/media', element: staff(<StudioMedia />) },
      { path: '/studio/new', element: staff(<StudioEditor />) },
      { path: '/studio/:id/edit', element: staff(<StudioEditor />) },
      { path: '/admin', element: admin(<Admin />) },
      { path: '/admin/libraries', element: admin(<AdminLibraries />) },
      { path: '/admin/libraries/new', element: admin(<AdminLibraryEditor />) },
      { path: '/admin/libraries/:id', element: admin(<AdminLibraryEditor />) },
      { path: '/admin/collections', element: admin(<AdminCollections />) },
      { path: '/admin/collections/new', element: admin(<AdminCollectionEditor />) },
      { path: '/admin/collections/:id', element: admin(<AdminCollectionEditor />) },
      { path: '/admin/content', element: admin(<AdminContent />) },
      { path: '/admin/history', element: admin(<AdminHistory />) },
      { path: '*', element: <NotFound /> },
    ],
  },
])
