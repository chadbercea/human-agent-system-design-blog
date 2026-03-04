import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import { initTestScene, createAircraft, LIVERIES } from '../lib/diorama';

function run(): void {
  const container = document.getElementById('diorama-container');
  if (!container) return;

  const { scene, camera, renderer, updateFrustum } = initTestScene(container);

  const a1 = createAircraft(LIVERIES.ALPHA);
  a1.position.set(-4, 0, 0);
  scene.add(a1);

  const a2 = createAircraft(LIVERIES.BRAVO);
  a2.position.set(0, 0, 0);
  scene.add(a2);

  const a3 = createAircraft(LIVERIES.CHARLIE);
  a3.position.set(4, 0, 0);
  scene.add(a3);

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
    overlay.textContent = 'ALPHA | BRAVO | CHARLIE — three liveries';
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
