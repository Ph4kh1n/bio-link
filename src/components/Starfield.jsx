import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function createNebulaTexture(hsl) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, hsl)
  grad.addColorStop(0.3, hsl.replace(/[\d.]+%\)$/, '40%)'))
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}

const isMobile = () => window.innerWidth < 768
const STAR_FACTOR = isMobile() ? 0.4 : 1

export default function Starfield() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x08080f)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    camera.position.z = 350

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2))
    mount.appendChild(renderer.domElement)

    const starCount = Math.round(2800 * STAR_FACTOR)
    const positions = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      const radius = 300 + Math.random() * 700
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      sizes[i] = Math.random() * 2.5 + 0.3
    }

    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(uTime * 0.8 + position.x * 0.08 + position.y * 0.06 + position.z * 0.07) * 0.35 + 0.65;
          vAlpha = twinkle;
          gl_PointSize = size * uPixelRatio * (280.0 / -mvPosition.z);
          gl_PointSize = clamp(gl_PointSize, 1.0, 8.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          gl_FragColor = vec4(1.0, 1.0, 1.0, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    const nebulaColors = [
      'hsla(20, 90%, 55%, 0.25)',
      'hsla(200, 80%, 60%, 0.2)',
      'hsla(270, 70%, 65%, 0.18)',
      'hsla(30, 85%, 50%, 0.15)',
      'hsla(220, 75%, 55%, 0.15)',
      'hsla(320, 60%, 50%, 0.12)',
    ]

    const nebulaGroup = new THREE.Group()
    const nebulaTextures = nebulaColors.map(c => createNebulaTexture(c))
    const nebulaSprites = []

    nebulaColors.forEach((_, i) => {
      const mat = new THREE.SpriteMaterial({
        map: nebulaTextures[i],
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const sprite = new THREE.Sprite(mat)
      const radius = 200 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      sprite.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi) - 100
      )
      const s = 150 + Math.random() * 250
      sprite.scale.set(s, s, 1)
      sprite.userData = {
        rotSpeed: (Math.random() - 0.5) * 0.0003,
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatPhase: Math.random() * Math.PI * 2,
        origPos: sprite.position.clone(),
      }
      nebulaGroup.add(sprite)
      nebulaSprites.push(sprite)
    })
    scene.add(nebulaGroup)

    const glowCount = Math.round(50 * STAR_FACTOR)
    const glowPos = new Float32Array(glowCount * 3)
    const glowSizes = new Float32Array(glowCount)
    for (let i = 0; i < glowCount; i++) {
      const i3 = i * 3
      glowPos[i3] = (Math.random() - 0.5) * 800
      glowPos[i3 + 1] = (Math.random() - 0.5) * 800
      glowPos[i3 + 2] = (Math.random() - 0.5) * 600
      glowSizes[i] = Math.random() * 4 + 2
    }

    const glowGeo = new THREE.BufferGeometry()
    glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPos, 3))
    glowGeo.setAttribute('size', new THREE.BufferAttribute(glowSizes, 1))

    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float drift = sin(uTime * 0.3 + position.x * 0.01) * 20.0;
          float driftY = cos(uTime * 0.4 + position.z * 0.01) * 15.0;
          vec3 pos = position + vec3(drift, driftY, 0.0);
          mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vAlpha = sin(uTime * 0.5 + position.x * 0.05 + position.y * 0.05) * 0.2 + 0.3;
          gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
          gl_PointSize = clamp(gl_PointSize, 2.0, 12.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          gl_FragColor = vec4(1.0, 0.8, 0.6, a * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const glowPoints = new THREE.Points(glowGeo, glowMat)
    scene.add(glowPoints)

    const mouse = { x: 0, y: 0 }
    const targetRot = { x: 0, y: 0 }

    let frameCount = 0
    const handleMouse = (e) => {
      if (++frameCount % 2 !== 0) return
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })

    let resizeTimer
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth
        const h = window.innerHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }, 100)
    }
    window.addEventListener('resize', handleResize, { passive: true })

    let animId

    function animate(time) {
      animId = requestAnimationFrame(animate)
      const t = time * 0.001

      starMat.uniforms.uTime.value = t
      glowMat.uniforms.uTime.value = t

      targetRot.x += (mouse.y * 0.05 - targetRot.x) * 0.02
      targetRot.y += (mouse.x * 0.05 - targetRot.y) * 0.02

      stars.rotation.x = targetRot.x
      stars.rotation.y = targetRot.y + t * 0.008

      glowPoints.rotation.x = targetRot.x * 0.7
      glowPoints.rotation.y = targetRot.y * 0.7 + t * 0.005

      for (let i = 0; i < nebulaSprites.length; i++) {
        const sprite = nebulaSprites[i]
        const ud = sprite.userData
        sprite.position.y = ud.origPos.y + Math.sin(t * ud.floatSpeed + ud.floatPhase) * 30
        sprite.position.x = ud.origPos.x + Math.cos(t * ud.floatSpeed * 0.7 + ud.floatPhase) * 20
        sprite.material.rotation += ud.rotSpeed
      }
      nebulaGroup.rotation.y = t * 0.003
      nebulaGroup.rotation.x = targetRot.x * 0.3

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)

      scene.remove(stars)
      scene.remove(glowPoints)
      scene.remove(nebulaGroup)

      starGeo.dispose()
      starMat.dispose()
      glowGeo.dispose()
      glowMat.dispose()

      nebulaSprites.forEach((sprite) => {
        sprite.material.map?.dispose()
        sprite.material.dispose()
      })

      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}
