import * as CANNON from 'cannon-es';

class Robot {
    constructor(world) {
        this.world = world
        this.createRobot()
    }

    // step(action) {
    //   const SCALING_FACTOR_WHEELS = 10
    //   const SCALING_FACTOR_HINGE = 1

    //   this.vehicle.applyEngineForce(action[0] * SCALING_FACTOR_WHEELS, 0)
    //   this.vehicle.applyEngineForce(action[1] * SCALING_FACTOR_WHEELS, 1)
    //   this.vehicle.applyEngineForce(action[2] * SCALING_FACTOR_WHEELS, 2)
    //   this.vehicle.applyEngineForce(action[3] * SCALING_FACTOR_WHEELS, 3)
    //   this.hinge.setMotorSpeed(action[4] * SCALING_FACTOR_HINGE)
    // }

    step(action) {
        const maxForce = 10
        switch (action) {
            case 0:
                this.vehicle.applyEngineForce(maxForce, 0)
                this.vehicle.applyEngineForce(maxForce, 1)
                // this.vehicle.applyEngineForce(maxForce, 2)
                // this.vehicle.applyEngineForce(maxForce, 3)
                break
            case 1:
                this.vehicle.applyEngineForce(-maxForce, 0)
                this.vehicle.applyEngineForce(-maxForce, 1)
                // this.vehicle.applyEngineForce(-maxForce, 2)
                // this.vehicle.applyEngineForce(-maxForce, 3)
                break
            case 2:
                // this.vehicle.applyEngineForce(maxForce, 0)
                // this.vehicle.applyEngineForce(-maxForce, 1)
                // this.vehicle.applyEngineForce(maxForce, 2)
                // this.vehicle.applyEngineForce(-maxForce, 3)
                this.vehicle.setSteeringValue(0.5, 2)
                this.vehicle.setSteeringValue(0.5, 3)
                break
            case 3:
                // this.vehicle.applyEngineForce(-maxForce * 10, 0)
                // this.vehicle.applyEngineForce(maxForce * 10, 1)
                // this.vehicle.applyEngineForce(-maxForce * 10, 2)
                // this.vehicle.applyEngineForce(maxForce * 10, 3)
                this.vehicle.setSteeringValue(-0.5, 2)
                this.vehicle.setSteeringValue(-0.5, 3)
                break
            case 4:
                this.vehicle.applyEngineForce(0, 0)
                this.vehicle.applyEngineForce(0, 1)
                this.vehicle.applyEngineForce(0, 2)
                this.vehicle.applyEngineForce(0, 3)
                this.vehicle.setSteeringValue(0.0, 2)
                this.vehicle.setSteeringValue(0.0, 3)
                // this.hinge.setMotorSpeed(0)
                break
            // case 5:
            //     this.hinge.setMotorSpeed(-1)
            //     break
            // case 6:
            //     this.hinge.setMotorSpeed(1)
            //     break
        }
    }

    createRobot() {
        // Build the car chassis
        const bodyWidth = 1.6
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1.5, 2.0, bodyWidth))
        const chassisBody = new CANNON.Body({ mass: 10 })
        chassisBody.addShape(chassisShape)


        // // Grabber front
        // const grabber = new CANNON.Body({ mass: 0.1 });
        // const lengthToPivot = 3.0;
        // const distanceFromChassis = 1.3;
        // let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        // grabber.addShape(new CANNON.Box(new CANNON.Vec3(bodyWidth, 0.15, 0.15)), new CANNON.Vec3(lengthToPivot, 0.0, 0.0), quat);

        // // Grabber left
        // grabber.addShape(new CANNON.Box(new CANNON.Vec3(lengthToPivot / 2, 0.15, 0.05)), new CANNON.Vec3(lengthToPivot / 2, 0.0, -bodyWidth - 0.1));

        // // Grabber right
        // grabber.addShape(new CANNON.Box(new CANNON.Vec3(lengthToPivot / 2, 0.15, 0.05)), new CANNON.Vec3(lengthToPivot / 2, 0.0, bodyWidth + 0.1));

        // // let pos = chassisBody.pointToWorldFrame(new CANNON.Vec3(10, -1.0, 0.0));
        // // grabber.position.copy(pos);
        // this.world.addBody(grabber);

        // // Define the hinge constraint
        // const pivotA = new CANNON.Vec3(distanceFromChassis, 0, 0); // Pivot point relative to the first body
        // const pivotB = new CANNON.Vec3(0, 0, 0); // Pivot point relative to the second body
        // // const pivotB = new CANNON.Vec3(-1.5, 0, 0); // Pivot point relative to the second body
        // const axisA = new CANNON.Vec3(0, 0, 1); // Axis of rotation (e.g., around the z-axis)
        // const axisB = new CANNON.Vec3(0, 0, 1); // Axis of rotation (e.g., around the z-axis)

        // // Create and add the hinge constraint
        // const hingeConstraint = new CANNON.HingeConstraint(chassisBody, grabber, {
        //     pivotA: pivotA,
        //     pivotB: pivotB,
        //     axisA: axisA,
        //     axisB: axisB
        // });
        // hingeConstraint.collideConnected = true
        // // hingeConstraint.enableMotor()
        // this.world.addConstraint(hingeConstraint);

        // Create the vehicle
        const vehicle = new CANNON.RaycastVehicle({
            chassisBody,
        })
        const wheelMaterial = new CANNON.Material('wheel')
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
            material: wheelMaterial,
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
        // const wheelMaterial = new CANNON.Material('wheel')
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
        // this.hinge = hingeConstraint
    }

    get position() {
        return this.chassisBody.position
    }

    get quaternion() {
        return this.chassisBody.quaternion
    }

    get actionSpace() {
        return 5
    }
}

