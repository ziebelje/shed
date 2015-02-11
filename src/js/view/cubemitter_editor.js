shed.view.cubemitter_editor = function() {

  // bugs? fire rotating on all 3 axis (I think?), should just be one
  // dust poof has a point origin with two values?
  // many of the stonehearth particle effect names are wrong
  // velocity is confusing. By default, the "y" velocity is 1 if you set the speed to 1 and the x/z velocities are 0.w
  // This is kind of weird and I'm not sure I like how it works. By default,
  // speed is ONLY on the y-axis. So a y velocity of 0 means the particle will
  // still move in the y direction as long as speed is non-zero.

  // TODO: add controls for showing/hiding terrain, changing backterrain colors, etc

  // TODO: Emission angle appears to control the angle the particles emit at.
  // 360 means a particle will be created and then have an initial direction
  // of...anything.

  // TODO: Switch to effects editor

  // TODO: Launch default .json editor for any json file?

  // TODO: Materials

  // TODO: controls for playback in order to view effects that don't loop

  // TODO: Add mod switcher
  // TODO: Add a quick view/share that allows you to import or export JSON quickly
  // TODO: Add a way to record a gif?
  // TODO: Import QB files
  // TODO: Effects
  // TODO: Smooth zooming
  // TODO: Selected indicator and show name of currently selected effect on bottom of well
  // TODO: Redo curve function

  this.cubemitter_ = {
    'data': null,
    'dt': 0,
    'group': new THREE.Object3D()
  };


  this.current_name_ = $.createElement('div').addClass('current_name');

  // For now...
  this.load_cubemitter_(localStorage.path + '\\mods\\stonehearth\\data\\horde\\particles\\sparkle\\treasure_sparkle.cubemitter.json');

  shed.view.apply(this, arguments);
}
$.inherits(shed.view.cubemitter_editor, shed.view);

shed.view.cubemitter_editor.prototype.title_ = 'Cubemitter Editor';
shed.view.cubemitter_editor.prototype.cubemitter_;
shed.view.cubemitter_editor.prototype.webgl_;
shed.view.cubemitter_editor.prototype.watcher_;
shed.view.cubemitter_editor.prototype.scene_terrain_;
shed.view.cubemitter_editor.prototype.cube_limit_ = 100;
shed.view.cubemitter_editor.prototype.current_name_;

shed.view.cubemitter_editor.prototype.decorate_ = function(parent) {
  var self = this;

  var testing_this_container = $.createElement('div').addClass('cubemitter_editor');

  var grid_row = $.createElement('div').addClass('grid_row');
  var left = $.createElement('div').addClass(['list', 'grid_column_5']);
  var right = $.createElement('div').addClass('grid_column_7');

  // Cubemitter list
  this.decorate_list_(left);

  // Well
  var well = $.createElement('div').addClass('well');

  this.decorate_toolbar_(well);

  well.appendChild(toolbar);
  well.appendChild(this.current_name_);

  // Scene
  this.webgl_ = new shed.component.webgl({
    'width': 490,
    'height': 485,
    'update': this.update_.bind(this)
  });
  this.webgl_.render(well);

  this.webgl_.get_camera().position.z = 12;
  this.webgl_.get_camera().position.y = 7;
  this.webgl_.get_camera().position.x = 12;

  this.scene_toggle_terrain_(true);
  this.webgl_.get_scene().add(this.cubemitter_.group);

  // Canvas
  right.appendChild(well);

  grid_row.appendChild(left);
  grid_row.appendChild(right);
  testing_this_container.appendChild(grid_row);

  parent.appendChild(testing_this_container);
};

shed.view.cubemitter_editor.prototype.decorate_toolbar_ = function(parent) {
  var self = this;

  // Toolbar
  var toolbar = $.createElement('div')
    .addClass('toolbar');

  var toggle_terrain_container = $.createElement('span')
    .dataset('hint', 'Toggle terrain')
    .addClass(['hint--bottom', 'hint--bounce']);
  var toggle_terrain = $.createElement('input')
    .setAttribute('type', 'checkbox')
    .addClass('toggle_terrain')
    .checked(true);
  toggle_terrain.addEventListener('change', function() {
    self.scene_toggle_terrain_(toggle_terrain.checked());
  });
  toggle_terrain_container.appendChild(toggle_terrain);
  toolbar.appendChild(toggle_terrain_container);

  parent.appendChild(toolbar);
}

