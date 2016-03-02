/**
 * Created by Wesley on 01/11/2015.
 */

var scene, camera, renderer;
var WIDTH = 1280, HEIGHT = 720;


/*function loadObjectAndMaterial(objFilePath, mtlFilePath, position, scale, rotate)
{
    position = typeof position !== 'undefined'? position : [0, 0, 0];
    rotate = typeof rotate !== 'undefined'? rotate : false;
    scale = typeof scale !== 'undefined'? scale : [1, 1, 1];

    var objectLoader = new THREE.OBJMTLLoader();

    objectLoader.load(objFilePath,mtlFilePath, function(object)
        {
            object.position.x = position[0];
            object.position.y = position[1];
            object.position.z = position[2];
            object.scale.set(scale[0], scale[1], scale[2]);
            if(rotate) object.rotation.y = Math.PI/2.0;
            scene.add(object);
        }
    );
}*/

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
            var material2 = new THREE.MeshPhongMaterial({ color: 0xffffff });

            object.traverse( function(child) {
                if (child instanceof THREE.Mesh) {

                    // apply custom material
                    child.material = material;

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

    var light = new THREE.PointLight(0xffffff);
    light.position.set(100,50,50);
    scene.add(light);

    var light2 = new THREE.PointLight(0xffffff);
    light2.position.set(2.45, 5, 0);
    //scene.add(light2);

    //loadObject('bull.obj', [0,0,0], [1,1,1], false);
    loadObject('bull.obj', [0,0,0], [1,1,1], true);

    render();
}

function render()
{
    requestAnimationFrame(render);
    renderer.render( scene, camera );
    controls.update();
}