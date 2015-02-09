shed.view.cubemitter_editor = function() {

  // bugs? fire rotating on all 3 axis (I think?), should just be one
  // dust poof has a point origin with two values?
  // many of the stonehearth particle effect names are wrong
  // velocity is confusing. By default, the "y" velocity is 1 if you set the speed to 1 and the x/z velocities are 0.w
  // This is kind of weird and I'm not sure I like how it works. By default,
  // speed is ONLY on the y-axis. So a y velocity of 0 means the particle will
  // still move in the y direction as long as speed is non-zero.

  // TODO: add controls for showing/hiding ground, changing background colors, etc

  // TODO: Emission angle appears to control the angle the particles emit at.
  // 360 means a particle will be created and then have an initial direction
  // of...anything.

  // TODO: Particles that go downward clip into the dirt. Give the option to move the particle system around?

  // TODO: Load multiple emitters at the same time? Maybe for displaying only and switch between editing them. Or load multiple of the same one and edit all instances at once.

  // TODO: Launch default .json editor for any json file?

  // TODO: Materials

  // TODO: controls for playback in order to view effects that don't loop

  this.cubemitter_ = {
    'data': null,
    'dt': 0,
    'meshes': [],
    'group': new THREE.Group()
  };

  // For now...
  this.load_cubemitter_(localStorage.path + '\\mods\\stonehearth\\data\\horde\\particles\\fire\\fire.cubemitter.json');

  this.scene_ = new THREE.Scene();
  this.scene_toggle_ground_(true);
  this.scene_.add(this.cubemitter_.group);

  this.camera_ = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
  this.camera_.position.z = 12;
  this.camera_.position.y = 7;
  this.camera_.position.x = 12;

  this.renderer_ = new THREE.WebGLRenderer({'antialias': true, 'alpha': true});
  this.renderer_.setSize(465, 465);
  this.renderer_.setClearColor(0x000000, 0);

  shed.view.apply(this, arguments);
}
$.inherits(shed.view.cubemitter_editor, shed.view);

shed.view.cubemitter_editor.prototype.title_ = 'Cubemitter Editor';
shed.view.cubemitter_editor.prototype.cubemitter_;
shed.view.cubemitter_editor.prototype.scene_;
shed.view.cubemitter_editor.prototype.camera_;
shed.view.cubemitter_editor.prototype.renderer_;
shed.view.cubemitter_editor.prototype.controls_;
shed.view.cubemitter_editor.prototype.watcher_;
shed.view.cubemitter_editor.prototype.scene_ground_;

shed.view.cubemitter_editor.prototype.decorate_ = function(parent) {
  var self = this;

  var table = new jex.table({'rows': 1, 'columns': 2});
  table.table().style('width', '100%');

  // Cubemitter list
  table.td(0, 0).setAttribute('valign', 'top').style('width', '370px');
  this.decorate_list_(table.td(0, 0));

  // Well
  var well = $.createElement('div').addClass('well').style('position', 'relative');

  // Toolbar
  var toolbar = $.createElement('div')
    .addClass('toolbar');
  var toggle_ground_container = $.createElement('span')
    .dataset('hint', 'Toggle ground')
    .addClass(['hint--bottom', 'hint--bounce']);
  var toggle_ground = $.createElement('input')
    .setAttribute('type', 'checkbox')
    .addClass('toggle_ground')
    .checked(true);
  toggle_ground.addEventListener('change', function() {
    self.scene_toggle_ground_(toggle_ground.checked());
  });
  toggle_ground_container.appendChild(toggle_ground);
  toolbar.appendChild(toggle_ground_container);
  well.appendChild(toolbar);

  // Canvas
  well.appendChild(this.renderer_.domElement);
  table.td(1, 0).setAttribute('valign', 'top');
  table.td(1, 0).appendChild(well);
  parent.appendChild(table.table());


  // Add camera controls
  // http://threejs.org/examples/misc_controls_orbit.html
  // http://stackoverflow.com/questions/18581225/orbitcontrol-or-trackballcontrol
  this.controls_ = new THREE.OrbitControls(this.camera_, this.renderer_.domElement);
  this.controls_.zoomSpeed = 3;
  this.controls_.noPan = true;
  this.controls_.minDistance = 3;
  this.controls_.maxDistance = 30;
  this.controls_.noKeys = true;

  // http://gameprogrammingpatterns.com/game-loop.html
  // http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/
  var run = (function() {
    var fps = 60;
    var skip_milliseconds = 1000 / fps;
    var next_update = Date.now();
    var last_update = Date.now();
    var loops = 0;

    return function() {
      loops = 0;

      while (Date.now() > next_update) {
        // Run update logic. Passing it the time since the last update was called.
        self.update_(Date.now() - last_update);
        last_update = Date.now();

        // Set the next update out some amount of milliseconds
        next_update += skip_milliseconds;

        loops++;
      }

      // Always draw, but only if there has been an update. Don't otherwise
      // bother since nothing will have changed.
      if(loops) {
        self.draw_();
      }
    };
  })();

  var onEachFrame = function(cb) {
    var _cb = function() { cb(); requestAnimationFrame(_cb); }
    _cb();
  };

  onEachFrame(run);
};

