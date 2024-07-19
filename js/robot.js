import * as CANNON from 'cannon';

export default class Robot {
    constructor(world) {
      this.world = world
      this.createRobot()
    }


    showAxes(body) {
        const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.objectsToUpdate.push({mesh: cube, pos: body.position, ori: body.quaternion});
        cube.add(new THREE.AxesHelper(1));
    }

    step(action) {
      const SCALING_FACTOR_WHEELS = 10
      const SCALING_FACTOR_HINGE = 1

      this.vehicle.applyEngineForce(action[0] * SCALING_FACTOR_WHEELS, 0)
      this.vehicle.applyEngineForce(action[1] * SCALING_FACTOR_WHEELS, 1)
      this.vehicle.applyEngineForce(action[2] * SCALING_FACTOR_WHEELS, 2)
      this.vehicle.applyEngineForce(action[3] * SCALING_FACTOR_WHEELS, 3)
      this.hinge.setMotorSpeed(action[4] * SCALING_FACTOR_HINGE)

    }

    createRobot() {
        // Build the car chassis
        const bodyWidth = 1.6
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1.5, 2.0, bodyWidth))
        const chassisBody = new CANNON.Body({ mass: 10 })
        chassisBody.addShape(chassisShape)
        chassisBody.position.set(-1.5, 2.2, 3.0)
        chassisBody.angularVelocity.set(0, 0.5, 0)

        // Grabber front
        const grabber = new CANNON.Body({ mass: 0.1 });
        const lengthToPivot = 3.0;
        const distanceFromChassis = 1.3;
        let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        grabber.addShape(new CANNON.Box(new CANNON.Vec3(bodyWidth, 0.15, 0.15)), new CANNON.Vec3(lengthToPivot, 0.0, 0.0), quat);
        
        // Grabber left
        grabber.addShape(new CANNON.Box(new CANNON.Vec3(lengthToPivot/2, 0.15, 0.05)), new CANNON.Vec3(lengthToPivot/2, 0.0, -bodyWidth - 0.1));

        // Grabber right
        grabber.addShape(new CANNON.Box(new CANNON.Vec3(lengthToPivot/2, 0.15, 0.05)), new CANNON.Vec3(lengthToPivot/2, 0.0, bodyWidth + 0.1));

        let pos = chassisBody.pointToWorldFrame(new CANNON.Vec3(distanceFromChassis, -1.0, 0.0));
        grabber.position.copy(pos);
        this.world.addBody(grabber);

        // Define the hinge constraint
        const pivotA = new CANNON.Vec3(distanceFromChassis, 0, 0); // Pivot point relative to the first body
        const pivotB =  new CANNON.Vec3(0, 0, 0); // Pivot point relative to the second body
        // const pivotB = new CANNON.Vec3(-1.5, 0, 0); // Pivot point relative to the second body
        const axisA = new CANNON.Vec3(0, 0, 1); // Axis of rotation (e.g., around the z-axis)
        const axisB = new CANNON.Vec3(0, 0, 1); // Axis of rotation (e.g., around the z-axis)

        // Create and add the hinge constraint
        const hingeConstraint = new CANNON.HingeConstraint(chassisBody, grabber, {
            pivotA: pivotA,
            pivotB: pivotB,
            axisA: axisA,
            axisB: axisB
        });
        hingeConstraint.collideConnected = true
        hingeConstraint.enableMotor()
        this.world.addConstraint(hingeConstraint);

        // Create the vehicle
        const vehicle = new CANNON.RaycastVehicle({
            chassisBody,
        })

        const wheelOptions = {
            radius: 0.4,
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
        wheelOptions.chassisConnectionPointLocal.set(-0.9, -1.8, 1.5)
        vehicle.addWheel(wheelOptions)

        // Rear wheel left
        wheelOptions.chassisConnectionPointLocal.set(-0.9, -1.8, -1.5)
        vehicle.addWheel(wheelOptions)

        // Front wheel right
        wheelOptions.chassisConnectionPointLocal.set(0.9, -1.8, 1.5)
        vehicle.addWheel(wheelOptions)

        // Front wheel left
        wheelOptions.chassisConnectionPointLocal.set(0.9, -1.8, -1.5)
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
        this.hinge = hingeConstraint
    }
}