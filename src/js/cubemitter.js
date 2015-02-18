// TODO: Why are constant values stored in arrays?

// TODO: Something with POINT origins is wrong maybe? No, they just have values
// that don't get read.

// TODO: Materials

// TODO: Duration/looping?? Handled by effect?

// TODO: transforms?? Handled by effect?

// TODO: start time / end time on the effects?

// SH Bug? When rotating an effect, the particle system origin rotates, but the
// particles still move according to the original axis.

// Addressed on Dev Stream #16 2/17/2015 around 30 min in? Tom suggested
// programmatic access to the effect transforms to handle things like rotating
// an effect with an object.

// TODO: If I request 9999 particles per second, SH will give those to me by
// just creating them all at once (then limiting to 100). I'm only creating one
// particle per frame max, so I need to change that to allow creating LOTS of
// particles pretty much at the same time. Then, FIREWORKS!

// TODO FOR NEXT RELEASE:
// finish effect editor with openable files
// add button to toggle grid maybe
// add button to toggle axis
// add button to toggle emitter display
// add mod switcher maybe
// add legacy THREE support
// handle duration / looping & add controls?
// local coordinate systems?

shed.cubemitter = function(options) {
  this.file_ = options.file;
  this.transforms_ = options.transforms;
  this.load_();



  // TODO: This doesn't need to run until the cubemitter gets displayed, BUT it
  // can only run one time total or it will transform multiple times (depending
  // on if I use an absolute or relative transform).
  // this.apply_transforms_();
};

shed.cubemitter.prototype.load_ = function() {
  this.group_ = new THREE.Object3D();
  this.cubes_ = new THREE.Object3D();
  this.emitter_ = new THREE.Mesh();

  this.group_.add(this.emitter_);
  this.group_.add(this.cubes_);


  this.apply_transforms_(); // TODO: JUST TESTING SOMETHING

  this.data_ = shed.read_file(this.file_);
};

/**
 * How many cubes can be present in a cubemitter at any given time.
 *
 * @type {number}
 */
shed.cubemitter.cube_limit_ = 100;

shed.cubemitter.prototype.file_;
shed.cubemitter.prototype.scene_;
shed.cubemitter.prototype.watcher_;
shed.cubemitter.prototype.data_;
shed.cubemitter.prototype.emitter_;


/**
 * The group containing all cubes.
 *
 * @type {THREE.Object3D}
 */
shed.cubemitter.prototype.cubes_;


/**
 * A master group containing everything, including debugging stuff like the
 * emitter wireframes.
 *
 * @type {THREE.Object3D}
 */
shed.cubemitter.prototype.group_;


/**
 * Rotational and positional transforms.
 *
 * @type {Object}
 */
shed.cubemitter.prototype.transforms_;


/**
 * Set the scene this effect is part of.
 *
 * @param {THREE.Scene} scene
 */
shed.cubemitter.prototype.set_scene = function(scene) {
  this.watch_();
  this.scene_ = scene;
  this.scene_.add(this.group_);
};


/**
 * Time since last cube was created.
 *
 * @type {number}
 */
shed.cubemitter.prototype.dt_cube_ = 0;


/**
 * Time since the system was created.
 *
 * @type {number}
 */
shed.cubemitter.prototype.dt_system_ = 0;


shed.cubemitter.prototype.update = function(dt) {
  this.dt_system_ += dt;
  this.update_create_(dt);
  this.update_move_(dt); // TODO: Find a better name for this
};


/**
 * Apply any effect transformations to the cubemitter.
 */
shed.cubemitter.prototype.apply_transforms_ = function() {
  this.group_.position.x = this.transforms_.x;
  this.group_.position.y = this.transforms_.y;
  this.group_.position.z = this.transforms_.z;
};


