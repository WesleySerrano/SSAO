/**
 * Created by Wesley on 01/03/16.
 */

THREE.SSAOShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 color = texture2D(tDiffuse, vUv);",
        "float r = color.r, g = color.g, b = color.b;",
        "color.r = r*0.393 + g*0.769 + b*0.189;",
        "color.g = r*0.349 + g*0.686 + b*0.168;",
        "color.b = r*0.272 + g*0.534 + b*0.131;",
        "gl_FragColor = color;",

        "}"

    ].join( "\n" )

};