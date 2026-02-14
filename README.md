# 🎨 3D Web Renderer

An easy-to-use, interactive 3D web renderer for previewing 3D effects and models directly in your browser.

## ✨ Features

- **Real-time 3D Rendering**: Powered by Three.js for high-performance 3D graphics
- **Multiple Built-in Shapes**: Cube, Sphere, Torus, Cone, Cylinder, and Teapot
- **3D Model Loading**: Support for GLB and GLTF file formats
- **Interactive Controls**: 
  - Orbit, pan, and zoom with mouse controls
  - Adjustable lighting (ambient and directional)
  - Color customization for objects and background
  - Toggle wireframe mode
  - Animation controls
- **Responsive Design**: Works on desktop and mobile devices
- **FPS Counter**: Monitor rendering performance in real-time

## 🚀 Quick Start

### Option 1: Direct Browser Access (Simplest)

1. Clone the repository:
```bash
git clone https://github.com/S-T-3-V-3/web-renderer.git
cd web-renderer
```

2. Open `index.html` directly in your browser (Chrome, Firefox, Safari, or Edge)

### Option 2: Local Server (Recommended)

1. Install dependencies (optional, only needed for http-server):
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Your browser will automatically open to `http://localhost:8080`

### Option 3: Python Server

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open `http://localhost:8080` in your browser.

## 🎮 Controls

### Mouse Controls
- **Left Click + Drag**: Rotate the camera around the object
- **Right Click + Drag**: Pan the camera
- **Scroll Wheel**: Zoom in/out

### Control Panel

#### 📦 3D Objects
- Click any shape button to load a predefined 3D object
- Available shapes: Cube, Sphere, Torus, Cone, Cylinder, Teapot

#### 📁 Load Model
- Upload your own 3D models in GLB or GLTF format
- Models are automatically centered and scaled to fit the scene

#### 💡 Lighting
- **Ambient Light**: Adjust overall scene brightness (0-2)
- **Directional Light**: Adjust main light intensity (0-3)

#### 🎨 Material
- **Object Color**: Change the color of the current object
- **Background Color**: Change the scene background color

#### 🎬 Animation
- **Toggle Rotation**: Start/stop automatic object rotation
- **Toggle Wireframe**: Switch between solid and wireframe rendering

#### 📷 Camera
- **Reset Camera**: Return camera to default position and angle

## 📁 Project Structure

```
web-renderer/
├── index.html          # Main HTML file with UI
├── renderer.js         # 3D rendering logic and controls
├── package.json        # Node.js configuration
└── README.md          # Documentation
```

## 🛠️ Technical Details

### Dependencies
- **Three.js** (v0.160.0): Core 3D rendering engine
- **OrbitControls**: Camera control system
- **GLTFLoader**: 3D model loader for GLB/GLTF files

All dependencies are loaded via CDN (no local installation required for basic usage).

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

Requires a browser with WebGL support (all modern browsers).

## 🎨 Customization

### Adding New Shapes

Edit `renderer.js` and add a new case in the `loadShape()` method:

```javascript
case 'myShape':
    geometry = new THREE.MyGeometry(params);
    break;
```

Then add a button in `index.html`:

```html
<button onclick="renderer.loadShape('myShape')">My Shape</button>
```

### Changing Default Colors

Modify the initial values in `index.html`:

```html
<input type="color" id="objectColor" value="#yourcolor" ...>
```

## 📝 Usage Examples

### Load a 3D Model

1. Click "Load Model" section in the control panel
2. Click "Choose File" and select a `.glb` or `.gltf` file
3. The model will be automatically loaded, centered, and scaled

### Create a Custom Scene

1. Select a base object (e.g., Sphere)
2. Adjust the ambient light to 0.3
3. Adjust the directional light to 2.0
4. Change object color to your preference
5. Toggle rotation off for a static view
6. Use mouse controls to position the camera

## 🐛 Troubleshooting

### Model not loading?
- Ensure the file is a valid GLB or GLTF format
- Check browser console for error messages
- Try a different model file

### Low FPS?
- Reduce model complexity
- Close other browser tabs
- Check if hardware acceleration is enabled in your browser

### Controls not working?
- Ensure you're clicking on the canvas area
- Try refreshing the page
- Check if JavaScript is enabled

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

ISC License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/)
- Inspired by modern 3D web applications

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ for easy 3D visualization in the browser
