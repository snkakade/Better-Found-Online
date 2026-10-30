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
  { x: -6.6, y: 2.5, z: -5.5, ry: 0.2, scale: 0.78 },
  { x: 6.2, y: -2.25, z: -11.5, ry: -0.2, scale: 0.82 },
  { x: -6.1, y: -2.05, z: -17.5, ry: 0.18, scale: 0.84 },
  { x: 6.7, y: 2.35, z: -23.5, ry: -0.19, scale: 0.8 },
  { x: -5.7, y: 2.8, z: -29.5, ry: 0.17, scale: 0.84 },
  { x: 6.35, y: -2.55, z: -35.5, ry: -0.18, scale: 0.8 },
];

const tunnelSpan = 36;
// Recycle an object only after it has crossed behind the camera. Recycling it
// while it was still eight world units ahead made cards visibly vanish instead
// of letting the viewer travel past them.
const recyclePlane = 2.4;

const wrapAhead = (worldZ: number, cameraZ: number) => {
  let relativeZ = worldZ - cameraZ;
  while (relativeZ > recyclePlane) relativeZ -= tunnelSpan;
  while (relativeZ <= recyclePlane - tunnelSpan) relativeZ += tunnelSpan;
  return cameraZ + relativeZ;
};

function makeGlowTexture() {
  const surface = document.createElement("canvas");
  surface.width = 256;
  surface.height = 256;
  const context = surface.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(187, 35, 43, 0.42)");
  gradient.addColorStop(0.34, "rgba(32, 48, 154, 0.15)");
  gradient.addColorStop(1, "rgba(32, 48, 154, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Preserve the signature tunnel on phones. Design variance 6 / motion 7 /
// density 4: native page scrolling, one approaching image, no pinned text.
export function BrandTunnel({ paused = false, reducedMotion = false }: BrandTunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const journey = section?.closest<HTMLElement>(".tunnel-journey");
    if (!canvas || !section || !journey) return;
    let compact = window.matchMedia("(max-width: 900px)").matches;
    const motionAllowed = !reducedMotion && !paused && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const beats = Array.from(journey.querySelectorAll<HTMLElement>(".story-beat"));
    const slots = beats.map(beat => beat.querySelector<HTMLImageElement>(".story-beat-media"));

    gsap.registerPlugin(ScrollTrigger);

    const scene = new THREE.Scene();
    const startColor = new THREE.Color(0x20309a);
    const endColor = new THREE.Color(0x20309a);
    const clearColor = startColor.clone();
    scene.background = clearColor;
    scene.fog = new THREE.Fog(0x20309a, 7, 37);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 90);
    camera.position.set(0, 0, 9.6);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !compact,
        alpha: false,
        powerPreference: compact ? "low-power" : "high-performance",
      });
    } catch {
      // The chapter images remain available as ordinary HTML when WebGL is unavailable.
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    const world = new THREE.Group();
    scene.add(world);

    const ambient = new THREE.AmbientLight(0xffffff, 0.52);
    const key = new THREE.PointLight(0xffffff, 28, 34, 1.65);
    key.position.set(4, 4, 5);
    const rim = new THREE.PointLight(0xbb232b, 34, 40, 1.8);
    rim.position.set(-5, -2, -13);
    scene.add(ambient, key, rim);

    const sculptureMaterial = new THREE.MeshStandardMaterial({
      color: 0xbb232b,
      metalness: compact ? 0.56 : 0.76,
      roughness: 0.32,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const sculpture = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.25, 0.42, compact ? 96 : 150, compact ? 12 : 18, 2, 3),
      sculptureMaterial,
    );
    sculpture.position.set(5.25, 1.35, -12);
    sculpture.scale.setScalar(0.86);
    sculpture.rotation.set(0.72, -0.34, 0.16);
    world.add(sculpture);

    const veilMaterial = new THREE.MeshBasicMaterial({
      color: 0xbb232b,
      transparent: true,
      opacity: compact ? 0.025 : 0.085,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const veilGeometry = new THREE.SphereGeometry(9, 40, 24, 0, Math.PI * 1.55, 0, Math.PI);
    const veil = new THREE.Mesh(veilGeometry, veilMaterial);
    veil.scale.set(2.05, 0.78, 1);
    veil.position.set(0, 0, -20);
    veil.rotation.set(0.22, 0.68, -0.16);
    world.add(veil);

    const portalMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const portals = [-7, -18, -30].map((z, index) => {
      const portal = new THREE.Mesh(
        new THREE.TorusGeometry(7.2 + index * 0.5, 0.022 + index * 0.006, 8, 96),
        portalMaterial.clone(),
      );
      portal.position.set(index % 2 === 0 ? 0.8 : -0.7, index === 1 ? 0.8 : -0.3, z);
      portal.rotation.set(index === 1 ? 0.18 : -0.12, index === 1 ? -0.16 : 0.12, index * 0.22);
      portal.scale.y = 0.68;
      world.add(portal);
      return portal;
    });

    const glowTexture = makeGlowTexture();
    const glowMaterial = glowTexture
      ? new THREE.SpriteMaterial({
          map: glowTexture,
          color: 0xbb232b,
          transparent: true,
          opacity: 0.38,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      : null;
    if (glowMaterial) {
      [
        { x: 5.4, y: 2.7, z: -4, s: 10 },
        { x: -5.8, y: -2.1, z: -15, s: 13 },
        { x: 3, y: 1, z: -27, s: 15 },
      ].forEach(({ x, y, z, s }) => {
        const glow = new THREE.Sprite(glowMaterial.clone());
        glow.position.set(x, y, z);
        glow.scale.set(s, s, 1);
        world.add(glow);
      });
    }

    const textureLoader = new THREE.TextureLoader();
    let disposed = false;
    let loadedTextures = 0;
    const textures = textureSources.map((source) => {
      const texture = textureLoader.load(source, () => {
        if (disposed) return;
        loadedTextures += 1;
        renderer.render(scene, camera);
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      return texture;
    });

    const cards = cardLayout.map((layout, index) => {
      const cardGroup = new THREE.Group();
      const imageMaterial = new THREE.MeshBasicMaterial({
        map: textures[index % textures.length],
        color: 0xffffff,
        transparent: true,
        opacity: 0.56,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const image = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 3.05), imageMaterial);
      const backingMaterial = new THREE.MeshBasicMaterial({
        color: 0x20309a,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const backing = new THREE.Mesh(new THREE.PlaneGeometry(5.08, 3.23), backingMaterial);
      backing.position.z = -0.04;
      cardGroup.add(backing, image);
      cardGroup.position.set(layout.x, layout.y, layout.z);
      cardGroup.rotation.set(index % 2 ? -0.05 : 0.06, layout.ry, index % 2 ? -0.07 : 0.08);
      cardGroup.scale.setScalar(layout.scale);
      world.add(cardGroup);
      return { group: cardGroup, material: imageMaterial, backing: backingMaterial };
    });

    // These are scene objects, not images crossfading over the canvas. Each
    // chapter travels from the vanishing point to the reading position, then
    // past the camera, using the same perspective and fog as the tunnel.
    const chapterCards = textures.map((texture) => {
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const group = new THREE.Group();
      group.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material));
      group.visible = false;
      scene.add(group);
      return { group, material, targetProgress: 0, progress: 0, slot: { left: 0, top: 0, width: 0, height: 0 } };
    });
    const measureSlot = (index: number) => {
      const rect = slots[index]?.getBoundingClientRect();
      // The sticky surface starts leaving with the last chapter. Measure in
      // its local viewport so the final image does not slip away from its slot.
      if (rect) chapterCards[index].slot = { left: rect.left, top: rect.top - section.getBoundingClientRect().top, width: rect.width, height: rect.height };
    };
    const chapterTriggers = !motionAllowed ? [] : beats.map((beat, index) => {
      const chapter = chapterCards[index];
      const chapterTrigger = ScrollTrigger.create({
        trigger: beat,
        start: () => compact ? "top 92%" : "top 80%",
        end: () => compact ? "bottom top" : "bottom 50%",
        invalidateOnRefresh: true,
        onUpdate: (self) => { chapter.targetProgress = self.progress; if (compact) measureSlot(index); },
        onRefresh: (self) => { chapter.targetProgress = self.progress; if (compact) measureSlot(index); },
      });
      chapter.targetProgress = chapter.progress = chapterTrigger.progress;
      return chapterTrigger;
    });

    let targetProgress = 0;
    let currentProgress = 0;
    const trigger = ScrollTrigger.create({
      trigger: journey,
      start: "top top",
      // Continue travelling while the sticky canvas itself leaves the viewport.
      // `bottom bottom` completed the tunnel one viewport too early, leaving a
      // visibly frozen final frame behind the story-intro copy.
      end: "bottom top",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (motionAllowed) targetProgress = self.progress;
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

    let travelDistance = 20;
    let sceneSpread = 1;
    const chapterDepth = 7.5;
    const chapterPosition = new THREE.Vector3();
    const chapterRestPosition = new THREE.Vector2();
    let chapterMaxWidth = 1;
    let chapterMaxHeight = 1;
    let pixelsToWorld = 1;
    let viewportWidth = 1;
    let viewportHeight = 1;
    let viewportLeft = 0;
    const resize = () => {
      const rect = section.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      compact = width <= 900;
      viewportWidth = width;
      viewportHeight = height;
      viewportLeft = rect.left;
      const journeyScreens = journey.offsetHeight / height;
      const distancePerScreen = width < 768 ? 7 : 8;
      travelDistance = THREE.MathUtils.clamp(
        journeyScreens * distancePerScreen,
        width < 768 ? 16 : 20,
        width < 768 ? 44 : 56,
      );
      sceneSpread = width < 768 ? 0.56 : width < 1100 ? 0.8 : 1;
      sculpture.position.x = 5.25 * sceneSpread;
      sculpture.position.y = width < 768 ? 1.8 : 1.35;
      cards.forEach((card, index) => {
        card.group.position.x = cardLayout[index].x * sceneSpread;
      });
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const halfViewHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * chapterDepth;
      pixelsToWorld = halfViewHeight * 2 / height;
      const stage = journey.querySelector<HTMLElement>(".story-stage");
      const inner = journey.querySelector<HTMLElement>(".story-stage-inner");
      if (!compact && stage && inner) {
        const stageRect = stage.getBoundingClientRect();
        const innerRect = inner.getBoundingClientRect();
        const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0;
        chapterRestPosition.set(
          ((innerRect.left + innerRect.width / 2) / width * 2 - 1) * halfViewHeight * camera.aspect,
          (1 - (stickyTop + stageRect.height / 2) / height * 2) * halfViewHeight,
        );
        chapterMaxWidth = innerRect.width * 0.92;
        chapterMaxHeight = stageRect.height * 0.72;
      }
      if (compact) slots.forEach((_, index) => measureSlot(index));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.25 : 1.6));
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(section);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    let frame = 0;
    let running = true;
    let contextLost = false;
    const startTime = performance.now();
    const render = () => {
      if (!running || contextLost || disposed) return;
      const elapsed = (performance.now() - startTime) / 1000;
      const motionTime = reducedMotion || paused ? 0 : elapsed;
      const intro = reducedMotion || paused ? 1 : Math.min(1, elapsed / 0.9);
      const introEase = 1 - Math.pow(1 - intro, 3);

      currentProgress += (targetProgress - currentProgress) * (reducedMotion || paused ? 1 : 0.06);
      pointer.lerp(pointerTarget, reducedMotion || paused ? 1 : 0.045);

      const travel = currentProgress * travelDistance;
      camera.position.x = pointer.x + Math.sin(currentProgress * Math.PI * 1.25) * 0.48;
      camera.position.y = -pointer.y + Math.sin(currentProgress * Math.PI * 0.8) * 0.28;
      camera.position.z = THREE.MathUtils.lerp(10.2, 8.4, introEase) - travel;
      camera.rotation.z = Math.sin(currentProgress * Math.PI) * 0.018;
      camera.lookAt(camera.position.x * 0.08, camera.position.y * 0.05, camera.position.z - 12);
      camera.updateMatrixWorld();

      let chapterActive = false;
      chapterCards.forEach((chapter, index) => {
        chapter.progress += (chapter.targetProgress - chapter.progress) * 0.12;
        const progress = chapter.progress;
        const visible = motionAllowed && loadedTextures === textureSources.length && progress > 0.001 && progress < 0.999;
        chapter.group.visible = visible;
        // Only exchange the real HTML image after its WebGL counterpart can
        // actually render. Text and image slots always remain in document flow.
        if (compact) {
          const state = visible ? "visible" : "fallback";
          if (beats[index].dataset.tunnelCard !== state) beats[index].dataset.tunnelCard = state;
        }
        if (!visible) return;
        chapterActive = true;
        const approach = THREE.MathUtils.smoothstep(progress, 0.02, compact ? 0.34 : 0.46);
        const departure = THREE.MathUtils.smoothstep(progress, compact ? 0.86 : 0.76, 1);
        const image = textures[index].image as { width: number; height: number } | undefined;
        const ratio = image ? image.width / image.height : 4 / 3;
        let maxWidth = chapterMaxWidth;
        let maxHeight = chapterMaxHeight;
        if (compact) {
          const slot = chapter.slot;
          maxWidth = slot.width;
          maxHeight = slot.height;
          chapterRestPosition.set(
            (slot.left - viewportLeft + slot.width / 2 - viewportWidth / 2) * pixelsToWorld,
            (viewportHeight / 2 - slot.top - slot.height / 2) * pixelsToWorld,
          );
        }
        const displayWidth = Math.min(maxWidth, maxHeight * ratio) * pixelsToWorld;
        chapter.group.scale.set(displayWidth, displayWidth / ratio, 1);
        chapterPosition.set(
          chapterRestPosition.x * approach - displayWidth * departure * 0.85,
          chapterRestPosition.y * approach + departure * 0.4,
          -THREE.MathUtils.lerp(29, chapterDepth, approach) + departure * 5.7,
        );
        chapter.group.position.copy(camera.localToWorld(chapterPosition));
        chapter.group.quaternion.copy(camera.quaternion);
        chapter.group.rotateY((1 - approach) * (compact ? -0.2 : -0.38) - departure * 0.18);
        chapter.group.rotateZ((1 - approach) * (compact ? 0.025 : 0.05) - departure * 0.04);
        chapter.material.opacity = THREE.MathUtils.smoothstep(progress, 0.01, 0.2)
          * (1 - THREE.MathUtils.smoothstep(progress, 0.86, 1));
      });
      const chapterState = chapterActive ? "true" : "false";
      if (journey.dataset.chapterActive !== chapterState) journey.dataset.chapterActive = chapterState;
      const sculptureOpacity = chapterActive ? 0.025 : compact ? 0.84 : 0.72;
      sculptureMaterial.opacity += (sculptureOpacity - sculptureMaterial.opacity) * 0.12;
      if (compact) veilMaterial.opacity += ((chapterActive ? 0.01 : 0.025) - veilMaterial.opacity) * 0.12;

      world.rotation.z = Math.sin(motionTime * 0.12) * 0.012 + currentProgress * 0.028;
      sculpture.rotation.x = 0.72 + motionTime * 0.055;
      sculpture.rotation.y = -0.34 + motionTime * 0.075 + currentProgress * 0.55;
      sculpture.position.z = wrapAhead(-12, camera.position.z);
      veil.rotation.y = 0.68 + motionTime * 0.018;
      veil.position.z = camera.position.z - 20;
      portals.forEach((portal, index) => {
        portal.position.z = wrapAhead([-7, -19, -31][index], camera.position.z);
        portal.rotation.z = index * 0.22 + motionTime * (index % 2 ? -0.025 : 0.02);
      });
      cards.forEach((card, index) => {
        const imageOpacity = chapterActive ? 0 : compact ? 0.68 : 0.56;
        const backingOpacity = chapterActive ? 0 : 0.7;
        card.material.opacity += (imageOpacity - card.material.opacity) * 0.075;
        card.backing.opacity += (backingOpacity - card.backing.opacity) * 0.075;
        card.group.position.z = wrapAhead(cardLayout[index].z, camera.position.z);
        card.group.position.y = cardLayout[index].y + Math.sin(motionTime * 0.34 + index * 1.7) * 0.13;
        card.group.rotation.z += (Math.sin(motionTime * 0.22 + index) * 0.035 - card.group.rotation.z) * 0.018;
      });

      clearColor.copy(startColor).lerp(endColor, THREE.MathUtils.smoothstep(currentProgress, 0.38, 1));
      if (scene.fog) scene.fog.color.copy(clearColor);
      renderer.setClearColor(clearColor, 1);
      renderer.render(scene, camera);
      // Mark ready after a painted render, never just after a network response.
      if (motionAllowed && loadedTextures === textureSources.length) journey.dataset.tunnelReady = "true";
      if (motionAllowed) frame = window.requestAnimationFrame(render);
    };

    const restoreFallback = () => {
      delete journey.dataset.tunnelReady;
      delete journey.dataset.chapterActive;
      beats.forEach(beat => delete beat.dataset.tunnelCard);
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      window.cancelAnimationFrame(frame);
      restoreFallback();
    };
    const onContextRestored = () => {
      contextLost = false;
      resize();
      if (running) render();
    };
    const onVisibilityChange = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden && running) render();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    document.addEventListener("visibilitychange", onVisibilityChange);

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
      disposed = true;
      restoreFallback();
      running = false;
      window.cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      trigger.kill();
      chapterTriggers.forEach((chapterTrigger) => chapterTrigger.kill());
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      world.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => material.dispose());
        }
        if (child instanceof THREE.Sprite) child.material.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      chapterCards.forEach((chapter) => {
        chapter.group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
        chapter.material.dispose();
      });
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
