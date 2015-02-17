/**
 * Effect editor.
 */
shed.view.effect_editor = function() {
  // TODO: Sky color (night/day/specific time of night/day)
  // TODO: Playback controls for each effect. Repeat, repeat delay, play pause, playback speed (2x, normal to mimic game)
  // TODO: GIF recording?
  // TODO: Load up any entity

  // TODO: The Stonehearth JSON files (firepit_effect.json for example) have
  // some duplicate keys. This is technically legal but REALLY weird and
  // JavaScript won't decode that the same way the game does...I think tracks
  // should be an array, not an object. Or if it's an object the keys need
  // unique names.

  // TODO: Need to figure this out / handle these paths and mixins and overrides
  // etc
  //
  // \data\effects\firepit_effect\firepit_effect.json
  //
  // POINTS TO A CUBEMITTER EFFECT AT
  //
  // "particles/fire/fire.cubemitter.json"
  //
  // This path is not relative to the current path.
  // This path is not an absolute path.
  //
  // Actual effect is located at
  //
  // \data\horde\particles\fire\fire.cubemitter.json

  this.current_name_ = $.createElement('h3').addClass('current_name');
  shed.view.apply(this, arguments);
}
$.inherits(shed.view.effect_editor, shed.view);


/**
 * Title of this view.
 *
 * @type {string}
 */
shed.view.effect_editor.prototype.title_ = 'Effect Editor';


/**
 * WebGL component.
 *
 * @type {shed.component.webgl}
 */
shed.view.effect_editor.prototype.webgl_;


/**
 * The terrain group.
 *
 * @type {Three.Object3D}
 */
shed.view.effect_editor.prototype.scene_terrain_;


/**
 * The x, y, z axis group.
 *
 * @type {Three.Object3D}
 */
shed.view.effect_editor.prototype.scene_axis_;


/**
 * A container for the name of the currently loaded effect.
 *
 * @type {rocket.Elements}
 */
shed.view.effect_editor.prototype.current_name_;


/**
 * Whether or not to display the emitter on each cubemitter.
 *
 * @type {boolean}
 */
shed.view.effect_editor.prototype.display_emitter_;


/**
 * Decorate the view.
 *
 * @param {rocket.Elements} parent
 */
shed.view.effect_editor.prototype.decorate_ = function(parent) {
  var self = this;

  var testing_this_container = $.createElement('div').addClass('effect_editor');

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
  this.scene_toggle_axis_(false);
  this.scene_toggle_emitter_(false);

  // Canvas
  right.appendChild(well);

  grid_row.appendChild(left);
  grid_row.appendChild(right);
  testing_this_container.appendChild(grid_row);

  parent.appendChild(testing_this_container);
};


/**
 * Decorate the previewer toolabr
 *
 * @param {rocket.Elements} parent
 */
shed.view.effect_editor.prototype.decorate_toolbar_ = function(parent) {
  var self = this;

  // Toolbar
  var toolbar = $.createElement('div')
    .addClass('toolbar');

  // Toggle terrain
  var toggle_terrain_container = $.createElement('span')
    .dataset('hint', 'Terrain')
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

  // Toggle axis
  var toggle_axis_container = $.createElement('span')
    .dataset('hint', 'Axis')
    .addClass(['hint--bottom', 'hint--bounce']);
  var toggle_axis = $.createElement('input')
    .setAttribute('type', 'checkbox')
    .addClass('toggle_axis')
    .checked(false);
  toggle_axis.addEventListener('change', function() {
    self.scene_toggle_axis_(toggle_axis.checked());
  });
  toggle_axis_container.appendChild(toggle_axis);
  toolbar.appendChild(toggle_axis_container);

  // Toggle emitter
  var toggle_emitter_container = $.createElement('span')
    .dataset('hint', 'Emitters')
    .addClass(['hint--bottom', 'hint--bounce']);
  var toggle_emitter = $.createElement('input')
    .setAttribute('type', 'checkbox')
    .addClass('toggle_emitter')
    .checked(false);
  toggle_emitter.addEventListener('change', function() {
    self.scene_toggle_emitter_(toggle_emitter.checked());
  });
  toggle_emitter_container.appendChild(toggle_emitter);
  toolbar.appendChild(toggle_emitter_container);

  parent.appendChild(toolbar);
}


/**
 * Decorate the effect list.
 *
 * @param {rocket.Elements} parent
 */
