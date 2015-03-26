


/**
 * Cubemitter.
 *
 * @param {Array} options [file, transforms, effect]
 *
 * @constructor
 */
shed.cubemitter = function(options) {
  this.file_ = options.file;
  this.transforms_ = options.transforms || null;
  this.load_();
};
$.inherits(shed.cubemitter, $.EventTarget);


/**
 * How many cubes can be present in a cubemitter at any given time.
 *
 * @type {number}
 *
 * @private
 */
shed.cubemitter.cube_limit_ = 100;


/**
 * The file for this cubemitter.
 *
 * @type {shed.file}
 *
 * @private
 */
shed.cubemitter.prototype.file_;


/**
 * The scene the cubmitter exists in.
 *
 * @type {THREE.Scene}
 *
 * @private
 */
shed.cubemitter.prototype.scene_;


/**
 * Cubemitter properties loaded from the JSON file.
 *
 * @type {Object}
 *
 * @private
 */
shed.cubemitter.prototype.data_;


/**
 * Emitter mesh that is optionally displayed
 *
 * @type {THREE.Mesh}
 *
 * @private
 */
shed.cubemitter.prototype.emitter_;


/**
 * Whether or not to display the emitter.
 *
 * @type {boolean}
 *
 * @private
 */
shed.cubemitter.prototype.dispaly_emitter_;


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
 * Time since last cube was created.
 *
 * @type {number}
 *
 * @private
 */
shed.cubemitter.prototype.dt_cube_;


/**
 * Time since the system was created.
 *
 * @type {number}
 *
 * @private
 */
shed.cubemitter.prototype.dt_system_;


/**
 * Whether or not the cubemitter is allowed to emit new cubes.
 *
 * @type {boolean}
 *
 * @private
 */
shed.cubemitter.prototype.emit_;


/**
 * Set the scene this effect is part of.
 *
 * @param {THREE.Scene} scene
 */
shed.cubemitter.prototype.render = function(scene) {
  this.watch_();
  this.scene_ = scene;

  // Translate
  if (this.transforms_) {
    if (this.transforms_.x) {
      this.group_.position.x = this.transforms_.x;
    }
    if (this.transforms_.y) {
      this.group_.position.y = this.transforms_.y;
    }
    if (this.transforms_.z) {
      this.group_.position.z = this.transforms_.z;
    }
  }

  // this.group_.add(this.emitter_);
  this.group_.add(this.cubes_);

  this.scene_.add(this.group_);
};


/**
 * Update the cubemitter data in prepration to be rendered.
 *
 * @param {number} dt Time since last update call.
 */
shed.cubemitter.prototype.update = function(dt) {
  this.dt_system_ += dt;

  this.update_create_(dt);
  this.update_alter_(dt);
};


/**
 * Get this file.
 *
 * @return {shed.file}
 */
shed.cubemitter.prototype.get_file = function() {
  return this.file_;
};


/**
 * Toggle display of the emitter. If the emitter does not yet exist, just
 * store the value to be used when it gets created.
 *
 * @param {boolean} display Whether or not to display it.
 */
shed.cubemitter.prototype.toggle_emitter = function(display) {
  if (this.emitter_) {
    this.emitter_.visible = display;
  }
  this.display_emitter_ = display;
};


/**
 * Start emitting cubes.
 */
shed.cubemitter.prototype.start_emit = function() {
  this.emit_ = true;
};


/**
 * Stop emitting cubes.
 */
shed.cubemitter.prototype.stop_emit = function() {
  this.emit_ = false;
};


/**
 * Load the cubemitter file, create some basic stuff and apply the translation
 * transform.
 *
 * @private
 */
shed.cubemitter.prototype.load_ = function() {
  this.dt_cube_ = 0;
  this.dt_system_ = 0;
  this.emit_ = true;

  this.data_ = this.file_.read();

  this.group_ = new THREE.Object3D();
  this.cubes_ = new THREE.Object3D();
};


/**
 * Determine whether or not any new cubes need created, then create them.
 *
 * @param {number} dt Time since last update call.
 *
 * @private
 */
