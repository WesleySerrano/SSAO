/**
 * Created by Wesley on 01/03/16.
 */

THREE.OurSSAOShader = {

    uniforms: {

        "tDiffuse":     { type: "t", value: null },
        "depthTexture":       { type: "t", value: null },
        "textureSize":         { type: "v2", value: new THREE.Vector2( 512, 512 ) },
        "cameraNear":   { type: "f", value: 1 },
        "cameraFar":    { type: "f", value: 100 },
        "ambientOcclusionClamp":      { type: "f", value: 0.5 },
        "luminosityInfluence": { type: "f", value: 0.5 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "#define DL 2.399963229728653",
        "#define EULER 2.718281828459045",

        "uniform sampler2D tDiffuse;",
        "uniform sampler2D depthTexture;",
        
        "uniform float cameraNear;",
        "uniform float cameraFar;",
        
        "uniform vec2 textureSize;",
        "uniform float ambientOcclusionClamp;",

        "uniform float luminosityInfluence;",  

        "varying vec2 vUv;",

        "const int samples = 8;",     
        "const float sphereRadius = 5.0;",  

        "const bool useNoise = false;",      
        "const float noiseAmount = 0.0003;", 

        "const float diffArea = 0.4;",
        "const float gaussianDisplacement = 0.4;",

        // RGBA depth

        "float unpackDepth( const in vec4 rgbaDepth ) {",

        "const vec4 bitShift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
        "float depth = dot( rgbaDepth, bitShift );",
        "return depth;",

        "}",

        // generating noise / pattern texture for dithering

        "vec2 rand( const vec2 coord ) {",

        "vec2 noise;",

        "if ( useNoise ) {",

        "float noiseX = dot ( coord, vec2( 12.9898, 78.233 ) );",
        "float noiseY = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",

        "noise = clamp( fract ( 43758.5453 * sin( vec2( noiseX, noiseY ) ) ), 0.0, 1.0 );",

        "} else {",

        "float ff = fract( 1.0 - coord.s * ( textureSize.x / 2.0 ) );",
        "float gg = fract( coord.t * ( textureSize.y / 2.0 ) );",

        "noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;",

        "}",

        "return ( noise * 2.0  - 1.0 ) * noiseAmount;",

        "}",

        "float readDepth( const in vec2 coord ) {",

        "float cameraFarPlusNear = cameraFar + cameraNear;",
        "float cameraFarMinusNear = cameraFar - cameraNear;",
        "float cameraCoef = 2.0 * cameraNear;",

        "return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( depthTexture, coord ) ) * cameraFarMinusNear );",


        "}",

        "float compareDepths( const in float depth1, const in float depth2, inout int far ) {",

        "float gaussianArea = 2.0;",                         // gauss bell width
        "float depthDifference = ( depth1 - depth2 ) * 100.0;",

        // reduce left bell width to avoid self-shadowing

        "if ( depthDifference < gaussianDisplacement ) {",

        "gaussianArea = depthDifference;",

        "} else {",

        "far = 1;",

        "}",

        "float dd = depthDifference - gaussianDisplacement;",
        "float gauss = pow( EULER, -2.0 * dd * dd / ( gaussianArea * gaussianArea ) );",
        "return gauss;",

        "}",

        "float calculateAmbientOcclusionFactor( float depth, float dw, float dh ) {",

        "float dd = sphereRadius - depth * sphereRadius;",
        "vec2 vv = vec2( dw, dh );",

        "vec2 coord1 = vUv + dd * vv;",
        "vec2 coord2 = vUv - dd * vv;",

        "float temp1 = 0.0;",
        "float temp2 = 0.0;",

        "int far = 0;",
        "temp1 = compareDepths( depth, readDepth( coord1 ), far );",

        // DEPTH EXTRAPOLATION

        "if ( far > 0 ) {",

        "temp2 = compareDepths( readDepth( coord2 ), depth, far );",
        "temp1 += ( 1.0 - temp1 ) * temp2;",

        "}",

        "return temp1;",

        "}",

        "void main() {",

        "vec2 noise = rand( vUv );",
        "float depth = readDepth( vUv );",

        "float tt = clamp( depth, ambientOcclusionClamp, 1.0 );",

        "float w = ( 1.0 / textureSize.x )  / tt + ( noise.x * ( 1.0 - noise.x ) );",
        "float h = ( 1.0 / textureSize.y ) / tt + ( noise.y * ( 1.0 - noise.y ) );",

        "float ambientOcclusionFactor = 0.0;",

        "float dz = 1.0 / float( samples );",
        "float z = 1.0 - dz / 2.0;",
        "float l = 0.0;",

        "for ( int i = 0; i <= samples; i ++ ) {",

        "float r = sqrt( 1.0 - z );",

        "float pw = cos( l ) * r;",
        "float ph = sin( l ) * r;",
        "ambientOcclusionFactor += calculateAmbientOcclusionFactor( depth, pw * w, ph * h );",
        "z = z - dz;",
        "l = l + DL;",

        "}",

        "ambientOcclusionFactor /= float( samples );",
        "ambientOcclusionFactor = 1.0 - ambientOcclusionFactor;",

        "vec3 color = texture2D( tDiffuse, vUv ).rgb;",

        "vec3 luminosityCoefficient = vec3( 0.299, 0.587, 0.114 );",
        "float luminosity = dot( color.rgb, luminosityCoefficient );",
        "vec3 luminance = vec3( luminosity );",

        "vec3 final = vec3( color * mix( vec3( ambientOcclusionFactor ), vec3( 1.0 ), luminance * luminosityInfluence ) );",

        "gl_FragColor = vec4( final, 1.0 );",

        "}"

    ].join( "\n" )
};