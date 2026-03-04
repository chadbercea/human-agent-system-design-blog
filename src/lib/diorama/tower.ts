import * as THREE from 'three';

const baseMat = new THREE.MeshStandardMaterial({
  color: 0xd4c4a8,
  roughness: 0.85,
  metalness: 0.05,
  flatShading: true,
});

const cabMat = new THREE.MeshStandardMaterial({
  color: 0xe8d8c0,
  roughness: 0.7,
  metalness: 0.1,
  flatShading: true,
});

const roofMat = new THREE.MeshStandardMaterial({
  color: 0xa08060,
  roughness: 0.85,
  metalness: 0.05,
  flatShading: true,
});

const antennaMat = new THREE.MeshStandardMaterial({
  color: 0x888888,
  metalness: 0.5,
  roughness: 0.4,
  flatShading: true,
});

const windowMat = new THREE.MeshStandardMaterial({
  color: 0xfaf0d8,
  emissive: 0xf0e0c8,
  emissiveIntensity: 0.6,
  roughness: 0.3,
  metalness: 0,
  flatShading: true,
});

export interface TowerGroup extends THREE.Group {
  userData: { cabLight?: THREE.PointLight };
}

/**
 * Create control tower: base, shaft, cab, roof, antenna, window glow, interior light.
 * ILI-403 geometry, ILI-404 cab glow + PointLight (ref in group.userData.cabLight).
 */
export function createTower(): TowerGroup {
  const group = new THREE.Group() as TowerGroup;
  group.userData = {};

  const base = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 3), baseMat);
  base.position.y = 0.6;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 1.2), baseMat.clone());
  shaft.position.y = 2.45;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 2.2), cabMat);
  cab.position.y = 4.2;
  cab.castShadow = true;
  group.add(cab);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 2.6), roofMat);
  roof.position.y = 4.75;
  roof.castShadow = true;
  group.add(roof);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.02, 0.8, 6),
    antennaMat
  );
  antenna.position.y = 5.2;
  group.add(antenna);

  const cabCenterY = 4.2;
  const inset = 1.1 + 0.02;
  const windowGeom = new THREE.PlaneGeometry(1.8, 0.6);
  const windowPositions: [number, number, number][] = [
    [inset, cabCenterY, 0],
    [-inset, cabCenterY, 0],
    [0, cabCenterY, inset],
    [0, cabCenterY, -inset],
  ];
  const windowRotations: [number, number, number][] = [
    [0, Math.PI / 2, 0],
    [0, -Math.PI / 2, 0],
    [0, 0, 0],
    [0, Math.PI, 0],
  ];
  for (let i = 0; i < 4; i++) {
    const win = new THREE.Mesh(windowGeom, windowMat.clone());
    win.position.set(windowPositions[i][0], windowPositions[i][1], windowPositions[i][2]);
    win.rotation.set(windowRotations[i][0], windowRotations[i][1], windowRotations[i][2]);
    win.castShadow = false;
    group.add(win);
  }

  const cabLight = new THREE.PointLight(0xf0e0c8, 1.0, 12, 2);
  cabLight.position.set(0, cabCenterY, 0);
  cabLight.castShadow = false;
  group.add(cabLight);
  group.userData.cabLight = cabLight;

  return group;
}
