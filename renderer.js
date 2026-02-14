import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class WebRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentObject = null;
        this.ambientLight = null;
        this.directionalLight = null;
        this.isRotating = true;
        this.gltfLoader = new GLTFLoader();
        
        // FPS counter
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        this.init();
        this.animate();
    }

    init() {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Setup camera
        const canvas = document.getElementById('renderCanvas');
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Setup lights
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(this.directionalLight);

        // Add point lights for better illumination
        const pointLight1 = new THREE.PointLight(0x4a90e2, 0.5);
        pointLight1.position.set(-5, 3, -5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xe24a90, 0.5);
        pointLight2.position.set(5, -3, -5);
        this.scene.add(pointLight2);

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;

        // Load default shape
        this.loadShape('cube');

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    loadShape(shapeType) {
        // Remove current object
        if (this.currentObject) {
            this.scene.remove(this.currentObject);
        }

        let geometry;
        switch (shapeType) {
            case 'cube':
                geometry = new THREE.BoxGeometry(2, 2, 2);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(1.5, 32, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(1.5, 2.5, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(1, 1, 2.5, 32);
                break;
            case 'teapot':
                // Create a teapot-like shape using multiple geometries
                const group = new THREE.Group();
                
                // Body (sphere)
                const bodyGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7);
                const bodyMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x4a90e2,
                    metalness: 0.3,
                    roughness: 0.4
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                group.add(body);
                
                // Spout (cone)
                const spoutGeometry = new THREE.ConeGeometry(0.15, 0.8, 16);
                const spout = new THREE.Mesh(spoutGeometry, bodyMaterial);
                spout.rotation.z = Math.PI / 2;
                spout.position.set(1, 0, 0);
                group.add(spout);
                
                // Handle (torus)
                const handleGeometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI);
                const handle = new THREE.Mesh(handleGeometry, bodyMaterial);
                handle.rotation.y = Math.PI / 2;
                handle.position.set(-0.8, 0, 0);
                group.add(handle);
                
                // Lid (cylinder + sphere)
                const lidGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.2, 32);
                const lid = new THREE.Mesh(lidGeometry, bodyMaterial);
                lid.position.y = 0.8;
                group.add(lid);
                
                const knobGeometry = new THREE.SphereGeometry(0.2, 16, 16);
                const knob = new THREE.Mesh(knobGeometry, bodyMaterial);
                knob.position.y = 1;
                group.add(knob);
                
                this.currentObject = group;
                this.scene.add(this.currentObject);
                return;
        }

        const material = new THREE.MeshStandardMaterial({
            color: 0x4a90e2,
            metalness: 0.3,
            roughness: 0.4,
            flatShading: false
        });

        this.currentObject = new THREE.Mesh(geometry, material);
        this.currentObject.castShadow = true;
        this.currentObject.receiveShadow = true;
        this.scene.add(this.currentObject);
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            
            this.gltfLoader.parse(arrayBuffer, '', (gltf) => {
                // Remove current object
                if (this.currentObject) {
                    this.scene.remove(this.currentObject);
                }

                this.currentObject = gltf.scene;
                
                // Center the model
                const box = new THREE.Box3().setFromObject(this.currentObject);
                const center = box.getCenter(new THREE.Vector3());
                this.currentObject.position.sub(center);
                
                // Scale the model to fit the scene
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 3 / maxDim;
                this.currentObject.scale.multiplyScalar(scale);

                this.scene.add(this.currentObject);
                
                // Enable shadows for all meshes in the model
                this.currentObject.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            }, (error) => {
                console.error('Error loading model:', error);
                alert('Error loading model. Please ensure it\'s a valid GLB/GLTF file.');
            });
        };
        reader.readAsArrayBuffer(file);
    }

    updateAmbientLight(value) {
        this.ambientLight.intensity = parseFloat(value);
        document.getElementById('ambientValue').textContent = value;
    }

    updateDirectionalLight(value) {
        this.directionalLight.intensity = parseFloat(value);
        document.getElementById('directionalValue').textContent = value;
    }

    updateObjectColor(color) {
        if (!this.currentObject) return;
        
        const newColor = new THREE.Color(color);
        this.currentObject.traverse((child) => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.color.set(newColor));
                } else {
                    child.material.color.set(newColor);
                }
            }
        });
    }

    updateBackgroundColor(color) {
        this.scene.background = new THREE.Color(color);
    }

    toggleRotation() {
        this.isRotating = !this.isRotating;
    }

    toggleWireframe() {
        if (!this.currentObject) return;
        
        this.currentObject.traverse((child) => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.wireframe = !mat.wireframe);
                } else {
                    child.material.wireframe = !child.material.wireframe;
                }
            }
        });
    }

    resetCamera() {
        this.camera.position.set(0, 0, 5);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    onWindowResize() {
        const canvas = document.getElementById('renderCanvas');
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;
        
        if (elapsed >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / elapsed);
            document.getElementById('fps-counter').textContent = `FPS: ${fps}`;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate object if enabled
        if (this.currentObject && this.isRotating) {
            this.currentObject.rotation.x += 0.005;
            this.currentObject.rotation.y += 0.01;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.updateFPS();
    }
}

// Create global instance
window.renderer = new WebRenderer();
