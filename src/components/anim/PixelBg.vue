<template>
  <canvas ref="canvasRef" class="pixel-bg" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Square pixel size in px */
  tileSize?: number
  /** Gap between tiles */
  gap?: number
  /** Max opacity a tile can reach */
  maxOpacity?: number
  /** Wave speed */
  waveSpeed?: number
  /** Fraction of tiles that participate */
  density?: number
  /** Current theme: 'dark' or 'light' */
  theme?: string
}>(), {
  tileSize: 5,
  gap: 3,
  maxOpacity: 0.18,
  waveSpeed: 0.002,
  density: 0.4,
  theme: 'dark',
})

// Theme-based colors
const themeColors: Record<string, string> = {
  dark: '255,255,255',    // White pixels for dark theme
  light: '0,0,0',         // Black pixels for light theme
}

const currentColor = computed(() => themeColors[props.theme] || themeColors.dark)

interface Tile {
  x: number
  y: number
  cx: number
  cy: number
  opacity: number
  target: number
  speed: number
  active: boolean
  noise: number
  edgeNoise: number
  edgePhase: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let tiles: Tile[] = []
let time = 0

function buildGrid(canvas: HTMLCanvasElement) {
  const step = props.tileSize + props.gap
  const cols = Math.ceil(canvas.width / step) + 1
  const rows = Math.ceil(canvas.height / step) + 1
  tiles = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c / cols
      const cy = r / rows
      
      // Distance from bottom-right corner (wave origin)
      const dx = cx - 1
      const dy = cy - 1
      const distFromOrigin = Math.sqrt(dx * dx + dy * dy)
      
      // Smooth edge falloff using smoothstep
      // Tiles closer to top-left (far from origin) have lower probability
      const maxDist = Math.sqrt(2) // diagonal distance
      const edgeFactor = 1 - Math.pow(distFromOrigin / maxDist, 2) * 0.6
      
      // Combine density with edge factor and add some randomness
      const activeProbability = props.density * edgeFactor
      const isActive = Math.random() < activeProbability
      
      tiles.push({
        x: c * step,
        y: r * step,
        cx: cx,
        cy: cy,
        opacity: 0,
        target: 0,
        speed: 0.006 + Math.random() * 0.01,
        active: isActive,
        noise: (Math.random() - 0.5) * 2,
        edgeNoise: Math.random(),
        edgePhase: Math.random() * Math.PI * 2,
      })
    }
  }
}

function waveAt(cx: number, cy: number, noise: number, t: number): number {
  // Wave originates from bottom-right corner (1, 1)
  const dx = cx - 1
  const dy = cy - 1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)

  const warp =
    Math.sin(angle * 3 + t * 0.3) * 0.06 +
    Math.sin(angle * 7 - t * 0.18) * 0.035 +
    Math.sin(angle * 11 + t * 0.1) * 0.02

  const distorted = dist + warp + noise * 0.015
  const phase = (distorted * 2.5 - t * 3) % 2
  return (Math.sin(phase * Math.PI) + 1) / 2
}

function tick() {
  time += props.waveSpeed
  for (const tile of tiles) {
    if (!tile.active) continue
    
    // Calculate distance from bottom-right (wave origin)
    const dx = tile.cx - 1
    const dy = tile.cy - 1
    const distFromOrigin = Math.sqrt(dx * dx + dy * dy)
    const maxDist = Math.sqrt(2)
    const normalizedDist = distFromOrigin / maxDist
    
    // Base wave animation
    const wave = waveAt(tile.cx, tile.cy, tile.noise, time)
    let targetOpacity = wave > 0.38 ? props.maxOpacity * wave : 0
    
    // Dynamic edge variation - edges breathe independently
    // Tiles farther from origin have more edge effect
    const edgeFactor = normalizedDist * normalizedDist
    const edgeBreath = Math.sin(time * 2 + tile.edgePhase) * 0.5 + 0.5
    const edgeFlicker = Math.sin(time * 5 + tile.edgeNoise * 10) * 0.3 + 0.7
    
    // Apply edge dynamics - more variation at edges
    const edgeVariation = edgeFactor * edgeBreath * edgeFlicker * 0.4
    targetOpacity *= (1 + edgeVariation)
    
    // Clamp to maxOpacity
    tile.target = Math.min(targetOpacity, props.maxOpacity)
    tile.opacity += (tile.target - tile.opacity) * tile.speed
  }
}

function drawShield(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas
  
  // Shield size and position (bottom-right corner) - 1/4 of original
  const shieldSize = Math.min(width, height) * 0.03
  const margin = 30
  const centerX = width - margin - shieldSize / 2
  const centerY = height - margin - shieldSize / 2
  
  // Shield opacity (subtle but visible)
  const shieldOpacity = 0.06
  const strokeOpacity = 0.12
  
  ctx.save()
  ctx.translate(centerX, centerY)
  
  // Draw shield shape
  ctx.beginPath()
  const w = shieldSize / 2
  const h = shieldSize / 2
  
  // Classic shield: curved top, straight sides, pointed bottom
  ctx.moveTo(0, -h)                    // Top center
  ctx.bezierCurveTo(w * 0.9, -h, w, -h * 0.6, w, -h * 0.2)  // Right top curve
  ctx.lineTo(w, h * 0.4)               // Right side
  ctx.quadraticCurveTo(w * 0.5, h, 0, h * 1.1)  // Right bottom to point
  ctx.quadraticCurveTo(-w * 0.5, h, -w, h * 0.4)  // Left bottom
  ctx.lineTo(-w, -h * 0.2)             // Left side
  ctx.bezierCurveTo(-w, -h * 0.6, -w * 0.9, -h, 0, -h)  // Left top curve
  ctx.closePath()
  
  // Fill with subtle opacity
  ctx.fillStyle = `rgba(${currentColor.value},${shieldOpacity})`
  ctx.fill()
  
  // Add stroke for clearer shape
  ctx.strokeStyle = `rgba(${currentColor.value},${strokeOpacity})`
  ctx.lineWidth = 1
  ctx.stroke()
  
  // Draw cross-shaped cutout in the center
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  
  const crossThickness = shieldSize * 0.15
  const crossLength = shieldSize * 0.5
  
  // Vertical bar of cross
  ctx.fillStyle = 'rgba(0,0,0,1)'
  ctx.fillRect(-crossThickness / 2, -crossLength / 2, crossThickness, crossLength)
  
  // Horizontal bar of cross
  ctx.fillRect(-crossLength / 2, -crossThickness / 2, crossLength, crossThickness)
  
  ctx.restore()
  
  ctx.restore()
}

function draw(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas
  ctx.clearRect(0, 0, width, height)
  const s = props.tileSize
  for (const tile of tiles) {
    if (!tile.active || tile.opacity < 0.004) continue
    ctx.fillStyle = `rgba(${currentColor.value},${tile.opacity.toFixed(3)})`
    ctx.fillRect(tile.x, tile.y, s, s)
  }
  
  // Draw shield in bottom-right corner
  drawShield(ctx)
}

function resize(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement!
  canvas.width = parent.clientWidth
  canvas.height = parent.clientHeight
  buildGrid(canvas)
}

onMounted(() => {
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  resize(canvas)

  const ro = new ResizeObserver(() => resize(canvas))
  ro.observe(canvas.parentElement!)

  const loop = () => {
    tick()
    draw(ctx)
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)

  onUnmounted(() => {
    cancelAnimationFrame(rafId)
    ro.disconnect()
  })
})
</script>

<style scoped>
.pixel-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