// determine whether or not a new cube needs created
shed.cubemitter.prototype.update_create_ = function(dt) {

  this.dt_cube_ += dt;
  var emission_rate = this[this.data_.emission.rate.kind.toLowerCase() + '_']('emission.rate', this.data_.emission.rate.values, this.dt_system_ / this.data_.duration);

  // emission_rate = 9999;
  var particles_to_create = dt / 1000 * emission_rate;
  // particles_to_create = 0;

  while (particles_to_create-- > 0) { // TODO: needs more testing
    if (
      this.dt_cube_ >= (1000 / emission_rate) && // Don't create new cubes until enough time has passed.
      this.cubes_.children.length < shed.cubemitter.cube_limit_ && // Stop creating new cubes if the cubemitter cube limit is reached.
      (this.dt_system_ < this.data_.duration * 1000) // Stop creating new cubes when the cubemitter duration is up.
      // particles_to_create-- > 0
    ) {
      this.dt_cube_ = 0;

      // Create the cube
      var scale = this[this.data_.particle.scale.start.kind.toLowerCase() + '_']('particle.scale', this.data_.particle.scale.start.values);
      var color = this[this.data_.particle.color.start.kind.toLowerCase() + '_']('particle.color', this.data_.particle.color.start.values);
      var opacity = this[this.data_.particle.color.start.kind.toLowerCase() + '_']('particle.opacity', this.data_.particle.color.start.values);
      var lifetime = this[this.data_.particle.lifetime.start.kind.toLowerCase() + '_']('particle.lifetime', this.data_.particle.lifetime.start.values);
      var speed = this[this.data_.particle.speed.start.kind.toLowerCase() + '_']('particle.speed', this.data_.particle.speed.start.values);
      var origin = this[this.data_.emission.origin.surface.toLowerCase() + '_']('emission.origin', this.data_.emission.origin.values);
      var angle = this[this.data_.emission.angle.kind.toLowerCase() + '_']('emission.angle', this.data_.emission.angle.values);
      // TODO: Start velocity?

      var geometry = new THREE.BoxGeometry(scale, scale, scale);
      var material = new THREE.MeshBasicMaterial({
        'color': color.getHex(),
        'transparent': true,
        'opacity': opacity
      });
      var cube = new THREE.Mesh(geometry, material);

      cube.position.x = origin.x;
      cube.position.y = origin.y;
      cube.position.z = origin.z;

      var z_min = Math.cos(angle * Math.PI / 180);
      var z_max = 1;
      var z = (Math.random() * (z_max - z_min)) + z_min;

      var phi_min = 0;
      var phi_max = 2 * Math.PI;
      var phi = (Math.random() * (phi_max - phi_min)) + phi_min;

      // theta = theta * Math.PI / 180;
      // var phi = theta;
      // var random_theta = Math.random() * theta * Math.PI / 180;
      cube.userData = {
        'lifetime': lifetime,
        'age': 0,
        'speed': speed,
        'z': z,
        'phi': phi,
        'random': Math.random()
        // 'theta': random_theta,
        // 'u': (Math.random() * 2) - 1,
        // 'u2': Math.random() * (1 - Math.cos(phi)) + Math.cos(phi)
      };

      this.cubes_.add(cube);
    }
  }
};