shed.view.cubemitter_editor.prototype.decorate_list_ = function(parent) {
  var self = this;

  var table_container = $.createElement('div')
    .style({'overflow': 'auto', 'height': '506px'});
  var table = new jex.table({'rows': 0, 'columns': 1});
  table.table().addClass('table_stripe').style('width', '100%');
  table_container.appendChild(table.table());

  parent.appendChild(table_container);

  var fs = require('fs');

  var path = localStorage.path + '\\mods\\stonehearth';

  // TODO: Clean this up a little better.
  var count = 0;
  var walk = function(directory, done) {
    fs.readdir(directory, function(error, list) {
      if(error) {
        return done(error);
      }

      var i = 0;

      (function next() {
        var file = list[i++];

        if (!file) {
          return done(null);
        }

        file = directory + '/' + file;

        fs.stat(file, function(error, stat) {
          if(stat && stat.isDirectory()) {
            walk(file, function(error) {
              next();
            });
          } else {
            if(file.substr(-16) === '.cubemitter.json') {
              var name = file.substr(file.lastIndexOf('/') + 1).replace('.cubemitter.json', '');
              table.add_row();
              table.td(0, count)
                .innerHTML(name)
                .addEventListener('click', function() {
                  self.load_cubemitter_(file);
                })
                .style('cursor', 'pointer');
              count++;
            }
            next();
          }
        });
      })();
    });
  };

  walk(path, function(error) {
    if(error) {
      throw error;
    }
  });
}

shed.view.cubemitter_editor.prototype.load_cubemitter_ = function(path) {
  var self = this;

  var fs = require('fs');
  try {
    var data = JSON.parse(fs.readFileSync(path));
    this.cubemitter_.data = data;
  }
  catch(e) {
    alert('invalid json'); // TODO: Make this nicer
  }

  if(this.watcher_) {
    this.watcher_.close();
  }
  this.watcher_ = fs.watch(path, {}, function(event, filename) {
    self.load_cubemitter_(path);
  });
}

