        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
        import { FontLoader } from 'three/addons/loaders/FontLoader.js';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
		import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
        import * as CANNON from 'cannon';
        import CannonDebugger from "cannon-es-debugger";
        import {threeToCannon, ShapeType} from 'https://esm.run/three-to-cannon';
        import { bodyToMesh } from './three-conversion-utils.js'


        import Robot from 'robot';

		let camera, controls, scene, renderer, effect, canvas_div;

        /**
         * Canvas
         */
        const canvas = document.querySelector('canvas.webgl')

        /**
         * Scene
         */
        scene = new THREE.Scene()
        scene.background = new THREE.Color( 0xECE8E5 );

        const axesHelper = new THREE.AxesHelper(2)
        scene.add(axesHelper)

		/**
		 * Physics
		 */
        const objectsToUpdate = []
		const world = new CANNON.World()
		// world.broadphase = new CANNON.SAPBroadphase(world)
		world.allowSleep = true
		world.gravity.set(0, -9.82, 0)
        world.solver.iterations = 100;

        /**
         * Debugger
         */
        const cannonDebugger = new CannonDebugger(scene, world, {
            // options...
        })          

		// Default material
		const defaultMaterial = new CANNON.Material('default')
		const defaultContactMaterial = new CANNON.ContactMaterial(
			defaultMaterial,
			defaultMaterial,
			{
				friction: 0.01,
				restitution: 0.3
			}
		)
		world.defaultContactMaterial = defaultContactMaterial

		/**
         * Floor
         */
		const floorShape = new CANNON.Plane()
		const floorBody = new CANNON.Body()
		floorBody.mass = 0
		floorBody.addShape(floorShape)
		floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5) 
		world.addBody(floorBody)

        // const floor = new THREE.Mesh(
        //     new THREE.PlaneGeometry(20, 20),
        //     new THREE.MeshStandardMaterial({
        //         color: '#777777',
        //         metalness: 0.3,
        //         roughness: 0.4,
        //         // envMap: environmentMapTexture,
        //         envMapIntensity: 0.5
        //     })
        // )
        // floor.receiveShadow = true
        // floor.rotation.x = - Math.PI * 0.5
        // scene.add(floor)

        /**
         * Lights
         */
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.camera.left = - 7
        directionalLight.shadow.camera.top = 7
        directionalLight.shadow.camera.right = 7
        directionalLight.shadow.camera.bottom = - 7
        directionalLight.position.set(5, 5, 5)
        scene.add(directionalLight)
 
        /**
         * Textures
         */
        const textureLoader = new THREE.TextureLoader()
        const matcapTexture = textureLoader.load('textures/white.png')
        matcapTexture.colorSpace = THREE.SRGBColorSpace


        /**
         * Sounds
         */
        // const hitSound = new Audio('/sounds/hit.mp3')

        // const playHitSound = (collision) =>
        // {
        //     const impactStrength = collision.contact.getImpactVelocityAlongNormal()

        //     if(impactStrength > 1.5)
        //     {
        //         hitSound.volume = Math.random()
        //         hitSound.currentTime = 0
        //         hitSound.play()
        //     }
        // }

        /**
         * Robot
         */
        // const robot = new Robot(world, scene, objectsToUpdate)


        const gltfLoader = new GLTFLoader()
        // let mixer = null

        

        // gltfLoader.load(
        //     './js/personal_website.gltf',
        //     (gltf) =>
        //     {
        //         scene.add(gltf.scene)
        //     })

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

		// Controls
		controls = new OrbitControls(camera, canvas)
		// controls.enableDamping = true
        // controls.enableZoom = false
        // controls.enableRotate = false
        // controls.enablePan = false


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
        const clock = new THREE.Clock()
        let oldElapsedTime = 0

        const tick = () =>
        {
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime
        
            // Update physics
            // world.step(1 / 60, deltaTime, 3)
            world.fixedStep()
            
            // for(const object of objectsToUpdate)
            // {
            //     object.mesh.position.copy(object.getPos())
            //     object.mesh.quaternion.copy(object.getOri())
            // }

            // Update mixer
            // if(mixer)
            // {
            //     mixer.update(deltaTime)
            // }
            

            // Update controls
            controls.update();

            // Update the debug renderer
            cannonDebugger.update();

            // Render
            renderer.render(scene, camera);

            // Call tick again on the next frame
            window.requestAnimationFrame(tick);
			
        }

        tick()

		////////////////////////////////////////

        function getRand(min, max) {
            return Math.random() * (max - min) + min;
        }

        function computeBoundingBox(geometry) {
            
            geometry.computeBoundingBox();
            const max_val = geometry.boundingBox.max
            const min_val = geometry.boundingBox.min
            return {
                width: max_val.x - min_val.x,
                height: max_val.y - min_val.y,
                depth: max_val.z - min_val.z
            }
        }

		// Function to create text
		function createText(font, text) {
			return new TextGeometry(
				text,
				{
					font: font,
					size: 1.0,
					depth: 0.35,
					curveSegments: 12,
					bevelEnabled: false,
					bevelThickness: 0.1,
					bevelSize: 0.02,
					bevelOffset: 0,
					bevelSegments: 5
				}
			)
		}
        
        // Convert position for text
        function convertPos(obj, bbox) {
            const localPoint = {
                x: -bbox.width / 2,
                y: -bbox.height / 2,
                z: -bbox.depth / 2
            }
            return obj.pointToWorldFrame(localPoint)
        }

        function createTetra() {
            // Define vertices of the ramp
            const vertices = [
                new CANNON.Vec3(0, 0, 0), // Front left
                new CANNON.Vec3(2, 0, 0), // Front right
                new CANNON.Vec3(0, 0, -5), // Back left
                new CANNON.Vec3(2, 0,  -5), // Back right
                new CANNON.Vec3(0, 2,  -5), // Back left top
                new CANNON.Vec3(2, 2,  -5), // Back right top
            ];

            // Define faces of the ramp
            const faces = [
                [0, 1, 2, 3], // Front face
                [0, 1, 4, 5],
                [1, 3, 5],
                [0, 2, 4],
                [2, 3, 4, 5]
            ];

            return new CANNON.ConvexPolyhedron({
              vertices,
              faces
            })
        }

        // function createSphere(radius, position) {
        //         const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
        //         const sphereMaterial = new THREE.MeshStandardMaterial({
        //             metalness: 0.3,
        //             roughness: 0.4,
        //             envMapIntensity: 0.5
        //         })
        //         // Three.js mesh
        //         const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
        //         mesh.castShadow = true
        //         mesh.scale.set(radius, radius, radius)
        //         mesh.position.copy(position)
        //         scene.add(mesh)
            
        //         // Cannon.js body
        //         const shape = new CANNON.Sphere(radius)
            
        //         const body = new CANNON.Body({
        //             mass: 1,
        //             position: new CANNON.Vec3(0, 3, 0),
        //             shape: shape,
        //             material: defaultMaterial
        //         })
        //         body.position.copy(position)
        //         // body.addEventListener('collide', playHitSound)
        //         world.addBody(body)
            
        //         // Save in objects
        //         objectsToUpdate.push({ mesh, body })
        //         return body
        //     }
            