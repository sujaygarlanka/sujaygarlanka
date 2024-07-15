import * as CANNON from 'cannon';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Robot {
    constructor(world, scene, objectsToUpdate) {
        this.world = world
        this.scene = scene
        this.objectsToUpdate = objectsToUpdate
        // this.vehicleMesh = null
        // this.wheelMeshes = {}
        // this.forkMeshes = {}
        this.loadRobotMeshes()
        this.createRobot()
        this.setupControls()
    
    }

    showAxes(body) {
        const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.objectsToUpdate.push({mesh: cube, getPos(){return body.position}, getOri(){return body.quaternion}});
        cube.add(new THREE.AxesHelper(1))
    }

    loadRobotMeshes() {
        const gltfLoader = new GLTFLoader()
        // let mixer = null

        

        gltfLoader.load(
            './robot/scene.gltf',
            (gltf) =>
            {
                gltf.scene.scale.set(0.004, 0.004, 0.004)
                this.scene.add(gltf.scene)
                const vehicleMesh = gltf.scene
                vehicleMesh.add(new THREE.AxesHelper(1))
                const chassisBody = this.chassisBody
                this.objectsToUpdate.push({ mesh: vehicleMesh, 
                    getPos(){
                        const localPoint = {
                            x: 0.4,
                            y: -0.65,
                            z: 0.0
                        }

                        return chassisBody.pointToWorldFrame(localPoint)
                
                    }, 
                    getOri(){
                        
                        return chassisBody.quaternion
                    
                    }
                })
                // this.objectsToUpdate.push({ mesh: this.scene.getObjectByName('Wheel_back_left'), 
                //     getPos(){
                //         return this.position
                //     }, getOri(){
                //         return this.quaternion
                //     }}
            
                // )

                const backLeft = this.scene.getObjectByName('Wheel_back_left')
                const backRight = this.scene.getObjectByName('Wheel_back_right')
                const frontLeft = this.scene.getObjectByName('Wheel_front_left')
                const frontRight = this.scene.getObjectByName('Wheel_front_right')

                const frontHorizontal = this.scene.getObjectByName('Fork_horizontal')
                const forkLeft = this.scene.getObjectByName('Fork_left')
                const forkRight = this.scene.getObjectByName('Fork_right')
                const forkVertical = this.scene.getObjectByName('Fork_vertical')

                // Animation
                // mixer = new THREE.AnimationMixer(gltf.scene)
                // const action = mixer.clipAction(gltf.animations[0])
                // action.play()
            }
        )
    }

    createRobot() {
        const VEHICLE_SCALE = 0.27

        // Build the car chassis
        const chassisShape = new CANNON.Box(new CANNON.Vec3(2.5 * VEHICLE_SCALE, 2.3 * VEHICLE_SCALE, VEHICLE_SCALE))
        const chassisBody = new CANNON.Body({ mass: 10 })
        chassisBody.addShape(chassisShape)
        chassisBody.position.set(-1.5, 0.8, 3.0)
        chassisBody.angularVelocity.set(0, 0.5, 0)
        this.showAxes(chassisBody)

        // // Fork lift
        // const forkBack = new CANNON.Body({ mass: 0.1 });
        // forkBack.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.01)));
        // let pos = new CANNON.Vec3(0.52, 0.4, 0.0);
        // let quaternion = new CANNON.Quaternion().setFromEuler(0, Math.PI / 2, 0)
        // forkBack.position.copy(chassisBody.pointToWorldFrame(pos));
        // forkBack.quaternion.copy(quaternion);
        // this.world.addBody(forkBack);
        // this.showAxes(forkBack);

        let pos;
        let quaternion;

        // const forkVertical = new CANNON.Body({ mass: 0.1 });
        // forkVertical.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.09, 0.01)));
        // pos = new CANNON.Vec3(0.72, -0.5, 0.0);
        // quaternion = new CANNON.Quaternion().setFromEuler(0, Math.PI / 2, 0)
        // forkVertical.position.copy(chassisBody.pointToWorldFrame(pos));
        // forkVertical.quaternion.copy(quaternion);
        // this.world.addBody(forkVertical);
        // this.showAxes(forkVertical);

        const forkLeft = new CANNON.Body({ mass: 0.1 });
        forkLeft.addShape(new CANNON.Box(new CANNON.Vec3(0.37, 0.05, 0.01)));
        pos = new CANNON.Vec3(1.1, -0.48, -0.4);
        forkLeft.position.copy(chassisBody.pointToWorldFrame(pos));
        this.world.addBody(forkLeft);
        this.showAxes(forkLeft);

        const forkRight = new CANNON.Body({ mass: 0.1 });
        forkRight.addShape(new CANNON.Box(new CANNON.Vec3(0.37, 0.05, 0.01)));
        pos = new CANNON.Vec3(1.1, -0.48, 0.4);
        forkRight.position.copy(chassisBody.pointToWorldFrame(pos));
        this.world.addBody(forkRight);
        this.showAxes(forkRight);

        // // Create a LockConstraint to lock the bodies together
        // const lockConstraintHorizontalBack = new CANNON.LockConstraint(chassisBody, forkBack);
        // const lockConstraintVertical = new CANNON.LockConstraint(chassisBody, forkVertical);
        const lockConstraintLeft = new CANNON.LockConstraint(chassisBody, forkLeft);
        const lockConstraintRight = new CANNON.LockConstraint(chassisBody, forkRight);
        // this.world.addConstraint(lockConstraintVertical);
        // this.world.addConstraint(lockConstraintLeft);
        // this.world.addConstraint(lockConstraintRight);

        // lockConstraintVertical.equationY.minForce = 0;
        // lockConstraintVertical.equationY.maxForce = 0;

        // lockConstraintLeft.equationY.minForce = 0;
        // lockConstraintLeft.equationY.maxForce = 0;

        // lockConstraintRight.equationY.minForce = 0;
        // lockConstraintRight.equationY.maxForce = 0;

        // Create the vehicle
        const vehicle = new CANNON.RaycastVehicle({
            chassisBody,
        })

        const wheelOptions = {
            radius: 0.55 * VEHICLE_SCALE,
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
        wheelOptions.chassisConnectionPointLocal.set(-1.65 * VEHICLE_SCALE, -1.5 * VEHICLE_SCALE, 1.15 * VEHICLE_SCALE)
        vehicle.addWheel(wheelOptions)

        // Rear wheel left
        wheelOptions.chassisConnectionPointLocal.set(-1.65 * VEHICLE_SCALE, -1.5 * VEHICLE_SCALE, -1.15 * VEHICLE_SCALE)
        vehicle.addWheel(wheelOptions)

        // Front wheel right
        wheelOptions.chassisConnectionPointLocal.set(1.8 * VEHICLE_SCALE, -1.5 * VEHICLE_SCALE, 1.6 * VEHICLE_SCALE)
        vehicle.addWheel(wheelOptions)

        // Front wheel left
        wheelOptions.chassisConnectionPointLocal.set(1.8 * VEHICLE_SCALE, -1.5 * VEHICLE_SCALE, -1.6 * VEHICLE_SCALE)
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

        this.wheelBodies = wheelBodies
        this.chassisBody = chassisBody
        this.vehicle = vehicle
        this.forkVertical = forkLeft


        // this.forkLeft = forkLeft
        // this.forkRight = forkRight
    }

    setupControls() {
        // Keybindings
        // Add force on keydown
        document.addEventListener('keydown', (event) => {
            const maxForce = 10
  
            switch (event.key) {
              case 'ArrowUp':
                this.vehicle.applyEngineForce(maxForce, 0)
                this.vehicle.applyEngineForce(maxForce, 1)
                this.vehicle.applyEngineForce(maxForce, 2)
                this.vehicle.applyEngineForce(maxForce, 3)
                break
  
              case 'ArrowDown':
                this.vehicle.applyEngineForce(-maxForce, 0)
                this.vehicle.applyEngineForce(-maxForce, 1)
                this.vehicle.applyEngineForce(-maxForce, 2)
                this.vehicle.applyEngineForce(-maxForce, 3)
                break
  
              case 'ArrowLeft':
                this.vehicle.applyEngineForce(maxForce*10, 0)
                this.vehicle.applyEngineForce(-maxForce*10, 1)
                this.vehicle.applyEngineForce(maxForce*10, 2)
                this.vehicle.applyEngineForce(-maxForce*10, 3)
                break
  
              case 'ArrowRight':
                this.vehicle.applyEngineForce(-maxForce*10, 0)
                this.vehicle.applyEngineForce(maxForce*10, 1)
                this.vehicle.applyEngineForce(-maxForce*10, 2)
                this.vehicle.applyEngineForce(maxForce*10, 3)
                break
  
              case 'w':
                console.log('hello');
                this.forkVertical.applyForce(new CANNON.Vec3(0, 100, 0), new CANNON.Vec3(0, 0, 0));
                console.log(this.forkVertical)
                // this.forkVertical.position.y += 0.1
                break

              case 's':
                this.forkVertical.applyForce(new CANNON.Vec3(0, -10, 0), new CANNON.Vec3(0, 0, 0));
                // this.forkVertical.position.y -= 0.1
                break

            }
          })
  
          // Reset force on keyup
          document.addEventListener('keyup', (event) => {
            switch (event.key) {
              case 'ArrowUp':
                this.vehicle.applyEngineForce(0, 0)
                this.vehicle.applyEngineForce(0, 1)
                this.vehicle.applyEngineForce(0, 2)
                this.vehicle.applyEngineForce(0, 3)
                break
  
              case 'ArrowDown':
                this.vehicle.applyEngineForce(0, 0)
                this.vehicle.applyEngineForce(0, 1)
                this.vehicle.applyEngineForce(0, 2)
                this.vehicle.applyEngineForce(0, 3)
                break
  
              case 'ArrowLeft':
                this.vehicle.applyEngineForce(0, 0)
                this.vehicle.applyEngineForce(0, 1)
                this.vehicle.applyEngineForce(0, 2)
                this.vehicle.applyEngineForce(0, 3)
                break
  
              case 'ArrowRight':
                this.vehicle.applyEngineForce(0, 0)
                this.vehicle.applyEngineForce(0, 1)
                this.vehicle.applyEngineForce(0, 2)
                this.vehicle.applyEngineForce(0, 3)
                break
            
            case 'w':
                this.forkVertical.applyForce(new CANNON.Vec3(0, 0, 0), this.forkVertical.position);
                break

            case 's':
                this.forkVertical.applyForce(new CANNON.Vec3(0, 0, 0), this.forkVertical.position);
                break
  
            }
          })
    }
}