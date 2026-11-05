import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const GLYPHS = '01#@%+=-:.'

function createGlyphTexture() {
  const canvas = document.createElement('canvas')
  const glyphWidth = 12
  const glyphHeight = 16
  canvas.width = GLYPHS.length * glyphWidth
  canvas.height = glyphHeight

  const context = canvas.getContext('2d')
  if (!context) return null

  context.font = '12px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#ffffff'

  for (let index = 0; index < GLYPHS.length; index += 1) {
    context.fillText(GLYPHS[index], index * glyphWidth + glyphWidth / 2, glyphHeight / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return texture
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision highp float;

  uniform sampler2D uGlyphs;
  uniform vec2 uResolution;
  uniform vec2 uCellSize;
  uniform float uTime;
  uniform float uGlyphCount;
  varying vec2 vUv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy;
    vec2 cell = floor(pixel / uCellSize);
    vec2 local = fract(pixel / uCellSize);
    float seed = hash(cell);
    float flicker = hash(cell + floor(uTime * 2.0));
    float visible = step(0.77, seed + flicker * 0.12);
    float index = floor(hash(cell + 9.7) * uGlyphCount);
    vec2 atlasUv = vec2((index + local.x) / uGlyphCount, local.y);
    float glyph = texture2D(uGlyphs, atlasUv).a;

    vec2 center = (pixel - uResolution * 0.5) / uResolution;
    float edge = smoothstep(0.12, 0.62, length(center));
    float scan = 0.75 + 0.25 * sin(pixel.y * 0.025 + uTime * 0.8);
    float alpha = glyph * visible * edge * scan * 0.22;
    gl_FragColor = vec4(0.95, 0.96, 0.97, alpha);
  }
`

export function AsciiBackdrop() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const glyphTexture = createGlyphTexture()
    if (!glyphTexture) return

    const scene = new THREE.Scene()
    const camera = new THREE.Camera()
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uGlyphs: { value: glyphTexture },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uCellSize: { value: new THREE.Vector2(9, 12) },
        uTime: { value: 0 },
        uGlyphCount: { value: GLYPHS.length },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    const plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    } catch {
      glyphTexture.dispose()
      geometry.dispose()
      material.dispose()
      return
    }

    renderer.setClearColor(0x000000, 0)
    renderer.domElement.className = 'pointer-events-none absolute inset-0 size-full'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const resize = () => {
      const bounds = host.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      renderer.setPixelRatio(ratio)
      renderer.setSize(bounds.width, bounds.height, false)
      material.uniforms.uResolution.value.set(bounds.width * ratio, bounds.height * ratio)
      material.uniforms.uCellSize.value.set(9 * ratio, 12 * ratio)
      renderer.render(scene, camera)
    }

    const render = (time: number) => {
      material.uniforms.uTime.value = time * 0.001
      renderer.render(scene, camera)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    renderer.setAnimationLoop(motionQuery.matches ? null : render)

    const handleMotionChange = () => {
      renderer.setAnimationLoop(motionQuery.matches ? null : render)
      if (motionQuery.matches) render(0)
    }
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      observer.disconnect()
      renderer.setAnimationLoop(null)
      renderer.dispose()
      glyphTexture.dispose()
      geometry.dispose()
      material.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />
}
