import * as THREE from 'three';

const RUNWAY_LENGTH = 30;
const RUNWAY_WIDTH = 3;
const RUNWAY_HEIGHT = 0.05;
const MARKING_Y = 0.06;
const CENTERLINE_SPACING = 1.2;
const CENTERLINE_DASH = { w: 0.6, h: 0.02, d: 0.08 };
const THRESHOLD_BAR = { w: 0.08, h: 0.02, d: 1.5 };
const THRESHOLD_BAR_SPACING = 0.15;
const THRESHOLD_BAR_COUNT = 5;

const markingMat = new THREE.MeshStandardMaterial({
  color: 0x333333,
  roughness: 0.8,
  metalness: 0,
  flatShading: true,
});

/**
 * Create runway surface geometry and markings. Two strips in L-config + centerline dashes and threshold bars.
 * ILI-400 surface, ILI-401 markings (all children of runway group).
 */
export function createRunway(): THREE.Group {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0,
    flatShading: true,
  });

  const primaryGeom = new THREE.BoxGeometry(RUNWAY_LENGTH, RUNWAY_HEIGHT, RUNWAY_WIDTH);
  const primary = new THREE.Mesh(primaryGeom, mat);
  primary.receiveShadow = true;
  primary.castShadow = false;
  primary.position.set(0, RUNWAY_HEIGHT / 2, 0);
  group.add(primary);

  const secondaryGeom = new THREE.BoxGeometry(RUNWAY_LENGTH, RUNWAY_HEIGHT, RUNWAY_WIDTH);
  const secondary = new THREE.Mesh(secondaryGeom, mat.clone());
  secondary.receiveShadow = true;
  secondary.castShadow = false;
  secondary.rotation.y = Math.PI / 2;
  secondary.position.set(15, RUNWAY_HEIGHT / 2, 1.5);
  group.add(secondary);

  // ILI-401: centerline dashes every 1.2 along both runways
  const halfLen = RUNWAY_LENGTH / 2;
  const dashStart = -halfLen + CENTERLINE_DASH.w / 2;
  const dashEnd = halfLen - CENTERLINE_DASH.w / 2;
  for (let t = dashStart; t <= dashEnd; t += CENTERLINE_SPACING) {
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(CENTERLINE_DASH.w, CENTERLINE_DASH.h, CENTERLINE_DASH.d),
      markingMat
    );
    dash.position.set(t, MARKING_Y, 0);
    group.add(dash);
  }
  for (let t = 1.5 - halfLen + CENTERLINE_DASH.w / 2; t <= 1.5 + halfLen - CENTERLINE_DASH.w / 2; t += CENTERLINE_SPACING) {
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(CENTERLINE_DASH.w, CENTERLINE_DASH.h, CENTERLINE_DASH.d),
      markingMat.clone()
    );
    dash.rotation.y = Math.PI / 2;
    dash.position.set(15, MARKING_Y, t);
    group.add(dash);
  }

  // Threshold bars at each runway end: 5 bars, spacing 0.15
  const barGeom = new THREE.BoxGeometry(THRESHOLD_BAR.w, THRESHOLD_BAR.h, THRESHOLD_BAR.d);
  const barHalf = ((THRESHOLD_BAR_COUNT - 1) * THRESHOLD_BAR_SPACING) / 2;
  for (let i = 0; i < THRESHOLD_BAR_COUNT; i++) {
    const z = -barHalf + i * THRESHOLD_BAR_SPACING;
    const b1 = new THREE.Mesh(barGeom, markingMat.clone());
    b1.position.set(-15, MARKING_Y, z);
    group.add(b1);
    const b2 = new THREE.Mesh(barGeom, markingMat.clone());
    b2.position.set(15, MARKING_Y, z);
    group.add(b2);
  }
  for (let i = 0; i < THRESHOLD_BAR_COUNT; i++) {
    const xOff = -barHalf + i * THRESHOLD_BAR_SPACING;
    const b1 = new THREE.Mesh(barGeom, markingMat.clone());
    b1.rotation.y = Math.PI / 2;
    b1.position.set(15 + xOff, MARKING_Y, 1.5 - 15);
    group.add(b1);
    const b2 = new THREE.Mesh(barGeom, markingMat.clone());
    b2.rotation.y = Math.PI / 2;
    b2.position.set(15 + xOff, MARKING_Y, 1.5 + 15);
    group.add(b2);
  }

  return group;
}
