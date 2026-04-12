/**
 * GlowNodeProgram — sigma v3 custom WebGL node renderer
 *
 * Renders nodes with:
 * - Additive blending (gl.SRC_ALPHA, gl.ONE) for constellation glow
 * - GPU vertex-shader breathing animation driven by u_time
 * - Per-node vibrancy attribute that scales amplitude and core brightness
 * - Two-circle approach: outer bloom (low alpha) + inner core (bright)
 *
 * Sigma v3 API: extend NodeProgram<Uniforms>, implement getDefinition(),
 * processVisibleItem(), and setUniforms(). Additive blending is applied by
 * overriding render() to wrap super.render() with gl.blendFunc calls.
 */

import type { NodeDisplayData, RenderParams } from 'sigma/types'
import { NodeProgram } from 'sigma/rendering'
import type { NodeProgramType, ProgramInfo } from 'sigma/rendering'

const FLOAT = WebGLRenderingContext.FLOAT
const UNSIGNED_BYTE = WebGLRenderingContext.UNSIGNED_BYTE

const VERTEX_SHADER_SOURCE = /* glsl */ `
precision mediump float;

attribute vec2  a_position;
attribute float a_size;
attribute vec4  a_color;
attribute float a_vibrancy;
attribute float a_nodeIndex;

uniform mat3  u_matrix;
uniform float u_sqrtZoomRatio;
uniform float u_correctionRatio;
uniform float u_time;
uniform float u_amplitude;

varying vec4  v_color;
varying float v_vibrancy;

void main() {
  // Breathing animation — golden-ratio phase offset makes each node drift
  // independently so oscillations are organic, not synchronized
  float phase = a_nodeIndex * 2.3999632;
  float effectiveAmplitude = u_amplitude * max(0.4, a_vibrancy);

  float ox = sin(u_time * 0.28 + phase)        * effectiveAmplitude;
  float oy = cos(u_time * 0.28 + phase * 1.31) * effectiveAmplitude;

  vec2 pos = a_position + vec2(ox, oy);

  gl_Position  = vec4((u_matrix * vec3(pos, 1.0)).xy, 0.0, 1.0);
  gl_PointSize = (a_size + 2.0) * u_sqrtZoomRatio * u_correctionRatio;

  // Core brightness scales with vibrancy — foundational nodes stay visible,
  // archived nodes dim but never go dark
  float coreBrightness = 0.6 + a_vibrancy * 0.4;
  v_color    = vec4(a_color.rgb * coreBrightness, a_color.a);
  v_vibrancy = a_vibrancy;
}
`

const FRAGMENT_SHADER_SOURCE = /* glsl */ `
precision mediump float;

varying vec4  v_color;
varying float v_vibrancy;

void main() {
  // gl_PointCoord: (0,0) top-left, (1,1) bottom-right
  vec2  uv   = gl_PointCoord * 2.0 - 1.0;
  float dist = length(uv);

  // Soft glow bloom (outer ring, additive blending amplifies overlaps)
  float glow = exp(-dist * dist * 2.5) * 0.45 * v_vibrancy;

  // Crisp core circle
  float core = smoothstep(1.0, 0.75, dist);

  float alpha = max(glow, core * v_color.a);
  if (alpha < 0.01) discard;

  gl_FragColor = vec4(v_color.rgb, alpha);
}
`

const UNIFORMS = [
  'u_matrix', 'u_sqrtZoomRatio', 'u_correctionRatio',
  'u_time', 'u_amplitude',
] as const

type GlowUniforms = (typeof UNIFORMS)[number]

/** Control object — update `amplitude` and `reducedMotion` from the React ShaderAnimator */
export interface GlowProgramControl {
  amplitude: number
  reducedMotion: boolean
}

/**
 * Factory: creates a GlowNodeProgram class bound to the given control object.
 * This lets the React component update uniforms (amplitude, reduced-motion)
 * without global state.
 *
 * @example
 * ```ts
 * const control = { amplitude: 0.006, reducedMotion: false }
 * const GlowNodeProgram = createGlowNodeProgram(control)
 * // pass to sigma settings:
 * <SigmaContainer settings={{ nodeProgramClasses: { circle: GlowNodeProgram } }} />
 * ```
 */
export function createGlowNodeProgram(control: GlowProgramControl): NodeProgramType {
  class GlowNodeProgram extends NodeProgram<GlowUniforms> {
    getDefinition() {
      return {
        VERTICES: 1,
        VERTEX_SHADER_SOURCE,
        FRAGMENT_SHADER_SOURCE,
        METHOD: WebGLRenderingContext.POINTS,
        UNIFORMS,
        ATTRIBUTES: [
          { name: 'a_position',  size: 2, type: FLOAT },
          { name: 'a_size',      size: 1, type: FLOAT },
          { name: 'a_color',     size: 4, type: UNSIGNED_BYTE, normalized: true },
          { name: 'a_vibrancy',  size: 1, type: FLOAT },
          { name: 'a_nodeIndex', size: 1, type: FLOAT },
        ],
      }
    }

    processVisibleItem(
      nodeIndex: number,
      startIndex: number,
      data: NodeDisplayData & { vibrancy?: number },
    ) {
      const array = this.array

      // Extract RGBA from sigma's color string
      let r = 128, g = 128, b = 128, a = 255
      const color = data.color ?? '#8b949e'
      if (color.startsWith('#') && color.length === 7) {
        r = parseInt(color.slice(1, 3), 16)
        g = parseInt(color.slice(3, 5), 16)
        b = parseInt(color.slice(5, 7), 16)
      }

      array[startIndex++] = data.x
      array[startIndex++] = data.y
      array[startIndex++] = data.size ?? 8
      // Pack RGBA into a single float (sigma convention via DataView)
      const buf  = new ArrayBuffer(4)
      const view = new DataView(buf)
      view.setUint8(0, r); view.setUint8(1, g); view.setUint8(2, b); view.setUint8(3, a)
      array[startIndex++] = view.getFloat32(0, true)
      array[startIndex++] = data.vibrancy ?? 1.0
      array[startIndex]   = nodeIndex
    }

    setUniforms(
      params: RenderParams,
      { gl, uniformLocations }: ProgramInfo<GlowUniforms>,
    ) {
      const { u_matrix, u_sqrtZoomRatio, u_correctionRatio, u_time, u_amplitude } =
        uniformLocations

      gl.uniformMatrix3fv(u_matrix, false, params.matrix)
      // RenderParams provides zoomRatio; the shader expects its square root
      gl.uniform1f(u_sqrtZoomRatio, Math.sqrt(params.zoomRatio))
      gl.uniform1f(u_correctionRatio, params.correctionRatio)
      gl.uniform1f(u_time, performance.now() / 1000)
      gl.uniform1f(u_amplitude, control.reducedMotion ? 0 : control.amplitude)
    }

    render(params: RenderParams) {
      // Additive blending — overlapping glows brighten each other,
      // producing the constellation effect. Restore default after draw.
      const { gl } = this.normalProgram
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
      super.render(params)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    }
  }
  return GlowNodeProgram
}
