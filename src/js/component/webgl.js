

/**
 * This is more or less just a wrapper for a THREE scene that handles all of
 * the loop/draw logic, camera controls, etc.
 *
 * @param {number} width The width of the scene.
 * @param {number} height The height of the scene.
 */
shed.component.webgl = function(options) {
  this.width_ = options.width;
  this.height_ = options.height;
  this.update_ = options.update;

  shed.component.apply(this, arguments);
}
$.inherits(shed.component.webgl, shed.component);


/**
 * The width of the scene.
 *
 * @type {number}
 */
shed.component.webgl.prototype.width_;


/**
 * The height of the scene.
 *
 * @type {number}
 */
shed.component.webgl.prototype.height_;


/**
 * The scene.
 *
 * @type {THREE.Scene}
 */
shed.component.webgl.prototype.scene_;


/**
 * The camera.
 *
 * @type {THREE.PerspectiveCamera}
 */
shed.component.webgl.prototype.camera_;


/**
 * The renderer.
 *
 * @type {THREE.WebGLRenderer}
 */
shed.component.webgl.prototype.renderer_;


/**
 * The camera controls.
 *
 * @type {THREE.OrbitControls}
 */
shed.component.webgl.prototype.controls_;


/**
 * The ID from requestAnimation Frame
 *
 * @type {number}
 */
shed.component.webgl.prototype.animation_frame_id_;


/**
 * The function to call in the main loop that should update properties of
 * things inside the scene.
 *
 * @type {THREE.OrbitControls}
 */
shed.component.webgl.prototype.update_;


/**
 * Update frames per second. The browser will always try to animate at 60 FPS.
 *
 * @type {number}
 */
shed.component.webgl.prototype.fps_ = 30;


/**
 * Milliseconds between updates.
 *
 * @type {number}
 */
shed.component.webgl.prototype.skip_milliseconds_ = 1000 / 30;


/**
 * When the next update will occur.
 *
 * @type {number}
 */
shed.component.webgl.prototype.next_update_ = Date.now();


/**
 * When the last update happened.
 *
 * @type {number}
 */
shed.component.webgl.prototype.last_update_ = Date.now();


/**
 * How many times the update function was called since the last animate.
 *
 * @type {number}
 */
shed.component.webgl.prototype.loops_ = 0;


/**
 * Create the scene, add the camera, renderer, and controls. Automatically
 * starts the animation loop.
 *
 * @param {Rocket.Elements} parent
 */
shed.component.webgl.prototype.decorate_ = function(parent) {
  this.scene_ = new THREE.Scene();

  this.camera_ = new THREE.PerspectiveCamera(75, this.width_ / this.height_, 0.1, 100);

  this.renderer_ = new THREE.WebGLRenderer({
    'antialias': true,
    'alpha': true
  });
  this.renderer_.setSize(this.width_, this.height_);
  this.renderer_.setClearColor(0x000000, 0);

  // http://threejs.org/examples/misc_controls_orbit.html
  // http://stackoverflow.com/questions/18581225/orbitcontrol-or-trackballcontrol
  this.controls_ = new THREE.OrbitControls(this.camera_, this.renderer_.domElement);
  this.controls_.zoomSpeed = 3;
  this.controls_.noPan = true;
  this.controls_.minDistance = 3;
  this.controls_.maxDistance = 30;
  this.controls_.noKeys = true;

  parent.appendChild(this.renderer_.domElement);

  this.play();
};


/**
 * Main loop.
 *
 * @link http://gameprogrammingpatterns.com/game-loop.html
 * @link http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/
 */
shed.component.webgl.prototype.run_ = function() {
  this.loops_ = 0;

  while (Date.now() > this.next_update_) {
    // Run update logic. Passing it the time since the last update was called.
    this.update_(Date.now() - this.last_update_);
    this.last_update_ = Date.now();

    // Set the next update out some amount of milliseconds
    this.next_update_ += this.skip_milliseconds_;

    this.loops_++;
  }

  // Always draw, but only if there has been an update. Don't otherwise bother
  // since nothing will have changed. This doesn't actually do much right now
  // since webkit will try to render at 60fps and I'm also updating at 60fps.
  if(this.loops_) {
    this.controls_.update();
    this.renderer_.render(this.scene_, this.camera_);
  }

  this.animation_frame_id_ = requestAnimationFrame(this.run_.bind(this));
}


/**
 * Get the scene.
 *
 * @return {THREE.Scene}
 */
shed.component.webgl.prototype.get_scene = function() {
  return this.scene_;
}


/**
 * Get the renderer.
 *
 * @return {THREE.WebGLRenderer}
 */
shed.component.webgl.prototype.get_renderer = function() {
  return this.renderer_;
}


/**
 * Get the camera.
 *
 * @return {THREE.PerspectiveCamera}
 */
shed.component.webgl.prototype.get_camera = function() {
  return this.camera_;
}


/**
 * Get the controls.
 *
 * @return {THREE.OrbitControls}
 */
shed.component.webgl.prototype.get_controls = function() {
  return this.controls_;
}


/**
 * Start updating/animating.
 */
shed.component.webgl.prototype.play = function() {
  this.animation_frame_id_ = requestAnimationFrame(this.run_.bind(this));
}


/**
 * Stop updating/animating.
 */
shed.component.webgl.prototype.stop = function() {
  cancelAnimationFrame(this.animation_frame_id_);
}