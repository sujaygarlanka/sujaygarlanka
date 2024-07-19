import * as CANNON from 'cannon';
import * as THREE from 'three';
import Robot from 'robot';


export default class Environment {
    constructor() {
        // this.vehicleMesh = null
        // this.wheelMeshes = {}
        // this.forkMeshes = {}
        this.objects = {}

        this.createWorld()
        this.createBlocks()
        this.createRobot()
        this.setupControls()

    }

    createWorld() {
        // Create world
        const world = new CANNON.World()
        // world.broadphase = new CANNON.SAPBroadphase(world)
        world.allowSleep = true
        world.gravity.set(0, -9.82, 0)
        world.solver.iterations = 10

        // Create a plane
        const groundShape = new CANNON.Plane()
        const groundBody = new CANNON.Body({ mass: 0 })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
        world.addBody(groundBody)

        this.world = world      
    }

    step(action) {
        if (action != null) {
            this.robot.step(action)
        }
        this.world.step(1 / 60)
    }

    showAxes(body) {
        const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.objectsToUpdate.push({mesh: cube, getPos(){return body.position}, getOri(){return body.quaternion}});
        cube.add(new THREE.AxesHelper(1))
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

    getObservation() {
        return {
            robotPosition: this.robot.chassisBody.position,
            robotOrientation: this.robot.chassisBody.quaternion
        }
    }

    setupControls() {
        // Keybindings
        // Add force on keydown
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
              case 'ArrowUp':
                this.robot.step([1, 1, 1, 1, 0])
                break
  
              case 'ArrowDown':
                this.robot.step([-1, -1, -1, -1, 0])
                break
  
              case 'ArrowLeft':
                this.robot.step([3, -3, 3, -3, 0])
                break
  
              case 'ArrowRight':
                this.robot.step([-3, 3, -3, 3, 0])
                break

              case 'w':
                this.robot.step([0, 0, 0, 0, -1])
                break

              case 's':
                this.robot.step([0, 0, 0, 0, 1])
                break

            }
          })
  
          // Reset force on keyup
          document.addEventListener('keyup', (event) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's'].includes(event.key)) {
              this.robot.step([0, 0, 0, 0, 0])
            }
            else {
              this.robot.step([0, 0, 0, 0, 0])
            }
          })
    }
}