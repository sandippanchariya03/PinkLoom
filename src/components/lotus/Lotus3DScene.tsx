"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { EcosystemState } from "./LotusEcosystem";

export interface Lotus3DSceneProps {
  experienceState: EcosystemState;
  isCenterHovered: boolean;
  onCenterClick: () => void;
  onPetalClick: () => void;
  shouldReduceMotion?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  time: number;
  maxRadius: number;
  speed: number;
  amplitude: number;
}

export function Lotus3DScene({
  experienceState,
  isCenterHovered,
  onCenterClick,
  onPetalClick,
  shouldReduceMotion = false,
}: Lotus3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // References for animation and event loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const flowerGroupRef = useRef<THREE.Group | null>(null);
  const detachablePetalMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const coreLightRef = useRef<THREE.PointLight | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0 });
  const windSpringRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0 });
  const stateRef = useRef(experienceState);

  // Safely synchronize state into ref outside of render
  useEffect(() => {
    stateRef.current = experienceState;
  }, [experienceState]);

  // Adjust core light intensity on center hover
  useEffect(() => {
    if (coreLightRef.current) {
      coreLightRef.current.intensity = isCenterHovered ? 2.8 : 1.8;
    }
  }, [isCenterHovered]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.background = null; // Transparent WebGL to allow photographic backdrop
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 5.2);
    cameraRef.current = camera;

    // 2. High-DPI Antialiased WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Realistic Botanical Lighting
    const ambientLight = new THREE.AmbientLight(0xfff2e6, 1.25);
    scene.add(ambientLight);

    // Warm Sunset Backlight Bloom (Reference Image 2)
    const sunLight = new THREE.DirectionalLight(0xffdfb8, 2.0);
    sunLight.position.set(0, 3.5, -2.5);
    scene.add(sunLight);

    // Golden Receptacle Core Glow Light (soft ambient botanical illumination)
    const coreLight = new THREE.PointLight(0xffea88, 0.45, 4.5);
    coreLight.position.set(0, 0.35, 0.35);
    scene.add(coreLight);
    coreLightRef.current = coreLight;

    // Subtle Cyan Water Depth Underlight
    const waterUnderlight = new THREE.DirectionalLight(0x408090, 0.7);
    waterUnderlight.position.set(0, -4, 2);
    scene.add(waterUnderlight);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // 5. Multi-Layer 3D Water Surface with Dynamic Ripple Shader & Reflection
    const waterUniforms = {
      uTime: { value: 0 },
      uWind: { value: new THREE.Vector2(0, 0) },
      uRipples: { value: new Array(12).fill(new THREE.Vector4(0, 0, 0, 0)) }, // x, y, startTime, amplitude
      uReflectionTex: { value: null as THREE.Texture | null },
      uColorDeep: { value: new THREE.Color(0x061116) },
      uColorShallow: { value: new THREE.Color(0x0e242a) },
      uColorHighlight: { value: new THREE.Color(0xffdbb5) },
    };

    textureLoader.load("/lotus/lotus-reflection.jpg", (refTex) => {
      refTex.colorSpace = THREE.SRGBColorSpace;
      waterUniforms.uReflectionTex.value = refTex;
    });

    const waterVertShader = `
      uniform float uTime;
      uniform vec2 uWind;
      uniform vec4 uRipples[12];
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Gentle undulating aquatic pond swell
        float wave1 = sin(pos.x * 1.8 + uTime * 1.2 + uWind.x * 0.5) * 0.035;
        float wave2 = cos(pos.y * 2.2 + uTime * 0.9 + uWind.y * 0.5) * 0.025;
        float wave3 = sin((pos.x + pos.y) * 3.5 + uTime * 1.8) * 0.015;

        // Dynamic interactive ripples from clicks
        float rippleDisp = 0.0;
        for (int i = 0; i < 12; i++) {
          if (uRipples[i].w > 0.001) {
            float dist = distance(pos.xy, uRipples[i].xy);
            float age = uTime - uRipples[i].z;
            float radius = age * 1.8;
            if (age > 0.0 && dist < radius && dist > (radius - 1.2)) {
              float ring = sin((dist - radius) * 14.0) * exp(-dist * 1.4) * exp(-age * 1.1);
              rippleDisp += ring * uRipples[i].w;
            }
          }
        }

        pos.z += wave1 + wave2 + wave3 + rippleDisp;
        vNormal = normalize(vec3(-wave1 * 2.0, -wave2 * 2.0, 1.0));
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const waterFragShader = `
      uniform float uTime;
      uniform sampler2D uReflectionTex;
      uniform vec3 uColorDeep;
      uniform vec3 uColorShallow;
      uniform vec3 uColorHighlight;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {
        // Fresnel calculation
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = clamp(1.0 - dot(viewDir, vNormal), 0.0, 1.0);
        float fresnelFactor = pow(fresnel, 2.2);

        // Realistic localized water reflection directly beneath flower
        // Horizon is at vUv.y = 1.0, flower base touches water around vUv.y = 0.72
        float refX = abs(vUv.x - 0.5) / 0.24;
        float refY = (0.75 - vUv.y) / 0.38;

        float refAtten = 0.0;
        if (refX < 1.0 && refY > 0.0 && refY < 1.0) {
          refAtten = (1.0 - refX * refX) * (1.0 - refY) * smoothstep(0.0, 0.12, refY);
        }

        // Sample bloom texture upside down with ripple normal displacement
        vec2 refUv = vec2(
          clamp(0.50 + (vUv.x - 0.50) * 1.15 + vNormal.x * 0.08, 0.0, 1.0),
          clamp(0.46 - refY * 0.42 + vNormal.y * 0.06, 0.0, 1.0)
        );

        vec4 refColor = texture2D(uReflectionTex, refUv);

        // Deep natural aquatic pond water (dark teal / blue-green)
        vec3 deepTeal = vec3(0.03, 0.09, 0.12);
        vec3 surfaceTeal = vec3(0.06, 0.18, 0.22);
        vec3 waterBase = mix(deepTeal, surfaceTeal, vUv.y * 0.85);

        // Soft, authentic water reflection tinted by pond water
        vec3 reflectedFlower = mix(waterBase, refColor.rgb * vec3(0.85, 0.80, 0.85), 0.55);
        vec3 finalColor = mix(waterBase, reflectedFlower, refAtten * refColor.a * 0.65);

        // Subtle aquatic surface glint / fresnel highlight
        finalColor += uColorHighlight * fresnelFactor * 0.30;

        // Smooth circular perimeter fade into dark aquatic pond depths
        float edgeDist = length((vUv - 0.5) * vec2(1.15, 1.0));
        float alpha = smoothstep(0.96, 0.35, edgeDist) * 0.98;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const waterGeo = new THREE.PlaneGeometry(14, 9, 80, 80);
    const waterMat = new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: waterVertShader,
      fragmentShader: waterFragShader,
      transparent: true,
      depthWrite: false,
    });
    waterMaterialRef.current = waterMat;

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2.3; // Tilted perspective water plane
    waterMesh.position.set(0, -0.65, 0.4);
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;


    // 6. Primary Photographic Lotus in 3D Multi-Layer Assembly
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0, 0.25, 0.2);
    scene.add(flowerGroup);
    flowerGroupRef.current = flowerGroup;

    // Load Real Photographic Bloom Texture (from high-res 2048x2048 lotus-bloom.jpg)
    textureLoader.load("/lotus/lotus-bloom.jpg", (bloomTex) => {
      bloomTex.colorSpace = THREE.SRGBColorSpace;

      // Pass real bloom texture to water reflection
      waterUniforms.uReflectionTex.value = bloomTex;

      // 6a. Main Flower Body (Concave 3D curved geometry with GPU organic cutout)
      const flowerGeo = new THREE.PlaneGeometry(3.6, 3.6, 36, 36);
      const posAttr = flowerGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const r2 = x * x + y * y;
        posAttr.setZ(i, -r2 * 0.12);
      }
      flowerGeo.computeVertexNormals();

      const flowerMat = new THREE.ShaderMaterial({
        uniforms: {
          uBloomTex: { value: bloomTex },
          uCoreGlow: { value: 1.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uBloomTex;
          uniform float uCoreGlow;
          varying vec2 vUv;
          varying vec3 vNormal;

          void main() {
            vec2 uvOffset = (vUv - vec2(0.50, 0.47)) / vec2(0.35, 0.32);
            float dist = length(uvOffset);

            // Discard any pixel outside organic petal bounds
            if (dist >= 1.0) discard;

            // Smooth feathered fade at outer petal edges
            float alpha = 1.0 - smoothstep(0.68, 0.98, dist);

            vec4 tex = texture2D(uBloomTex, vUv);

            // Botanical directional lighting
            vec3 lightDir = normalize(vec3(0.3, 0.8, 0.9));
            float diff = max(dot(vNormal, lightDir), 0.0) * 0.35 + 0.70;

            // Receptacle core glow
            float centerDist = length((vUv - vec2(0.50, 0.47)) / vec2(0.12, 0.12));
            float glow = clamp(1.0 - centerDist, 0.0, 1.0) * uCoreGlow;
            vec3 coreCol = vec3(1.0, 0.85, 0.35) * glow * 0.30;

            gl_FragColor = vec4(tex.rgb * diff + coreCol, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const flowerMesh = new THREE.Mesh(flowerGeo, flowerMat);
      flowerMesh.position.set(0, 0, 0);
      flowerGroup.add(flowerMesh);

      // 6d. The 3D Detachable Petal for Authentication (Positioned on mid-tier right petal)
      const petalGeo = new THREE.PlaneGeometry(0.75, 1.3, 16, 16);
      const pAttr = petalGeo.attributes.position;
      for (let i = 0; i < pAttr.count; i++) {
        const px = pAttr.getX(i);
        const py = pAttr.getY(i);
        pAttr.setZ(i, (1.0 - Math.abs(px) * 2.2) * 0.06 - py * 0.05);
      }
      petalGeo.computeVertexNormals();

      const petalMat = new THREE.ShaderMaterial({
        uniforms: {
          uBloomTex: { value: bloomTex },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uBloomTex;
          varying vec2 vUv;
          varying vec3 vNormal;

          void main() {
            // Map strictly to an individual right petal from the photograph
            vec2 petalUv = vec2(0.62 + vUv.x * 0.16, 0.36 + vUv.y * 0.22);
            vec4 tex = texture2D(uBloomTex, clamp(petalUv, 0.0, 1.0));

            // Feathered petal outline
            float edgeX = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
            float edgeY = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
            float alpha = edgeX * edgeY;

            if (alpha <= 0.02) discard;

            vec3 lightDir = normalize(vec3(0.4, 0.8, 0.9));
            float diff = max(dot(vNormal, lightDir), 0.0) * 0.35 + 0.70;

            gl_FragColor = vec4(tex.rgb * diff, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const detachablePetalMesh = new THREE.Mesh(petalGeo, petalMat);
      detachablePetalMesh.position.set(0.46, 0.12, 0.18);
      detachablePetalMesh.rotation.set(0.12, -0.22, 0.28);
      flowerGroup.add(detachablePetalMesh);
      detachablePetalMeshRef.current = detachablePetalMesh;

      setIsLoaded(true);
    });

    // 7. Interactive Pointer & Click Event Listeners
    let rippleIndex = 0;
    const raycaster = new THREE.Raycaster();
    const planeIntersectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0.3), 0.6);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseRef.current.vx = (normX - mouseRef.current.targetX) * 28;
      mouseRef.current.vy = (normY - mouseRef.current.targetY) * 28;
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;

      // Soft wind force with proximity
      const windForceX = Math.max(-1.2, Math.min(1.2, mouseRef.current.vx * 0.45));
      const windForceY = Math.max(-0.8, Math.min(0.8, mouseRef.current.vy * 0.35));
      windSpringRef.current.targetX = windForceX;
      windSpringRef.current.targetY = windForceY;
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Raycast to find exact 3D water intersection
      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
      const hitPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeIntersectionPlane, hitPoint);

      if (hitPoint) {
        // Spawn realistic circular water ripple wave
        const now = performance.now() / 1000;
        const uRipples = waterUniforms.uRipples.value;
        uRipples[rippleIndex] = new THREE.Vector4(hitPoint.x, hitPoint.y, now, 0.08);
        rippleIndex = (rippleIndex + 1) % 12;

        ripplesRef.current.push({
          x: hitPoint.x,
          y: hitPoint.y,
          time: now,
          maxRadius: 3.5,
          speed: 1.8,
          amplitude: 0.08,
        });

        // Check if click was in flower center to trigger zoom
        const distToCenter = Math.hypot(normX, normY - 0.1);
        if (distToCenter < 0.22) {
          onCenterClick();
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerdown", handlePointerDown);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 8. High-Performance Render Loop
    let lastTime = performance.now();
    let animationFrameId: number;

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const t = now / 1000;

      // Mouse Parallax Smoothing (Spring Damped)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 4.0 * dt;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 4.0 * dt;

      // Natural Wind Inertia & Spring Decay
      const k = 12.0; // Spring stiffness
      const d = 4.5; // Damping
      const fX = -k * windSpringRef.current.x - d * windSpringRef.current.vx + windSpringRef.current.targetX * 8.0;
      const fY = -k * windSpringRef.current.y - d * windSpringRef.current.vy + windSpringRef.current.targetY * 6.0;
      windSpringRef.current.vx += fX * dt;
      windSpringRef.current.vy += fY * dt;
      windSpringRef.current.x += windSpringRef.current.vx * dt;
      windSpringRef.current.y += windSpringRef.current.vy * dt;
      windSpringRef.current.targetX *= 0.92;
      windSpringRef.current.targetY *= 0.92;

      // Update Water Shader Uniforms
      waterUniforms.uTime.value = t;
      waterUniforms.uWind.value.set(windSpringRef.current.x, windSpringRef.current.y);

      // Camera State Control
      const currentState = stateRef.current;

      if (!shouldReduceMotion) {
        if (currentState === "LOTUS_ZOOMING" || currentState === "DISCOVERY_CENTER") {
          // Camera glides straight along Z into the golden lotus center
          camera.position.z += (0.95 - camera.position.z) * 2.8 * dt;
          camera.position.y += (0.15 - camera.position.y) * 2.8 * dt;
          camera.position.x += (0 - camera.position.x) * 2.8 * dt;
        } else {
          // Subtle camera parallax based on mouse
          const targetCamX = mouseRef.current.x * 0.45;
          const targetCamY = 0.35 + mouseRef.current.y * 0.28;
          const targetCamZ = currentState === "SIGN_IN_PETAL" ? 4.6 : 5.2;

          camera.position.x += (targetCamX - camera.position.x) * 3.5 * dt;
          camera.position.y += (targetCamY - camera.position.y) * 3.5 * dt;
          camera.position.z += (targetCamZ - camera.position.z) * 3.5 * dt;
        }

        // Flower 3D Wind Sway & Aquatic Floating Bobbing
        if (flowerGroupRef.current) {
          const bobY = Math.sin(t * 1.5) * 0.025;
          const bobTiltX = Math.cos(t * 1.2) * 0.015;
          const windTiltZ = windSpringRef.current.x * 0.14;
          const windTiltY = windSpringRef.current.y * 0.12;

          flowerGroupRef.current.position.y = 0.35 + bobY;
          flowerGroupRef.current.rotation.z = windTiltZ;
          flowerGroupRef.current.rotation.y = windTiltY + mouseRef.current.x * 0.15;
          flowerGroupRef.current.rotation.x = bobTiltX - mouseRef.current.y * 0.12;

          // Scale flower up when zooming
          if (currentState === "LOTUS_ZOOMING" || currentState === "DISCOVERY_CENTER") {
            const currentScale = flowerGroupRef.current.scale.x;
            const targetScale = currentState === "DISCOVERY_CENTER" ? 4.8 : 3.8;
            flowerGroupRef.current.scale.setScalar(currentScale + (targetScale - currentScale) * 2.5 * dt);
          } else {
            flowerGroupRef.current.scale.setScalar(1);
          }
        }

        // Detachable Petal Animation for Sign-In
        if (detachablePetalMeshRef.current) {
          const petal = detachablePetalMeshRef.current;
          if (currentState === "SIGN_IN_PETAL") {
            // Petal separates, pitches in 3D, and flies toward camera
            const targetZ = 3.6;
            const targetX = 0.0;
            const targetY = 0.05;
            petal.position.x += (targetX - petal.position.x) * 3.2 * dt;
            petal.position.y += (targetY - petal.position.y) * 3.2 * dt;
            petal.position.z += (targetZ - petal.position.z) * 3.2 * dt;
            petal.rotation.x += (0.05 - petal.rotation.x) * 3.0 * dt;
            petal.rotation.y += (0.0 - petal.rotation.y) * 3.0 * dt;
            petal.rotation.z += (0.08 - petal.rotation.z) * 3.0 * dt;
            petal.scale.setScalar(1.65);
          } else {
            // Docked cleanly onto the flower
            petal.position.set(0.42, 0.15, 0.18);
            petal.rotation.set(0.12, -0.22, 0.28);
            petal.scale.setScalar(1);
          }
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 9. Teardown & Resource Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleResize);

      // Dispose Three.js geometries, materials, and renderer
      waterGeo.dispose();
      waterMat.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [shouldReduceMotion, onCenterClick, onPetalClick]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-auto select-none transition-all duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      } ${experienceState === "SIGN_IN_PETAL" ? "filter blur-md brightness-75 scale-[1.02]" : ""}`}
      style={{ touchAction: "none" }}
    />
  );
}
