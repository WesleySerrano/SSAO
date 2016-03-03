/**
 * Created by Wesley and Luan on 01/11/2015.
 */

var scene, camera, renderer, effectComposer, depthMaterial;
var renderPass, pars, ssaoPass, blurPass;
var depthRenderTarget;
var WIDTH = 1280, HEIGHT = 720;
var ssaoActive = false;
var blurActive = false;
var sphereRadius = 2;
var gaussianDisplacement = 0.2;
var blurIntensity = 1.0;

function loadObject(objFilePath,  position, scale, rotate, color)
{
  position = typeof position !== 'undefined'? position : [0, 0, 0];
  rotate = typeof rotate !== 'undefined'? rotate : false;
  scale = typeof scale !== 'undefined'? scale : [1, 1, 1];

  var objectLoader = new THREE.OBJLoader();

  objectLoader.load(objFilePath, function(object)
  {
    var material = new THREE.MeshPhongMaterial({ color: color });

    object.traverse( function(child) {
      if (child instanceof THREE.Mesh) {

        // apply custom material
        child.material = material;
        // var loader = new THREE.DDSLoader();
        // child.material.map = loader.load( 'pickup/pickup_exterior_d.dds' );
				// child.material.map.minFilter = child.material.map.magFilter = THREE.LinearFilter;
				// child.material.map.anisotropy = 8;
        // child.material.needsUpdate = true;

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

  scene.add( new THREE.AmbientLight( 0x555555 ) );
  var light = new THREE.PointLight(0xffffff);
  light.position.set(100,90,90);
  scene.add(light);
  loadObject('pickup/PickUp.obj',  [0,0,0], [10,10,10], false, 0xec7a21)

  loadObject('jeep.obj',  [-130,0,0], [0.1,0.1,0.1], false, 0xec7a21)

  //starts UI
  document.getElementById("ssao-switch").checked = ssaoActive;
  document.getElementById("blur-switch").checked = blurActive;
  document.getElementById("sphere-radius").value = sphereRadius;
  document.getElementById("sphere-radius-text").value = "(" + parseFloat(sphereRadius).toFixed(1) + ") Samples Sphere Radius";
  document.getElementById("gaussian-displacement").value = gaussianDisplacement;
  document.getElementById("gaussian-displacement-text").value = "(" + parseFloat(gaussianDisplacement).toFixed(2) + ") Gaussian Displacement";
  document.getElementById("blur-intensity").value = blurIntensity;
  document.getElementById("blur-intensity-text").value = "(" + blurIntensity + ") Blur Intensity";

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

  ssaoPass.uniforms[ 'ambientOcclusionClamp' ].value = 0.3;
  ssaoPass.uniforms[ 'luminosityInfluence' ].value = 0.5;
  ssaoPass.uniforms[ 'diffArea' ].value = 0.4;
  ssaoPass.uniforms[ 'gaussianDisplacement' ].value = gaussianDisplacement;
  ssaoPass.uniforms[ 'sphereRadius' ].value = sphereRadius;

  blurPass.uniforms[ "aBlurIntensity" ].value = blurIntensity;

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

function setSphereRadius(slider){
  sphereRadius = slider.value;
  document.getElementById("sphere-radius-text").value = "(" + parseFloat(slider.value).toFixed(1) + ") Samples Sphere Radius";
  makeEffectComposer();
}

function setGaussianDisplacement(slider){
  gaussianDisplacement = slider.value;
  document.getElementById("gaussian-displacement-text").value = "(" + parseFloat(slider.value).toFixed(2) + ") Gaussian Displacement";
  makeEffectComposer();
}

function setBlurIntensity(slider){
  blurIntensity = slider.value;
  document.getElementById("blur-intensity-text").value = "(" + slider.value + ") Blur Intensity";
  makeEffectComposer();
}
