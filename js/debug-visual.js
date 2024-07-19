import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SplineLoader from '@splinetool/loader';
import Environment from 'environment';
import CannonDebugger from 'cannon-es-debugger';

// scene
const scene = new THREE.Scene();

const objectVisuals = {};
const showAxesBodies = [];

// const sceneObjects = [ 'Letter 1', 'Letter 2', 'Letter 3', 'Letter 4', 'Letter 5', 'Letter 6', 'Letter 7',
//     'Letter 8', 'Letter 9', 'Letter 10', 'Letter 11', 'Letter 12', 'Letter 13', 'Letter 14', 'Letter 15',
//     'Letter 16', 'Wheel 1', 'Wheel 2', 'Wheel 3', 'Wheel 4', 'Robot', 'Grabber'
// ]
const sceneObjects = [ 'Letter 1'];

// spline scene
// const loader = new SplineLoader();
// loader.load('./js/scene.splinecode',
//   (splineScene) => {
//     // splineScene.scale = 0.1;
//     scene.add(splineScene);
//     for (const name of sceneObjects) {
//         objectVisuals[name] = splineScene.children[0].getObjectByName(name);
//     }
//   }
// );

const environment = new Environment();

/**
 * Debugging
 */
const cannonDebugger = new CannonDebugger(scene, environment.world, {
  // options...
})
showAxes(environment);

let camera, canvas_div, renderer, controls;

const canvas = document.getElementById('test');

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
camera.position.x = 5
camera.position.y = 5
camera.position.z = 10
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

// scene.background = new THREE.Color('#cacaff');
renderer.setClearAlpha(1);

// Controls
controls = new OrbitControls(camera, canvas)

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

const tick = () =>
{
    // Update controls
    controls.update();

    // Update physics world
    environment.step();

    // Update the scene visuals (spline)
    for (const name in objectVisuals) {
        const object = environment.objects[name];
        const visual = objectVisuals[name];
        visual.position.copy(object.position);
        visual.quaternion.copy(object.quaternion);
    }

    // Update the objects with axes
    for (const {mesh, body} of showAxesBodies) {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
    }

    // Update the debug renderer
    cannonDebugger.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick()


////////////////////////////////////
function showAxes(environment) {
  for (const body of environment.world.bodies) {
    const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.add(new THREE.AxesHelper(1));
    scene.add(cube);
    showAxesBodies.push({mesh: cube, body});
  }
}