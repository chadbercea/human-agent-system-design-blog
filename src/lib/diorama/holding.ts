import * as THREE from 'three';

/**
 * Create holding pattern ring. ILI-413. TorusGeometry laid flat, translucent blue.
 */
export function createHoldingRing(): THREE.Mesh {
  const geom = new THREE.TorusGeometry(6, 0.06, 8, 32);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a3a5a,
    emissive: 0x1a3a5a,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.5,
    roughness: 0.6,
    flatShading: true,
  });
  const ring = new THREE.Mesh(geom, mat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 10;
  ring.castShadow = false;
  ring.receiveShadow = false;
  return ring;
}
