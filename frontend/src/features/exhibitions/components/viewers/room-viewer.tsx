import { OrbitControls, useCursor, useProgress, useTexture } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'

import { ErrorBoundary } from '@/components/error-boundary'
import { makeArt } from '@/lib/art'
import { useI18n } from '@/lib/i18n'
import { SCENE } from '@/lib/scene-palette'

import type { Exhibition, ExhibitionItem } from '../../types'
import { ItemDialog } from '../item-dialog'

type RoomViewerProps = { exhibition: Exhibition }

const ROOM = { width: 14, depth: 14, height: 5 }

type Placement = { position: [number, number, number]; rotationY: number }

function layout(count: number): Placement[] {
  const half = ROOM.width / 2
  const walls: Placement[][] = [[], [], []]
  for (let i = 0; i < count; i++) walls[i % 3]?.push({ position: [0, 0, 0], rotationY: 0 })
  const result: Placement[] = []
  const place = (wall: number, slot: number, total: number): Placement => {
    const t = total === 1 ? 0 : (slot / (total - 1) - 0.5) * (ROOM.width - 5)
    if (wall === 0) return { position: [t, 1.9, -half + 0.08], rotationY: 0 }
    if (wall === 1) return { position: [-half + 0.08, 1.9, t], rotationY: Math.PI / 2 }
    return { position: [half - 0.08, 1.9, t], rotationY: -Math.PI / 2 }
  }
  const counters = [0, 0, 0]
  for (let i = 0; i < count; i++) {
    const wall = i % 3
    const slot = counters[wall] ?? 0
    counters[wall] = slot + 1
    result.push(place(wall, slot, walls[wall]?.length ?? 1))
  }
  return result
}

type FrameProps = { item: ExhibitionItem; placement: Placement; onSelect: (item: ExhibitionItem) => void }

function Frame({ item, placement, onSelect }: FrameProps) {
  const texture = useTexture(item.imageUrl)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  // Fit the picture's own aspect ratio into a 3.2 x 2.4 box so photos are not stretched.
  const image = texture.image as { width?: number; height?: number } | undefined
  const ratio = image?.width && image?.height ? image.width / image.height : 1
  const w = Math.min(3.2, 2.4 * ratio)
  const h = w / ratio

  return (
    <group position={placement.position} rotation={[0, placement.rotationY, 0]}>
      <mesh>
        <boxGeometry args={[w + 0.25, h + 0.25, 0.08]} />
        <meshStandardMaterial color={SCENE.frame} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          onSelect(item)
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[0, 0, 0.045]}
        scale={hovered ? 1.03 : 1}
      >
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <spotLight
        position={[0, 2.2, 1.6]}
        intensity={hovered ? 30 : 18}
        angle={0.9}
        penumbra={0.6}
        target-position={[0, 0, 0]}
      />
    </group>
  )
}

function Room({ items, onSelect }: { items: ExhibitionItem[]; onSelect: (item: ExhibitionItem) => void }) {
  const placements = layout(items.length)
  const { width, depth, height } = ROOM

  return (
    <>
      <ambientLight intensity={0.9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={SCENE.floor} roughness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={SCENE.ceiling} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={SCENE.wall} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={SCENE.wall} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={SCENE.wall} />
      </mesh>
      {items.map((item, i) => {
        const placement = placements[i]
        return placement ? (
          <ErrorBoundary
            key={item.id}
            fallback={
              <Frame
                item={{ ...item, imageUrl: makeArt(item.type, item.title.me, String(item.year ?? '')) }}
                placement={placement}
                onSelect={onSelect}
              />
            }
          >
            <Frame item={item} placement={placement} onSelect={onSelect} />
          </ErrorBoundary>
        ) : null
      })}
    </>
  )
}

function LoadingBar() {
  const { t } = useI18n()
  const { active, progress } = useProgress()
  if (!active) return null

  return (
    <div role="status" className="absolute inset-x-6 bottom-6 flex flex-col gap-2 text-on-ink">
      <p className="text-sm">{t('viewer.roomLoadingPct', { n: Math.round(progress) })}</p>
      <div className="h-1 overflow-hidden rounded-full bg-on-ink/20">
        <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default function RoomViewer({ exhibition }: RoomViewerProps) {
  const { t, l } = useI18n()
  const items = exhibition.sections.flatMap((s) => s.items)
  const [selected, setSelected] = useState<ExhibitionItem | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative h-[60vh] overflow-hidden rounded-lg border bg-ink"
        role="application"
        aria-label={t('tpl.room')}
      >
        <Canvas camera={{ position: [0, 1.7, 5.5], fov: 65 }}>
          <color attach="background" args={[SCENE.backdrop]} />
          <Suspense fallback={null}>
            <Room items={items} onSelect={setSelected} />
          </Suspense>
          <OrbitControls
            target={[0, 1.8, 0]}
            minDistance={1}
            maxDistance={6.5}
            maxPolarAngle={Math.PI / 1.9}
            enablePan={false}
          />
        </Canvas>
        <LoadingBar />
      </div>
      <p className="text-sm text-muted-foreground">{t('viewer.roomHint')}</p>
      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer text-sm font-medium">{t('viewer.roomObjects')}</summary>
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="w-full rounded px-2 py-1 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                {l(item.title)}
                {item.year ? ` · ${item.year}` : ''}
              </button>
            </li>
          ))}
        </ul>
      </details>
      {selected && <ItemDialog item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
