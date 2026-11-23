import { useEffect, useRef } from 'react'
import LAND_DOTS from '@/data/landDots'

/**
 * Rotating dotted globe linking Seoul with cities worldwide.
 * direction="in"  → requests stream from the world into Seoul (Request page)
 * direction="out" → expertise spreads from Seoul to the world (Join Us)
 *
 * Plain <canvas> + orthographic projection math, no WebGL/three.js.
 * - Land is drawn from precomputed dots (src/data/landDots.ts)
 * - Each origin city sends a gold "comet" along a raised great-circle arc
 * - Seoul pulses on each arrival ("in") or send ("out"); cities ripple likewise
 * - Pauses off-screen / in background tabs; static frame for reduced motion
 */

type Vec = [number, number, number]

const SEOUL = { lat: 37.57, lng: 126.98 }

// Conceptual request origins (not office locations)
const ORIGINS: ReadonlyArray<[number, number]> = [
  [40.71, -74.0], [34.05, -118.24], [37.77, -122.42], [41.88, -87.63], [43.65, -79.38],
  [49.28, -123.12], [19.43, -99.13], [25.76, -80.19], [-23.55, -46.63], [-34.6, -58.38],
  [4.71, -74.07], [-12.05, -77.04], [51.51, -0.13], [48.86, 2.35], [52.52, 13.41],
  [50.11, 8.68], [47.38, 8.54], [40.42, -3.7], [41.9, 12.5], [59.33, 18.07],
  [52.37, 4.9], [55.76, 37.62], [41.01, 28.98], [25.2, 55.27], [24.71, 46.68],
  [30.04, 31.24], [-1.29, 36.82], [6.52, 3.38], [-26.2, 28.05], [19.08, 72.88],
  [28.61, 77.21], [13.76, 100.5], [1.35, 103.82], [-6.21, 106.85], [14.6, 120.98],
  [22.32, 114.17], [31.23, 121.47], [39.9, 116.4], [35.68, 139.65], [25.03, 121.57],
  [-33.87, 151.21], [-37.81, 144.96], [-36.85, 174.76], [43.06, 141.35], [10.82, 106.63],
]

const COLORS = {
  sphere: '#F4EFE6',
  sphereEdge: '#DCCFB6',
  land: '138, 108, 60', // rgb of the dot colour; alpha varies
  arc: '154, 118, 59',
  node: '14, 26, 43',
  hub: '#9A763B',
  label: '#875D20',
  sub: '#738094',
}

const TILT = (22 * Math.PI) / 180 // view latitude
const START_LNG = 105 // initial view longitude (Seoul in view)
const SPEED = 5 // degrees per second
const ARC_SAMPLES = 56

const rad = (d: number) => (d * Math.PI) / 180

function toVec(lat: number, lng: number): Vec {
  const la = rad(lat)
  const lo = rad(lng)
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]
}

/** Points along the great circle a→b, lifted into an arc above the surface. */
function buildArc(a: Vec, b: Vec): { p: Vec; r: number }[] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  const sinO = Math.sin(omega) || 1
  const height = 0.05 + 0.2 * (omega / Math.PI)
  const pts: { p: Vec; r: number }[] = []
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const t = i / ARC_SAMPLES
    const k1 = Math.sin((1 - t) * omega) / sinO
    const k2 = Math.sin(t * omega) / sinO
    pts.push({
      p: [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2],
      r: 1 + height * Math.sin(Math.PI * t),
    })
  }
  return pts
}

