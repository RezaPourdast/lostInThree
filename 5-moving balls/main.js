import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

/* ---------------------------------- */
/* CAMERA                             */
/* ---------------------------------- */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 1, 4);
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
/* TEST OBJECT (REMOVE LATER)          */
/* ---------------------------------- */
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x00ff99 })
);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

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

  requestAnimationFrame(animate);
}

animate();
