import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function VoiceCore3D({ currentState = 'IDLE', statusMessage = 'System Ready', audioData = 0 }) {
  const mountRef = useRef(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Black + Neon Yellow / Gold Color Palette Mapping
  const stateColorMap = {
    IDLE: { core: '#FFD400', ring: '#FFB800', outer: '#D97706' },
    LISTENING: { core: '#FFE600', ring: '#FFD400', outer: '#FFB800' },
    THINKING: { core: '#FFB800', ring: '#FFD400', outer: '#B45309' },
    SPEAKING: { core: '#FFD400', ring: '#FFE600', outer: '#FFB800' },
    INTERRUPTED: { core: '#EF4444', ring: '#F97316', outer: '#DC2626' },
    RECOVERING: { core: '#F59E0B', ring: '#FFD400', outer: '#FFB800' },
    SUCCESS: { core: '#10B981', ring: '#34D399', outer: '#059669' },
    ERROR: { core: '#EF4444', ring: '#B91C1C', outer: '#7F1D1D' },
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let coreMesh, ringMesh1, ringMesh2, particlesMesh, waveRings = [];

    try {
      // 1. Scene Setup
      scene = new THREE.Scene();
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 400;

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 12;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // 2. Central Core Sphere
      const coreGeo = new THREE.IcosahedronGeometry(2, 4);
      const coreMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(stateColorMap[currentState]?.core || '#FFD400'),
        wireframe: true,
        transparent: true,
        opacity: 0.85
      });
      coreMesh = new THREE.Mesh(coreGeo, coreMat);
      scene.add(coreMesh);

      // 3. Inner Glowing Sphere
      const innerGeo = new THREE.SphereGeometry(1.4, 32, 32);
      const innerMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(stateColorMap[currentState]?.core || '#FFD400'),
        transparent: true,
        opacity: 0.6
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      coreMesh.add(innerMesh);

      // 4. Orbital Ring 1 (Yellow)
      const ringGeo1 = new THREE.TorusGeometry(3.2, 0.03, 16, 100);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: new THREE.Color(stateColorMap[currentState]?.ring || '#FFB800'),
        transparent: true,
        opacity: 0.75
      });
      ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
      ringMesh1.rotation.x = Math.PI / 3;
      scene.add(ringMesh1);

      // 5. Orbital Ring 2 (Gold)
      const ringGeo2 = new THREE.TorusGeometry(3.8, 0.02, 16, 100);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: new THREE.Color(stateColorMap[currentState]?.outer || '#D97706'),
        transparent: true,
        opacity: 0.55
      });
      ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
      ringMesh2.rotation.y = Math.PI / 4;
      scene.add(ringMesh2);

      // 6. Floating Particle Field (Yellow/Gold Atmosphere)
      const particleCount = 280;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 16;
        particlePositions[i + 1] = (Math.random() - 0.5) * 16;
        particlePositions[i + 2] = (Math.random() - 0.5) * 16;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: new THREE.Color('#FFD400'),
        size: 0.09,
        transparent: true,
        opacity: 0.6
      });
      particlesMesh = new THREE.Points(particleGeo, particleMat);
      scene.add(particlesMesh);

      // 7. Audio Wave Rings (for SPEAKING & LISTENING)
      for (let i = 0; i < 3; i++) {
        const wGeo = new THREE.RingGeometry(2 + i * 0.8, 2.05 + i * 0.8, 64);
        const wMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(stateColorMap[currentState]?.core || '#FFD400'),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35 - i * 0.09
        });
        const wMesh = new THREE.Mesh(wGeo, wMat);
        wMesh.rotation.x = Math.PI / 2;
        scene.add(wMesh);
        waveRings.push(wMesh);
      }

      // Animation loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Update colors smoothly according to state
        const targetColor = new THREE.Color(stateColorMap[currentState]?.core || '#FFD400');
        const targetRingColor = new THREE.Color(stateColorMap[currentState]?.ring || '#FFB800');
        coreMat.color.lerp(targetColor, 0.05);
        innerMat.color.lerp(targetColor, 0.05);
        ringMat1.color.lerp(targetRingColor, 0.05);

        // Core Rotations & Pulse Dynamics
        let pulseFactor = 1.0;

        if (currentState === 'IDLE') {
          pulseFactor = 1.0 + Math.sin(elapsedTime * 1.5) * 0.05;
          coreMesh.rotation.y = elapsedTime * 0.2;
          coreMesh.rotation.x = elapsedTime * 0.1;
          ringMesh1.rotation.z = elapsedTime * 0.3;
          ringMesh2.rotation.z = -elapsedTime * 0.2;
        } else if (currentState === 'LISTENING') {
          pulseFactor = 1.15 + (audioData / 255) * 0.45 + Math.sin(elapsedTime * 6) * 0.08;
          coreMesh.rotation.y = elapsedTime * 0.7;
          ringMesh1.rotation.z = elapsedTime * 0.9;
        } else if (currentState === 'THINKING') {
          pulseFactor = 1.0 + Math.sin(elapsedTime * 5) * 0.12;
          coreMesh.rotation.y = elapsedTime * 1.6;
          coreMesh.rotation.z = elapsedTime * 1.1;
          ringMesh1.rotation.z = elapsedTime * 1.3;
          ringMesh2.rotation.y = elapsedTime * 1.5;
        } else if (currentState === 'SPEAKING') {
          pulseFactor = 1.05 + (audioData / 255) * 0.55 + Math.sin(elapsedTime * 8) * 0.12;
          coreMesh.rotation.y = elapsedTime * 0.9;
          ringMesh1.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 4) * 0.22;
          
          // Animate wave rings expanding outward
          waveRings.forEach((wave, idx) => {
            const scale = 1 + ((elapsedTime * 1.6 + idx * 0.4) % 1.5);
            wave.scale.set(scale, scale, scale);
            wave.material.opacity = (1 - (scale - 1) / 1.5) * 0.45;
          });
        } else if (currentState === 'INTERRUPTED') {
          pulseFactor = 0.7 + Math.random() * 0.2;
          coreMesh.rotation.y = elapsedTime * 3.0;
          ringMesh1.rotation.z = elapsedTime * 4.0;
        } else if (currentState === 'RECOVERING') {
          pulseFactor = 0.9 + Math.sin(elapsedTime * 10) * 0.15;
          coreMesh.rotation.y = elapsedTime * 1.2;
        }

        coreMesh.scale.set(pulseFactor, pulseFactor, pulseFactor);

        // Particle rotation
        if (particlesMesh) {
          particlesMesh.rotation.y = elapsedTime * 0.05;
        }

        renderer.render(scene, camera);
      };

      animate();

      // Handle Resize
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.warn("WebGL initialization fallback:", err);
      setWebGlSupported(false);
    }
  }, [currentState]);

  return (
    <div className="relative w-full h-[360px] md:h-[420px] flex items-center justify-center overflow-hidden">
      {/* Background ambient lighting radial gradient (Neon Yellow/Gold) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFD400]/10 via-[#FFB800]/5 to-transparent rounded-3xl pointer-events-none"></div>

      {/* 3D WebGL Canvas Container */}
      {webGlSupported ? (
        <div ref={mountRef} className="w-full h-full cursor-pointer flex items-center justify-center"></div>
      ) : (
        /* 2D Canvas Fallback */
        <div className="relative flex items-center justify-center w-64 h-64">
          <div className="absolute inset-0 rounded-full border-2 border-[#FFD400]/40 animate-ping"></div>
          <div className="absolute w-48 h-48 rounded-full border border-[#FFB800]/50 animate-spin-slow"></div>
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FFD400] to-[#FFB800] shadow-glow-yellow flex items-center justify-center animate-pulse">
            <span className="font-mono text-xs text-black font-bold tracking-widest">{currentState}</span>
          </div>
        </div>
      )}

      {/* Dynamic State Overlay Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-[#FFD400]/30 shadow-glow-yellow">
          <span className={`w-2.5 h-2.5 rounded-full ${
            currentState === 'SPEAKING' ? 'bg-[#FFD400] animate-ping' :
            currentState === 'INTERRUPTED' ? 'bg-red-500 animate-bounce' :
            currentState === 'THINKING' ? 'bg-[#FFB800] animate-pulse' :
            currentState === 'LISTENING' ? 'bg-emerald-400 animate-ping' : 'bg-[#FFD400]/80'
          }`}></span>
          <span className="text-xs font-mono font-bold tracking-widest text-[#FFD400] uppercase">
            {currentState}
          </span>
        </div>
        <p className="text-xs text-slate-300 font-mono tracking-wide bg-[#050505]/90 px-3.5 py-1 rounded-md border border-zinc-800">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}