shed.view.cubemitter_editor.prototype.decorate_list_ = function(parent) {
  // TODO: Major cleaning on this.
  var self = this;

  var table = new jex.table({'rows': 0, 'columns': 2});
  table.table().addClass(['zebra', 'highlight'])
    .style({'width': '100%', 'cursor': 'pointer'});
  parent.appendChild(table.table());

  var fs = require('fs');

  // For now just grabbing all .json files from this directory. Needs more work
  // but I may try to force people to use this directory.
  var path = localStorage.path + '\\mods\\stonehearth\\data\\horde\\particles';

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

        file = directory + '\\' + file;

        fs.stat(file, function(error, stat) {
          if(stat && stat.isDirectory()) {
            walk(file, function(error) {
              next();
            });
          } else {
              // console.log(file);
            if(file.substr(-5) === '.json') {
              var name = file.substr(file.lastIndexOf('\\') + 1).replace('.json', '').replace('.cubemitter', '');
              table.add_row();
              table.td(0, count)
                .innerHTML(name)
                .dataset('file', file)
                .addEventListener('click', function() {
                  self.load_cubemitter_(file);
                });

              table.td(1, count)
                .dataset('file', file)
                .style('text-align', 'right')
                .style('width', '50px')
                .addEventListener('click', function() {
                  var gui = require('nw.gui');
                  gui.Shell.openItem(file);
                })
                .appendChild(
                  $.createElement('img')
                    .setAttribute('src', 'img/forward.png')
                    .style('height', '20px')
                )
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
};

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

  this.current_name_.innerHTML(path.substr(path.lastIndexOf('\\') + 1).replace('.json', '').replace('.cubemitter', ''));
};

shed.view.cubemitter_editor.prototype.update_ = function(dt) {
  this.cubemitter_.dt += dt;
  if( // Decide whether or not to create a new cube
    this.cubemitter_.dt >= (1000 / this.cubemitter_.data.emission.rate.values[0]) &&
    this.cubemitter_.group.children.length < this.cube_limit_
  ) {
    this.cubemitter_.dt = 0; // Reset this so we wait before adding another cube.

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
    var material = new THREE.MeshBasicMaterial({
      'color': color.getHex(),
      'transparent': true,
      'opacity': opacity
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
      'lifetime': lifetime, // How long it gets to live
      'age': 0, // How old it currently is
      'speed': speed,
      'velocity': {
        'x': 0,
        'y': 0,
        'z': 0
      }
    };

    mesh.position.x = origin.x;
    mesh.position.z = origin.z;
    mesh.position.y = 0;

    this.cubemitter_.group.add(mesh);
  }

  // Delete old stuff
  // TODO: I think I can merge this with the main loop and just do it at the end as long as it's going backwards?
  for(var i = this.cubemitter_.group.children.length - 1; i >= 0; i--) {
    if(this.cubemitter_.group.children[i].userData.age >= this.cubemitter_.group.children[i].userData.lifetime) {
      this.cubemitter_.group.children[i].geometry.dispose();
      this.cubemitter_.group.children[i].material.dispose();
      this.cubemitter_.group.remove(this.cubemitter_.group.children[i]);
    }
  }

  for(var i = 0; i < this.cubemitter_.group.children.length; i++) {
    this.cubemitter_.group.children[i].userData.age += (dt / 1000);

    var self = this;
    ['r', 'g', 'b'].forEach(function(which_rgb) {
      if(self.cubemitter_.data.particle.color['over_lifetime_' + which_rgb]) {
        switch(self.cubemitter_.data.particle.color['over_lifetime_' + which_rgb].kind) {
          case 'CURVE':
            var which_rgb_value = self.evaluate_curve_(
              self.cubemitter_.data.particle.color['over_lifetime_' + which_rgb].values,
              self.cubemitter_.group.children[i].userData.age / self.cubemitter_.group.children[i].userData.lifetime
            );

            self.cubemitter_.group.children[i].material.color[which_rgb] = which_rgb_value;
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
                self.cubemitter_.group.children[i].userData.age / self.cubemitter_.group.children[i].userData.lifetime
              );

              self.cubemitter_.group.children[i].userData.velocity[which_xyz] = which_xyz_value;
            break;
            case 'RANDOM_BETWEEN_CURVES':
              var which_xyz_value1 = self.evaluate_curve_(
                self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[0],
                self.cubemitter_.group.children[i].userData.age / self.cubemitter_.group.children[i].userData.lifetime
              );
              var which_xyz_value2 = self.evaluate_curve_(
                self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[1],
                self.cubemitter_.group.children[i].userData.age / self.cubemitter_.group.children[i].userData.lifetime
              );

              var which_xyz_value = Math.random() * (which_xyz_value1 - which_xyz_value2) + which_xyz_value2;
              self.cubemitter_.group.children[i].userData.velocity[which_xyz] = which_xyz_value;
            break;
            case 'RANDOM_BETWEEN':
              var which_xyz_value1 = self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[0]
              var which_xyz_value2 = self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[1]

              var which_xyz_value = Math.random() * (which_xyz_value1 - which_xyz_value2) + which_xyz_value2;
              self.cubemitter_.group.children[i].userData.velocity[which_xyz] = which_xyz_value;
            break;
            case 'CONSTANT':
              self.cubemitter_.group.children[i].userData.velocity[which_xyz] = self.cubemitter_.data.particle.velocity['over_lifetime_' + which_xyz].values[0];
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
            this.cubemitter_.group.children[i].userData.age / this.cubemitter_.group.children[i].userData.lifetime
          );

          this.cubemitter_.group.children[i].userData.speed = speed;
        break;
        default:
          throw 'this.cubemitter_.data.particle.speed.over_lifetime.kind ' + this.cubemitter_.data.particle.speed.over_lifetime.kind + ' not supported';
        break;
      }
    }

    // This is kind of weird and I'm not sure I like how it works. By default,
    // speed is ONLY on the y-axis. So a y velocity of 0 means the particle will
    // still move in the y direction as long as speed is non-zero.
    this.cubemitter_.group.children[i].position.x += 0.01 * (this.cubemitter_.group.children[i].userData.velocity.x);
    this.cubemitter_.group.children[i].position.y += 0.01 * (this.cubemitter_.group.children[i].userData.velocity.y + this.cubemitter_.group.children[i].userData.speed);
    this.cubemitter_.group.children[i].position.z += 0.01 * (this.cubemitter_.group.children[i].userData.velocity.z);

    if(self.cubemitter_.data.particle.rotation) {
      var self = this;
      ['x', 'y', 'z'].forEach(function(which_xyz) {
        if(self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz]) {
          switch(self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].kind) {
            case 'RANDOM_BETWEEN_CURVES':
              var which_xyz_value1 = self.evaluate_curve_(
                self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].values[0],
                self.cubemitter_.group.children[i].userData.age / self.cubemitter_.group.children[i].userData.lifetime
              );
              var which_xyz_value2 = self.evaluate_curve_(
                self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].values[1],
                self.cubemitter_.group.children[i].userData.age / self.cubemitter_.group.children[i].userData.lifetime
              );

              var which_xyz_value = Math.random() * (which_xyz_value1 - which_xyz_value2) + which_xyz_value2;

              self.cubemitter_.group.children[i].rotation[which_xyz] += which_xyz_value * (Math.PI / 180);
            break;
            case 'CONSTANT':
              self.cubemitter_.group.children[i].rotation[which_xyz] = self.cubemitter_.data.particle.rotation['over_lifetime_' + which_xyz].values[0] * (Math.PI / 180);
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
            this.cubemitter_.group.children[i].userData.age / this.cubemitter_.group.children[i].userData.lifetime
          );

          this.cubemitter_.group.children[i].material.opacity = opacity;
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
            this.cubemitter_.group.children[i].userData.age / this.cubemitter_.group.children[i].userData.lifetime
          );

          this.cubemitter_.group.children[i].scale.x = scale;
          this.cubemitter_.group.children[i].scale.y = scale;
          this.cubemitter_.group.children[i].scale.z = scale;
        break;
        case 'RANDOM_BETWEEN_CURVES':
          var scale1 = this.evaluate_curve_(
            this.cubemitter_.data.particle.scale.over_lifetime.values[0],
            this.cubemitter_.group.children[i].userData.age / this.cubemitter_.group.children[i].userData.lifetime
          );
          var scale2 = this.evaluate_curve_(
            this.cubemitter_.data.particle.scale.over_lifetime.values[0],
            this.cubemitter_.group.children[i].userData.age / this.cubemitter_.group.children[i].userData.lifetime
          );

          var scale = Math.random() * (scale1 - scale2) + scale2;

          this.cubemitter_.group.children[i].scale.x = scale;
          this.cubemitter_.group.children[i].scale.y = scale;
          this.cubemitter_.group.children[i].scale.z = scale;
        break;
        default:
          throw 'this.cubemitter_.data.particle.scale.over_lifetime.kind ' + this.cubemitter_.data.particle.scale.over_lifetime.kind + ' not supported';
        break;
      }
    }
  }
};


shed.view.cubemitter_editor.prototype.evaluate_curve_ = function(curve, t) {
  // Add a fake point at the end of the curve to make evaluating this not
  // require a conditional.

  // Ok yeah, need to fix this. Adding this to the end of the curve array was
  // actually adding it to the data object EVERY SINGLE TIME THIS FUNCTION WAS
  // CALLED. That pretty much just leaked memory out the wazoo since curve is
  // passed by reference. Oops...I'll fix this proper later when I rethink this,
  // for now just getting the bugfix done.
  var clone_curve = curve.slice(0);
  clone_curve.push([10, 0]); // TODO: Not really liking this...

  var x, y, x0, x1, y0, y1;
  for(var i = 0; i < clone_curve.length; i++) {
    if(t >= clone_curve[i][0] && t < clone_curve[i + 1][0]) {
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

shed.view.cubemitter_editor.prototype.scene_toggle_terrain_ = function(display) {
  if(display === false) {
    if(this.scene_terrain_) {
      this.webgl_.get_scene().remove(this.scene_terrain_);
      this.scene_terrain = null;
      // TODO: Dispose
    }
  }
  else {
    this.scene_terrain_ = new THREE.Object3D();

    var geometry, material, mesh;

    // TODO: Add axis markers
    // Origin marker for debugging
    // geometry = new THREE.BoxGeometry(1, 1, 1);
    // material = new THREE.MeshBasicMaterial({'color': 0xff0000 });
    // mesh = new THREE.Mesh(geometry, material);
    // mesh.position.y = 0;
    // mesh.position.z = 0;
    // mesh.position.x = 0;
    // this.webgl_.get_scene().add(mesh);
    // return;

    // Grass
    geometry = new THREE.BoxGeometry(10, 1, 10);
    material = new THREE.MeshBasicMaterial({'color': 0xa7e288 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -0.5;
    this.scene_terrain_.add(mesh);

    // Dirt
    geometry = new THREE.BoxGeometry(10, 2, 10);
    material = new THREE.MeshBasicMaterial({'color': 0x48402b }); // Light
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -2;
    this.scene_terrain_.add(mesh);

    geometry = new THREE.BoxGeometry(10, 2, 10);
    material = new THREE.MeshBasicMaterial({'color': 0x403823 }); // Dark
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -4;
    this.scene_terrain_.add(mesh);

    geometry = new THREE.BoxGeometry(10, 2, 10);
    material = new THREE.MeshBasicMaterial({'color': 0x48402b }); // Light
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -6;
    this.scene_terrain_.add(mesh);

    this.webgl_.get_scene().add(this.scene_terrain_);
  }
};

shed.view.cubemitter_editor.prototype.dispose_ = function() {
  this.webgl_.stop();
};