shed.cubemitter.prototype.update_create_ = function(dt) {
  this.dt_cube_ += dt;

  if (this.emit_ === false) {
    return;
  }

  // Limit creation between start/stop times
  var emission_rate = this[this.data_.emission.rate.kind.toLowerCase() + '_']('emission.rate', this.data_.emission.rate.values, this.dt_system_ / this.data_.duration);

  var particles_to_create = Math.floor(this.dt_cube_ / 1000 * emission_rate);

  while (particles_to_create-- > 0) {
    // Stop creating new cubes if the cubemitter cube limit is reached.
    if (this.cubes_.children.length < shed.cubemitter.cube_limit_) {
      this.dt_cube_ = 0;

      // Create the cube
      var scale = this[this.data_.particle.scale.start.kind.toLowerCase() + '_']('particle.scale', this.data_.particle.scale.start.values);
      var color = this[this.data_.particle.color.start.kind.toLowerCase() + '_']('particle.color', this.data_.particle.color.start.values);
      var opacity = this[this.data_.particle.color.start.kind.toLowerCase() + '_']('particle.opacity', this.data_.particle.color.start.values);
      var lifetime = this[this.data_.particle.lifetime.start.kind.toLowerCase() + '_']('particle.lifetime', this.data_.particle.lifetime.start.values);
      var speed = this[this.data_.particle.speed.start.kind.toLowerCase() + '_']('particle.speed', this.data_.particle.speed.start.values);
      var origin = this[this.data_.emission.origin.surface.toLowerCase() + '_']('emission.origin', this.data_.emission.origin.values);
      var angle = this[this.data_.emission.angle.kind.toLowerCase() + '_']('emission.angle', this.data_.emission.angle.values);

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

      // Emission angle properties
      var z_min = Math.cos(angle * Math.PI / 180);
      var z_max = 1;
      var z = (Math.random() * (z_max - z_min)) + z_min;

      var theta_min = 0;
      var theta_max = 2 * Math.PI;
      var theta = (Math.random() * (theta_max - theta_min)) + theta_min;

      // Emission vector is some random vector in a cone.
      var vector = new THREE.Vector3(
        Math.sqrt(1 - Math.pow(z, 2)) * Math.cos(theta),
        Math.sqrt(1 - Math.pow(z, 2)) * Math.sin(theta),
        z
      );

      // Rotate the emission vector to line up with the emitter.
      if (this.transforms_) {
        if (this.transforms_.rx) {
          vector.applyAxisAngle(new THREE.Vector3(1, 0, 0), -this.transforms_.rx * Math.PI / 180);
        }
        if (this.transforms_.ry) {
          vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), -this.transforms_.ry * Math.PI / 180);
        }
        if (this.transforms_.rz) {
          vector.applyAxisAngle(new THREE.Vector3(0, 0, 1), -this.transforms_.rz * Math.PI / 180);
        }
      }

      cube.userData = {
        'lifetime': lifetime,
        'age': 0,
        'speed': speed,
        'vector': vector,
        'random': Math.random()
      };

      this.cubes_.add(cube);
    }
  }

};


/**
 * Updating the position, rotation, color, etc of all particles in the
 * cubemitter.
 *
 * @param {number} dt Time since last update call.
 *
 * @private
 */
shed.cubemitter.prototype.update_alter_ = function(dt) {
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
        this.cubes_.children[i].rotation.x = rotation_x * Math.PI / 180;
      }
      if (this.data_.particle.rotation.over_lifetime_y) {
        var rotation_y = this[this.data_.particle.rotation.over_lifetime_y.kind.toLowerCase() + '_']('particle.rotation', this.data_.particle.rotation.over_lifetime_y.values, age_percent, this.cubes_.children[i].userData.random);
        this.cubes_.children[i].rotation.y = rotation_y * Math.PI / 180;
      }
      if (this.data_.particle.rotation.over_lifetime_z) {
        var rotation_z = this[this.data_.particle.rotation.over_lifetime_z.kind.toLowerCase() + '_']('particle.rotation', this.data_.particle.rotation.over_lifetime_z.values, age_percent, this.cubes_.children[i].userData.random);
        this.cubes_.children[i].rotation.z = rotation_z * Math.PI / 180;
      }
    }

    // Speed
    if (this.data_.particle.speed.over_lifetime) {
      var speed_factor = this[this.data_.particle.speed.over_lifetime.kind.toLowerCase() + '_']('particle.speed', this.data_.particle.speed.over_lifetime.values, age_percent, this.cubes_.children[i].userData.random);
    } else {
      var speed_factor = 1;
    }
    var speed = this.cubes_.children[i].userData.speed * speed_factor;

    var velocity_x = speed * this.cubes_.children[i].userData.vector.getComponent(0);
    var velocity_y = speed * this.cubes_.children[i].userData.vector.getComponent(1);
    var velocity_z = speed * this.cubes_.children[i].userData.vector.getComponent(2);

    // Now alter the velocity over time if provided.
    if (this.data_.particle.velocity) {
      if (this.data_.particle.velocity.over_lifetime_x) {
        velocity_x += this[this.data_.particle.velocity.over_lifetime_x.kind.toLowerCase() + '_']('particle.velocity', this.data_.particle.velocity.over_lifetime_x.values, age_percent, this.cubes_.children[i].userData.random);
      }
      if (this.data_.particle.velocity.over_lifetime_y) {
        velocity_y += this[this.data_.particle.velocity.over_lifetime_y.kind.toLowerCase() + '_']('particle.velocity', this.data_.particle.velocity.over_lifetime_y.values, age_percent, this.cubes_.children[i].userData.random);
      }
      if (this.data_.particle.velocity.over_lifetime_z) {
        velocity_z += this[this.data_.particle.velocity.over_lifetime_z.kind.toLowerCase() + '_']('particle.velocity', this.data_.particle.velocity.over_lifetime_z.values, age_percent, this.cubes_.children[i].userData.random);
      }
    }

    this.cubes_.children[i].position.x += dt / 1000 * (velocity_x);
    this.cubes_.children[i].position.y += dt / 1000 * (velocity_y);
    this.cubes_.children[i].position.z += dt / 1000 * (velocity_z);
  }

};


