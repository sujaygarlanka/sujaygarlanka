import { Application } from '@splinetool/runtime';
import * as CANNON from 'cannon';
import CannonDebugger from "cannon-es-debugger";

// make sure you have a canvas in the body
const canvas = document.getElementById('test');

// start the application and load the scene
const spline = new Application(canvas);
spline.load('./js/scene.splinecode').then(() => {
    const obj = spline.getAllObjects();
    obj[0].position.x = 130;
    obj[0].rotation.x = 1.5;
    console.log(obj)
});
console.log(spline)

const world = new CANNON.World()
// world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.82, 0)
world.solver.iterations = 100;

const cannonDebugger = new CannonDebugger(spline._scene, world, {
    // options...
})

const tick = () =>
    {
        // const elapsedTime = clock.getElapsedTime()
        // const deltaTime = elapsedTime - oldElapsedTime
        // oldElapsedTime = elapsedTime
    
        // Update physics
        world.fixedStep()

        cannonDebugger.update();
        
    }
    
    tick()
