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
        this.isRotating = false;
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
            0.01,
            10000
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
        this.controls.minDistance = 0.01;
        this.controls.maxDistance = 10000;

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

        // Update hierarchy
        this.updateHierarchy(shapeType.charAt(0).toUpperCase() + shapeType.slice(1));

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
                this.frameCameraOnObject();
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
        this.frameCameraOnObject();
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

        // Map of material property names to common filename patterns
        const textureMapTypes = [
            { prop: 'map',              patterns: ['diffuse', 'albedo', 'basecolor', 'base_color', 'color', 'diff'] },
            { prop: 'normalMap',        patterns: ['normal', 'nrm', 'norm', 'nmap'] },
            { prop: 'bumpMap',          patterns: ['bump', 'height', 'disp_bump'] },
            { prop: 'emissiveMap',      patterns: ['emissive', 'emission', 'emit', 'glow', 'self_illum'] },
            { prop: 'roughnessMap',     patterns: ['roughness', 'rough', 'rgh'] },
            { prop: 'metalnessMap',     patterns: ['metalness', 'metallic', 'metal', 'met'] },
            { prop: 'aoMap',            patterns: ['ao', 'ambient_occlusion', 'ambientocclusion', 'occlusion'] },
            { prop: 'specularMap',      patterns: ['specular', 'spec', 'refl'] },
            { prop: 'displacementMap',  patterns: ['displacement', 'displace', 'heightmap'] },
            { prop: 'alphaMap',         patterns: ['alpha', 'opacity', 'transparent', 'transparency'] },
        ];

        // Determine which texture file best matches each map type by filename
        const assignments = new Map(); // prop -> { url, file }
        const usedFiles = new Set();

        for (const { prop, patterns } of textureMapTypes) {
            for (const [fileName, entry] of this.textureFiles) {
                const lower = fileName.toLowerCase();
                if (patterns.some(p => lower.includes(p))) {
                    assignments.set(prop, entry);
                    usedFiles.add(fileName);
                    break;
                }
            }
        }

        // If there are unassigned texture files and no diffuse was matched,
        // assign the first unmatched file as diffuse
        if (!assignments.has('map')) {
            for (const [fileName, entry] of this.textureFiles) {
                if (!usedFiles.has(fileName)) {
                    assignments.set('map', entry);
                    usedFiles.add(fileName);
                    break;
                }
            }
        }

        // If only one texture and no pattern matched, use it as diffuse
        if (this.textureFiles.size === 1 && assignments.size === 0) {
            const entry = this.textureFiles.values().next().value;
            assignments.set('map', entry);
        }

        this.currentObject.traverse((child) => {
            if (child.isMesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                    // First, try to replace existing texture maps by matching their source filenames
                    const mapProps = ['map', 'normalMap', 'bumpMap', 'emissiveMap', 'roughnessMap',
                                     'metalnessMap', 'aoMap', 'specularMap', 'displacementMap', 'alphaMap'];
                    for (const prop of mapProps) {
                        if (mat[prop] && mat[prop].sourceFile) {
                            const texName = mat[prop].sourceFile.split('/').pop().split('\\').pop().toLowerCase();
                            const entry = this.textureFiles.get(texName);
                            if (entry) {
                                const tex = textureLoader.load(entry.url);
                                // Only diffuse/emissive maps use SRGB; others are linear data
                                if (prop === 'map' || prop === 'emissiveMap') {
                                    tex.colorSpace = THREE.SRGBColorSpace;
                                } else {
                                    tex.colorSpace = THREE.LinearSRGBColorSpace;
                                }
                                mat[prop] = tex;
                            }
                        }
                    }

                    // Then apply pattern-matched textures for any maps not already set
                    for (const [prop, entry] of assignments) {
                        if (!mat[prop]) {
                            const tex = textureLoader.load(entry.url);
                            if (prop === 'map' || prop === 'emissiveMap') {
                                tex.colorSpace = THREE.SRGBColorSpace;
                            } else {
                                tex.colorSpace = THREE.LinearSRGBColorSpace;
                            }
                            mat[prop] = tex;

                            // Enable emissive color if emissive map is assigned
                            if (prop === 'emissiveMap' && mat.emissive) {
                                mat.emissive.set(0xffffff);
                            }
                        }
                    }

                    mat.needsUpdate = true;
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

                    // Update hierarchy
                    this.updateHierarchy(file.name.split('.')[0]);

                    // Enable shadows
                    this.currentObject.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            const materials = Array.isArray(child.material) ? child.material : [child.material];
                            materials.forEach((mat) => {
                                this.fixMaterialTextures(mat);
                            });
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

                // Update hierarchy
                this.updateHierarchy(file.name.split('.')[0]);

                // Enable shadows and fix materials
                this.currentObject.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        // Fix colorSpace on all texture maps
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        materials.forEach((mat) => {
                            this.fixMaterialTextures(mat);
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

                // Update hierarchy
                this.updateHierarchy(file.name.split('.')[0]);
                
                // Enable shadows for all meshes in the model
                this.currentObject.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        materials.forEach((mat) => {
                            this.fixMaterialTextures(mat);
                        });
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
        // Force world matrix update so bounding box is accurate
        object.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(object);

        // Guard against empty/degenerate bounding boxes
        if (box.isEmpty()) return;

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Normalize: move object so its center is at origin, scale to target size
        const targetSize = 3;
        if (maxDim > 0) {
            const scale = targetSize / maxDim;
            object.scale.multiplyScalar(scale);
        }

        // Re-compute after scaling
        object.updateMatrixWorld(true);
        const scaledBox = new THREE.Box3().setFromObject(object);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

        // Move the object so its bounding box center sits at origin
        object.position.sub(scaledCenter);

        // Now frame the camera to look at the centered object
        this.frameCameraOnObject();
    }

    frameCameraOnObject() {
        if (!this.currentObject) return;

        this.currentObject.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(this.currentObject);
        if (box.isEmpty()) return;

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Calculate ideal camera distance using FOV
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraDistance = (maxDim / 2) / Math.tan(fov / 2);
        cameraDistance *= 1.5; // Padding so the model isn't edge-to-edge

        // Position camera at a slight angle for better 3D perception
        this.camera.position.set(
            center.x + cameraDistance * 0.3,
            center.y + cameraDistance * 0.3,
            center.z + cameraDistance
        );

        // Point orbit controls and camera at the object center
        this.controls.target.copy(center);
        this.camera.lookAt(center);

        // Adapt near/far clipping planes to the model scale
        const dist = this.camera.position.distanceTo(center);
        this.camera.near = Math.max(0.001, dist * 0.001);
        this.camera.far = Math.max(1000, dist * 100);
        this.camera.updateProjectionMatrix();

        // Adapt orbit limits
        this.controls.minDistance = maxDim * 0.05;
        this.controls.maxDistance = maxDim * 50;

        // Reposition directional light relative to model scale
        const lightOffset = maxDim * 2;
        this.directionalLight.position.set(lightOffset, lightOffset, lightOffset);
        this.directionalLight.shadow.camera.near = 0.01;
        this.directionalLight.shadow.camera.far = lightOffset * 10;
        this.directionalLight.shadow.camera.left = -maxDim * 2;
        this.directionalLight.shadow.camera.right = maxDim * 2;
        this.directionalLight.shadow.camera.top = maxDim * 2;
        this.directionalLight.shadow.camera.bottom = -maxDim * 2;
        this.directionalLight.shadow.camera.updateProjectionMatrix();

        this.controls.update();
    }

    fixMaterialTextures(mat) {
        // Map properties that store color data (sRGB)
        const srgbMaps = ['map', 'emissiveMap'];
        // Map properties that store linear data (normals, roughness, etc.)
        const linearMaps = ['normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap',
                            'aoMap', 'specularMap', 'displacementMap', 'alphaMap'];

        for (const prop of srgbMaps) {
            if (mat[prop]) {
                mat[prop].colorSpace = THREE.SRGBColorSpace;
            }
        }

        for (const prop of linearMaps) {
            if (mat[prop]) {
                mat[prop].colorSpace = THREE.LinearSRGBColorSpace;
            }
        }

        // Enable emissive if emissive map exists
        if (mat.emissiveMap && mat.emissive) {
            if (mat.emissive.r === 0 && mat.emissive.g === 0 && mat.emissive.b === 0) {
                mat.emissive.set(0xffffff);
            }
            mat.emissiveIntensity = mat.emissiveIntensity || 1;
        }

        // If material has alpha map, enable transparency
        if (mat.alphaMap) {
            mat.transparent = true;
        }

        mat.needsUpdate = true;
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
        if (this.currentObject) {
            this.frameCameraOnObject();
        } else {
            this.camera.position.set(0, 0, 5);
            this.controls.target.set(0, 0, 0);
            this.camera.lookAt(0, 0, 0);
            this.camera.updateProjectionMatrix();
            this.controls.update();
        }
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

    updateHierarchy(objectName) {
        const item = document.getElementById('current-object-item');
        if (item) {
            const nameSpan = item.querySelector('span:last-child');
            if (nameSpan) {
                nameSpan.textContent = objectName;
            }
        }
    }

    handleIndividualTexture(mapType, event) {
        const file = event.target.files[0];
        if (!file || !this.currentObject) return;

        const url = URL.createObjectURL(file);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(url);

        // Set color space based on map type
        if (mapType === 'map' || mapType === 'emissiveMap') {
            texture.colorSpace = THREE.SRGBColorSpace;
        } else {
            texture.colorSpace = THREE.LinearSRGBColorSpace;
        }

        // Apply texture to all materials
        this.currentObject.traverse((child) => {
            if (child.isMesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                    mat[mapType] = texture;
                    
                    // Enable emissive color if emissive map is assigned
                    if (mapType === 'emissiveMap' && mat.emissive) {
                        mat.emissive.set(0xffffff);
                    }
                    
                    // Enable transparency if alpha map is assigned
                    if (mapType === 'alphaMap') {
                        mat.transparent = true;
                    }
                    
                    mat.needsUpdate = true;
                });
            }
        });

        console.log(`Applied ${mapType} texture: ${file.name}`);
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

export { WebRenderer };

// Create global instance (skip in test environment)
if (!import.meta.env?.VITEST) {
    window.renderer = new WebRenderer();
}
