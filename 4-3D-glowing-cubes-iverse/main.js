import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/Addons.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "three/examples/jsm/Addons.js";

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
scene.fog = new THREE.FogExp2(0x222222, 0.035);

/* ---------------------------------- */
/* CAMERA                             */
/* ---------------------------------- */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 1, 25);
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
controls.dampingFactor = 0.1;

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
/* POST PROCESSING                    */
/* ---------------------------------- */
const renderScene = new RenderPass(scene, camera);
// const afterimagePass = new AfterimagePass();
// afterimagePass.uniforms["damp"].value = 0.9;
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  0.5,
  0.5,
  0.5
);
bloomPass.threshold = 0;
bloomPass.strength = 0.7;
bloomPass.radius = 0.5;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
// composer.addPass(afterimagePass);

/* ---------------------------------- */
/* OBJECTS                            */
/* ---------------------------------- */

function getRandomSpherePoint({ radius = 10 }) {
  const minRadius = radius * 0.25;
  const maxRadius = radius - minRadius;
  const range = Math.random() * maxRadius + minRadius;
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const x = range * Math.sin(phi) * Math.cos(theta);
  const y = range * Math.sin(phi) * Math.sin(theta);
  const z = range * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function getRandomColor() {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}
function createBox() {
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0x288a8a,
    })
  );
  return line;
}

const boxGroup = new THREE.Group();
scene.add(boxGroup);

const numBoxes = 1000;
const radius = 45;
for (let i = 0; i < numBoxes; i++) {
  const box = createBox();
  box.position.copy(getRandomSpherePoint({ radius }));
  box.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  box.rotationSpeed = Math.random() * 0.003 + 0.001;
  // box.material.color = getRandomColor();
  boxGroup.add(box);
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
  composer.render(scene, camera);

  boxGroup.rotation.y += 0.0006;
  boxGroup.rotation.x += 0.0004;
  boxGroup.children.forEach((box) => {
    box.rotation.x += box.rotationSpeed;
    box.rotation.y += box.rotationSpeed;
  });

  requestAnimationFrame(animate);
}

animate();