// Deterministic pseudo-random so the timing pattern is stable across renders
function seeded(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

interface ArcState {
  origin: Vec
  pts: { p: Vec; r: number }[]
  travel: number // seconds to reach Seoul
  rest: number // seconds idle before next send
  offset: number
}

interface DotGlobeProps {
  className?: string
  ariaLabel: string
  direction?: 'in' | 'out'
}

export default function DotGlobe({ className, ariaLabel, direction = 'in' }: DotGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* ── Static geometry ─────────────────────────────────────────────── */
    const land: Vec[] = []
    for (let i = 0; i < LAND_DOTS.length; i += 2) land.push(toVec(LAND_DOTS[i + 1], LAND_DOTS[i]))
    const seoul = toVec(SEOUL.lat, SEOUL.lng)
    const arcs: ArcState[] = ORIGINS.map(([lat, lng], i) => {
      const origin = toVec(lat, lng)
      return {
        origin,
        pts: direction === 'out' ? buildArc(seoul, origin) : buildArc(origin, seoul),
        travel: 2.4 + seeded(i) * 1.8,
        rest: 1.2 + seeded(i + 99) * 3.5,
        offset: seeded(i + 7) * 8,
      }
    })

    /* ── Sizing ──────────────────────────────────────────────────────── */
    let width = 0
    let height = 0
    let dpr = 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }
    resize()

    /* ── Projection ──────────────────────────────────────────────────── */
    let cosL = 1, sinL = 0
    const cosT = Math.cos(TILT), sinT = Math.sin(TILT)
    const setView = (lngDeg: number) => {
      cosL = Math.cos(rad(-lngDeg))
      sinL = Math.sin(rad(-lngDeg))
    }
    // rotate around Y by -viewLng, then around X by -tilt → [x, y, z(depth)]
    const view = (v: Vec): Vec => {
      const x = v[0] * cosL + v[2] * sinL
      const z1 = -v[0] * sinL + v[2] * cosL
      return [x, v[1] * cosT - z1 * sinT, v[1] * sinT + z1 * cosT]
    }

    const seoulPulses: number[] = []
    let lastArrivalCheck = 0

    /* ── Draw one frame at time t (seconds) ──────────────────────────── */
    const draw = (t: number) => {
      const lng = reduceMotion ? START_LNG : START_LNG + t * SPEED
      setView(lng)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2
      const R = Math.min(width, height) * 0.39
      const dotR = Math.max(0.9, R / 175)

      const sx = (v: Vec, r = 1) => cx + v[0] * R * r
      const sy = (v: Vec, r = 1) => cy - v[1] * R * r

      // Sphere
      const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R)
      grad.addColorStop(0, '#FBF8F2')
      grad.addColorStop(1, COLORS.sphere)
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = COLORS.sphereEdge
      ctx.stroke()

      // Outer dotted orbit
      ctx.save()
      ctx.setLineDash([2, 8])
      ctx.strokeStyle = 'rgba(205, 191, 156, 0.7)'
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // Land dots, batched by depth into 4 alpha buckets
      const buckets: number[][] = [[], [], [], []]
      for (const d of land) {
        const v = view(d)
        if (v[2] <= 0.02) continue
        const b = Math.min(3, Math.floor(v[2] * 4))
        buckets[b].push(sx(v), sy(v))
      }
      buckets.forEach((pts, b) => {
        if (!pts.length) return
        ctx.fillStyle = `rgba(${COLORS.land}, ${0.3 + b * 0.2})`
        ctx.beginPath()
        for (let i = 0; i < pts.length; i += 2) {
          ctx.moveTo(pts[i] + dotR, pts[i + 1])
          ctx.arc(pts[i], pts[i + 1], dotR, 0, Math.PI * 2)
        }
        ctx.fill()
      })

      // Arcs
      ctx.lineCap = 'round'
      for (const a of arcs) {
        const cycle = a.travel + a.rest
        const local = reduceMotion ? a.travel : (t + a.offset) % cycle
        const progress = Math.min(1, local / a.travel)

        // Project arc samples once; null = hidden behind the sphere
        const proj: ([number, number] | null)[] = a.pts.map(({ p, r }) => {
          const v = view(p)
          const ox = v[0] * r
          const oy = v[1] * r
          const visible = v[2] > 0 || ox * ox + oy * oy > 1
          return visible ? [cx + ox * R, cy - oy * R] : null
        })

        // Faint full route
        ctx.strokeStyle = `rgba(${COLORS.arc}, 0.16)`
        ctx.lineWidth = 0.8
        ctx.beginPath()
        let pen = false
        for (const q of proj) {
          if (!q) { pen = false; continue }
          if (pen) ctx.lineTo(q[0], q[1])
          else { ctx.moveTo(q[0], q[1]); pen = true }
        }
        ctx.stroke()

        // Travelling comet (only while in flight)
        if (local <= a.travel || reduceMotion) {
          const head = Math.round(progress * ARC_SAMPLES)
          const tail = Math.max(0, head - Math.round(ARC_SAMPLES * 0.28))
          for (let i = tail; i < head; i++) {
            const p0 = proj[i]
            const p1 = proj[i + 1]
            if (!p0 || !p1) continue
            const k = (i - tail + 1) / (head - tail)
            ctx.strokeStyle = `rgba(${COLORS.arc}, ${0.15 + 0.85 * k})`
            ctx.lineWidth = 0.6 + 1.4 * k
            ctx.beginPath()
            ctx.moveTo(p0[0], p0[1])
            ctx.lineTo(p1[0], p1[1])
            ctx.stroke()
          }
          const hp = proj[head]
          if (hp && progress < 1) {
            ctx.fillStyle = COLORS.hub
            ctx.beginPath()
            ctx.arc(hp[0], hp[1], dotR * 1.6, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // Origin node (+ ripple when sending)
        const o = view(a.origin)
        if (o[2] > 0) {
          const alpha = 0.35 + 0.65 * o[2]
          ctx.fillStyle = `rgba(${COLORS.node}, ${alpha})`
          ctx.beginPath()
          ctx.arc(sx(o), sy(o), dotR * 1.9, 0, Math.PI * 2)
          ctx.fill()
          const rippleAt = direction === 'out' ? a.travel : 0
          if (!reduceMotion && local >= rippleAt && local < rippleAt + 0.9) {
            const k = (local - rippleAt) / 0.9
            ctx.strokeStyle = `rgba(${COLORS.arc}, ${(1 - k) * 0.7 * alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(sx(o), sy(o), dotR * (2 + k * 7), 0, Math.PI * 2)
            ctx.stroke()
          }
        }

        // Queue a Seoul pulse once per cycle: on arrival ("in") or departure ("out")
        if (!reduceMotion) {
          const prevLocal = (lastArrivalCheck + a.offset) % cycle
          const fired =
            direction === 'out'
              ? local < prevLocal // wrapped round → a new send just started
              : prevLocal < a.travel && local >= a.travel
          if (fired) seoulPulses.push(t)
        }
      }
      lastArrivalCheck = t

      // Seoul hub
      const s = view(seoul)
      if (s[2] > 0) {
        const x = sx(s)
        const y = sy(s)
        const fade = Math.min(1, s[2] * 3)
        for (let i = seoulPulses.length - 1; i >= 0; i--) {
          const age = (t - seoulPulses[i]) / 1.4
          if (age >= 1) { seoulPulses.splice(i, 1); continue }
          ctx.strokeStyle = `rgba(${COLORS.arc}, ${(1 - age) * 0.6 * fade})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(x, y, dotR * (4 + age * 14), 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.globalAlpha = fade
        ctx.fillStyle = 'rgba(154, 118, 59, 0.18)'
        ctx.beginPath()
        ctx.arc(x, y, dotR * 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = COLORS.hub
        ctx.beginPath()
        ctx.arc(x, y, dotR * 3.4, 0, Math.PI * 2)
        ctx.fill()

        const fs = Math.max(11, R / 13)
        ctx.textBaseline = 'alphabetic'
        ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '2px'
        ctx.font = `700 ${fs}px Inter, sans-serif`
        ctx.fillStyle = COLORS.label
        ctx.fillText('SEOUL', x + dotR * 9, y - 2)
        ctx.font = `500 ${fs * 0.68}px Inter, sans-serif`
        ctx.fillStyle = COLORS.sub
        ctx.fillText('PRIMARY HUB', x + dotR * 9, y + fs * 0.85)
        ctx.globalAlpha = 1
      } else {
        seoulPulses.length = 0
      }
    }

    /* ── Animation loop (paused when not visible) ────────────────────── */
    let raf = 0
    let running = false
    let elapsed = 0
    let last = 0
    const frame = (now: number) => {
      elapsed += Math.min(0.1, (now - last) / 1000)
      last = now
      draw(elapsed)
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (running || reduceMotion) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    draw(0)

    let inView = true
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView && !document.hidden) start()
      else stop()
    })
    io.observe(canvas)
    const onVisibility = () => (document.hidden || !inView ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)
    const ro = new ResizeObserver(() => {
      resize()
      draw(elapsed)
    })
    ro.observe(canvas)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [direction])

  return <canvas ref={canvasRef} className={className} role="img" aria-label={ariaLabel} />
}
