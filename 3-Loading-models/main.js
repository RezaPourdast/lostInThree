import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/* ---------------------------------- */
/* BASIC SETUP                         */
/* ---------------------------------- */

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

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

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;

dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 20;
dirLight.shadow.camera.left = -5;
dirLight.shadow.camera.right = 5;
dirLight.shadow.camera.top = 5;
dirLight.shadow.camera.bottom = -5;

scene.add(dirLight);

/* ---------------------------------- */
/* HDR ENVIRONMENT                    */
/* ---------------------------------- */

const hdrLoader = new HDRLoader();
hdrLoader.load("./assets/3.hdr", (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr;
  // scene.background = hdr; //optionally set as scene background
});

/* ---------------------------------- */
/* GROUND (SHADOW RECEIVER)            */
/* ---------------------------------- */

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.ShadowMaterial({ opacity: 0.35 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);

/* ---------------------------------- */
/* FRAME OBJECT UTILITY               */
/* ---------------------------------- */

function frameObject(camera, controls, object) {
  object.updateWorldMatrix(true, true);

  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  controls.target.copy(center);

  camera.position.copy(center);
  camera.position.z += size * 1.2;

  camera.near = size / 100;
  camera.far = size * 10;
  camera.updateProjectionMatrix();
}

/* ---------------------------------- */
/* MODEL + ANIMATION                  */
/* ---------------------------------- */

let mixer;

const loader = new GLTFLoader();
loader.load(
  "./assets/knight/scene.gltf",
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    frameObject(camera, controls, model);

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
  },
  undefined,
  (err) => console.error(err)
);

/* ---------------------------------- */
/* POST PROCESSING (BLOOM)             */
/* ---------------------------------- */

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(w, h),
  0.4, // strength
  0.6, // radius
  0.85 // threshold
);
composer.addPass(bloomPass);

/* ---------------------------------- */
/* RESIZE                             */
/* ---------------------------------- */

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  composer.setSize(w, h);
});

/* ---------------------------------- */
/* ANIMATION LOOP                     */
/* ---------------------------------- */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  controls.update();
  composer.render();
}

animate();
