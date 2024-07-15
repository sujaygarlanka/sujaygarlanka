import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SplineLoader from '@splinetool/loader';

// camera
// const camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2,  -50000, 10000);
// camera.position.set(0, 0, 0);
// camera.quaternion.setFromEuler(new THREE.Euler(0, 0, 0));

// scene
const scene = new THREE.Scene();
// scene.scale.set(0.1, 0.1, 0.1);

// scene.background = new THREE.Color('#cacaff');

// spline scene
const loader = new SplineLoader();
loader.load(
  './js/scene.splinecode',
  (splineScene) => {
    scene.add(splineScene);
  }
);
console.log(scene)


let camera, canvas_div, renderer, controls;

const canvas = document.querySelector('canvas.webgl')

/**
 * Sizes
 */
canvas_div = document.getElementById("canvas")
const sizes = {
    width: canvas_div.offsetWidth,
    height: canvas_div.offsetHeight
}

/**
 * Camera
 */
camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000)
// camera = new THREE.OrthographicCamera(sizes.width / - 2, sizes.width / 2, window.height / 2, window.height / - 2,  -50000, 10000);
// camera.position.x = 5
// camera.position.y = 5
// camera.position.z = 10
scene.add(camera)


/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

scene.background = new THREE.Color('#cacaff');
renderer.setClearAlpha(1);

// Controls
controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true
// controls.enableZoom = false
// controls.enableRotate = false
// controls.enablePan = false


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = canvas_div.offsetWidth
    sizes.height = canvas_div.offsetHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // // Update physics
    // // world.step(1 / 60, deltaTime, 3)
    // world.fixedStep()
    
    // for(const object of objectsToUpdate)
    // {
    //     object.mesh.position.copy(object.getPos())
    //     object.mesh.quaternion.copy(object.getOri())
    // }

    // Update mixer
    // if(mixer)
    // {
    //     mixer.update(deltaTime)
    // }
    

    // Update controls
    controls.update();

    // Update the debug renderer
    // cannonDebugger.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
    
}

tick()

// // renderer
// const canvas_div = document.getElementById("canvas")
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setAnimationLoop(animate);
// document.body.appendChild(canvas_div);

// // scene settings
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFShadowMap;

// scene.background = new THREE.Color('#cacaff');
// renderer.setClearAlpha(1);

// // orbit controls
// const controls = new OrbitControls(camera, canvas_div);
// controls.enableDamping = true;
// controls.dampingFactor = 0.125;

// window.addEventListener('resize', onWindowResize);
// function onWindowResize() {
//   camera.left = window.innerWidth / - 2;
//   camera.right = window.innerWidth / 2;
//   camera.top = window.innerHeight / 2;
//   camera.bottom = window.innerHeight / - 2;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// }

// function animate(time) {
//   controls.update();
//   renderer.render(scene, camera);
// }
