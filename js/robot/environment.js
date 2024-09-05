import * as CANNON from 'cannon-es';

class Robot {
    constructor(env) {
        this.env = env
        this.world = env.world
        this.objectConstraint = null
        this.magnetized = false
        this.createRobot()
    }

    step(action, force) {
        const linearForce = 15
        const rotationalForce = 100
        if (force) {
            this.vehicle.applyEngineForce(action[0], 0)
            this.vehicle.applyEngineForce(action[1], 1)
            this.vehicle.applyEngineForce(action[2], 2)
            this.vehicle.applyEngineForce(action[3], 3)
        }
        else {
            switch (action) {
                // Forward
                case 0:
                    this.vehicle.applyEngineForce(linearForce, 0)
                    this.vehicle.applyEngineForce(linearForce, 1)
                    this.vehicle.applyEngineForce(linearForce, 2)
                    this.vehicle.applyEngineForce(linearForce, 3)
                    break
                // Backward
                case 1:
                    this.vehicle.applyEngineForce(-linearForce, 0)
                    this.vehicle.applyEngineForce(-linearForce, 1)
                    this.vehicle.applyEngineForce(-linearForce, 2)
                    this.vehicle.applyEngineForce(-linearForce, 3)
                    break
                // Left
                case 2:
                    this.vehicle.applyEngineForce(rotationalForce, 0)
                    this.vehicle.applyEngineForce(-rotationalForce, 1)
                    this.vehicle.applyEngineForce(rotationalForce, 2)
                    this.vehicle.applyEngineForce(-rotationalForce, 3)
                    break
                // Right
                case 3:
                    this.vehicle.applyEngineForce(-rotationalForce, 0)
                    this.vehicle.applyEngineForce(rotationalForce, 1)
                    this.vehicle.applyEngineForce(-rotationalForce, 2)
                    this.vehicle.applyEngineForce(rotationalForce, 3)
                    break
                // Stop
                case 4:
                    this.vehicle.applyEngineForce(0, 0)
                    this.vehicle.applyEngineForce(0, 1)
                    this.vehicle.applyEngineForce(0, 2)
                    this.vehicle.applyEngineForce(0, 3)
                    this.hinge.setMotorSpeed(0)
                    break
                // Up
                case 5:
                    this.hinge.setMotorSpeed(1)
                    break
                // Down
                case 6:
                    this.hinge.setMotorSpeed(-1)
                    break
                // Magnetize
                case 7:
                    this.magnetized = true
                    break
                // Demagnetize
                case 8:
                    this.magnetized = false
                    if (this.objectConstraint != null) {
                        this.world.removeConstraint(this.objectConstraint)
                        this.objectConstraint = null
                    }
                    break
                // Brake
                case 9:
                    this.vehicle.setBrake(10, 0)
                    this.vehicle.setBrake(10, 1)
                    this.vehicle.setBrake(10, 2)
                    this.vehicle.setBrake(10, 3)
                    break
                // Release Brake
                case 10:
                    this.vehicle.setBrake(0, 0)
                    this.vehicle.setBrake(0, 1)
                    this.vehicle.setBrake(0, 2)
                    this.vehicle.setBrake(0, 3)
                    break
            }
        }
    }

