import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import * as TWEEN from 'tween.js';

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Fog

const fog = new THREE.Fog('#262837', 0.1, 10);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load(
  '/textures/door/ambientOcclusion.jpg'
);
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('/textures/matcaps/1.png');
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg');
const grassColorTexture = textureLoader.load('/textures/grass/color.jpg');
const grassAmbientOcclusionTexture = textureLoader.load(
  '/textures/grass/ambientOcclusion.jpg'
);
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load(
  '/textures/grass/roughness.jpg'
);

grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

/**
 * House
 */
// Group
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    color: '#ac8e82',
    map: textureLoader.load('/textures/bricks/color.jpg'),
    aoMap: textureLoader.load('/textures/bricks/ambientOcclusion.jpg'),
    normalMap: textureLoader.load('/textures/bricks/normal.jpg'),
    roughnessMap: textureLoader.load('/textures/bricks/roughness.jpg'),
  })
);
walls.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = 2.5 / 2;
house.add(walls);

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.25, 1, 4),
  new THREE.MeshStandardMaterial({
    color: '#b35f45',
  })
);
roof.position.y = 2.5 + 0.5;
roof.rotation.y = Math.PI / 4;
house.add(roof);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  })
);
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;

scene.add(floor);
// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(1.75, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    alphaMap: doorAlphaTexture,
    transparent: true,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
  })
);
door.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.z = 2 + 0.01;
door.position.y = 1 + 0.01;
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);
house.add(bush1, bush2, bush3, bush4);

// Graveyard
const graveyard = new THREE.Group();
scene.add(graveyard);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' });
function checkCollision(grave1, grave2) {
  const distance = grave1.position.distanceTo(grave2.position);
  const minDistance = 1.0; // Set the minimum distance between graves here

  return distance < minDistance;
}

for (let i = 0; i < 40; i++) {
  let validPosition = false;
  let x, z;

  while (!validPosition) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 6;
    x = Math.sin(angle) * radius;
    z = Math.cos(angle) * radius;

    // Check for collision with existing graves
    validPosition = true;
    for (let j = 0; j < graveyard.children.length; j++) {
      if (checkCollision(graveyard.children[j], { position: { x, z } })) {
        validPosition = false;
        break;
      }
    }
  }

  // Create the grave and add it to the scene
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  graveyard.add(grave);
  grave.position.set(x, 0.3, z);
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.castShadow = true;
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.13);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.13);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(moonLight);
// Door light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

// Ghosts
const ghost1 = new THREE.PointLight('#ffffff', 2, 3);
ghost1.distance = 5;
ghost1.power = 3;
scene.add(ghost1);
ghost1.position.set(0, 2, 0);
const ghost2 = new THREE.PointLight('#00ffff', 2, 3);
ghost2.distance = 5;
ghost2.power = 3;
scene.add(ghost2);
ghost2.position.set(0, 2, 0);
const ghost3 = new THREE.PointLight('#ffff00', 2, 3);
ghost3.distance = 5;
ghost3.power = 3;
scene.add(ghost3);

const spriteCanvas = document.createElement('canvas');
spriteCanvas.width = 128;
spriteCanvas.height = 128;

const context = spriteCanvas.getContext('2d');
const gradient = context.createRadialGradient(
  spriteCanvas.width / 2,
  spriteCanvas.height / 2,
  0,
  spriteCanvas.width / 2,
  spriteCanvas.height / 2,
  spriteCanvas.width / 2
);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
context.fillStyle = gradient;
context.fillRect(0, 0, spriteCanvas.width, spriteCanvas.height);

const texture = new THREE.CanvasTexture(spriteCanvas);

const ghost1SpriteMaterial = new THREE.SpriteMaterial({
  map: texture,
  color: ghost1.color,
});
const ghost2SpriteMaterial = new THREE.SpriteMaterial({
  map: texture,
  color: ghost2.color,
});
const ghost3SpriteMaterial = new THREE.SpriteMaterial({
  map: texture,
  color: ghost3.color,
});

// Create a sprite for each ghost using the corresponding material
const ghost1Sprite = new THREE.Sprite(ghost1SpriteMaterial);
const ghost2Sprite = new THREE.Sprite(ghost2SpriteMaterial);
const ghost3Sprite = new THREE.Sprite(ghost3SpriteMaterial);

ghost1Sprite.scale.set(0.5, 0.5, 1);
ghost2Sprite.scale.set(0.5, 0.5, 1);
ghost3Sprite.scale.set(0.5, 0.5, 1);

scene.add(ghost1Sprite);
scene.add(ghost2Sprite);
scene.add(ghost3Sprite);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837');

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;
graveyard.castShadow = true;

floor.receiveShadow = true;
walls.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

/**
 * Animate
 */
const clock = new THREE.Clock();

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

const damping = 0.05;

const tick = () => {
  TWEEN.update();
  const elapsedTime = clock.getElapsedTime();

  // Update ghosts

  const ghost1Angle = elapsedTime * 0.1 + randomInRange(-0.05, 0.05);
  ghost1.position.x +=
    (Math.cos(ghost1Angle) * 4 - ghost1.position.x) * damping;
  ghost1.position.z +=
    (Math.sin(ghost1Angle) * 4 - ghost1.position.z) * damping;
  ghost1.position.y = Math.sin(elapsedTime * 1);

  const ghost2Angle = -elapsedTime * 0.08 + randomInRange(-0.05, 0.05);
  ghost2.position.x +=
    (Math.cos(ghost2Angle) * 5 - ghost2.position.x) * damping;
  ghost2.position.z +=
    (Math.sin(ghost2Angle) * 5 - ghost2.position.z) * damping;
  ghost2.position.y = Math.sin(elapsedTime * 1) + Math.sin(elapsedTime * 1);

  const ghost3Angle = -elapsedTime * 0.05 + randomInRange(-0.05, 0.05);
  ghost3.position.x +=
    (Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.16)) -
      ghost3.position.x) *
    damping;
  ghost3.position.z +=
    (Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.25)) -
      ghost3.position.z) *
    damping;
  ghost3.position.y = Math.sin(elapsedTime * 1) + Math.sin(elapsedTime * 0.8);

  ghost1Sprite.position.copy(ghost1.position);
  ghost2Sprite.position.copy(ghost2.position);
  ghost3Sprite.position.copy(ghost3.position);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
