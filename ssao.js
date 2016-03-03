/**
 * Created by Wesley and Luan on 01/11/2015.
 */

var scene, camera, renderer, effectComposer, depthMaterial;
var renderPass, pars, ssaoPass, blurPass;
var depthRenderTarget;
var WIDTH = 1280, HEIGHT = 720;
var ssaoActive = false;
var blurActive = false;

function loadObject(objFilePath,  position, scale, rotate)
{
  position = typeof position !== 'undefined'? position : [0, 0, 0];
  rotate = typeof rotate !== 'undefined'? rotate : false;
  scale = typeof scale !== 'undefined'? scale : [1, 1, 1];

  var objectLoader = new THREE.OBJLoader();

  objectLoader.load(objFilePath, function(object)
  {
    var material = new THREE.MeshPhongMaterial({ color: 0xec7a21 });

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
  });
}

function init()
{
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 );
  camera.position.x = 100;
  camera.position.y = 65;
  camera.position.z = 50;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( WIDTH,HEIGHT);
  document.body.appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  scene.add( new THREE.AmbientLight( 0x222222 ) );
  var light = new THREE.PointLight(0xffffff);
  light.position.set(100,50,50);
  scene.add(light);
  loadObject('jeep.obj',  [0,0,0], [0.1,0.1,0.1], false)

  //starts UI
  document.getElementById("ssao-switch").checked = ssaoActive;
  document.getElementById("blur-switch").checked = blurActive;

  initializePostProcessing();

  render();
}

function initializePostProcessing()
{
  // Setup render pass
  renderPass = new THREE.RenderPass( scene, camera );

  // Setup depth pass
  var depthShader = THREE.ShaderLib[ "depthRGBA" ];
  var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

  depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader,
      uniforms: depthUniforms, blending: THREE.NoBlending } );

  pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

  // Setup SSAO pass
  ssaoPass = new THREE.ShaderPass( THREE.OurSSAOShader );
  //ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
  ssaoPass.uniforms[ "depthTexture" ].value = depthRenderTarget;
  ssaoPass.uniforms[ 'textureSize' ].value.set( window.innerWidth, window.innerHeight );
  ssaoPass.uniforms[ 'cameraNear' ].value = camera.near;
  ssaoPass.uniforms[ 'cameraFar' ].value = camera.far;
  ssaoPass.uniforms[ 'ambientOcclusionClamp' ].value = 0.3;
  ssaoPass.uniforms[ 'luminosityInfluence' ].value = 0.5;

  blurPass = new THREE.ShaderPass( THREE.BlurShader);
  blurPass.uniforms[ "tDiffuse" ].value = depthRenderTarget;

  makeEffectComposer();
}

function makeEffectComposer()
{
  if(blurActive) {
    ssaoPass.renderToScreen = false;
    blurPass.renderToScreen = true;
  }
  else if(ssaoPass) {
      ssaoPass.renderToScreen = true;
  }
  // Add all passes to effect composer
  effectComposer = new THREE.EffectComposer( renderer, new THREE.WebGLRenderTarget( WIDTH, HEIGHT, pars ) );
  effectComposer.addPass( renderPass );
  if(ssaoActive) effectComposer.addPass( ssaoPass );
  if(blurActive) effectComposer.addPass( blurPass );
}

function render()
{
    requestAnimationFrame(render);

    if(withoutEffects())
    {
      renderer.render(scene, camera);
    }
    else
    {
      // Render depth into depthRenderTarget
      scene.overrideMaterial = depthMaterial;
      renderer.render( scene, camera, depthRenderTarget, true );

      // Render renderPass and SSAO shaderPass
      //Post Processing
      scene.overrideMaterial = null;
      effectComposer.render();
    }
    controls.update();
}

function withoutEffects(){
  return !ssaoActive && !blurActive;
}

function toggleSSAO(checkbox){
  ssaoActive = checkbox.checked;
  makeEffectComposer();
}

function toggleBlur(checkbox){
  blurActive = checkbox.checked;
  makeEffectComposer();
}
