import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

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
        this.fbxLoader = new FBXLoader();
        this.objLoader = new OBJLoader();
        this.mtlLoader = new MTLLoader();
        this.textureFiles = new Map(); // Store uploaded texture files
        this.mtlFile = null; // Store uploaded MTL file
        
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

        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'fbx') {
            this.loadFBXFile(file);
        } else if (ext === 'obj') {
            this.loadOBJFile(file);
        } else {
            this.loadGLTFFile(file);
        }
    }

    handleMTLUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        this.mtlFile = { url, file };
        console.log(`Loaded MTL file: ${file.name}. Upload an OBJ model to apply.`);
    }

    handleTextureUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        this.textureFiles.clear();

        for (const file of files) {
            const url = URL.createObjectURL(file);
            this.textureFiles.set(file.name.toLowerCase(), { url, file });
        }

        // If a model is already loaded, apply textures
        if (this.currentObject) {
            this.applyUploadedTextures();
        }

        const count = files.length;
        console.log(`Loaded ${count} texture file(s). Upload an FBX model or re-upload to apply.`);
    }

    applyUploadedTextures() {
        if (!this.currentObject || this.textureFiles.size === 0) return;

        const textureLoader = new THREE.TextureLoader();

        this.currentObject.traverse((child) => {
            if (child.isMesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                    // Try to match texture by material name or map source
                    if (mat.map && mat.map.sourceFile) {
                        const texName = mat.map.sourceFile.split('/').pop().split('\\').pop().toLowerCase();
                        const entry = this.textureFiles.get(texName);
                        if (entry) {
                            mat.map = textureLoader.load(entry.url);
                            mat.map.colorSpace = THREE.SRGBColorSpace;
                            mat.needsUpdate = true;
                        }
                    }
                    // If only one texture uploaded, apply it as diffuse map
                    if (this.textureFiles.size === 1 && !mat.map) {
                        const entry = this.textureFiles.values().next().value;
                        mat.map = textureLoader.load(entry.url);
                        mat.map.colorSpace = THREE.SRGBColorSpace;
                        mat.needsUpdate = true;
                    }
                });
            }
        });
    }

    loadOBJFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;

            const loadObj = (objLoader) => {
                try {
                    const object = objLoader.parse(text);

                    // Remove current object
                    if (this.currentObject) {
                        this.scene.remove(this.currentObject);
                    }

                    this.currentObject = object;

                    // Center and scale the model
                    this.fitObjectToScene(this.currentObject);
                    this.scene.add(this.currentObject);

                    // Enable shadows
                    this.currentObject.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            // Apply default material if none
                            if (!child.material || (child.material.type === 'MeshPhongMaterial' && !child.material.map)) {
                                const materials = Array.isArray(child.material) ? child.material : [child.material];
                                materials.forEach((mat) => {
                                    if (mat.map) {
                                        mat.map.colorSpace = THREE.SRGBColorSpace;
                                    }
                                    mat.needsUpdate = true;
                                });
                            }
                        }
                    });

                    // Apply any pre-uploaded textures
                    this.applyUploadedTextures();

                } catch (error) {
                    console.error('Error loading OBJ model:', error);
                    alert('Error loading OBJ model. Please ensure it\'s a valid OBJ file.');
                }
            };

            // If MTL file was uploaded, use it
            if (this.mtlFile) {
                const mtlReader = new FileReader();
                mtlReader.onload = (mtlEvent) => {
                    const mtlText = mtlEvent.target.result;
                    const mtlLoader = new MTLLoader();

                    // Create a custom resource path from uploaded textures
                    const materials = mtlLoader.parse(mtlText, '');

                    // Override texture paths with uploaded texture blob URLs
                    if (this.textureFiles.size > 0) {
                        for (const [name, matInfo] of Object.entries(materials.materialsInfo)) {
                            for (const [key, value] of Object.entries(matInfo)) {
                                if (typeof value === 'string') {
                                    const texName = value.split('/').pop().split('\\').pop().toLowerCase();
                                    const entry = this.textureFiles.get(texName);
                                    if (entry) {
                                        matInfo[key] = entry.url;
                                    }
                                }
                            }
                        }
                    }

                    materials.preload();
                    const objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    loadObj(objLoader);
                };
                mtlReader.readAsText(this.mtlFile.file);
            } else {
                loadObj(new OBJLoader());
            }
        };
        reader.readAsText(file);
    }

    loadFBXFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;

            try {
                const object = this.fbxLoader.parse(arrayBuffer, '');

                // Remove current object
                if (this.currentObject) {
                    this.scene.remove(this.currentObject);
                }

                this.currentObject = object;

                // Center and scale the model
                this.fitObjectToScene(this.currentObject);
                this.scene.add(this.currentObject);

                // Enable shadows and fix materials
                this.currentObject.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        // Ensure materials render correctly
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        materials.forEach((mat) => {
                            if (mat.map) {
                                mat.map.colorSpace = THREE.SRGBColorSpace;
                            }
                            mat.needsUpdate = true;
                        });
                    }
                });

                // Apply any pre-uploaded textures
                this.applyUploadedTextures();

            } catch (error) {
                console.error('Error loading FBX model:', error);
                alert('Error loading FBX model. Please ensure it\'s a valid FBX file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    loadGLTFFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            
            this.gltfLoader.parse(arrayBuffer, '', (gltf) => {
                // Remove current object
                if (this.currentObject) {
                    this.scene.remove(this.currentObject);
                }

                this.currentObject = gltf.scene;
                
                // Center and scale the model
                this.fitObjectToScene(this.currentObject);
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

    fitObjectToScene(object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const scale = 3 / maxDim;
            object.scale.multiplyScalar(scale);
        }
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
