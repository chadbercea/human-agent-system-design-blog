import * as THREE from 'three';

const TAXIWAY_WIDTH = 1.5;
const TAXIWAY_HEIGHT = 0.04;
const SURFACE_COLOR = 0x161616;
const EDGE_COLOR = 0x4a9eff;
const CENTERLINE_COLOR = 0x8a7030;
const APRON_SIZE = { x: 12, y: 0.03, z: 8 };

const surfaceMat = new THREE.MeshStandardMaterial({
  color: SURFACE_COLOR,
  roughness: 0.9,
  metalness: 0,
  flatShading: true,
});

const edgeMat = new THREE.MeshStandardMaterial({
  color: EDGE_COLOR,
  emissive: EDGE_COLOR,
  emissiveIntensity: 0.3,
  flatShading: true,
});

const centerlineMat = new THREE.MeshStandardMaterial({
  color: CENTERLINE_COLOR,
  roughness: 0.8,
  flatShading: true,
});

function addStrip(
  group: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  length: number
): void {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(TAXIWAY_WIDTH, TAXIWAY_HEIGHT, length),
    surfaceMat.clone()
  );
  strip.position.copy(mid);
  strip.position.y = TAXIWAY_HEIGHT / 2;
  strip.lookAt(end);
  strip.rotation.x = 0;
  strip.rotation.z = 0;
  strip.receiveShadow = true;
  group.add(strip);

  const perp = new THREE.Vector3(-dir.z, 0, dir.x);
  const halfW = TAXIWAY_WIDTH / 2;
  const edgeGeom = new THREE.BoxGeometry(length, 0.02, 0.06);
  const e1 = new THREE.Mesh(edgeGeom, edgeMat.clone());
  e1.position.copy(mid);
  e1.position.y = 0.05;
  e1.position.add(perp.clone().multiplyScalar(halfW));
  e1.lookAt(end);
  e1.rotation.x = 0;
  e1.rotation.z = 0;
  group.add(e1);
  const e2 = new THREE.Mesh(edgeGeom, edgeMat.clone());
  e2.position.copy(mid);
  e2.position.y = 0.05;
  e2.position.add(perp.clone().multiplyScalar(-halfW));
  e2.lookAt(end);
  e2.rotation.x = 0;
  e2.rotation.z = 0;
  group.add(e2);

  const dashCount = Math.max(2, Math.floor(length / 0.8));
  for (let i = 0; i <= dashCount; i++) {
    const t = i / dashCount;
    const p = new THREE.Vector3().lerpVectors(start, end, t);
    p.y = 0.05;
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.02, 0.06),
      centerlineMat.clone()
    );
    dash.position.copy(p);
    dash.lookAt(end);
    dash.rotation.x = 0;
    dash.rotation.z = 0;
    group.add(dash);
  }
}

/**
 * Create taxiway strips + apron. ILI-410 strips and markings, ILI-411 apron and parking.
 * Returns one group. Position at origin; composition will place relative to runway.
 */
export function createTaxiwaysAndApron(): THREE.Group {
  const group = new THREE.Group();

  addStrip(group, new THREE.Vector3(0, 0, 0), new THREE.Vector3(8, 0, -4), 9);
  addStrip(group, new THREE.Vector3(8, 0, -4), new THREE.Vector3(10, 0, -6), 2.8);
  addStrip(group, new THREE.Vector3(15, 0, 1.5), new THREE.Vector3(10, 0, -4), 7.5);

  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(APRON_SIZE.x, APRON_SIZE.y, APRON_SIZE.z),
    surfaceMat.clone()
  );
  apron.position.set(10, APRON_SIZE.y / 2, -6);
  apron.receiveShadow = true;
  group.add(apron);

  const stopMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8, flatShading: true });
  for (let i = 0; i < 4; i++) {
    const x = 6 + i * 3;
    const leadIn = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 0.06), centerlineMat.clone());
    leadIn.position.set(x, 0.05, -5);
    group.add(leadIn);
    const stop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 1.2), stopMat.clone());
    stop.position.set(x, 0.05, -4.2);
    group.add(stop);
  }

  return group;
}
