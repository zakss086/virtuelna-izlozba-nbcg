import { AboutContent } from '@/features/about/components/about-content'
import { PlatformStats } from '@/features/exhibitions/components/platform-stats'

export function About() {
  return <AboutContent stats={<PlatformStats tone="hero" />} />
}
