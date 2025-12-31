import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { all } from "three/tsl";

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
camera.position.set(1, 16, 0);
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

let paused = true;

const numBalls = 30;
const radius = 1.3;
function createBalls(numBalls) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius, 1),
    new THREE.MeshNormalMaterial({ flatShading: true })
  );
  let x = (Math.random() - 0.5) * 10;
  let z = (Math.random() - 0.5) * 10;
  mesh.position.set(x, 0, z);
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

  const direction = new THREE.Vector3(0, 0, 0);
  const Damping = 0.98;
  const velocity = new THREE.Vector3(0, 0, 0);

  function update(allBalls) {
    mesh.position.add(velocity);
    velocity.multiplyScalar(Damping);

    allBalls.forEach((b) => {
      const distance = mesh.position.distanceTo(b.mesh.position);
      if (distance < radius * 2) {
        direction.subVectors(mesh.position, b.mesh.position);
        direction.normalize();
        const force = (radius * 2 - distance) * 0.001;
        velocity.addScaledVector(direction, force);
      }
    });
  }
  return { mesh, update };
}

const balls = [];

for (let i = 0; i < numBalls; i++) {
  const ball = createBalls();
  scene.add(ball.mesh);
  balls.push(ball);
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
  if (!paused) {
    balls.forEach((ball) => ball.update(balls));
  }

  requestAnimationFrame(animate);
}

animate();

window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    paused = !paused;
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") {
    window.location.reload();
  }
});