    createRobot() {
        // Build the car chassis
        const bodyWidth = 1.25
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1.4, 1.7, bodyWidth))
        const chassisBody = new CANNON.Body({ mass: 20 })
        chassisBody.addShape(chassisShape)

        // Arm front
        const arm = new CANNON.Body({ mass: 0.1 });
        const lengthToPivot = 2.3;
        const distanceFromChassis = 1.1;
        let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        arm.addShape(new CANNON.Box(new CANNON.Vec3(bodyWidth, 0.15, 0.05)), new CANNON.Vec3(lengthToPivot, 0, 0.0), quat);

        // Arm left
        arm.addShape(new CANNON.Box(new CANNON.Vec3(lengthToPivot / 2, 0.15, 0.05)), new CANNON.Vec3(lengthToPivot / 2, 0, -bodyWidth - 0.1));

        // Arm right
        arm.addShape(new CANNON.Box(new CANNON.Vec3(lengthToPivot / 2, 0.15, 0.05)), new CANNON.Vec3(lengthToPivot / 2, 0, bodyWidth + 0.1));

        // Arm magnet
        let quatFront = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);
        arm.addShape(new CANNON.Cylinder(0.25, 0.25, 0.1), new CANNON.Vec3(lengthToPivot + 0.18, 0, 0.0), quatFront);

        this.inContact = (c) => {
            const contactPoint = c.target.pointToLocalFrame(c.contact.bj.position.vadd(c.contact.rj))
            return contactPoint.distanceTo(new CANNON.Vec3(lengthToPivot + 0.4, 0, 0.0)) <= 0.5
        }

        this.world.addBody(arm);

        const attach = (c) =>
        {
            if (this.env.objectsId.includes(c.body.id) && this.objectConstraint == null && this.inContact(c) && this.magnetized) {
                // let contactObject = c.body.pointToLocalFrame(c.contact.bi.position.vadd(c.contact.ri))
                // let contactArm = c.target.pointToLocalFrame(c.contact.bj.position.vadd(c.contact.rj))

                // const objectConstraint = new CANNON.PointToPointConstraint(c.body, contactObject, c.target, contactArm);
                const objectConstraint = new CANNON.LockConstraint(c.body, c.target);

                this.world.addConstraint(objectConstraint)
                this.objectConstraint = objectConstraint
            }
    
        }
        arm.addEventListener('collide', attach)

        // Define the hinge constraint
        const height = -0.75;
        // const pivotA = new CANNON.Vec3(-1.5, 0, 0); // Pivot point relative to the second body
        const pivotA = new CANNON.Vec3(0, 0, 0); // Pivot point relative to the second body
        const pivotB = new CANNON.Vec3(distanceFromChassis, height, 0); // Pivot point relative to the first body
        const axisA = new CANNON.Vec3(0, 0, 1); // Axis of rotation (e.g., around the z-axis)
        const axisB = new CANNON.Vec3(0, 0, 1); // Axis of rotation (e.g., around the z-axis)

        // Create and add the hinge constraint
        const hingeConstraint = new CANNON.HingeConstraint(arm, chassisBody, {
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
        const wheelMaterial = new CANNON.Material('wheelMaterial')
        const wheelOptions = {
            radius: 0.5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 100,
            suspensionRestLength: 0.15,
            frictionSlip: 5.0,
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
        wheelOptions.chassisConnectionPointLocal.set(-0.75, -1.5, 1.4)
        vehicle.addWheel(wheelOptions)

        // Rear wheel left
        wheelOptions.chassisConnectionPointLocal.set(-0.75, -1.5, -1.4)
        vehicle.addWheel(wheelOptions)

        // Front wheel right
        wheelOptions.chassisConnectionPointLocal.set(0.75, -1.5, 1.4)
        vehicle.addWheel(wheelOptions)

        // Front wheel left
        wheelOptions.chassisConnectionPointLocal.set(0.75, -1.5, -1.4)
        vehicle.addWheel(wheelOptions)

        vehicle.addToWorld(this.world)

        // Add the wheel bodies
        const wheelBodies = []
        // const wheelMaterial = new CANNON.Material('wheel')
        vehicle.wheelInfos.forEach((wheel) => {
            const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
            const wheelBody = new CANNON.Body({
                mass: 1,
                material: wheelMaterial,
            })
            wheelBody.type = CANNON.Body.KINEMATIC
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
        const wheelGround = new CANNON.ContactMaterial(wheelMaterial, defaultMaterial, {
            friction: 0.3,
            restitution: 0,
            contactEquationStiffness: 1000,
        })
        this.world.addContactMaterial(wheelGround)
        this.vehicle = vehicle
        this.chassisBody = chassisBody
        this.arm = arm
        this.wheelBodies = wheelBodies
        this.hinge = hingeConstraint
    }
    
    completeStop(){
        this.step(4, false)
        this.vehicle.chassisBody.velocity.set(0, 0, 0);
        this.vehicle.chassisBody.angularVelocity.set(0, 0, 0);
    }

    get position() {
        return this.chassisBody.position
    }

    set position(position) {
        this.chassisBody.position.copy(position)
    }

    set armPosition(position) {
        const armPosition = this.chassisBody.pointToWorldFrame(position)
        this.arm.position.copy(armPosition)
    }

    set armQuaternion(quaternion) {
        this.arm.quaternion.copy(quaternion)
    }

    get quaternion() {
        return this.chassisBody.quaternion
    }

    set quaternion(quaternion) {
        this.chassisBody.quaternion.copy(quaternion)
    }

    get yaw() {
        const euler = new CANNON.Vec3()
        this.chassisBody.quaternion.toEuler(euler)
        return euler.y
    }

    set yaw(angle) {
        this.chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle)
    }

    get velocity() {
        return this.chassisBody.velocity
    }

    get angularVelocity() {
        return this.chassisBody.angularVelocity
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
        const maxPosition = 10
        return Math.max(-1, Math.min(1, position / maxPosition))

    }
    getObservation() {
        const position = this.env.robot.position
        const quaternion = this.env.robot.quaternion
        const finalPosition = this.finalPosition
        const finalQuaternion = this.finalQuaternion

        return [
            this._normalizePosition(position.x), 
            this._normalizePosition(position.y), 
            this._normalizePosition(position.z), 
            quaternion.x, 
            quaternion.y, 
            quaternion.z, 
            quaternion.w,
            this._normalizePosition(finalPosition.x),
            this._normalizePosition(finalPosition.y),
            this._normalizePosition(finalPosition.z),
            finalQuaternion.x,
            finalQuaternion.y,
            finalQuaternion.z,
            finalQuaternion.w
        ]
    }

    getReward() {
        // Reward function
        const LAMBDA = 10
        const positionError = this.env.robot.position.distanceTo(this.finalPosition)
        let positionReward = LAMBDA*(Math.E**-positionError)

        // Goal Reward
        if (positionError < 0.2) {
            positionReward += 100
        }

        let orientationError = this.finalQuaternion.inverse().mult(this.env.robot.quaternion);
        orientationError = Math.sqrt(Math.pow(orientationError.x, 2) + Math.pow(orientationError.y, 2) + Math.pow(orientationError.z, 2) + Math.pow(orientationError.w, 2))
        return positionReward
        // return -positionError - orientationError
    }

    isDone() {
        // Termination function
        if (this.num_step >= 700) {
            return true
        }
        else {
            return false
        }
    }

    get getObservationSpace() {
        return 14
    }
}


export default class Environment {
    constructor() {
        this.objects = {}
        this.objectsId = []
        this.enableController = true
        this.task = new Task(this, new CANNON.Vec3(0, 0, 0), new CANNON.Quaternion())

        this.createWorld()
        this.createRobot()
        this.reset()
        this.createBlocks()
        this.setupUserInput()
        
    }

    get actionSpace() {
        return this.robot.actionSpace
    }

    get observationSpace() {
        return this.task.getObservationSpace
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min
    }

    createWorld() {
        // Create world
        const world = new CANNON.World()
        // world.broadphase = new CANNON.SAPBroadphase(world)
        world.gravity.set(0, -9.82, 0)
        // world.solver.iterations = 10

        // Create a plane
        const groundShape = new CANNON.Plane()
        const groundBody = new CANNON.Body({ mass: 0 })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
        world.addBody(groundBody)
        this.world = world
    }

    reset() {
        this.robot.completeStop()
        this.robot.position = new CANNON.Vec3(-8, 3, 0)
        this.robot.yaw = -Math.PI / 2

        this.robot.armPosition = new CANNON.Vec3(2, 0, 0)
        this.robot.armQuaternion = this.robot.quaternion

        // let randomOrientation = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.random() * Math.PI)
        let randomOrientation = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0)
        const randomPosition = new CANNON.Vec3(this.randomRange(-5, 5), 2.0, this.randomRange(-5, 5))
        // return this.task.reset(new CANNON.Vec3(0, 2.0, 5), randomOrientation)
        return this.task.reset(randomPosition, randomOrientation)
    }

    applyAction(action, force=false) {
        this.robot.step(action, force)
    }

    _physicsStep(fixed) {
        if (fixed) {
            this.world.fixedStep()
        }
        else {
            this.world.step(1 / 60)
        }
    }

    step(fixed=false) {
        this._physicsStep(fixed)
        return this.task.step()
    }

    createRobot() {
        this.robot = new Robot(this)
        this.objects['Robot'] = this.robot.chassisBody
        this.objects['Arm'] = this.robot.arm
        this.objects['Wheel 1 Right'] = this.robot.wheelBodies[0]
        this.objects['Wheel 2 Right'] = this.robot.wheelBodies[2]
        this.objects['Wheel 1 Left'] = this.robot.wheelBodies[1]
        this.objects['Wheel 2 Left'] = this.robot.wheelBodies[3]
    }

    createBlocks() {
        // Create a box
        const randomizeTop = Math.floor(this.randomRange(0, 3))
        const randomizeBottom = Math.floor(this.randomRange(12, 15))
        this.randomizedBlocks = [{'index': randomizeTop}, {'index': randomizeBottom}]
        for (let i=0; i<16; i++) {
            const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
            const boxBody = new CANNON.Body({ mass: 0.01 })

            const {row, column} = this.indexToGrid(i, 4)
            let x = column * 3 - 4.5
            let z = row * 3 - 4.5
            // let ori = this.randomRange(-0.05, 0.05)
            let ori = 0.0

            switch (i) {
                case randomizeTop:
                    this.randomizedBlocks[0]['desiredPos'] = new CANNON.Vec3(x, 0, z)
                    x = Math.floor(this.randomRange(0, 7))
                    z = Math.floor(this.randomRange(-8.5, -8.0))
                    ori = this.randomRange(0, 1.0)
                    break
                case randomizeBottom:
                    this.randomizedBlocks[1]['desiredPos'] = new CANNON.Vec3(x, 0, z)
                    x = Math.floor(this.randomRange(0, 7))
                    z = Math.floor(this.randomRange(8.0, 8.5))
                    ori = this.randomRange(-1.0, 0)
                    break
            }
            boxBody.addShape(boxShape)
            boxBody.position.set(x, 3, z)
            boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), ori)
            this.world.addBody(boxBody)
            this.objects[`Letter ${i + 1}`] = boxBody
            this.objectsId.push(boxBody.id)
        }
    }

    indexToGrid(index, numColumns) {
        const row = Math.floor(index / numColumns);
        const column = index % numColumns;
        return { row: row, column: column };
    }

    angleBetweenPos(pos1, pos2){
        const diffX = pos2.x - pos1.x
        const diffZ = pos2.z - pos1.z
        return -Math.atan2(diffZ, diffX)
    }
    

    *generateCommands() {
        //////////////////////////
        // Bottom Block
        //////////////////////////
        let blockId = this.randomizedBlocks[1].index
        let blockDesiredPos = this.randomizedBlocks[1].desiredPos
        let block = this.objects[`Letter ${blockId + 1}`]
        let ori;

        // Navigate to Block
        let pos1 = block.pointToWorldFrame(new CANNON.Vec3(0, 0, 5.0))
        yield {'command': 'navigate', 'args': {'position': new CANNON.Vec3(this.robot.position.x, 0, pos1.z), 'orientation': 0.0}}
        ori = new CANNON.Vec3(0, 0, 0)
        block.quaternion.toEuler(ori)
        ori = ori.y + Math.PI/2
        yield {'command': 'navigate', 'args': {'position': new CANNON.Vec3(pos1.x, 0, pos1.z), 'orientation': ori}}
        yield {'command': 'magnetize'}

        // Attach Block
        yield {'command': 'forward', 'args': {'distance': 0.6}}
        yield {'command': 'arm', 'args': {'orientation': 0.9}}

        // Place Block
        yield {'command': 'navigate', 'args': {'position': new CANNON.Vec3(blockDesiredPos.x, 0, this.robot.position.z), 'orientation': Math.PI/2}}
        yield {'command': 'forward', 'args': {'distance': Math.abs(blockDesiredPos.z + 4.4 - this.robot.position.z)}}
        yield {'command': 'arm', 'args': {'orientation': 0}}
        yield {'command': 'demagnetize'}
        yield {'command': 'backward', 'args': {'distance': 1}}

        //////////////////////////
        // Return Home
        //////////////////////////
        yield {'command': 'navigate', 'args': {'position': new CANNON.Vec3(-8, 0, this.robot.position.z), 'orientation': Math.PI/2}}

        //////////////////////////
        // Top Block
        //////////////////////////
        blockId = this.randomizedBlocks[0].index
        blockDesiredPos = this.randomizedBlocks[0].desiredPos
        block = this.objects[`Letter ${blockId + 1}`]

        // Navigate to Block
        pos1 = block.pointToWorldFrame(new CANNON.Vec3(0, 0, -5.0))
        yield {'command': 'navigate', 'args': {'position': new CANNON.Vec3(this.robot.position.x, 0, pos1.z), 'orientation': 0.0}}
        ori = new CANNON.Vec3(0, 0, 0)
        block.quaternion.toEuler(ori)
        ori = ori.y - Math.PI/2

        yield {'command': 'navigate', 'args': {'position': new CANNON.Vec3(pos1.x, 0, pos1.z), 'orientation': ori}}
        yield {'command': 'magnetize'}

        // Attach Block
        yield {'command': 'forward', 'args': {'distance': 0.6}}
        yield {'command': 'arm', 'args': {'orientation': 0.9}}

        // Place Block
        yield {'command': 'navigate', 'args': {'position': new CANNON.Vec3(blockDesiredPos.x, 0, this.robot.position.z), 'orientation': -Math.PI/2}}
        yield {'command': 'forward', 'args': {'distance': Math.abs(blockDesiredPos.z - 4.4 - this.robot.position.z)}}
        yield {'command': 'arm', 'args': {'orientation': 0}}
        yield {'command': 'demagnetize'}
        yield {'command': 'backward', 'args': {'distance': 1}}

    }
    
    setupUserInput() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'm':
                    this.setupControls()
                    this.enableController = false
                    this.robot.completeStop()
                    this.applyAction(4)
                    break
                default:
                    break

            }
        })
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

                case 'w':
                    this.applyAction(5)
                    break

                case 's':
                    this.applyAction(6)
                    break

                case 'a':
                    this.applyAction(7)
                    break
                
                case 'd':
                    this.applyAction(8)
                    break

            }
        })

        // Reset force on keyup
        document.addEventListener('keyup', (event) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(event.key)) {
                this.applyAction(4)
            }
        })
    }
}