/**
 * Created by Wesley on 01/11/2015.
 */

var scene, camera, renderer, composer;
var WIDTH = 1280, HEIGHT = 720;

THREE.SSAOShader =
{
    uniforms:
    {

        "tDiffuse": { type: "t", value: null },
        "side":     { type: "i", value: 1 }

    },

    vertexShader:
    [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader:
    [

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 p = vUv;",
        "vec4 color = texture2D(tDiffuse, p);",
        "gl_FragColor = 0.5*color;",

        "}"

    ].join( "\n" )

};
function loadObject(objFilePath,  position, scale, rotate)
{
    position = typeof position !== 'undefined'? position : [0, 0, 0];
    rotate = typeof rotate !== 'undefined'? rotate : false;
    scale = typeof scale !== 'undefined'? scale : [1, 1, 1];

    var objectLoader = new THREE.OBJLoader();

    objectLoader.load(objFilePath, function(object)
        {

             //var material = new THREE.MeshFaceMaterial(materials);
             var material = new THREE.ShaderMaterial({
                 uniforms: {
                     color: {type: 'f', value: 1.0}
                 },
                 vertexShader: document.
                     getElementById('vertex-shader').text,
                 fragmentShader: document.
                     getElementById('fragment-shader').text
             });
            var material2 = new THREE.MeshPhongMaterial({ color: 0xec7a21 });

            object.traverse( function(child) {
                if (child instanceof THREE.Mesh) {

                    // apply custom material
                    child.material = material2;

                    // enable casting shadows
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            object.position.x = position[0];
            object.position.y = position[1];
            object.position.z = position[2];
            object.scale.set(scale[0], scale[1], scale[2]);
            if(rotate) object.rotation.y = Math.PI/2.0;
            scene.add(object);
        }
    );
}

function init()
{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 );
    camera.position.x = 20;
    camera.position.y = 13;
    camera.position.z = 10;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH,HEIGHT);
    document.body.appendChild( renderer.domElement );
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    scene.add( new THREE.AmbientLight( 0x222222 ) );
    var light = new THREE.PointLight(0xffffff);
    light.position.set(100,50,50);
    scene.add(light);

    loadObject('bull.obj', [0,0,0], [1,1,1], true);

    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );

    var effect = new THREE.ShaderPass( THREE.SSAOShader );
    composer.addPass( effect );

    render();
}

function render()
{
    requestAnimationFrame(render);
    renderer.render( scene, camera );
    composer.render(0.1);
    controls.update();
}