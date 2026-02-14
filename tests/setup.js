/**
 * Test setup: provides a mock WebGL2 context, DOM elements,
 * and stubs for browser APIs that Three.js and WebRenderer need.
 */

// ── WebGL2 Context Mock ──────────────────────────────────────────────
// Three.js WebGLRenderer probes many WebGL methods/constants.
// We use a Proxy-based mock to handle any call gracefully.

const GL_CONSTANTS = {
    FRAMEBUFFER_COMPLETE: 0x8CD5,
    COMPILE_STATUS: 0x8B81,
    LINK_STATUS: 0x8B82,
    ACTIVE_UNIFORMS: 0x8B86,
    ACTIVE_ATTRIBUTES: 0x8B89,
    ACTIVE_UNIFORM_BLOCKS: 0x8A36,
    TRANSFORM_FEEDBACK_VARYINGS: 0x8C83,
    MAX_TEXTURE_SIZE: 0x0D33,
    MAX_CUBE_MAP_TEXTURE_SIZE: 0x851C,
    MAX_RENDERBUFFER_SIZE: 0x84E8,
    MAX_TEXTURE_IMAGE_UNITS: 0x8872,
    MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8B4D,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8B4C,
    MAX_VERTEX_UNIFORM_VECTORS: 0x8DFB,
    MAX_VARYING_VECTORS: 0x8DFC,
    MAX_FRAGMENT_UNIFORM_VECTORS: 0x8DFD,
    MAX_VERTEX_ATTRIBS: 0x8869,
    MAX_VERTEX_UNIFORM_COMPONENTS: 0x8B4A,
    MAX_SAMPLES: 0x8D57,
    MAX_DRAW_BUFFERS: 0x8824,
    MAX_COLOR_ATTACHMENTS: 0x8CDF,
    MAX_UNIFORM_BUFFER_BINDINGS: 0x8A2F,
    MAX_UNIFORM_BLOCK_SIZE: 0x8A30,
    FLOAT: 0x1406,
    INT: 0x1404,
    UNSIGNED_BYTE: 0x1401,
    UNSIGNED_SHORT: 0x1403,
    UNSIGNED_INT: 0x1405,
    BYTE: 0x1400,
    SHORT: 0x1402,
    HALF_FLOAT: 0x140B,
    RGBA: 0x1908,
    RGB: 0x1907,
    RGBA8: 0x8058,
    DEPTH_COMPONENT16: 0x81A5,
    DEPTH_COMPONENT24: 0x81A6,
    DEPTH_COMPONENT32F: 0x8CAC,
    DEPTH_STENCIL: 0x84F9,
    DEPTH24_STENCIL8: 0x88F0,
    TEXTURE_2D: 0x0DE1,
    TEXTURE_CUBE_MAP: 0x8513,
    TEXTURE_3D: 0x806F,
    TEXTURE_2D_ARRAY: 0x8C1A,
    RENDERBUFFER: 0x8D41,
    FRAMEBUFFER: 0x8D40,
    READ_FRAMEBUFFER: 0x8CA8,
    DRAW_FRAMEBUFFER: 0x8CA9,
    COLOR_ATTACHMENT0: 0x8CE0,
    DEPTH_ATTACHMENT: 0x8D00,
    STENCIL_ATTACHMENT: 0x8D20,
    DEPTH_STENCIL_ATTACHMENT: 0x821A,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    UNIFORM_BUFFER: 0x8A11,
    TEXTURE0: 0x84C0,
    TRIANGLES: 0x0004,
    TRIANGLE_STRIP: 0x0005,
    TRIANGLE_FAN: 0x0006,
    LINES: 0x0001,
    LINE_STRIP: 0x0003,
    POINTS: 0x0000,
    VERTEX_SHADER: 0x8B31,
    FRAGMENT_SHADER: 0x8B30,
    NEAREST: 0x2600,
    LINEAR: 0x2601,
    NEAREST_MIPMAP_NEAREST: 0x2700,
    LINEAR_MIPMAP_LINEAR: 0x2703,
    CLAMP_TO_EDGE: 0x812F,
    REPEAT: 0x2901,
    MIRRORED_REPEAT: 0x8370,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_MAG_FILTER: 0x2800,
    UNPACK_FLIP_Y_WEBGL: 0x9240,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
    UNPACK_ALIGNMENT: 0x0CF5,
    PACK_ALIGNMENT: 0x0D05,
    BLEND: 0x0BE2,
    DEPTH_TEST: 0x0B71,
    STENCIL_TEST: 0x0B90,
    CULL_FACE: 0x0B44,
    SCISSOR_TEST: 0x0C11,
    POLYGON_OFFSET_FILL: 0x8037,
    SAMPLE_ALPHA_TO_COVERAGE: 0x809E,
    DITHER: 0x0BD0,
    FUNC_ADD: 0x8006,
    ONE: 1,
    ZERO: 0,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    DST_ALPHA: 0x0304,
    ONE_MINUS_DST_ALPHA: 0x0305,
    LESS: 0x0201,
    LEQUAL: 0x0203,
    ALWAYS: 0x0207,
    NEVER: 0x0200,
    KEEP: 0x1E00,
    REPLACE: 0x1E01,
    FRONT: 0x0404,
    BACK: 0x0405,
    FRONT_AND_BACK: 0x0408,
    CW: 0x0900,
    CCW: 0x0901,
    STATIC_DRAW: 0x88E4,
    DYNAMIC_DRAW: 0x88E8,
    STREAM_DRAW: 0x88E0,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    STENCIL_BUFFER_BIT: 0x0400,
    NO_ERROR: 0,
    VERSION: 0x1F02,
    SHADING_LANGUAGE_VERSION: 0x8B8C,
    VENDOR: 0x1F00,
    RENDERER: 0x1F01,
    SAMPLE_BUFFERS: 0x80A8,
    SAMPLES: 0x80A9,
    UNPACK_COLORSPACE_CONVERSION_WEBGL: 0x9243,
    BROWSER_DEFAULT_WEBGL: 0x9244,
    R8: 0x8229,
    RG8: 0x822B,
    R16F: 0x822D,
    R32F: 0x822E,
    RG16F: 0x822F,
    RG32F: 0x8230,
    RGBA16F: 0x881A,
    RGBA32F: 0x8814,
    RED: 0x1903,
    RG: 0x8227,
    RED_INTEGER: 0x8D94,
    RG_INTEGER: 0x8228,
    RGB_INTEGER: 0x8D98,
    RGBA_INTEGER: 0x8D99,
    R8I: 0x8231,
    R8UI: 0x8232,
    R16I: 0x8233,
    R16UI: 0x8234,
    R32I: 0x8235,
    R32UI: 0x8236,
    RG8I: 0x8237,
    RG8UI: 0x8238,
    RG16I: 0x8239,
    RG16UI: 0x823A,
    RG32I: 0x823B,
    RG32UI: 0x823C,
    RGBA8I: 0x8D8E,
    RGBA8UI: 0x8D7C,
    RGBA16I: 0x8D88,
    RGBA16UI: 0x8D76,
    RGBA32I: 0x8D82,
    RGBA32UI: 0x8D70,
    RGB8: 0x8051,
    SRGB8: 0x8C41,
    SRGB8_ALPHA8: 0x8C43,
    COMPARE_REF_TO_TEXTURE: 0x884E,
    R11F_G11F_B10F: 0x8C3A,
    RGB9_E5: 0x8C3D,
    RGB10_A2: 0x8059,
    UNSIGNED_INT_2_10_10_10_REV: 0x8368,
    UNSIGNED_INT_24_8: 0x84FA,
    FLOAT_32_UNSIGNED_INT_24_8_REV: 0x8DAD,
    TRANSFORM_FEEDBACK_BUFFER: 0x8C8E,
    TRANSFORM_FEEDBACK: 0x8E22,
    INTERLEAVED_ATTRIBS: 0x8C8C,
    SEPARATE_ATTRIBS: 0x8C8D,
    SYNC_GPU_COMMANDS_COMPLETE: 0x9117,
    ALREADY_SIGNALED: 0x911A,
    CONDITION_SATISFIED: 0x911C,
    WAIT_FAILED: 0x911D,
};

