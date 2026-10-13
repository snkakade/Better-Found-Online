import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

type BrandTunnelProps = {
  paused?: boolean;
  reducedMotion?: boolean;
};

const textureSources = [
  "/assets/portals.webp",
  "/assets/macro.webp",
  "/assets/connect.webp",
];

const cardLayout = [
  { x: 5.45, y: 0.95, z: -8, ry: -0.48, scale: 0.58 },
  { x: -5.3, y: -0.75, z: -21, ry: 0.48, scale: 0.56 },
  { x: 5.25, y: 0.35, z: -34, ry: -0.46, scale: 0.52 },
];

const frameDepths = [-4, -14, -24, -34];
const tunnelSpan = 40;
const nearPlane = -5;

const wrapAhead = (worldZ: number, cameraZ: number) => {
  let relativeZ = worldZ - cameraZ;
  while (relativeZ > nearPlane) relativeZ -= tunnelSpan;
  while (relativeZ <= nearPlane - tunnelSpan) relativeZ += tunnelSpan;
  return cameraZ + relativeZ;
};

function makeGlowTexture() {
  const surface = document.createElement("canvas");
  surface.width = 256;
  surface.height = 256;
  const context = surface.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(209, 167, 146, 0.42)");
  gradient.addColorStop(0.34, "rgba(151, 92, 91, 0.15)");
  gradient.addColorStop(1, "rgba(23, 17, 19, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function BrandTunnel({ paused = false, reducedMotion = false }: BrandTunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const journey = section?.closest<HTMLElement>(".hero-journey");
    if (!canvas || !section || !journey) return;

    gsap.registerPlugin(ScrollTrigger);

    const scene = new THREE.Scene();
    const startColor = new THREE.Color(0x0c0b0d);
    const endColor = new THREE.Color(0x191014);
    const clearColor = startColor.clone();
    scene.background = clearColor;
    scene.fog = new THREE.Fog(0x0c0b0d, 7, 37);

    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 90);
    camera.position.set(0, 0, 9.6);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    const world = new THREE.Group();
    scene.add(world);

    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(12, 7, 60),
      new THREE.MeshBasicMaterial({
        color: 0x381720,
        depthWrite: false,
        opacity: 0.12,
        side: THREE.BackSide,
        transparent: true,
      }),
    );
    shell.position.z = -20;
    world.add(shell);

    const ambient = new THREE.AmbientLight(0xd9c9c0, 0.42);
    const key = new THREE.PointLight(0xd2a28f, 22, 34, 1.7);
    key.position.set(2.5, 3.5, 4);
    const rim = new THREE.PointLight(0x6f3545, 24, 44, 1.85);
    rim.position.set(-4, -1.5, -16);
    scene.add(ambient, key, rim);

    const frameMaterial = new THREE.MeshBasicMaterial({
      color: 0x9b706b,
      depthWrite: false,
      transparent: true,
      opacity: 0.2,
    });
    const frames = frameDepths.map((z, index) => {
      const frame = new THREE.Group();
      const width = 11.6;
      const height = 6.65;
      const beam = 0.055;
      const depth = 0.16;
      const material = frameMaterial.clone();
      material.opacity = 0.2 - index * 0.018;
      const top = new THREE.Mesh(new THREE.BoxGeometry(width, beam, depth), material);
      const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, beam, depth), material);
      const left = new THREE.Mesh(new THREE.BoxGeometry(beam, height, depth), material);
      const right = new THREE.Mesh(new THREE.BoxGeometry(beam, height, depth), material);
      top.position.y = height / 2;
      bottom.position.y = -height / 2;
      left.position.x = -width / 2;
      right.position.x = width / 2;
      frame.add(top, bottom, left, right);
      frame.position.z = z;
      world.add(frame);
      return frame;
    });

    const glowTexture = makeGlowTexture();
    const glowMaterial = glowTexture
      ? new THREE.SpriteMaterial({
          map: glowTexture,
          color: 0xd0a291,
          transparent: true,
          opacity: 0.38,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      : null;
    if (glowMaterial) {
      glowMaterial.opacity = 0.22;
      const glow = new THREE.Sprite(glowMaterial);
      glow.position.set(0, 0, -36);
      glow.scale.set(12, 12, 1);
      world.add(glow);
    }

    const textureLoader = new THREE.TextureLoader();
    const textures = textureSources.map((source) => {
      const texture = textureLoader.load(source, () => renderer.render(scene, camera));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      return texture;
    });

    const cards = cardLayout.map((layout, index) => {
      const cardGroup = new THREE.Group();
      const imageMaterial = new THREE.MeshBasicMaterial({
        map: textures[index % textures.length],
        color: 0xd8d0cc,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const image = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 2.05), imageMaterial);
      const backingMaterial = new THREE.MeshBasicMaterial({
        color: 0x24161b,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
      });
      const backing = new THREE.Mesh(new THREE.PlaneGeometry(3.38, 2.18), backingMaterial);
      backing.position.z = -0.04;
      cardGroup.add(backing, image);
      cardGroup.position.set(layout.x, layout.y, layout.z);
      cardGroup.rotation.set(0, layout.ry, 0);
      cardGroup.scale.setScalar(layout.scale);
      world.add(cardGroup);
      return { group: cardGroup, material: imageMaterial, backing: backingMaterial };
    });

    let targetProgress = 0;
    let currentProgress = 0;
    const trigger = ScrollTrigger.create({
      trigger: journey,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!reducedMotion && !paused) targetProgress = self.progress;
      },
    });
    targetProgress = trigger.progress;

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      if (!hasFinePointer || reducedMotion || paused) return;
      pointerTarget.set(
        (event.clientX / window.innerWidth - 0.5) * 0.85,
        (event.clientY / window.innerHeight - 0.5) * 0.55,
      );
    };
    const onPointerLeave = () => pointerTarget.set(0, 0);

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, window.innerHeight);
      const narrow = width < 768;
      const tunnelWidthScale = narrow ? 0.56 : 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      shell.scale.x = tunnelWidthScale;
      frames.forEach((frame) => frame.scale.set(tunnelWidthScale, narrow ? 1.06 : 1, 1));
      cards.forEach((card, index) => {
        card.group.position.x = cardLayout[index].x * tunnelWidthScale;
        card.group.scale.setScalar(cardLayout[index].scale * (narrow ? 0.86 : 1));
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, narrow ? 1.25 : 1.6));
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(section);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    let frame = 0;
    let running = true;
    const startTime = performance.now();
    const render = () => {
      if (!running) return;
      const elapsed = (performance.now() - startTime) / 1000;
      const motionTime = reducedMotion || paused ? 0 : elapsed;
      const intro = reducedMotion || paused ? 1 : Math.min(1, elapsed / 0.9);
      const introEase = 1 - Math.pow(1 - intro, 3);

      currentProgress += (targetProgress - currentProgress) * (reducedMotion || paused ? 1 : 0.06);
      pointer.lerp(pointerTarget, reducedMotion || paused ? 1 : 0.045);

      const travelDistance = window.innerWidth < 768 ? 17 : 22;
      const travel = currentProgress * travelDistance;
      camera.position.x = pointer.x * 0.42 + Math.sin(currentProgress * Math.PI) * 0.18;
      camera.position.y = -pointer.y * 0.35 + Math.sin(currentProgress * Math.PI * 0.8) * 0.1;
      camera.position.z = THREE.MathUtils.lerp(10.2, 8.4, introEase) - travel;
      camera.rotation.z = Math.sin(currentProgress * Math.PI) * 0.006;
      camera.lookAt(camera.position.x * 0.035, camera.position.y * 0.035, camera.position.z - 14);

      world.rotation.z = Math.sin(motionTime * 0.1) * 0.003;
      frames.forEach((frame, index) => {
        frame.position.z = wrapAhead(frameDepths[index], camera.position.z);
      });
      cards.forEach((card, index) => {
        card.material.opacity = 0.18;
        card.backing.opacity = 0.28;
        card.group.position.z = wrapAhead(cardLayout[index].z, camera.position.z);
        card.group.position.y = cardLayout[index].y + Math.sin(motionTime * 0.28 + index * 1.7) * 0.055;
      });

      clearColor.copy(startColor).lerp(endColor, THREE.MathUtils.smoothstep(currentProgress, 0.38, 1));
      if (scene.fog) scene.fog.color.copy(clearColor);
      renderer.setClearColor(clearColor, 1);
      renderer.render(scene, camera);
      if (!reducedMotion && !paused) frame = window.requestAnimationFrame(render);
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const shouldRun = entry.isIntersecting;
        if (shouldRun === running) return;
        running = shouldRun;
        if (running) {
          render();
        } else {
          window.cancelAnimationFrame(frame);
        }
      },
      { rootMargin: "20% 0px" },
    );

    visibilityObserver.observe(journey);
    resize();
    if (reducedMotion || paused) {
      targetProgress = trigger.progress;
      currentProgress = targetProgress;
    }
    render();

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      trigger.kill();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      world.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => material.dispose());
        }
        if (child instanceof THREE.Sprite) child.material.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      glowTexture?.dispose();
      glowMaterial?.dispose();
      renderer.dispose();
    };
  }, [paused, reducedMotion]);

  return (
    <div className="brand-tunnel" ref={sectionRef} aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="brand-tunnel-atmosphere" />
      <div className="brand-tunnel-vignette" />
    </div>
  );
}
