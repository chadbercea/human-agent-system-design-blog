import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import { initTestScene, createRunway } from '../lib/diorama';

function run(): void {
  const container = document.getElementById('diorama-container');
  if (!container) return;

  const { scene, camera, renderer, updateFrustum } = initTestScene(container);

  const runway = createRunway();
  scene.add(runway);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = 'absolute';
  stats.dom.style.left = '0';
  stats.dom.style.top = '0';
  container.appendChild(stats.dom);

  const overlay = document.getElementById('diorama-scene-info');
  function updateOverlay(): void {
    if (!overlay) return;
    const p = camera.position;
    overlay.textContent = `Camera: (${p.x.toFixed(0)}, ${p.y.toFixed(0)}, ${p.z.toFixed(0)}) | Runway L-config`;
  }

  let animationId: number;
  function animate(): void {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    stats.update();
    updateOverlay();
  }

  const ro = new ResizeObserver(() => updateFrustum());
  ro.observe(container);
  window.addEventListener('resize', () => updateFrustum());

  animate();
  updateOverlay();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