const PARAMETER_VALUES = {
    [GL_CONSTANTS.MAX_TEXTURE_SIZE]: 16384,
    [GL_CONSTANTS.MAX_CUBE_MAP_TEXTURE_SIZE]: 16384,
    [GL_CONSTANTS.MAX_RENDERBUFFER_SIZE]: 16384,
    [GL_CONSTANTS.MAX_TEXTURE_IMAGE_UNITS]: 32,
    [GL_CONSTANTS.MAX_COMBINED_TEXTURE_IMAGE_UNITS]: 64,
    [GL_CONSTANTS.MAX_VERTEX_TEXTURE_IMAGE_UNITS]: 32,
    [GL_CONSTANTS.MAX_VERTEX_UNIFORM_VECTORS]: 4096,
    [GL_CONSTANTS.MAX_VARYING_VECTORS]: 32,
    [GL_CONSTANTS.MAX_FRAGMENT_UNIFORM_VECTORS]: 4096,
    [GL_CONSTANTS.MAX_VERTEX_ATTRIBS]: 16,
    [GL_CONSTANTS.MAX_VERTEX_UNIFORM_COMPONENTS]: 16384,
    [GL_CONSTANTS.MAX_SAMPLES]: 16,
    [GL_CONSTANTS.MAX_DRAW_BUFFERS]: 8,
    [GL_CONSTANTS.MAX_COLOR_ATTACHMENTS]: 8,
    [GL_CONSTANTS.MAX_UNIFORM_BUFFER_BINDINGS]: 72,
    [GL_CONSTANTS.MAX_UNIFORM_BLOCK_SIZE]: 65536,
    [GL_CONSTANTS.VERSION]: 'WebGL 2.0 (Mock)',
    [GL_CONSTANTS.SHADING_LANGUAGE_VERSION]: 'WebGL GLSL ES 3.00 (Mock)',
    [GL_CONSTANTS.VENDOR]: 'Mock',
    [GL_CONSTANTS.RENDERER]: 'Mock WebGL',
    [GL_CONSTANTS.SAMPLE_BUFFERS]: 1,
    [GL_CONSTANTS.SAMPLES]: 4,
    [GL_CONSTANTS.UNPACK_COLORSPACE_CONVERSION_WEBGL]: GL_CONSTANTS.BROWSER_DEFAULT_WEBGL,
};

