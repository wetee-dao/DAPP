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
  tileSize: 10,
  gap: 5,
  maxOpacity: 0.14,
  waveSpeed: 0.0014,
  density: 0.28,
  theme: 'dark',
})

/** 低饱和、贴近底色的「环境光」色，避免霓虹点阵感 */
const themeColors: Record<string, string> = {
  dark: '118, 132, 126',
  light: '130, 148, 138',
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
        speed: 0.004 + Math.random() * 0.006,
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
    Math.sin(angle * 3 + t * 0.22) * 0.035 +
    Math.sin(angle * 5 - t * 0.12) * 0.018 +
    Math.sin(angle * 8 + t * 0.07) * 0.012

  const distorted = dist + warp + noise * 0.01
  const phase = (distorted * 2.2 - t * 2.35) % 2
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
    const maxDist = Math.sqrt(1.3)
    const normalizedDist = distFromOrigin / maxDist
    
    // Base wave：略提高阈值，点亮像素更少、更「呼吸感」
    const wave = waveAt(tile.cx, tile.cy, tile.noise, time)
    let targetOpacity = wave > 0.46 ? props.maxOpacity * wave : 0

    const edgeFactor = normalizedDist * normalizedDist
    const edgeBreath = Math.sin(time * 1.1 + tile.edgePhase) * 0.5 + 0.5
    const edgeFlicker = Math.sin(time * 2.2 + tile.edgeNoise * 6) * 0.2 + 0.8
    const edgeVariation = edgeFactor * edgeBreath * edgeFlicker * 0.1
    targetOpacity *= 1 + edgeVariation

    // 离右下角越远颜色越淡：加大衰减（平方曲线，更快变淡）
    const fadeFactor = Math.max(0, 1 - Math.pow(normalizedDist, 2))
    targetOpacity *= fadeFactor

    // Clamp to maxOpacity
    tile.target = Math.min(targetOpacity, props.maxOpacity)
    tile.opacity += (tile.target - tile.opacity) * tile.speed
  }
}

/** Shield outline in local coords (origin = shield center). */
function addShieldOutlinePath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.moveTo(0, -h)
  ctx.bezierCurveTo(w * 0.9, -h, w, -h * 0.6, w, -h * 0.2)
  ctx.lineTo(w, h * 0.4)
  ctx.quadraticCurveTo(w * 0.5, h, 0, h * 1.1)
  ctx.quadraticCurveTo(-w * 0.5, h, -w, h * 0.4)
  ctx.lineTo(-w, -h * 0.2)
  ctx.bezierCurveTo(-w, -h * 0.6, -w * 0.9, -h, 0, -h)
  ctx.closePath()
}

function drawShield(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas

  // Shield size and position (bottom-right corner)
  const shieldSize = Math.min(width, height) * 0.03
  const margin = 30
  const centerX = width - margin - shieldSize / 2
  const centerY = height - margin - shieldSize / 2

  ctx.save()
  ctx.translate(centerX, centerY)

  const w = shieldSize / 2
  const h = shieldSize / 2

  // 3 层放大扩散圆环：半径扩得更大，与盾牌区域错开显示
  const ringColor = '96, 118, 108'
  const cycle = 4.2
  const maxRingExpand = 3.2
  const baseRadius = shieldSize / 2
  for (let i = 0; i < 3; i++) {
    const phase = ((time / cycle + i / 3) % 1)
    const ringScale = 1 + phase * maxRingExpand
    const ringOpacity = (1 - phase) * 0.072
    if (ringOpacity > 0.002) {
      ctx.beginPath()
      ctx.arc(0, 0, baseRadius * ringScale, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${ringColor},${ringOpacity.toFixed(3)})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  // 挖掉盾牌形状内的波纹，避免圆环与盾牌叠在一起
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  addShieldOutlinePath(ctx, w, h)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.restore()

  const shieldOpacity = 0.038

  // Draw shield shape
  ctx.beginPath()
  addShieldOutlinePath(ctx, w, h)
  
  // Fill with subtle opacity
  ctx.fillStyle = `rgba(${currentColor.value},${shieldOpacity})`
  ctx.fill()

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

/** 中心略压暗、四角略亮，主内容区更干净（阅读区不抢戏） */
function contentCalmFactor(x: number, y: number, s: number, width: number, height: number): number {
  const mx = (x + s * 0.5) / width
  const my = (y + s * 0.5) / height
  const nd = Math.hypot(mx - 0.5, my - 0.5) / 0.70710678
  return 0.38 + 0.62 * Math.pow(Math.min(nd, 1), 0.95)
}

function draw(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas
  ctx.clearRect(0, 0, width, height)
  const s = props.tileSize
  for (const tile of tiles) {
    if (!tile.active || tile.opacity < 0.003) continue
    const calm = contentCalmFactor(tile.x, tile.y, s, width, height)
    const a = tile.opacity * calm
    if (a < 0.002) continue
    ctx.fillStyle = `rgba(${currentColor.value},${a.toFixed(4)})`
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
