// Writes the frontend's sample data (exhibitions, libraries, collections) to backend/app/seed_data/*.json,
// so the backend seed shows the same content as the mock API. Run from `frontend/`: `pnpm export-seed`.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const here = dirname(fileURLToPath(import.meta.url))
const targetDir = resolve(here, '../../backend/app/seed_data')

const server = await createServer({
  root: resolve(here, '..'),
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true },
})

try {
  const { initialExhibitions } = await server.ssrLoadModule('/src/features/exhibitions/api/exhibitions-data.ts')
  const { authApi } = await server.ssrLoadModule('/src/features/auth/api/auth-api.ts')
  const { libraries } = await server.ssrLoadModule('/src/features/libraries/api/libraries-data.ts')
  const { initialCollections } = await server.ssrLoadModule('/src/features/collections/api/collections-data.ts')

  const authors = Object.fromEntries(authApi.demoUsers.map((user) => [user.id, user.email]))
  const exhibitions = initialExhibitions.map((exhibition) => ({
    ...exhibition,
    authorEmail: authors[exhibition.authorId],
  }))

  mkdirSync(targetDir, { recursive: true })
  const files = { exhibitions, libraries, collections: initialCollections }
  for (const [name, rows] of Object.entries(files)) {
    writeFileSync(resolve(targetDir, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`)
    console.log(`Wrote ${rows.length} ${name} to ${targetDir}`)
  }
} finally {
  await server.close()
}