/**
 * Attribute with a constant value.
 *
 * @param {string} type The type of the property.
 * @param {Array} values Just a single constant value in an array...
 *
 * @private
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
      throw new Error('CONSTANT not supported for ' + type);
    break;
  }
};


/**
 * Attribute with a random value.
 *
 * @param {string} type The type of the property.
 * @param {Array} values The min and max value.
 *
 * @private
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
      throw new Error('RANDOM_BETWEEN not supported for ' + type);
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
 * @private
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
      throw new Error('CURVE not supported for ' + type);
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
 * @private
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
      throw new Error('RANDOM_BETWEEN_CURVES not supported for ' + type);
    break;
  }
};


/**
 * Get two points inside of a rectangle.
 *
 * @param {string} type The type of the property.
 * @param {Array} values The rectangle bounds
 *
 * @private
 *
 * @return {Array} An array of points in the rectangle to be used on some
 * desired plane.
 */
shed.cubemitter.prototype.rectangle_ = function(type, values) {
  switch (type) {
    case 'emission.origin':
      if (!this.emitter_) {

        this.emitter_ = new THREE.Mesh(
          new THREE.BoxGeometry(values[1], values[0], 0.1),
          new THREE.MeshBasicMaterial({'color': 0x3d9cd2})
        );
        this.emitter_.visible = this.display_emitter_;

        // Rotate the emitter. Cannot just scale/rotate the mesh because the
        // geometry doesn't update. Need to do these matrix transforms.
        // http://stackoverflow.com/a/17647308
        // this.emitter_.geometry.applyMatrix(new THREE.Matrix4().makeScale(values[1], values[0], 0.1));
        if (this.transforms_) {
          if (this.transforms_.rx) {
            this.emitter_.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-this.transforms_.rx * Math.PI / 180));
          }
          if (this.transforms_.ry) {
            this.emitter_.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-this.transforms_.ry * Math.PI / 180));
          }
          if (this.transforms_.rz) {
            this.emitter_.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-this.transforms_.rz * Math.PI / 180));
          }
        }

        this.group_.add(this.emitter_);
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
      throw new Error('RECTANGLE not supported for ' + type);
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
 * @private
 *
 * @return {Array} An array of points in the point to be used on some desired
 * plane.
 */
shed.cubemitter.prototype.point_ = function(type, values) {
  if (!this.emitter_) {
    this.emitter_ = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial({'color': 0x3d9cd2})
    );
    this.emitter_.visible = this.display_emitter_;

    this.group_.add(this.emitter_);
  }

  return {'x': 0, 'y': 0, 'z': 0};
};


/**
 * Evaluate a curve at time t by linear interpolation.
 *
 * @param {Array} curve Curve data
 * @param {number} t Current time (from 0 to 1)
 *
 * @private
 *
 * @return {number}
 */
shed.cubemitter.prototype.evaluate_curve_ = function(curve, t) {
  var t0, t1, y0, y1;
  for (var i = 0; i < curve.length; i++) {
    if (t >= curve[i][0] && (!curve[i + 1] || t < curve[i + 1][0])) {
      t0 = curve[i][0];
      t1 = curve[i + 1] ? curve[i + 1][0] : curve[i][0];
      y0 = curve[i][1];
      y1 = curve[i + 1] ? curve[i + 1][1] : curve[i][1];
      return y0 + ((y1 - y0) * ((t - t0) / (t1 - t0)));
    }
  }
};


/**
 * Trigger the watcher on the effect file. That will do all of the necessary
 * work to reload the effect with this cubemitter.
 *
 * @private
 */
shed.cubemitter.prototype.watch_ = function() {
  var self = this;
  this.file_.watch(function() {
    self.dispatchEvent('change');
  });
};


/**
 * Dispose of this. This is REQUIRED when you're done with it to ensure that
 * it stops listening for file changes.
 */
shed.cubemitter.prototype.dispose = function() {
  // Remove all particles from the group and then remove the group from the
  // scene.
  if (this.cubes_) {
    for (var i = this.cubes_.children.length - 1; i >= 0; i--) {
      this.cubes_.children[i].geometry.dispose();
      this.cubes_.children[i].material.dispose();
      this.cubes_.remove(this.cubes_.children[i]);
    }
  }

  if (this.scene_) {
    this.group_.remove(this.emitter_);
    this.group_.remove(this.cubes_);
    this.scene_.remove(this.group_);
  }

  // Stop watching file for changes (if watching at all)
  this.file_.stop_watch();

  delete this.scene_;
  delete this.data_;
  delete this.emitter_;
  delete this.cubes_;
  delete this.group_;
  delete this.transforms_;
  delete this.dt_cube_;
  delete this.dt_system_;
  delete this.emit_;
};
