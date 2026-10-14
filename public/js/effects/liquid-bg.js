/* ==========================================================================
   Animated liquid background
   A vanilla WebGL2 port of the Framer "Animated Liquid Background" component
   (https://framer.com/m/AnimatedLiquidBackground-Prod-vIhm.js@ghH1aHLmGZ0iE7qXDFVk),
   reproducing the same warp shader, uniforms and easing so the desktop
   wallpaper has the same animation and behavior without depending on
   Framer's runtime.
   ========================================================================== */

(function () {
  const PatternShapes = { Checks: 0, Stripes: 1, Edge: 2 };

  const vertexShaderSource = `#version 300 es
layout(location = 0) in vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

  const warpFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
  vec3 color1 = c1.rgb * c1.a;
  vec3 color2 = c2.rgb * c2.a;
  vec3 color3 = c3.rgb * c3.a;

  float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
  float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);

  vec3 blended_color_2 = mix(color1, color2, r1);
  float blended_opacity_2 = mix(c1.a, c2.a, r1);

  vec3 c = mix(blended_color_2, color3, r2);
  float o = mix(blended_opacity_2, c3.a, r2);
  return vec4(c, o);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  float t = .5 * u_time;
  float noise_scale = .0005 + .006 * u_scale;

  uv -= .5;
  uv *= (noise_scale * u_resolution);
  uv = rotate(uv, u_rotation * .5 * PI);
  uv /= u_pixelRatio;
  uv += .5;

  float n1 = noise(uv * 1. + t);
  float n2 = noise(uv * 2. - t);
  float angle = n1 * TWO_PI;
  uv.x += 4. * u_distortion * n2 * cos(angle);
  uv.y += 4. * u_distortion * n2 * sin(angle);

  float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
  for (float i = 1.; i <= iterations_number; i++) {
    uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
    uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
  }

  float proportion = clamp(u_proportion, 0., 1.);

  float shape = 0.;
  float mixer = 0.;
  if (u_shape < .5) {
    vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
    shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else if (u_shape < 1.5) {
    vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
    float f = fract(stripes_shape_uv.y);
    shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else {
    float sh = 1. - uv.y;
    sh -= .5;
    sh /= (noise_scale * u_resolution.y);
    sh += .5;
    float shape_scaling = .2 * (1. - u_shapeScale);
    shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
    mixer = shape;
  }

  vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);
  fragColor = vec4(color_mix.rgb, color_mix.a);
}
`;

  function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

  function hexToRgba(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length === 6) hex += 'ff';
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
      parseInt(hex.slice(6, 8), 16) / 255,
    ];
  }

  function getShaderColorFromString(colorString, fallback = [0, 0, 0, 1]) {
    if (typeof colorString !== 'string') return fallback;
    if (colorString.startsWith('#')) return hexToRgba(colorString).map((v) => clamp(v, 0, 1));
    return fallback;
  }

  /* Cubic-bezier easing, matching framer-motion's cubicBezier(.65,0,.88,.77) */
  function cubicBezier(x1, y1, x2, y2) {
    function a(a1, a2) { return 1 - 3 * a2 + 3 * a1; }
    function b(a1, a2) { return 3 * a2 - 6 * a1; }
    function c(a1) { return 3 * a1; }
    function calcBezier(t, a1, a2) { return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t; }
    function calcSlope(t, a1, a2) { return 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1); }
    function getTForX(x) {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const slope = calcSlope(t, x1, x2);
        if (slope === 0) return t;
        const xEst = calcBezier(t, x1, x2) - x;
        t -= xEst / slope;
      }
      return t;
    }
    return (x) => (x1 === y1 && x2 === y2 ? x : calcBezier(getTForX(x), y1, y2));
  }
  const speedEase = cubicBezier(0.65, 0, 0.88, 0.77);

  /* ---- Vanilla WebGL2 shader mount (port of ShaderMount) ---- */
  class ShaderMount {
    constructor(canvas, fragmentShader, uniforms = {}, webGlContextAttributes, speed = 1, seed = 0) {
      this.canvas = canvas;
      this.fragmentShader = fragmentShader;
      this.providedUniforms = uniforms;
      this.program = null;
      this.uniformLocations = {};
      this.rafId = null;
      this.lastFrameTime = 0;
      this.totalAnimationTime = seed;
      this.speed = 1;
      this.hasBeenDisposed = false;
      this.resolutionChanged = true;

      const gl = canvas.getContext('webgl2', webGlContextAttributes);
      if (!gl) throw new Error('WebGL2 not supported');
      this.gl = gl;
      this.initWebGL();
      this.setupResizeObserver();
      this.setSpeed(speed);
      this.canvas.setAttribute('data-paper-shaders', 'true');
    }

    initWebGL() {
      const program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
      if (!program) return;
      this.program = program;
      this.setupPositionAttribute();
      this.setupUniforms();
    }

    setupPositionAttribute() {
      const loc = this.gl.getAttribLocation(this.program, 'a_position');
      const buf = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
      const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
      this.gl.enableVertexAttribArray(loc);
      this.gl.vertexAttribPointer(loc, 2, this.gl.FLOAT, false, 0, 0);
    }

    setupUniforms() {
      this.uniformLocations = {
        u_time: this.gl.getUniformLocation(this.program, 'u_time'),
        u_pixelRatio: this.gl.getUniformLocation(this.program, 'u_pixelRatio'),
        u_resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
        ...Object.fromEntries(Object.keys(this.providedUniforms).map((k) => [k, this.gl.getUniformLocation(this.program, k)])),
      };
    }

    setupResizeObserver() {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.canvas);
      this.handleResize();
    }

    handleResize() {
      const pixelRatio = window.devicePixelRatio || 1;
      const newWidth = this.canvas.clientWidth * pixelRatio;
      const newHeight = this.canvas.clientHeight * pixelRatio;
      if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.resolutionChanged = true;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.render(performance.now());
      }
    }

    render(currentTime) {
      if (this.hasBeenDisposed) return;
      const dt = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      if (this.speed !== 0) this.totalAnimationTime += dt * this.speed;

      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.useProgram(this.program);
      this.gl.uniform1f(this.uniformLocations.u_time, this.totalAnimationTime * 0.001);
      if (this.resolutionChanged) {
        this.gl.uniform2f(this.uniformLocations.u_resolution, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.uniform1f(this.uniformLocations.u_pixelRatio, window.devicePixelRatio || 1);
        this.resolutionChanged = false;
      }
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      if (this.speed !== 0) this.requestRender();
      else this.rafId = null;
    }

    requestRender() {
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame((t) => this.render(t));
    }

    updateProvidedUniforms() {
      this.gl.useProgram(this.program);
      Object.entries(this.providedUniforms).forEach(([key, value]) => {
        const location = this.uniformLocations[key];
        if (!location) return;
        if (Array.isArray(value)) {
          if (value.length === 4) this.gl.uniform4fv(location, value);
          else if (value.length === 3) this.gl.uniform3fv(location, value);
          else if (value.length === 2) this.gl.uniform2fv(location, value);
        } else if (typeof value === 'number') {
          this.gl.uniform1f(location, value);
        }
      });
    }

    setUniforms(newUniforms) {
      this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
      this.updateProvidedUniforms();
      this.render(performance.now());
    }

    setSpeed(newSpeed = 1) {
      this.speed = newSpeed;
      if (this.rafId === null && newSpeed !== 0) {
        this.lastFrameTime = performance.now();
        this.rafId = requestAnimationFrame((t) => this.render(t));
      }
      if (this.rafId !== null && newSpeed === 0) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    dispose() {
      this.hasBeenDisposed = true;
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      if (this.gl && this.program) this.gl.deleteProgram(this.program);
      if (this.resizeObserver) this.resizeObserver.disconnect();
    }
  }

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error: ' + gl.getProgramInfoLog(program));
      return null;
    }
    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return program;
  }

  /* ---- Preset (matches the Framer component's "Prism" default template) ---- */
  const preset = {
    color1: '#050505', color2: '#66B3FF', color3: '#FFFFFF',
    rotation: -50, proportion: 1, scale: 0.01, speed: 25,
    distortion: 0, swirl: 50, swirlIterations: 16,
    softness: 47, offset: -299, shape: 'Checks', shapeSize: 45,
  };

  function initLiquidBackground() {
    const canvas = document.querySelector('.liquid-bg');
    if (!canvas) return;

    const currentSpeed = speedEase(preset.speed / 100) * 5;
    const uniforms = {
      u_scale: preset.scale,
      u_rotation: preset.rotation * Math.PI / 180,
      u_color1: getShaderColorFromString(preset.color1),
      u_color2: getShaderColorFromString(preset.color2),
      u_color3: getShaderColorFromString(preset.color3),
      u_proportion: preset.proportion / 100,
      u_softness: preset.softness / 100,
      u_shape: PatternShapes[preset.shape],
      u_shapeScale: preset.shapeSize / 100,
      u_distortion: preset.distortion / 50,
      u_swirl: preset.swirl / 100,
      u_swirlIterations: preset.swirl === 0 ? 0 : preset.swirlIterations,
    };

    try {
      const mount = new ShaderMount(canvas, warpFragmentShader, uniforms, { antialias: false, alpha: false, preserveDrawingBuffer: true }, currentSpeed, preset.offset * 10);
      mount.setUniforms(uniforms);
    } catch (e) {
      console.warn('Liquid background unavailable, falling back to static wallpaper.', e);
      canvas.style.display = 'none';
      document.querySelector('.desktop')?.classList.add('no-liquid-bg');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiquidBackground);
  } else {
    initLiquidBackground();
  }
})();