shed.view.cubemitter_editor.prototype.update_ = function(dt) {
  this.cubemitter_.dt += dt;
  if(this.cubemitter_.dt >= (1000 / this.cubemitter_.data.emission.rate.values[0])) {
    this.cubemitter_.dt = 0;

    // TODO: Create more generalized functions for this kind of stuff instead of all the copy/paste
    var lifetime;
    var min, max;
    switch(this.cubemitter_.data.particle.lifetime.start.kind) {
      case 'RANDOM_BETWEEN':
        min = this.cubemitter_.data.particle.lifetime.start.values[0];
        max = this.cubemitter_.data.particle.lifetime.start.values[1];
        lifetime = Math.random() * (max - min) + min;
      break;
      default:
        throw 'this.cubemitter_.data.particle.lifetime.start.kind ' + this.cubemitter_.data.particle.lifetime.start.kind + ' not supported';
      break;
    }

    var origin;
    var x, y;
    switch(this.cubemitter_.data.emission.origin.surface) {
      case 'RECTANGLE':
        origin = {
          'x': (Math.random() * this.cubemitter_.data.emission.origin.values[0]) - this.cubemitter_.data.emission.origin.values[0] / 2,
          'z': (Math.random() * this.cubemitter_.data.emission.origin.values[1]) - this.cubemitter_.data.emission.origin.values[1] / 2
        };
      break;
      case 'POINT':
        origin = {
          // TODO: Um, the dust spoof has a POINT origin with two values?
          'x': Math.random() * this.cubemitter_.data.emission.origin.values[0],
          'z': Math.random() * this.cubemitter_.data.emission.origin.values[0]
        };
      break;
      default:
        throw 'this.cubemitter_.data.emission.origin.surface ' + this.cubemitter_.data.emission.origin.surface + ' not supported';
      break;
    }

    var scale;
    var min, max;
    switch(this.cubemitter_.data.particle.scale.start.kind) {
      case 'RANDOM_BETWEEN':
        min = this.cubemitter_.data.particle.scale.start.values[0];
        max = this.cubemitter_.data.particle.scale.start.values[1];
        scale = Math.random() * (max - min) + min;
      break;
      default:
        throw 'this.cubemitter_.data.particle.scale.start.kind ' + this.cubemitter_.data.particle.scale.start.kind + ' not supported';
      break;
    }

    var speed;
    var min, max;
    switch(this.cubemitter_.data.particle.speed.start.kind) {
      case 'RANDOM_BETWEEN':
        min = this.cubemitter_.data.particle.speed.start.values[0];
        max = this.cubemitter_.data.particle.speed.start.values[1];
        speed = Math.random() * (max - min) + min;
      break;
      case 'CONSTANT':
        speed = this.cubemitter_.data.particle.speed.start.values[0]
      break;
      default:
        throw 'this.cubemitter_.data.particle.speed.start.kind ' + this.cubemitter_.data.particle.speed.start.kind + ' not supported';
      break;
    }

    var color;
    var opacity = 1;
    var min, max;
    switch(this.cubemitter_.data.particle.color.start.kind) {
      case 'CONSTANT':
        color = new THREE.Color(
          this.cubemitter_.data.particle.color.start.values[0],
          this.cubemitter_.data.particle.color.start.values[1],
          this.cubemitter_.data.particle.color.start.values[2]
        );
        opacity = this.cubemitter_.data.particle.color.start.values[3];
      break;
      case 'RANDOM_BETWEEN':
        var r1 = this.cubemitter_.data.particle.color.start.values[0][0];
        var r2 = this.cubemitter_.data.particle.color.start.values[1][0];
        var g1 = this.cubemitter_.data.particle.color.start.values[0][1];
        var g2 = this.cubemitter_.data.particle.color.start.values[1][1];
        var b1 = this.cubemitter_.data.particle.color.start.values[0][2];
        var b2 = this.cubemitter_.data.particle.color.start.values[1][2];
        var a1 = this.cubemitter_.data.particle.color.start.values[0][3];
        var a2 = this.cubemitter_.data.particle.color.start.values[1][3];

        color = new THREE.Color(
          Math.random() * (r1 - r2) + r2,
          Math.random() * (g1 - g2) + g2,
          Math.random() * (b1 - b2) + b2
        );
        opacity = Math.random() * (a1 - a2) + a2
      break;
      default:
        throw 'this.cubemitter_.data.particle.color.start.kind ' + this.cubemitter_.data.particle.color.start.kind + ' not supported';
      break;
    }

    var geometry = new THREE.BoxGeometry(scale, scale, scale);
    var material = new THREE.MeshBasicMaterial( { 'color': color.getHex(), 'transparent': true, 'opacity': opacity } );
    var mesh = new THREE.Mesh(geometry, material);
    this.cubemitter_.meshes.push({
      'mesh': mesh,
      'lifetime': lifetime, // How long it gets to live
      'age': 0, // How old it currently is
      'speed': speed,
      'velocity': {
        'x': 0,
        'y': 0,
        'z': 0
      }
    });

    mesh.position.x = origin.x;
    mesh.position.z = origin.z;
    mesh.position.y = 0;

    this.cubemitter_.group.add(mesh);
  }

  // Delete old stuff
  for(var i = 0; i < this.cubemitter_.meshes.length; i++) {
    if(this.cubemitter_.meshes[i].age >= this.cubemitter_.meshes[i].lifetime) {
      this.cubemitter_.meshes[i].mesh.geometry.dispose();
      this.cubemitter_.meshes[i].mesh.material.dispose();
      this.cubemitter_.group.remove(this.cubemitter_.meshes[i].mesh);
      this.cubemitter_.meshes.splice(i, 1); // TODO: I think this is leaking somehow...
    }
  }

  for(var i = 0; i < this.cubemitter_.meshes.length; i++) {
    this.cubemitter_.meshes[i].age += (dt / 1000);

    var self = this;
    ['r', 'g', 'b'].forEach(function(which_rgb) {
      if(self.cubemitter_.data.particle.color['over_lifetime_' + which_rgb]) {
        switch(self.cubemitter_.data.particle.color['over_lifetime_' + which_rgb].kind) {
          case 'CURVE':
            var which_rgb_value = self.evaluate_curve_(
              self.cubemitter_.data.particle.color['over_lifetime_' + which_rgb].values,
              self.cubemitter_.meshes[i].age / self.cubemitter_.meshes[i].lifetime
            );

            self.cubemitter_.meshes[i].mesh.material.color[which_rgb] = which_rgb_value;
          break;
          default:
            throw 'self.cubemitter_.data.particle.color.over_lifetime_which_rgb.kind ' + self.cubemitter_.data.particle.color['over_lifetime_' + which_rgb].kind + ' not supported';
          break;
        }
      }
    });

    if(self.cubemitter_.data.particle.velocity) {
      var self = this;
      ['x', 'y', 'z'].forEach(function(which_xyz) {
        if(self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz]) {
          switch(self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].kind) {
            case 'CURVE':
              var which_xyz_value = self.evaluate_curve_(
                self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values,
                self.cubemitter_.meshes[i].age / self.cubemitter_.meshes[i].lifetime
              );

              self.cubemitter_.meshes[i].velocity[which_xyz] = which_xyz_value;
            break;
            case 'RANDOM_BETWEEN_CURVES':
              var which_xyz_value1 = self.evaluate_curve_(
                self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[0],
                self.cubemitter_.meshes[i].age / self.cubemitter_.meshes[i].lifetime
              );
              var which_xyz_value2 = self.evaluate_curve_(
                self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[1],
                self.cubemitter_.meshes[i].age / self.cubemitter_.meshes[i].lifetime
              );

              var which_xyz_value = Math.random() * (which_xyz_value1 - which_xyz_value2) + which_xyz_value2;
              self.cubemitter_.meshes[i].velocity[which_xyz] = which_xyz_value;
            break;
            case 'RANDOM_BETWEEN':
              var which_xyz_value1 = self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[0]
              var which_xyz_value2 = self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[1]

              var which_xyz_value = Math.random() * (which_xyz_value1 - which_xyz_value2) + which_xyz_value2;
              self.cubemitter_.meshes[i].velocity[which_xyz] = which_xyz_value;
            break;
            case 'CONSTANT':
              self.cubemitter_.meshes[i].velocity[which_xyz] = self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[0];
            break;
            default:
              throw 'self.cubemitter_.data.particle.velocity.over_lifetime_which_xyz.kind ' + self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].kind + ' not supported';
            break;
          }
        }
      });

    }

    if(this.cubemitter_.data.particle.speed.over_lifetime) {
      switch(this.cubemitter_.data.particle.speed.over_lifetime.kind) {
        case 'CURVE':
          var speed = this.evaluate_curve_(
            this.cubemitter_.data.particle.speed.over_lifetime.values,
            this.cubemitter_.meshes[i].age / this.cubemitter_.meshes[i].lifetime
          );

          this.cubemitter_.meshes[i].speed = speed;
        break;
        default:
          throw 'this.cubemitter_.data.particle.speed.over_lifetime.kind ' + this.cubemitter_.data.particle.speed.over_lifetime.kind + ' not supported';
        break;
      }
    }

    // This is kind of weird and I'm not sure I like how it works. By default,
    // speed is ONLY on the y-axis. So a y velocity of 0 means the particle will
    // still move in the y direction as long as speed is non-zero.
    this.cubemitter_.meshes[i].mesh.position.x += 0.01 * (this.cubemitter_.meshes[i].velocity.x);
    this.cubemitter_.meshes[i].mesh.position.y += 0.01 * (this.cubemitter_.meshes[i].velocity.y + this.cubemitter_.meshes[i].speed);
    this.cubemitter_.meshes[i].mesh.position.z += 0.01 * (this.cubemitter_.meshes[i].velocity.z);

    if(self.cubemitter_.data.particle.rotation) {
      var self = this;
      ['x', 'y', 'z'].forEach(function(which_xyz) {
        if(self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz]) {
          switch(self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].kind) {
            case 'RANDOM_BETWEEN_CURVES':
              var which_xyz_value1 = self.evaluate_curve_(
                self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].values[0],
                self.cubemitter_.meshes[i].age / self.cubemitter_.meshes[i].lifetime
              );
              var which_xyz_value2 = self.evaluate_curve_(
                self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].values[1],
                self.cubemitter_.meshes[i].age / self.cubemitter_.meshes[i].lifetime
              );

              var which_xyz_value = Math.random() * (which_xyz_value1 - which_xyz_value2) + which_xyz_value2;

              self.cubemitter_.meshes[i].mesh.rotation[which_xyz] += which_xyz_value * (Math.PI / 180);
            break;
            case 'CONSTANT':
              self.cubemitter_.meshes[i].mesh.rotation[which_xyz] = self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].values[0] * (Math.PI / 180);
            break;
            default:
              throw 'self.cubemitter_.data.particle.rotation.over_lifetime_which_xyz.kind ' + self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].kind + ' not supported';
            break;
          }
        }
      });
    }

    if(this.cubemitter_.data.particle.color.over_lifetime_a) {
      switch(this.cubemitter_.data.particle.color.over_lifetime_a.kind) {
        case 'CURVE':
          var opacity = this.evaluate_curve_(
            this.cubemitter_.data.particle.color.over_lifetime_a.values,
            this.cubemitter_.meshes[i].age / this.cubemitter_.meshes[i].lifetime
          );

          this.cubemitter_.meshes[i].mesh.material.opacity = opacity;
        break;
        default:
          throw 'this.cubemitter_.data.particle.color.over_lifetime_a.kind ' + this.cubemitter_.data.particle.color.over_lifetime_a.kind + ' not supported';
        break;
      }
    }

    if(this.cubemitter_.data.particle.scale.over_lifetime) {
      switch(this.cubemitter_.data.particle.scale.over_lifetime.kind) {
        case 'CURVE':
          var scale = this.evaluate_curve_(
            this.cubemitter_.data.particle.scale.over_lifetime.values,
            this.cubemitter_.meshes[i].age / this.cubemitter_.meshes[i].lifetime
          );

          this.cubemitter_.meshes[i].mesh.scale.x = scale;
          this.cubemitter_.meshes[i].mesh.scale.y = scale;
          this.cubemitter_.meshes[i].mesh.scale.z = scale;
        break;
        case 'RANDOM_BETWEEN_CURVES':
          var scale1 = this.evaluate_curve_(
            this.cubemitter_.data.particle.scale.over_lifetime.values[0],
            this.cubemitter_.meshes[i].age / this.cubemitter_.meshes[i].lifetime
          );
          var scale2 = this.evaluate_curve_(
            this.cubemitter_.data.particle.scale.over_lifetime.values[0],
            this.cubemitter_.meshes[i].age / this.cubemitter_.meshes[i].lifetime
          );

          var scale = Math.random() * (scale1 - scale2) + scale2;

          this.cubemitter_.meshes[i].mesh.scale.x = scale;
          this.cubemitter_.meshes[i].mesh.scale.y = scale;
          this.cubemitter_.meshes[i].mesh.scale.z = scale;
        break;
        default:
          throw 'this.cubemitter_.data.particle.scale.over_lifetime.kind ' + this.cubemitter_.data.particle.scale.over_lifetime.kind + ' not supported';
        break;
      }
    }
  }

  this.controls_.update();

};
shed.view.cubemitter_editor.prototype.draw_ = function() {
  this.renderer_.render(this.scene_, this.camera_);
};

