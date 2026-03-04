import * as THREE from 'three';

export interface LiveryConfig {
  hullColor: string;
  accentColor: string;
}

export const LIVERIES = {
  ALPHA: { hullColor: '#cccccc', accentColor: '#4a9eff' } as LiveryConfig,
  BRAVO: { hullColor: '#e0e0e0', accentColor: '#f0a050' } as LiveryConfig,
  CHARLIE: { hullColor: '#b0b8c0', accentColor: '#50c878' } as LiveryConfig,
} as const;

export interface AircraftGroup extends THREE.Group {
  userData: {
    beaconLight?: THREE.PointLight;
    wingtipLeft?: THREE.PointLight;
    wingtipRight?: THREE.PointLight;
    tailBeacon?: THREE.PointLight;
    noseLight?: THREE.PointLight;
  };
}

/**
 * Create low-poly aircraft. ILI-406 geometry, ILI-407 nav lights. Light refs on group.userData.
 */
export function createAircraft(config: LiveryConfig = LIVERIES.ALPHA): AircraftGroup {
  const hullColor = typeof config.hullColor === 'string' ? parseInt(config.hullColor.slice(1), 16) : 0xcccccc;
  const accentColor = typeof config.accentColor === 'string' ? parseInt(config.accentColor.slice(1), 16) : 0x4a9eff;

  const group = new THREE.Group() as AircraftGroup;
  group.userData = {};

  const hullMat = new THREE.MeshStandardMaterial({
    color: hullColor,
    roughness: 0.6,
    metalness: 0.15,
    flatShading: true,
  });

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 4, 8), hullMat);
  fuselage.rotation.z = Math.PI / 2;
  fuselage.castShadow = true;
  group.add(fuselage);

  const cockpitGeom = new THREE.SphereGeometry(0.3, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const cockpitMat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 0.3,
    roughness: 0.6,
    flatShading: true,
  });
  const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
  cockpit.position.x = 2;
  cockpit.castShadow = true;
  group.add(cockpit);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 0.8), hullMat.clone());
  wing.position.set(0.3, 0, 0);
  wing.rotation.y = 0.15;
  wing.castShadow = true;
  group.add(wing);

  const hStab = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.0, 0.4), hullMat.clone());
  hStab.position.set(-2, 0, 0);
  hStab.castShadow = true;
  group.add(hStab);

  const vStab = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.4, 1.0),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.6,
      metalness: 0.15,
      flatShading: true,
    })
  );
  vStab.position.set(-2, 0.2, 0);
  vStab.castShadow = true;
  group.add(vStab);

  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x999999,
    metalness: 0.3,
    roughness: 0.5,
    flatShading: true,
  });
  const engineGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 6);
  const engineL = new THREE.Mesh(engineGeom, engineMat);
  engineL.rotation.z = Math.PI / 2;
  engineL.position.set(0.3, 1, -0.3);
  engineL.castShadow = true;
  group.add(engineL);
  const engineR = new THREE.Mesh(engineGeom, engineMat.clone());
  engineR.rotation.z = Math.PI / 2;
  engineR.position.set(0.3, -1, -0.3);
  engineR.castShadow = true;
  group.add(engineR);

  const navSphereGeom = new THREE.SphereGeometry(0.04, 4, 4);
  const emissiveRed = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 });
  const emissiveGreen = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.8 });
  const emissiveWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });

  const wingtipL = new THREE.PointLight(0xff0000, 0.3, 3, 2);
  wingtipL.position.set(0.3, 2.5, 0);
  group.add(wingtipL);
  const sphereL = new THREE.Mesh(navSphereGeom, emissiveRed);
  sphereL.position.set(0.3, 2.5, 0);
  group.add(sphereL);
  group.userData.wingtipLeft = wingtipL;

  const wingtipR = new THREE.PointLight(0x00ff00, 0.3, 3, 2);
  wingtipR.position.set(0.3, -2.5, 0);
  group.add(wingtipR);
  const sphereR = new THREE.Mesh(navSphereGeom, emissiveGreen);
  sphereR.position.set(0.3, -2.5, 0);
  group.add(sphereR);
  group.userData.wingtipRight = wingtipR;

  const tailBeacon = new THREE.PointLight(0xffffff, 0.3, 4, 2);
  tailBeacon.position.set(-2, 0.4, 0);
  group.add(tailBeacon);
  const tailSphere = new THREE.Mesh(navSphereGeom, emissiveWhite.clone());
  tailSphere.position.set(-2, 0.4, 0);
  group.add(tailSphere);
  group.userData.tailBeacon = tailBeacon;

  const noseLight = new THREE.PointLight(0xffffff, 0.2, 3, 2);
  noseLight.position.set(2, 0, 0);
  group.add(noseLight);
  group.userData.noseLight = noseLight;

  const beaconLight = new THREE.PointLight(0xff3333, 0.4, 5, 2);
  beaconLight.position.set(0, 0, -0.3);
  group.add(beaconLight);
  const beaconSphere = new THREE.Mesh(navSphereGeom, new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.6 }));
  beaconSphere.position.set(0, 0, -0.3);
  group.add(beaconSphere);
  group.userData.beaconLight = beaconLight;

  return group;
}