shed.view.effect_editor.prototype.decorate_list_ = function(parent) {
  var self = this;

  shed.effect.get_effects(function(effects) {
    var table = new jex.table({'rows': 0, 'columns': 2});
    table.table().addClass(['zebra', 'highlight'])
      .style({'width': '100%', 'cursor': 'pointer'});


    for(var i = 0; i < effects.length; i++) {
      var tracks = effects[i].get_tracks();

      // Hide effects with no tracks or no supported tracks. TODO: Once I add
      // support for more track types I may just expose everything and disable
      // certain things.
      var effect_supported = false;
      for(var j = 0; j < tracks.length; j++) {
        if(tracks[j].attributes.type === 'cubemitter') {
          effect_supported = true;
          break;
        }
      }
      if(effect_supported === false) {
        continue;
      }

      var k = table.add_row();
      table.td(0, k).appendChild(
        $.createElement('h3').innerHTML(effects[i].get_name())
      );

      for(var j = 0; j < tracks.length; j++) {
        table.td(0, k).appendChild(
          $.createElement('div')
            .style('margin-left', '20px')
            .innerHTML(tracks[j].name)
        );
      }

      (function(effect) {
        table.td(0, k).addEventListener('click', function() {
          if(self.effect_) {
            self.effect_.dispose();
            // TODO: The effects are switching but when I go back to an already opened one it's like it's been playing for a while...
          }
          self.effect_ = effect;
          effect.set_scene(self.webgl_.get_scene());
          self.scene_toggle_emitter_(self.display_emitter_); // Load up the new scene and apply the proper emitter display setting
          self.current_name_.innerHTML(effect.get_name());
        });
      })(effects[i]);

      // TODO Temporary auto-load of the effect I want.
      if(effects[i].get_name() === 'firepit_effect') {
      // if(effects[i].get_name() === 'talisman_glow') {
        table.td(0, k).dispatchEvent('click');
      }

      // table.td(1, i)
      //   .style('text-align', 'right')
      //   .style('width', '50px')
      //   .appendChild(
      //     $.createElement('img')
      //       .setAttribute('src', 'img/forward.png')
      //       .style('height', '20px')
      //   );




    }
    // .addEventListener('click', function() {
    //   var gui = require('nw.gui');
    //   gui.Shell.openItem(file);
    // })

    parent.appendChild(table.table());
  });
};


/**
 * Call the update function on the currently loaded effect.
 *
 * @param {number} dt Time since last update (ms)
 */
shed.view.effect_editor.prototype.update_ = function(dt) {
  if(this.effect_) {
    this.effect_.update(dt);
  }
};


/**
 * Toggle the terrain on/off.
 *
 * @param {boolean} display
 */
shed.view.effect_editor.prototype.scene_toggle_terrain_ = function(display) {
  if(!this.scene_terrain_) {
    this.scene_terrain_ = new THREE.Object3D();

    // Grass
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.99, 10), // Slightly shorter so lines on the surface don't z-fight
      new THREE.MeshBasicMaterial({'color': 0x80c47b })
    );
    mesh.position.y = -0.5;
    this.scene_terrain_.add(mesh);

    // Dirt
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2, 10),
      new THREE.MeshBasicMaterial({'color': 0x48402b })
    );
    mesh.position.y = -2;
    this.scene_terrain_.add(mesh);

    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2, 10),
      new THREE.MeshBasicMaterial({'color': 0x403823 })
    );
    mesh.position.y = -4;
    this.scene_terrain_.add(mesh);

    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2, 10),
      new THREE.MeshBasicMaterial({'color': 0x48402b })
    );
    mesh.position.y = -6;
    this.scene_terrain_.add(mesh);

    this.webgl_.get_scene().add(this.scene_terrain_);
  }

  this.scene_terrain_.visible = display;
};


/**
 * Toggle the axis on/off.
 *
 * @param {boolean} display
 */
shed.view.effect_editor.prototype.scene_toggle_axis_ = function(display) {
  if(!this.scene_axis_) {
    this.scene_axis_ = new THREE.Object3D();

    var geometry, material, line, map, sprite;

    // X
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(6, 0, 0));
    material = new THREE.LineBasicMaterial({'color': 0xff0000});
    line = new THREE.Line(geometry, material);
    this.scene_axis_.add(line);

    map = THREE.ImageUtils.loadTexture('img/x.png');
    material = new THREE.SpriteMaterial({'map': map});
    sprite = new THREE.Sprite(material);
    sprite.scale.set(0.2, 0.2, 1);
    sprite.position.set(6.2, 0, 0);
    this.scene_axis_.add(sprite);

    // Y
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 6, 0));
    material = new THREE.LineBasicMaterial({'color': 0x00ff00});
    line = new THREE.Line(geometry, material);
    this.scene_axis_.add(line);

    map = THREE.ImageUtils.loadTexture('img/y.png');
    material = new THREE.SpriteMaterial({'map': map});
    sprite = new THREE.Sprite(material);
    sprite.scale.set(0.2, 0.2, 1);
    sprite.position.set(0, 6.2, 0);
    this.scene_axis_.add(sprite);

    // Z
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 6));
    material = new THREE.LineBasicMaterial({'color': 0x0000ff});
    line = new THREE.Line(geometry, material);
    this.scene_axis_.add(line);

    map = THREE.ImageUtils.loadTexture('img/z.png');
    material = new THREE.SpriteMaterial({'map': map});
    sprite = new THREE.Sprite(material);
    sprite.scale.set(0.2, 0.2, 1);
    sprite.position.set(0, 0, 6.2);
    this.scene_axis_.add(sprite);

    this.webgl_.get_scene().add(this.scene_axis_);
  }

  this.scene_axis_.visible = display;
}


/**
 * Toggle the cubemitter emitter on/off.
 *
 * @param {boolean} display
 */
shed.view.effect_editor.prototype.scene_toggle_emitter_ = function(display) {
  this.display_emitter_ = display;
  if(this.effect_) {
    var tracks = this.effect_.get_tracks();
    for(var i = 0; i < tracks.length; i++) {
      if(tracks[i].attributes.type === 'cubemitter') {
        tracks[i].object.toggle_emitter(display);
      }
    }
  }
}


/**
 * Dispose of this view by stopping the webgl component. This will cancel all
 * updates and requestAnimationFrames.
 */
shed.view.effect_editor.prototype.dispose_ = function() {
  this.webgl_.stop();
};
