import { useEffect, useRef } from "react";
import * as THREE from "three";

type BrandTunnelProps = {
  paused?: boolean;
  reducedMotion?: boolean;
};

const TUNNEL_WIDTH = 22;
const TUNNEL_HEIGHT = 13;
const SEGMENT_DEPTH = 7;
const SEGMENT_COUNT = 16;
const FLOOR_COLUMNS = 6;
const WALL_ROWS = 4;

const textureSources = ["/assets/portals.webp", "/assets/macro.webp", "/assets/connect.webp"];

export function BrandTunnel({ paused = false, reducedMotion = false }: BrandTunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0d);
    scene.fog = new THREE.FogExp2(0x0b0b0d, 0.021);

    const camera = new THREE.PerspectiveCamera(67, 1, 0.1, 240);
    camera.position.set(0, 0, 2.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const textureLoader = new THREE.TextureLoader();
    const textures = textureSources.map((source) => {
      const texture = textureLoader.load(source);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      return texture;
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x9e9498,
      transparent: true,
      opacity: 0.26,
    });
    const accentLineMaterial = new THREE.LineBasicMaterial({
      color: 0xcbb5a9,
      transparent: true,
      opacity: 0.72,
    });
    const imageMaterials = textures.map(
      (map) =>
        new THREE.MeshBasicMaterial({
          map,
          color: 0xd4ced0,
          transparent: true,
          opacity: 0.76,
          side: THREE.DoubleSide,
          toneMapped: false,
        }),
    );

    const group = new THREE.Group();
    scene.add(group);

    const halfWidth = TUNNEL_WIDTH / 2;
    const halfHeight = TUNNEL_HEIGHT / 2;
    const columnWidth = TUNNEL_WIDTH / FLOOR_COLUMNS;
    const rowHeight = TUNNEL_HEIGHT / WALL_ROWS;

    const addPanel = (
      parent: THREE.Group,
      index: number,
      position: THREE.Vector3,
      rotation: THREE.Euler,
      width: number,
      height: number,
    ) => {
      const geometry = new THREE.PlaneGeometry(width * 0.88, height * 0.86);
      const panel = new THREE.Mesh(geometry, imageMaterials[index % imageMaterials.length]);
      panel.position.copy(position);
      panel.rotation.copy(rotation);
      parent.add(panel);
    };

    for (let segmentIndex = 0; segmentIndex < SEGMENT_COUNT; segmentIndex += 1) {
      const segment = new THREE.Group();
      segment.position.z = -segmentIndex * SEGMENT_DEPTH;
      const vertices: number[] = [];

      for (let column = 0; column <= FLOOR_COLUMNS; column += 1) {
        const x = -halfWidth + column * columnWidth;
        vertices.push(x, -halfHeight, 0, x, -halfHeight, -SEGMENT_DEPTH);
        vertices.push(x, halfHeight, 0, x, halfHeight, -SEGMENT_DEPTH);
      }
      for (let row = 1; row < WALL_ROWS; row += 1) {
        const y = -halfHeight + row * rowHeight;
        vertices.push(-halfWidth, y, 0, -halfWidth, y, -SEGMENT_DEPTH);
        vertices.push(halfWidth, y, 0, halfWidth, y, -SEGMENT_DEPTH);
      }
      vertices.push(
        -halfWidth, -halfHeight, 0, halfWidth, -halfHeight, 0,
        -halfWidth, halfHeight, 0, halfWidth, halfHeight, 0,
        -halfWidth, -halfHeight, 0, -halfWidth, halfHeight, 0,
        halfWidth, -halfHeight, 0, halfWidth, halfHeight, 0,
      );

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      segment.add(new THREE.LineSegments(geometry, segmentIndex % 4 === 0 ? accentLineMaterial : lineMaterial));

      if (segmentIndex > 1) {
        const face = segmentIndex % 4;
        const depth = -SEGMENT_DEPTH * 0.52;
        if (face === 0) {
          addPanel(segment, segmentIndex, new THREE.Vector3(-halfWidth, 1, depth), new THREE.Euler(0, Math.PI / 2, 0), SEGMENT_DEPTH, rowHeight * 1.7);
        } else if (face === 1) {
          addPanel(segment, segmentIndex, new THREE.Vector3(halfWidth, -0.6, depth), new THREE.Euler(0, -Math.PI / 2, 0), SEGMENT_DEPTH, rowHeight * 1.7);
        } else if (face === 2) {
          addPanel(segment, segmentIndex, new THREE.Vector3(-2.2, -halfHeight, depth), new THREE.Euler(-Math.PI / 2, 0, 0), columnWidth * 1.8, SEGMENT_DEPTH);
        } else {
          addPanel(segment, segmentIndex, new THREE.Vector3(2.4, halfHeight, depth), new THREE.Euler(Math.PI / 2, 0, 0), columnWidth * 1.8, SEGMENT_DEPTH);
        }
      }

      group.add(segment);
    }

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, window.innerHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const pointer = { x: 0, y: 0 };
    const handlePointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 1.1;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.7;
    };
    const clearPointer = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    let frame = 0;
    let currentZ = 2.5;
    let currentX = 0;
    let currentY = 0;
    const render = () => {
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / travel));
      const targetZ = reducedMotion || paused ? 2.5 : 2.5 - progress * 44;
      currentZ += (targetZ - currentZ) * 0.055;
      currentX += ((reducedMotion || paused ? 0 : pointer.x) - currentX) * 0.035;
      currentY += ((reducedMotion || paused ? 0 : -pointer.y) - currentY) * 0.035;
      camera.position.set(currentX, currentY, currentZ);
      camera.rotation.z = reducedMotion || paused ? 0 : Math.sin(progress * Math.PI) * 0.012;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", clearPointer);
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
      document.documentElement.removeEventListener("mouseleave", clearPointer);
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) child.geometry.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      imageMaterials.forEach((material) => material.dispose());
      lineMaterial.dispose();
      accentLineMaterial.dispose();
      renderer.dispose();
    };
  }, [paused, reducedMotion]);

  return (
    <div className="brand-tunnel" ref={sectionRef} aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="brand-tunnel-vignette" />
    </div>
  );
}
