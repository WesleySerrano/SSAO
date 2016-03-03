/**
 * Created by Wesley on 02/03/16.
 */

THREE.BlurShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null }

    },

    vertexShader: [
      "varying vec2 vUv;",
      "varying vec2 vBlurTexCoords[14];",

      "void main()",
      "{",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
          "vUv = uv;",
          "vBlurTexCoords[ 0] = vUv + vec2(0.0, -0.0028);",
          "vBlurTexCoords[ 1] = vUv + vec2(0.0, -0.0024);",
          "vBlurTexCoords[ 2] = vUv + vec2(0.0, -0.0020);",
          "vBlurTexCoords[ 3] = vUv + vec2(0.0, -0.0016);",
          "vBlurTexCoords[ 4] = vUv + vec2(0.0, -0.0012);",
          "vBlurTexCoords[ 5] = vUv + vec2(0.0, -0.0008);",
          "vBlurTexCoords[ 6] = vUv + vec2(0.0, -0.0004);",
          "vBlurTexCoords[ 7] = vUv + vec2(0.0,  0.0004);",
          "vBlurTexCoords[ 8] = vUv + vec2(0.0,  0.0008);",
          "vBlurTexCoords[ 9] = vUv + vec2(0.0,  0.0012);",
          "vBlurTexCoords[10] = vUv + vec2(0.0,  0.0016);",
          "vBlurTexCoords[11] = vUv + vec2(0.0,  0.0020);",
          "vBlurTexCoords[12] = vUv + vec2(0.0,  0.0024);",
          "vBlurTexCoords[13] = vUv + vec2(0.0,  0.0028);",
      "}"

        // "varying vec2 vUv;",
        //
        // "void main() {",
        //
        // "vUv = uv;",
        // "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        //
        // "}"

    ].join( "\n" ),

    fragmentShader: [
      "precision mediump float;",

      "uniform sampler2D tDiffuse;",

      "varying vec2 vUv;",
      "varying vec2 vBlurTexCoords[14];",

      "void main()",
      "{",
        "gl_FragColor = vec4(0.0);",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 0])*0.0044299121055113265;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 1])*0.00895781211794;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 2])*0.0215963866053;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 3])*0.0443683338718;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 4])*0.0776744219933;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 5])*0.115876621105;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 6])*0.147308056121;",
        "gl_FragColor += texture2D(tDiffuse, vUv)*0.159576912161;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 7])*0.147308056121;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 8])*0.115876621105;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[ 9])*0.0776744219933;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[10])*0.0443683338718;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[11])*0.0215963866053;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[12])*0.00895781211794;",
        "gl_FragColor += texture2D(tDiffuse, vBlurTexCoords[13])*0.0044299121055113265;",
      "}",

        // "uniform sampler2D tDiffuse;",
        //
        // "varying vec2 vUv;",
        //
        // "void main() {",
        //
        // "vec4 color = texture2D(tDiffuse, vUv);",
        // "float r = color.r, g = color.g, b = color.b;",
        // "color.r = r*0.393 + g*0.769 + b*0.189;",
        // "color.g = r*0.349 + g*0.686 + b*0.168;",
        // "color.b = r*0.272 + g*0.534 + b*0.131;",
        // "gl_FragColor = color;",
        //
        // "}"

    ].join( "\n" )
};