// update all existing cubes
shed.cubemitter.prototype.update_move_ = function(dt) {
  for (var i = this.cubes_.children.length - 1; i >= 0; i--) {
    this.cubes_.children[i].userData.age += (dt / 1000);

    // Remove anything that has aged out.
    if (this.cubes_.children[i].userData.age >= this.cubes_.children[i].userData.lifetime) {
      this.cubes_.children[i].geometry.dispose();
      this.cubes_.children[i].material.dispose();
      this.cubes_.remove(this.cubes_.children[i]);
      continue;
    }

    var age_percent = this.cubes_.children[i].userData.age / this.cubes_.children[i].userData.lifetime;

    // Color
    if (this.data_.particle.color.over_lifetime_r) {
      var color_r = this[this.data_.particle.color.over_lifetime_r.kind.toLowerCase() + '_']('particle.color', this.data_.particle.color.over_lifetime_r.values, age_percent, this.cubes_.children[i].userData.random);
      this.cubes_.children[i].material.color.r = color_r;
    }
    if (this.data_.particle.color.over_lifetime_g) {
      var color_g = this[this.data_.particle.color.over_lifetime_g.kind.toLowerCase() + '_']('particle.color', this.data_.particle.color.over_lifetime_g.values, age_percent, this.cubes_.children[i].userData.random);
      this.cubes_.children[i].material.color.g = color_g;
    }
    if (this.data_.particle.color.over_lifetime_b) {
      var color_b = this[this.data_.particle.color.over_lifetime_b.kind.toLowerCase() + '_']('particle.color', this.data_.particle.color.over_lifetime_b.values, age_percent, this.cubes_.children[i].userData.random);
      this.cubes_.children[i].material.color.b = color_b;
    }
    if (this.data_.particle.color.over_lifetime_a) {
      var color_a = this[this.data_.particle.color.over_lifetime_a.kind.toLowerCase() + '_']('particle.opacity', this.data_.particle.color.over_lifetime_a.values, age_percent, this.cubes_.children[i].userData.random);
      this.cubes_.children[i].material.opacity = color_a;
    }

    // Scale
    if (this.data_.particle.scale.over_lifetime) {
      var scale = this[this.data_.particle.scale.over_lifetime.kind.toLowerCase() + '_']('particle.scale', this.data_.particle.scale.over_lifetime.values, age_percent, this.cubes_.children[i].userData.random);
      this.cubes_.children[i].scale.x = scale;
      this.cubes_.children[i].scale.y = scale;
      this.cubes_.children[i].scale.z = scale;
    }

    // Rotation
    if (this.data_.particle.rotation) {
      if (this.data_.particle.rotation.over_lifetime_x) {
        var rotation_x = this[this.data_.particle.rotation.over_lifetime_x.kind.toLowerCase() + '_']('particle.rotation', this.data_.particle.rotation.over_lifetime_x.values, age_percent, this.cubes_.children[i].userData.random);
        this.cubes_.children[i].rotation.x = rotation_x;
      }
      if (this.data_.particle.rotation.over_lifetime_y) {
        var rotation_y = this[this.data_.particle.rotation.over_lifetime_y.kind.toLowerCase() + '_']('particle.rotation', this.data_.particle.rotation.over_lifetime_y.values, age_percent, this.cubes_.children[i].userData.random);
        this.cubes_.children[i].rotation.y = rotation_y;
      }
      if (this.data_.particle.rotation.over_lifetime_z) {
        var rotation_z = this[this.data_.particle.rotation.over_lifetime_z.kind.toLowerCase() + '_']('particle.rotation', this.data_.particle.rotation.over_lifetime_z.values, age_percent, this.cubes_.children[i].userData.random);
        this.cubes_.children[i].rotation.z = rotation_z;
      }
    }

    // Speed
    if (this.data_.particle.speed.over_lifetime) {
      var speed_factor = this[this.data_.particle.speed.over_lifetime.kind.toLowerCase() + '_']('particle.speed', this.data_.particle.speed.over_lifetime.values, age_percent, this.cubes_.children[i].userData.random);
    } else {
      var speed_factor = 1;
    }
    var speed = this.cubes_.children[i].userData.speed * speed_factor;
    // TODO: negative speed?

    // Calculate initial velocities based off of emission angle.
    var velocity_x = speed * Math.sqrt(1 - Math.pow(this.cubes_.children[i].userData.z, 2)) * Math.cos(this.cubes_.children[i].userData.phi);
    var velocity_z = speed * Math.sqrt(1 - Math.pow(this.cubes_.children[i].userData.z, 2)) * Math.sin(this.cubes_.children[i].userData.phi);
    var velocity_y = speed * this.cubes_.children[i].userData.z;

    // TODO
    // Now alter the velocity over time if provided.
    if (this.data_.particle.velocity) {
      if (this.data_.particle.velocity.over_lifetime_x) {
        velocity_x += this[this.data_.particle.velocity.over_lifetime_x.kind.toLowerCase() + '_']('particle.velocity', this.data_.particle.velocity.over_lifetime_x.values, age_percent, this.cubes_.children[i].userData.random);
        // this.cubes_.children[i].userData.velocity.x = velocity_x;
      }
      if (this.data_.particle.velocity.over_lifetime_y) {
        velocity_y += this[this.data_.particle.velocity.over_lifetime_y.kind.toLowerCase() + '_']('particle.velocity', this.data_.particle.velocity.over_lifetime_y.values, age_percent, this.cubes_.children[i].userData.random);
        // this.cubes_.children[i].userData.velocity.y = velocity_y;
      }
      if (this.data_.particle.velocity.over_lifetime_z) {
        velocity_z += this[this.data_.particle.velocity.over_lifetime_z.kind.toLowerCase() + '_']('particle.velocity', this.data_.particle.velocity.over_lifetime_z.values, age_percent, this.cubes_.children[i].userData.random);
        // this.cubes_.children[i].userData.velocity.z = velocity_z;
      }
    }

    this.cubes_.children[i].position.x += dt / 1000 * (velocity_x);
    this.cubes_.children[i].position.y += dt / 1000 * (velocity_y);
    this.cubes_.children[i].position.z += dt / 1000 * (velocity_z);
  }

};


