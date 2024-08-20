import { Application } from '@splinetool/runtime';
import Environment from 'environment';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import RobotController from 'controller';

const objectVisuals = {};

const sceneObjects = [ 'Letter 1', 'Letter 2', 'Letter 3', 'Letter 4', 'Letter 5', 'Letter 6', 'Letter 7',
    'Letter 8', 'Letter 9', 'Letter 10', 'Letter 11', 'Letter 12', 'Letter 13', 'Letter 14', 'Letter 15',
    'Letter 16', 'Robot', 'Arm', 'Wheel 1 Right', 'Wheel 2 Right', 'Wheel 1 Left', 'Wheel 2 Left'
]

// make sure you have a canvas in the body
const canvas = document.getElementById('spline');

// start the application and load the scene
const spline = new Application(canvas);
spline.load('https://sujaygarlanka.com/js/robot/scene.splinecode').then(() => {
    // console.log(spline.findObjectByName('Robot').quaternion)
    for (const name of sceneObjects) {
        objectVisuals[name] = spline.findObjectByName(name);
    }
    resize()
});

const environment = new Environment();
const robotController = new RobotController(environment.robot); 

const commandGenerator = environment.generateCommands()
let actionGenerator = robotController.actionGenerator(commandGenerator.next().value);

window.addEventListener('resize', () => {
    // Update sizes
    resize()
})


function resize() {
    const width = spline.canvas.offsetWidth/2.5
    const cubeSize = 2
    const numCubes = 4
    const zoom = width/numCubes/cubeSize
    if (spline) {
        spline.setZoom(zoom)
    }
}

// render loop
function render() {

    if (actionGenerator != null && environment.enableController) {
        const action = actionGenerator.next().value;
        if (action == null) {
            actionGenerator = robotController.actionGenerator(commandGenerator.next().value);
        } else {
            environment.applyAction(...action);
        }
    }

    const [nextState, reward, done] = environment.step(true);

    if (environment.robot.magnetized) {
        spline.setVariable('magnetize', 100)
    }
    else {
        spline.setVariable('magnetize', 0)
    }
    
    // Update the scene visuals (spline)
    for (const name in objectVisuals) {
        const object = environment.objects[name];
        const visual = objectVisuals[name];
        visual.position.x = object.position.x;
        visual.position.y = object.position.y;
        visual.position.z = object.position.z;

        let euler = new THREE.Euler()
        const quaternion = new THREE.Quaternion(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w)
        euler.setFromQuaternion(quaternion, 'XYZ');
        visual.rotation.x = euler.x
        visual.rotation.y = euler.y
        visual.rotation.z = euler.z
    }

    window.requestAnimationFrame(render);
}

render();