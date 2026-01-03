import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import getBgSphere from "./src/getBgSphere.js";
import { FBXLoader } from "three/examples/jsm/Addons.js";
/* ---------------------------------- */
/* SIZES                              */
/* ---------------------------------- */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/* ---------------------------------- */
/* SCENE                              */
/* ---------------------------------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const bg = getBgSphere({ lightnessMult: 0.005 });
scene.add(bg);

/* ---------------------------------- */
/* CAMERA                             */
/* ---------------------------------- */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 5);
scene.add(camera);

/* ---------------------------------- */
/* RENDERER                           */
/* ---------------------------------- */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

/* ---------------------------------- */
/* CONTROLS                           */
/* ---------------------------------- */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ---------------------------------- */
/* LIGHTS                             */
/* ---------------------------------- */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -5;

scene.add(directionalLight);

/* ---------------------------------- */
/* DEBUG HELPERS (OPTIONAL)            */
/* ---------------------------------- */
// scene.add(new THREE.AxesHelper(5));

/* ---------------------------------- */
/*  OBJECT          */
/* ---------------------------------- */

const loader = new FBXLoader();
const model = await loader.loadAsync("./assets/astro.fbx");
model.scale.setScalar(0.02);
model.position.set(0, -1.5, 0);
scene.add(model);

const mat = new THREE.MeshStandardMaterial({
  roughness: 0.2,
  metalness: 0.8,
  flatShading: false,
});

model.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
    child.material = mat;
  }
});

const mixer = new THREE.AnimationMixer(model);
const action = mixer.clipAction(model.animations[0]);
action.play();

// fireflies

const fireflies = new THREE.Group();
fireflies.userData = {
  update: () => {
    fireflies.children.forEach((firefly) => {
      firefly.userData.update();
    });
  },
};
scene.add(fireflies);

function createFirefly() {
  const orbitObj = new THREE.Object3D();
  let hue = 0.6 + Math.random() * 0.2;
  if (Math.random() < 0.05) {
    hue = 0.25;
  }
  const color = new THREE.Color().setHSL(hue, 1, 0.5);
  const light = new THREE.SpotLight(color, 1, 3, Math.PI / 4, 0.5);
  const geometry = new THREE.SphereGeometry(0.02, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color });
  const firefly = new THREE.Mesh(geometry, material);

  firefly.position.x = 2.5;
  orbitObj.rotation.z = Math.random() * Math.PI * 2;

  firefly.add(light);
  orbitObj.add(firefly);

  function _addGlow(mesh) {
    const glowMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.15,
    });
    const glowMesh = new THREE.Mesh(geometry, glowMat);
    glowMesh.scale.multiplyScalar(1.5);
    const glowMesh2 = new THREE.Mesh(geometry, glowMat);
    glowMesh2.scale.multiplyScalar(2.5);
    const glowMesh3 = new THREE.Mesh(geometry, glowMat);
    glowMesh3.scale.multiplyScalar(4);
    const glowMesh4 = new THREE.Mesh(geometry, glowMat);
    glowMesh4.scale.multiplyScalar(6);
    mesh.add(glowMesh);
    mesh.add(glowMesh2);
    mesh.add(glowMesh3);
    mesh.add(glowMesh4);
  }

  _addGlow(firefly);

  const rate = 0.001 + Math.random() * 0.002;
  function update() {
    orbitObj.rotation.x += rate;
    orbitObj.rotation.y += rate;
    orbitObj.rotation.z += rate;
  }

  orbitObj.userData = { update };
  return orbitObj;
}

const fireflyCount = 30;
for (let i = 0; i < fireflyCount; i++) {
  const firefly = createFirefly();
  fireflies.add(firefly);
}

/* ---------------------------------- */
/* RESIZE                             */
/* ---------------------------------- */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/* ---------------------------------- */
/* LOOP                               */
/* ---------------------------------- */
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();

  controls.update();
  renderer.render(scene, camera);
  mixer.update(delta);

  fireflies.userData.update();

  requestAnimationFrame(animate);
}

animate();