function createMockWebGLContext() {
    let idCounter = 1;
    const ctx = {
        ...GL_CONSTANTS,
        canvas: null, // will be set after creation
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        drawingBufferColorSpace: 'srgb',

        // Parameter queries
        getParameter(pname) {
            if (pname in PARAMETER_VALUES) return PARAMETER_VALUES[pname];
            return 0;
        },
        getExtension(name) {
            // Return minimal extension objects
            if (name === 'EXT_color_buffer_float') return {};
            if (name === 'EXT_color_buffer_half_float') return {};
            if (name === 'EXT_texture_filter_anisotropic') return { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF, TEXTURE_MAX_ANISOTROPY_EXT: 0x84FE };
            if (name === 'OES_texture_float_linear') return {};
            if (name === 'OES_texture_half_float_linear') return {};
            if (name === 'WEBGL_compressed_texture_s3tc') return {};
            if (name === 'WEBGL_compressed_texture_pvrtc') return null;
            if (name === 'WEBGL_compressed_texture_etc') return null;
            if (name === 'WEBGL_compressed_texture_etc1') return null;
            if (name === 'WEBGL_compressed_texture_astc') return null;
            if (name === 'WEBGL_debug_renderer_info') return { UNMASKED_RENDERER_WEBGL: 0x9246, UNMASKED_VENDOR_WEBGL: 0x9245 };
            if (name === 'WEBGL_lose_context') return { loseContext() {}, restoreContext() {} };
            if (name === 'WEBGL_multi_draw') return { multiDrawArraysWEBGL() {}, multiDrawElementsWEBGL() {} };
            if (name === 'OVR_multiview2') return null;
            if (name === 'KHR_parallel_shader_compile') return { COMPLETION_STATUS_KHR: 0x91B1 };
            if (name === 'WEBGL_clip_cull_distance') return null;
            return {};
        },
        getSupportedExtensions() {
            return ['EXT_color_buffer_float', 'EXT_texture_filter_anisotropic', 'WEBGL_debug_renderer_info'];
        },
        getContextAttributes() {
            return { alpha: true, antialias: true, depth: true, stencil: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'default', failIfMajorPerformanceCaveat: false, desynchronized: false };
        },

        // Shader
        createShader() { return { id: idCounter++ }; },
        shaderSource() {},
        compileShader() {},
        getShaderParameter(shader, pname) { return true; },
        getShaderInfoLog() { return ''; },
        deleteShader() {},

        // Program
        createProgram() { return { id: idCounter++ }; },
        attachShader() {},
        linkProgram() {},
        getProgramParameter(program, pname) {
            if (pname === GL_CONSTANTS.ACTIVE_UNIFORMS) return 0;
            if (pname === GL_CONSTANTS.ACTIVE_ATTRIBUTES) return 0;
            if (pname === GL_CONSTANTS.ACTIVE_UNIFORM_BLOCKS) return 0;
            if (pname === GL_CONSTANTS.TRANSFORM_FEEDBACK_VARYINGS) return 0;
            return true;
        },
        getProgramInfoLog() { return ''; },
        useProgram() {},
        deleteProgram() {},
        validateProgram() {},
        detachShader() {},
        getActiveUniform() { return { name: '', type: GL_CONSTANTS.FLOAT, size: 1 }; },
        getActiveAttrib() { return { name: '', type: GL_CONSTANTS.FLOAT, size: 1 }; },

        // Uniform/Attribute
        getUniformLocation() { return { id: idCounter++ }; },
        getAttribLocation() { return 0; },
        getUniformBlockIndex() { return 0; },
        uniformBlockBinding() {},
        uniform1i() {},
        uniform1f() {},
        uniform2f() {},
        uniform3f() {},
        uniform4f() {},
        uniform1iv() {},
        uniform1fv() {},
        uniform2fv() {},
        uniform3fv() {},
        uniform4fv() {},
        uniformMatrix2fv() {},
        uniformMatrix3fv() {},
        uniformMatrix4fv() {},
        enableVertexAttribArray() {},
        disableVertexAttribArray() {},
        vertexAttribPointer() {},
        vertexAttribIPointer() {},
        vertexAttribDivisor() {},

        // Buffer
        createBuffer() { return { id: idCounter++ }; },
        bindBuffer() {},
        bufferData() {},
        bufferSubData() {},
        deleteBuffer() {},
        bindBufferBase() {},
        bindBufferRange() {},

        // Texture
        createTexture() { return { id: idCounter++ }; },
        bindTexture() {},
        texImage2D() {},
        texImage3D() {},
        texSubImage2D() {},
        texSubImage3D() {},
        texStorage2D() {},
        texStorage3D() {},
        texParameteri() {},
        texParameterf() {},
        generateMipmap() {},
        deleteTexture() {},
        activeTexture() {},
        pixelStorei() {},
        compressedTexImage2D() {},

        // Sampler
        createSampler() { return { id: idCounter++ }; },
        deleteSampler() {},
        bindSampler() {},
        samplerParameteri() {},
        samplerParameterf() {},

        // Framebuffer
        createFramebuffer() { return { id: idCounter++ }; },
        bindFramebuffer() {},
        framebufferTexture2D() {},
        framebufferTextureLayer() {},
        framebufferRenderbuffer() {},
        checkFramebufferStatus() { return GL_CONSTANTS.FRAMEBUFFER_COMPLETE; },
        deleteFramebuffer() {},
        readBuffer() {},
        drawBuffers() {},
        blitFramebuffer() {},
        invalidateFramebuffer() {},

        // Renderbuffer
        createRenderbuffer() { return { id: idCounter++ }; },
        bindRenderbuffer() {},
        renderbufferStorage() {},
        renderbufferStorageMultisample() {},
        deleteRenderbuffer() {},

        // VAO
        createVertexArray() { return { id: idCounter++ }; },
        bindVertexArray() {},
        deleteVertexArray() {},

        // Draw
        drawArrays() {},
        drawElements() {},
        drawArraysInstanced() {},
        drawElementsInstanced() {},
        drawRangeElements() {},

        // State
        enable() {},
        disable() {},
        isEnabled() { return false; },
        blendFunc() {},
        blendFuncSeparate() {},
        blendEquation() {},
        blendEquationSeparate() {},
        blendColor() {},
        depthFunc() {},
        depthMask() {},
        depthRange() {},
        stencilFunc() {},
        stencilFuncSeparate() {},
        stencilMask() {},
        stencilMaskSeparate() {},
        stencilOp() {},
        stencilOpSeparate() {},
        colorMask() {},
        cullFace() {},
        frontFace() {},
        lineWidth() {},
        polygonOffset() {},
        scissor() {},
        viewport() {},
        clearColor() {},
        clearDepth() {},
        clearStencil() {},
        clear() {},

        // Query
        createQuery() { return { id: idCounter++ }; },
        deleteQuery() {},
        beginQuery() {},
        endQuery() {},
        getQueryParameter() { return 0; },

        // Transform Feedback
        createTransformFeedback() { return { id: idCounter++ }; },
        deleteTransformFeedback() {},
        bindTransformFeedback() {},
        beginTransformFeedback() {},
        endTransformFeedback() {},
        transformFeedbackVaryings() {},
        getTransformFeedbackVarying() { return null; },

        // Sync
        fenceSync() { return { id: idCounter++ }; },
        deleteSync() {},
        clientWaitSync() { return GL_CONSTANTS.ALREADY_SIGNALED; },
        getSyncParameter() { return GL_CONSTANTS.CONDITION_SATISFIED; },

        // Misc
        getError() { return GL_CONSTANTS.NO_ERROR; },
        flush() {},
        finish() {},
        readPixels() {},
        getShaderPrecisionFormat() {
            return { precision: 23, rangeMin: 127, rangeMax: 127 };
        },
        getBufferSubData() {},
        getInternalformatParameter() { return new Int32Array([4]); },
        isTexture() { return false; },
    };

    return ctx;
}

