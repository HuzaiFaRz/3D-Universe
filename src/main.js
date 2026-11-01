import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import gsap from "gsap";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.z = 9;

scene.add(camera);

const lightLoader = new HDRLoader();
lightLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/buikslotermeerplein_1k.hdr",
  (light) => {
    light.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = light;
  },
);

const radius = 1.3;
const segments = 64;
const oribitRadius = 7;

const textures = [
  "./src/assets/planets/mercury.jpg",
  "./src/assets/planets/venus.jpg",
  "./src/assets/planets/earth.jpg",
  "./src/assets/planets/mars.jpg",
  "./src/assets/planets/jupiter.jpg",
  "./src/assets/planets/saturn.jpg",
  "./src/assets/planets/uranus.jpg",
  "./src/assets/planets/neptune.jpg",
];
const loadedTexture = new THREE.TextureLoader();

// const starTexture = new THREE.TextureLoader().load("./src/assets/stars.jpg");
// const starGeometry = new THREE.SphereGeometry(50, 64, 64);
// const starMaterial = new THREE.MeshBasicMaterial({
//   map: starTexture,
//   side: THREE.BackSide,
// });
// const starSphere = new THREE.Mesh(starGeometry, starMaterial);
// scene.add(starSphere);

const spheres = new THREE.Group();
for (let index = 0; index < 8; index++) {
  // const sphereTexture = loadedTexture.load(textures[index]);
  // sphereTexture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshStandardMaterial({
    // map: sphereTexture,
    color: "black",
  });

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const sphere = new THREE.Mesh(geometry, material);

  const angle = (index / 8) * (Math.PI * 2);

  sphere.position.x = oribitRadius * Math.cos(angle);
  sphere.position.z = oribitRadius * Math.sin(angle);
  spheres.add(sphere);
}

let wheelTime = 1000;
let lastWheelTime = 0;
let wheelCount = 0;
let isAnimating = false;

const planetsName = document.querySelector("#planetDesc").querySelectorAll('*')

planetsName.forEach((heading, ind) => {
  gsap.set(heading, {
    yPercent: ind * 100,
  });
});

const planetsAnimation = (event) => {
  if (!planetsName) return;
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= wheelTime) {
    lastWheelTime = currentTime;
    if (isAnimating) return;
    isAnimating = true;

    const direction = event.deltaY > 0 ? -1 : 1;

    planetsName.forEach((heading, ind) => {
      const currentY = gsap.getProperty(heading, "yPercent");
      gsap.to(heading, {
        yPercent: currentY + direction * 100,
        duration: 1,
        ease: "power2.inOut",
        modifiers: {
          yPercent: (value) => {
            return gsap.utils.wrap(-100, 700, parseFloat(value));
          },
        },
      });
    });

    gsap.delayedCall(1, () => {
      isAnimating = false;
    });

    gsap.to(spheres.rotation, {
      duration: 1,
      y: event.deltaY > 0 ? `+=${(Math.PI * 2) / 8}` : `-=${(Math.PI * 2) / 8}`,
      ease: "power1.inOut",
    });
  }
};

window.addEventListener("wheel", planetsAnimation);

spheres.rotation.x = 0.1;
spheres.position.y = -0.6;
// spheres.rotation.y = -0.0
scene.add(spheres);

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

const responsive = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

responsive();

window.addEventListener("resize", responsive);

// const controls = new OrbitControls(camera, renderer.domElement);

// controls.update();

const animate = () => {
  // spheres.rotation.y += 0.01;
  // starSphere.position.x += 0.005;
  // controls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};
animate();