/**
 * Attribute with a constant value.
 * TODO: Why are constant values stored in arrays in the cubemitter JSON?
 *
 * @param {string} type The type of the property.
 * @param {Array} values Just a single constant value in an array...
 *
 * @return {number|THREE.Color}
 */
shed.cubemitter.prototype.constant_ = function(type, values) {
  switch (type) {
    case 'particle.color':
      return new THREE.Color(values[0], values[1], values[2]);
    break;
    case 'particle.opacity':
      return values[3];
    break;
    case 'emission.rate':
    case 'emission.angle':
    case 'particle.scale':
    case 'particle.lifetime':
    case 'particle.speed':
    case 'particle.velocity':
    case 'particle.rotation':
      return values[0];
    break;
    default:
      throw 'CONSTANT not supported for ' + type;
    break;
  }
};


/**
 * Attribute with a random value.
 *
 * @param {string} type The type of the property.
 * @param {Array} values The min and max value.
 *
 * @return {number}
 */
shed.cubemitter.prototype.random_between_ = function(type, values) {
  switch (type) {
    case 'particle.color':
      return new THREE.Color(
        Math.random() * (values[0][0] - values[1][0]) + values[1][0],
        Math.random() * (values[0][1] - values[1][1]) + values[1][1],
        Math.random() * (values[0][2] - values[1][2]) + values[1][2]
      );
    break;
    case 'particle.opacity':
      return Math.random() * (values[0][3] - values[1][3]) + values[1][3];
    break;
    case 'particle.scale':
    case 'particle.lifetime':
    case 'particle.speed':
    case 'particle.velocity':
    case 'emission.rate':
    case 'emission.angle':
    case 'particle.rotation':
      return Math.random() * (values[0] - values[1]) + values[1];
    break;
    default:
      throw 'RANDOM_BETWEEN not supported for ' + type;
    break;
  }
};


/**
 * Attribute with a value on a curve evaluated by age.
 *
 * @param {string} type The type of the property.
 * @param {Array} values The curve keyframes.
 * @param {number} t How far along the curve (from 0 to 1).
 *
 * @return {number}
 */
shed.cubemitter.prototype.curve_ = function(type, values, t) {
  switch (type) {
    case 'emission.rate':
    case 'emission.angle':
    case 'particle.lifetime':
    case 'particle.color':
    case 'particle.opacity':
    case 'particle.scale':
    case 'particle.speed':
    case 'particle.velocity':
    case 'particle.rotation':
      return this.evaluate_curve_(values, t);
    break;
    default:
      throw 'CURVE not supported for ' + type;
    break;
  }
};


/**
 * Attribute with a value between two curves evaluated by age
 *
 * @param {string} type The type of the property.
 * @param {Array} values Two arrays of curve keyframes.
 * @param {number} t How far along the curve (from 0 to 1).
 * @param {number} random A constant random value chosen on particle creation
 * (from 0 to 1). This determines the ratio between the two curve points where
 * the "between" curve lies.
 *
 * @return {number}
 */
shed.cubemitter.prototype.random_between_curves_ = function(type, values, t, random) {
  switch (type) {
    case 'emission.rate':
    case 'emission.angle':
    case 'particle.color':
    case 'particle.opacity':
    case 'particle.lifetime':
    case 'particle.scale':
    case 'particle.speed':
    case 'particle.velocity':
    case 'particle.rotation':
      var a = this.evaluate_curve_(values[0], t);
      var b = this.evaluate_curve_(values[1], t);
      return random * (a - b) + b;
    break;
    default:
      throw 'RANDOM_BETWEEN_CURVES not supported for ' + type;
    break;
  }
};


/**
 * Get two points inside of a rectangle.
 *
 * @param {string} type The type of the property.
 * @param {Array} values The rectangle bounds
 *
 * @return {Array} An array of points in the rectangle to be used on some
 * desired plane.
 */
