// Writes the frontend's sample exhibitions to backend/app/seed_data/exhibitions.json, so the backend
// seed shows the same content as the mock API. Run from `frontend/`: `pnpm export-seed`.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const here = dirname(fileURLToPath(import.meta.url))
const target = resolve(here, '../../backend/app/seed_data/exhibitions.json')

const server = await createServer({
  root: resolve(here, '..'),
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true },
})

try {
  const { initialExhibitions } = await server.ssrLoadModule('/src/features/exhibitions/api/exhibitions-data.ts')
  const { authApi } = await server.ssrLoadModule('/src/features/auth/api/auth-api.ts')

  const authors = Object.fromEntries(authApi.demoUsers.map((user) => [user.id, user.email]))
  const exhibitions = initialExhibitions.map((exhibition) => ({
    ...exhibition,
    authorEmail: authors[exhibition.authorId],
  }))

  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify(exhibitions, null, 2)}\n`)
  console.log(`Wrote ${exhibitions.length} exhibitions to ${target}`)
} finally {
  await server.close()
}
