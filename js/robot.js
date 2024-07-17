import * as CANNON from 'cannon';

export default class Robot {
    constructor(world) {
      this.world = world
      this.createRobot()
    }

    createRobot() {
        // Build the car chassis
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1.5, 2.0, 1.6))
        const chassisBody = new CANNON.Body({ mass: 10 })
        chassisBody.addShape(chassisShape)
        chassisBody.position.set(-1.5, 2.2, 3.0)
        chassisBody.angularVelocity.set(0, 0.5, 0)

        let pos;
        let quaternion;

        const grabber = new CANNON.Body({ mass: 0.1 });
        grabber.addShape(new CANNON.Box(new CANNON.Vec3(1.0, 0.05, 0.01)));
        pos = new CANNON.Vec3(1.1, -0.48, 2.0);
        grabber.position.copy(chassisBody.pointToWorldFrame(pos));
        this.world.addBody(grabber);

        // const forkRight = new CANNON.Body({ mass: 0.1 });
        // forkRight.addShape(new CANNON.Box(new CANNON.Vec3(0.37, 0.05, 0.01)));
        // pos = new CANNON.Vec3(1.1, -0.48, 0.4);
        // forkRight.position.copy(chassisBody.pointToWorldFrame(pos));
        // this.world.addBody(forkRight);
        // this.showAxes(forkRight);

        // Create the vehicle
        const vehicle = new CANNON.RaycastVehicle({
            chassisBody,
        })

        const wheelOptions = {
            radius: 0.55,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 100,
            suspensionRestLength: 0.15,
            frictionSlip: 1.4,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true,
        }

        // Add the wheels
        // Rear wheel right
        wheelOptions.chassisConnectionPointLocal.set(-1.25, -1.7, 1.5)
        vehicle.addWheel(wheelOptions)

        // Rear wheel left
        wheelOptions.chassisConnectionPointLocal.set(-1.25, -1.7, -1.5)
        vehicle.addWheel(wheelOptions)

        // Front wheel right
        wheelOptions.chassisConnectionPointLocal.set(1.25, -1.7, 1.5)
        vehicle.addWheel(wheelOptions)

        // Front wheel left
        wheelOptions.chassisConnectionPointLocal.set(1.25, -1.7, -1.5)
        vehicle.addWheel(wheelOptions)

        vehicle.addToWorld(this.world)

        // Add the wheel bodies
        const wheelBodies = []
        const wheelMaterial = new CANNON.Material('wheel')
        vehicle.wheelInfos.forEach((wheel) => {
            const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
            const wheelBody = new CANNON.Body({
                mass: 0,
                material: wheelMaterial,
            })
            wheelBody.type = CANNON.Body.KINEMATIC
            wheelBody.collisionFilterGroup = 0 // turn off collisions
            const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)
            wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion)
            wheelBodies.push(wheelBody)
            this.world.addBody(wheelBody)
        })

        // Update the wheel bodies
        this.world.addEventListener('postStep', () => {
            for (let i = 0; i < vehicle.wheelInfos.length; i++) {
                vehicle.updateWheelTransform(i)
                const transform = vehicle.wheelInfos[i].worldTransform
                const wheelBody = wheelBodies[i]
                wheelBody.position.copy(transform.position)
                wheelBody.quaternion.copy(transform.quaternion)
            }
        })

        const defaultMaterial = new CANNON.Material('default');
        // Define interactions between wheels and ground
        const wheel_ground = new CANNON.ContactMaterial(wheelMaterial, defaultMaterial, {
            friction: 0.3,
            restitution: 0,
            contactEquationStiffness: 1000,
        })
        this.world.addContactMaterial(wheel_ground)
        this.vehicle = vehicle
        this.chassisBody = chassisBody
        this.wheelBodies = wheelBodies
    }
}