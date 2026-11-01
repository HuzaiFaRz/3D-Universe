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

const planets = [
  {
    name: "mercury",
    desc: "The smallest planet and closest to the Sun. It has a rocky surface and extreme temperature changes.",
  },
  {
    name: "venus",
    desc: "The hottest planet in our solar system. It has a thick atmosphere filled with carbon dioxide.",
  },
  {
    name: "earth",
    desc: "Our home planet and the only known planet to support life. It has liquid water and a breathable atmosphere.",
  },
  {
    name: "mars",
    desc: "Known as the Red Planet because of its reddish surface. Scientists believe it may have supported microbial life in the past.",
  },
  {
    name: "jupiter",
    desc: "The largest planet in our solar system. It is a gas giant famous for its Great Red Spot.",
  },
  {
    name: "saturn",
    desc: "A gas giant best known for its beautiful rings. It has many moons, including Titan.",
  },
  {
    name: "uranus",
    desc: "An ice giant with a blue-green color caused by methane. It rotates on its side compared to most planets.",
  },
  {
    name: "neptune",
    desc: "The farthest planet from the Sun. It is an ice giant known for its deep blue color and powerful winds.",
  },
];

const planetsNamesData = [
  {
    radius: 2,
  },
  { radius: 2 },
  { radius: 2 },
  { radius: 2 },
  { radius: 2 },
  { radius: 2 },
  { radius: 2 },
  { radius: 2 },
];

planets.forEach((elem, ind) => {
  const planetLabel = document.createElement("div");
  const planetDescP = document.createElement("p");

  const planetNameContainer = document.querySelector("#planet-name-container");
  const planetDescContainer = document.querySelector("#planet-desc-container");

  planetLabel.classList.add("planet-label");
  planetLabel.id = `label-${elem.name}`;
  planetLabel.innerHTML = `<svg viewBox="0 0 200 60" class="curved-svg-text">
                          <path
                            id="curve-${elem.name}"
                            d="M 10,50 Q 100,0 190,50"
                            fill="transparent"
                          />
                          <text   x="100"
    y="35"
    text-anchor="middle"
    dominant-baseline="middle">
                          
                            ${elem.name}
                         
                          </text></svg>`;

  planetDescP.classList.add("absolute");
  planetDescP.classList.add("w-full");
  planetDescP.classList.add("h-full");
  planetDescP.innerHTML = elem.desc;

  planetDescContainer.append(planetDescP);
  planetNameContainer.append(planetLabel);

  planetsNamesData[ind].element = planetLabel;
});

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

  planetsNamesData[index].mesh = sphere;
  const angle = (index / 8) * (Math.PI * 2);

  sphere.position.x = oribitRadius * Math.cos(angle);
  sphere.position.z = oribitRadius * Math.sin(angle);
  spheres.add(sphere);
}

let wheelTime = 1000;
let lastWheelTime = 0;
let isAnimating = false;
let wheelCount = 0;

const planetsDesc = document
  .querySelector("#planet-desc-container")
  .querySelectorAll("*");

planetsDesc.forEach((heading, ind) => {
  gsap.set(heading, {
    yPercent: ind * 100,
  });
});
const svgs = document.querySelectorAll(".curved-svg-text");
const planetsAnimation = (event) => {
  if (!planetsDesc) return;
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= wheelTime) {
    lastWheelTime = currentTime;
    if (isAnimating) return;
    isAnimating = true;
    wheelCount = (wheelCount + 1) % 8;
    const direction = event.deltaY > 0 ? -1 : 1;
    planetsDesc.forEach((heading, ind) => {
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
      y: event.deltaY > 0 ? `+=${(Math.PI * 2) / 8}` : `-=${(Math.PI * 2) / 8}`,
      duration: 1,
      ease: "power1.inOut",
    });

    svgSetting(wheelCount);
  }
};

const svgSetting = (ind = 0) => {
  planetsNamesData.forEach((e, i) => {
    if (i === ind) {
      gsap.to(svgs[i], {
        opacity: 1,
        transform: "scaleX(1)",
        fontSize: "4em",
        duration: 1,
        delay: 0.2,
        ease: "power1.inOut",
      });
    } else {
      gsap.to(svgs[i], {
        opacity: 0.3,
        transform: "scaleX(-1)",
        fontSize: "1em",
        delay: 0.6,
        ease: "power1.inOut",
      });
    }
  });
};

svgSetting();

// planetsNamesData.forEach((e, i) => {
//   svgs[i].style.opacity = i > 0 ? 0.5 : 1;
//   svgs[i].style.transform = i > 0 ? "scaleX(-1)" : null;
//   svgs[i].style.fontSize = i > 0 ? "0.6em" : "3em";
// });

window.addEventListener("wheel", planetsAnimation);

spheres.rotation.x = 0.1;
spheres.position.y = -0.9;
spheres.rotation.y = -`${(Math.PI * 2) / 4}`;

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

const tempVector = new THREE.Vector3();

const planetNameRotation = () => {
  planetsNamesData.forEach((planet) => {
    // 1. Rotate the planet sphere
    // planet.mesh.rotation.y += 0.01;

    // 2. Get the 3D world position of the planet center and offset to its top edge (radius)
    planet.mesh.getWorldPosition(tempVector);
    tempVector.y += planet.radius;

    // 3. Project the 3D vector to 2D normalized device coordinates (NDC)
    tempVector.project(camera);

    // 4. Convert NDC (-1 to +1) to screen pixel coordinates
    const x = (tempVector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (tempVector.y * -0.5 + 0.5) * window.innerHeight;

    // 5. Apply CSS transform to make the HTML/SVG text stick to the sphere's top position
    planet.element.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
  });
};

const animate = () => {
  window.requestAnimationFrame(animate);
  // spheres.rotation.y += 0.01;
  // starSphere.position.x += 0.005;
  // controls.update();

  planetNameRotation();
  renderer.render(scene, camera);
};
animate();