shed.view.cubemitter_editor.prototype.evaluate_curve_ = function(curve, t) {
  // Add a fake point at the end of the curve to make evaluating this not
  // require a conditional.
  curve.push([10, 0]); // TODO: Not really liking this...

  var x, y, x0, x1, y0, y1;
  for(var i = 0; i < curve.length; i++) {
    if(t >= curve[i][0] && t < curve[i + 1][0]) {
      x0 = curve[i][0];
      x1 = curve[i + 1][0];
      y0 = curve[i][1];
      y1 = curve[i + 1][1];
      x = t;
      y = y0 + ((y1 - y0) * ((x - x0) / (x1 - x0))); // Linear interpolation. TODO: Use a sine function here?
      return y;
    }
  }
}

shed.view.cubemitter_editor.prototype.scene_toggle_ground_ = function(display) {
  if(display === false) {
    if(this.scene_ground_) {
      this.scene_.remove(this.scene_ground_);
      this.scene_ground = null;
    }
  }
  else {
    this.scene_ground_ = new THREE.Group();

    var geometry, material, mesh;

    // TODO: Add axis markers
    // Origin marker for debugging
    // geometry = new THREE.BoxGeometry(1, 1, 1);
    // material = new THREE.MeshBasicMaterial({'color': 0xff0000 });
    // mesh = new THREE.Mesh(geometry, material);
    // mesh.position.y = 0;
    // mesh.position.z = 0;
    // mesh.position.x = 0;
    // this.scene_.add(mesh);
    // return;

    // Grass
    geometry = new THREE.BoxGeometry(10, 1, 10);
    material = new THREE.MeshBasicMaterial({'color': 0xa7e288 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -0.5;
    this.scene_ground_.add(mesh);

    // Dirt
    geometry = new THREE.BoxGeometry(10, 2, 10);
    material = new THREE.MeshBasicMaterial({'color': 0x48402b }); // Light
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -2;
    this.scene_ground_.add(mesh);

    geometry = new THREE.BoxGeometry(10, 2, 10);
    material = new THREE.MeshBasicMaterial({'color': 0x403823 }); // Dark
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -4;
    this.scene_ground_.add(mesh);

    geometry = new THREE.BoxGeometry(10, 2, 10);
    material = new THREE.MeshBasicMaterial({'color': 0x48402b }); // Light
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -6;
    this.scene_ground_.add(mesh);

    this.scene_.add(this.scene_ground_);
  }

};
