import { Application } from '@splinetool/runtime';
import Environment from 'environment';


const objectVisuals = {};

// make sure you have a canvas in the body
const canvas = document.getElementById('test');

// start the application and load the scene
const spline = new Application(canvas);
spline.load('./js/scene.splinecode').then(() => {
    objectVisuals['Letter 1'] = spline.findObjectByName('Letter 1');
    objectVisuals['Robot'] = spline.findObjectByName('Robot');
    console.log(objectVisuals['Robot']);
});

const environment = new Environment();

// render loop
function render() {
    // Update the scene visuals (spline)
    for (const name in objectVisuals) {
        const object = environment.objects[name];
        const visual = objectVisuals[name];
        visual.position.x = object.position.x;
        visual.position.y = object.position.y;
        visual.position.z = object.position.z;

        // Convert the quaternion to Euler angles
        const euler = quaternionToEuler(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w);
        visual.rotation.x = euler.x;
        visual.rotation.y = euler.y;
        visual.rotation.z = euler.z;
    }

    environment.step();
    window.requestAnimationFrame(render);
}

render();


function quaternionToEuler(qx, qy, qz, qw) {
    const ysqr = qy * qy;

    // Roll (x-axis rotation)
    const t0 = 2.0 * (qw * qx + qy * qz);
    const t1 = 1.0 - 2.0 * (qx * qx + ysqr);
    const roll = Math.atan2(t0, t1);

    // Pitch (y-axis rotation)
    let t2 = 2.0 * (qw * qy - qz * qx);
    t2 = t2 > 1.0 ? 1.0 : t2;
    t2 = t2 < -1.0 ? -1.0 : t2;
    const pitch = Math.asin(t2);

    // Yaw (z-axis rotation)
    const t3 = 2.0 * (qw * qz + qx * qy);
    const t4 = 1.0 - 2.0 * (ysqr + qz * qz);
    const yaw = Math.atan2(t3, t4);

    return {
        x: roll,
        y: pitch,
        z: yaw
    };
}