class Task {
    constructor(env, finalPosition, finalQuaternion) {
        this.env = env
        this.num_step = 0
        this.finalPosition = finalPosition
        this.finalQuaternion = finalQuaternion
    }

    reset(finalPosition, finalQuaternion) {
        this.num_step = 0
        this.finalPosition = finalPosition
        this.finalQuaternion = finalQuaternion
        return this.getObservation()
    }

    step() {
        this.num_step += 1
        return [this.getObservation(), this.getReward(), this.isDone()]
    }

    _normalizePosition(position) {
        const maxPosition = 30
        return Math.max(-1, Math.min(1, position / maxPosition))

    }
    getObservation() {
        const position = this.env.robot.position
        const quaternion = this.env.robot.quaternion

        return [this._normalizePosition(position.x), this._normalizePosition(position.y), this._normalizePosition(position.z), quaternion.x, quaternion.y, quaternion.z, quaternion.w]
    }

    getReward() {
        // Reward function
        const positionError = this.env.robot.position.distanceTo(this.finalPosition)
        let orientationError = new CANNON.Quaternion().mult(this.finalQuaternion.inverse(), this.env.robot.quaternion);
        orientationError = Math.sqrt(Math.pow(orientationError.x, 2) + Math.pow(orientationError.y, 2) + Math.pow(orientationError.z, 2) + Math.pow(orientationError.w, 2))
        return -positionError
        // return -positionError - orientationError
    }

    isDone() {
        // Termination function
        if (this.num_step == 1000) {
            return true
        }
        else {
            return false
        }
    }

    get getObservationSpace() {
        return 7
    }
}


export default class Environment {
    constructor() {
        this.objects = {}

        this.createWorld()
        this.createRobot()
        // this.createBlocks()
        this.setupControls()
        this.task = new Task(this, new CANNON.Vec3(0, 0, 0), new CANNON.Quaternion())
        this.reset()
    }

    get actionSpace() {
        return this.robot.actionSpace
    }

    get observationSpace() {
        return this.task.getObservationSpace
    }

    createWorld() {
        // Create world
        const world = new CANNON.World()
        // world.broadphase = new CANNON.SAPBroadphase(world)
        world.allowSleep = true
        world.gravity.set(0, -9.82, 0)
        world.solver.iterations = 10
        world.defaultContactMaterial.friction = 1.0

        // Create a plane
        const groundShape = new CANNON.Plane()
        const groundBody = new CANNON.Body({ mass: 0 })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
        world.addBody(groundBody)


        this.world = world
    }

    reset() {
        this.robot.position.set(0, 2.5, 0)
        // this.robot.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0)
        // let randomOrientation = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.random() * Math.PI)
        let randomOrientation = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0)
        return this.task.reset(new CANNON.Vec3(2, 0, 0), randomOrientation)
    }

    applyAction(action) {
        this.robot.step(action)
    }

    _physicsStep(timeStep) {
        this.world.step(timeStep)
    }

    step(timeStep = 1 / 60) {
        this._physicsStep(1/60)
        return this.task.step()
    }

    createRobot() {
        this.robot = new Robot(this.world)
        this.objects['Robot'] = this.robot.chassisBody
    }

    createBlocks() {
        // Create a box
        const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
        const boxBody = new CANNON.Body({ mass: 0.1 })
        boxBody.addShape(boxShape)
        boxBody.position.set(0, 3, 0)
        this.world.addBody(boxBody)
        this.objects['Letter 1'] = boxBody
    }

    setupControls() {
        // Keybindings
        // Add force on keydown
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.applyAction(0)
                    break

                case 'ArrowDown':
                    this.applyAction(1)
                    break

                case 'ArrowLeft':
                    this.applyAction(2)
                    break

                case 'ArrowRight':
                    this.applyAction(3)
                    break

                // case 'w':
                //     this.robot.step(5)
                //     break

                // case 's':
                //     this.robot.step(6)
                //     break

            }
        })

        // Reset force on keyup
        document.addEventListener('keyup', (event) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's'].includes(event.key)) {
                this.applyAction(4)
            }
        })
    }
}