shed.cubemitter.prototype.rectangle_ = function(type, values) {
  switch (type) {
    case 'emission.origin':
      if (!this.emitter_.userData.added) {
        this.emitter_.userData.added = true;
        this.emitter_.geometry = new THREE.BoxGeometry(values[1], values[0], 0);
        this.emitter_.material = new THREE.MeshBasicMaterial({'color': 0x000000, 'wireframe': true});

        // Rotate the emitter.
        // http://stackoverflow.com/a/17647308
        this.emitter_.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(this.transforms_.rx * Math.PI / 180));
        this.emitter_.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(this.transforms_.ry * Math.PI / 180));
        this.emitter_.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(this.transforms_.rz * Math.PI / 180));

        this.emitter_.geometry.computeBoundingBox();
      }

      // Use the generated / transformed mesh and pick a random point inside of
      // it for the origin.
      var min_x = this.emitter_.geometry.boundingBox.min.x;
      var max_x = this.emitter_.geometry.boundingBox.max.x;

      var min_y = this.emitter_.geometry.boundingBox.min.y;
      var max_y = this.emitter_.geometry.boundingBox.max.y;

      var min_z = this.emitter_.geometry.boundingBox.min.z;
      var max_z = this.emitter_.geometry.boundingBox.max.z;

      return {
        'x': Math.random() * (min_x - max_x) + max_x,
        'y': Math.random() * (min_y - max_y) + max_y,
        'z': Math.random() * (min_z - max_z) + max_z
      };
    break;
    default:
      throw 'RECTANGLE not supported for ' + type;
    break;
  }
};


/**
 * Get two points inside of a point.
 *
 * @param {string} type The type of the property.
 * @param {Array} values I have no idea why these even exist in the effect
 * JSON but they do.
 *
 * @return {Array} An array of points in the point to be used on some desired
 * plane.
 */
shed.cubemitter.prototype.point_ = function(type, values) {
  if (!this.emitter_.userData.added) {
    this.emitter_.userData.added = true;
    this.emitter_.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2),
    this.emitter_.material = new THREE.MeshBasicMaterial({'color': 0x000000, 'wireframe': true});
  }

  return {'x': 0, 'y': 0, 'z': 0};
};


// TODO TEMPORARY!!!!!!!!!!
shed.cubemitter.prototype.evaluate_curve_ = function(curve, t) {
  // TODO TEMPORARY!!!!!!!!!!
  var clone_curve = curve.slice(0);
  clone_curve.push([10, 0]); // TODO: Not really liking this...

  var x, y, x0, x1, y0, y1;
  for (var i = 0; i < clone_curve.length; i++) {
    if (t >= clone_curve[i][0] && t < clone_curve[i + 1][0]) {
      x0 = clone_curve[i][0];
      x1 = clone_curve[i + 1][0];
      y0 = clone_curve[i][1];
      y1 = clone_curve[i + 1][1];
      x = t;
      y = y0 + ((y1 - y0) * ((x - x0) / (x1 - x0))); // Linear interpolation. TODO: Use a sine function here?
      return y;
    }
  }
};


/**
 * Watch this file for changes and reload it when that happens.
 */
shed.cubemitter.prototype.watch_ = function() {
  var self = this;
  this.watcher_ = shed.watch_file(this.file_, function() {
    var scene = self.scene_; // Back this up before disposing.
    self.dispose();
    self.load_();
    self.set_scene(scene);
  });

  // this.watcher_ = shed.watch_file(this.file_, this.load_.bind(this));
};


/**
 * Dispose of this. This is REQUIRED when you're done with it to ensure that
 * it stops listening for file changes.
 */
shed.cubemitter.prototype.dispose = function() {
  this.watcher_.close();

  this.dt_cube_ = 0;
  this.dt_system_ = 0;

  // Remove all particles from the group and then remove the group from the
  // scene.
  for (var i = this.cubes_.children.length - 1; i >= 0; i--) {
    this.cubes_.children[i].geometry.dispose();
    this.cubes_.children[i].material.dispose();
    this.cubes_.remove(this.cubes_.children[i]);
  }
  // this.scene_.remove(this.cubes_);
  this.scene_.remove(this.group_);

  this.scene_ = null;
};

shed.cubemitter.prototype.toggle_emitter = function(display) {
  this.emitter_.visible = display;
};