// ── DOM Setup ────────────────────────────────────────────────────────

function setupDOM() {
    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'renderCanvas';
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });

    const glCtx = createMockWebGLContext();
    glCtx.canvas = canvas;

    // Override getContext to return our mock
    canvas.getContext = function (type) {
        if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') {
            return glCtx;
        }
        if (type === '2d') {
            return {
                fillRect() {},
                clearRect() {},
                getImageData() { return { data: new Uint8ClampedArray(4) }; },
                putImageData() {},
                createImageData() { return { data: new Uint8ClampedArray(4) }; },
                setTransform() {},
                drawImage() {},
                save() {},
                fillText() {},
                restore() {},
                beginPath() {},
                moveTo() {},
                lineTo() {},
                closePath() {},
                stroke() {},
                translate() {},
                scale() {},
                rotate() {},
                arc() {},
                fill() {},
                measureText() { return { width: 0 }; },
                canvas: canvas,
            };
        }
        return null;
    };

    document.body.appendChild(canvas);

    // Required DOM elements
    const ambientValue = document.createElement('span');
    ambientValue.id = 'ambientValue';
    ambientValue.textContent = '0.5';
    document.body.appendChild(ambientValue);

    const directionalValue = document.createElement('span');
    directionalValue.id = 'directionalValue';
    directionalValue.textContent = '1.0';
    document.body.appendChild(directionalValue);

    const fpsCounter = document.createElement('div');
    fpsCounter.id = 'fps-counter';
    fpsCounter.textContent = 'FPS: 60';
    document.body.appendChild(fpsCounter);
}

// ── Browser API Stubs ────────────────────────────────────────────────

// Prevent infinite animation loop
const _origRAF = globalThis.requestAnimationFrame;
globalThis.requestAnimationFrame = () => 0;

// URL.createObjectURL
if (!globalThis.URL) globalThis.URL = {};
globalThis.URL.createObjectURL = (blob) => `blob:mock-url-${Math.random().toString(36).slice(2)}`;
globalThis.URL.revokeObjectURL = () => {};

// Run DOM setup
setupDOM();
