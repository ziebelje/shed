


/**
 * Effect editor.
 *
 * @param {shed.effect} effect The effect currently being edited.
 *
 * @constructor
 */
shed.view.effect_editor = function(effect) {
  this.effect_ = effect;
  shed.view.apply(this, arguments);
};
$.inherits(shed.view.effect_editor, shed.view);


/**
 * Title of this view.
 *
 * @type {string}
 *
 * @private
 */
shed.view.effect_editor.prototype.title_ = 'Effect Editor';


/**
 * WebGL component.
 *
 * @type {shed.component.webgl}
 *
 * @private
 */
shed.view.effect_editor.prototype.webgl_;


/**
 * The terrain group.
 *
 * @type {Three.Object3D}
 *
 * @private
 */
shed.view.effect_editor.prototype.terrain_;


/**
 * The x, y, z axis group.
 *
 * @type {Three.Object3D}
 *
 * @private
 */
shed.view.effect_editor.prototype.axis_;


/**
 * Decorate the view.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.effect_editor.prototype.decorate_ = function(parent) {
  // Guarantee that we capture any changes to the effect since the object was
  // created.
  this.effect_.reload();

  this.effect_.addEventListener('change', function() {
    self.rerender();
  });

  var self = this;

  var todo = $.createElement('div').addClass('effect_editor'); // todo sass namespacing

  var grid_row = $.createElement('div').addClass('grid_row');
  var left = $.createElement('div').addClass(['list', 'left', 'grid_column_5']);
  var right = $.createElement('div').addClass('grid_column_7');

  var table = new jex.table({'rows': 1, 'columns': 2});
  table.table().style({'width': '100%', 'table-layout': 'fixed'});

  table.td(0, 0)
    .addClass('name')
    .innerHTML(this.effect_.get_name());

  var open = $.createElement('img').setAttribute('src', 'img/forward.png').addClass('effect_open');
  open.addEventListener('click', function() {
    self.effect_.get_file().open();
  });
  table.td(1, 0).style('text-align', 'right').appendChild(open);

  left.appendChild(table.table());

  this.decorate_tracks_(left);

  // Well
  var well = $.createElement('div').addClass('well');

  this.webgl_ = new shed.component.webgl({
    'width': 490,
    'height': 485,
    'update': this.update_.bind(this)
  });

  // Toolbar
  this.webgl_.render(well);
  this.decorate_toolbar_(well);

  // Set camera position
  var position = shed.setting.get('effect_editor_camera_position');
  this.webgl_.get_camera().position.x = position.x;
  this.webgl_.get_camera().position.y = position.y;
  this.webgl_.get_camera().position.z = position.z;

  this.effect_.render(this.webgl_.get_scene());

  // Canvas
  right.appendChild(well);

  grid_row.appendChild(left);
  grid_row.appendChild(right);
  todo.appendChild(grid_row);

  parent.appendChild(todo);
};


/**
 * Decorate track list
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.effect_editor.prototype.decorate_tracks_ = function(parent) {
  var tracks = this.effect_.get_tracks();
  var table = new jex.table({'rows': tracks.length, 'columns': 2});
  table.table().addClass('zebra').style('width', '100%');
  for (var i = 0; i < tracks.length; i++) {
    table.td(0, i).innerHTML(tracks[i].name);

    if (tracks[i].object === null) {
      table.td(0, i).addClass('unsupported');
      table.td(0, i).appendChild($.createElement('small').innerHTML('Unsupported track type (' + tracks[i].attributes.type + ')'));
    }
    else {
      table.td(0, i).appendChild($.createElement('small').innerHTML(tracks[i].attributes.type));

      var open = $.createElement('img').setAttribute('src', 'img/forward.png').addClass('cubemitter_open');
      table.td(1, i).style('text-align', 'right').appendChild(open);

      (function(file) {
        open.addEventListener('click', function() {
          file.open();
        });
      })(tracks[i].object.get_file());
    }

  }
  parent.appendChild(table.table());
};


/**
 * Decorate the previewer toolabr
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.effect_editor.prototype.decorate_toolbar_ = function(parent) {
  var self = this;

  // Toolbar
  var toolbar = $.createElement('div').addClass('toolbar');

  // Toggle terrain
  var toggle_terrain_container = $.createElement('span')
    .dataset('hint', 'Terrain')
    .addClass(['hint--bottom', 'hint--bounce']);
  var toggle_terrain = $.createElement('input')
    .setAttribute('type', 'checkbox')
    .addClass('toggle_terrain')
    .checked(shed.setting.get('effect_editor_terrain'));
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
    .checked(shed.setting.get('effect_editor_axis'));
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
    .checked(shed.setting.get('effect_editor_emitter'));
  toggle_emitter.addEventListener('change', function() {
    self.scene_toggle_emitter_(toggle_emitter.checked());
  });
  toggle_emitter_container.appendChild(toggle_emitter);
  toolbar.appendChild(toggle_emitter_container);

  toggle_terrain.dispatchEvent('change');
  toggle_axis.dispatchEvent('change');
  toggle_emitter.dispatchEvent('change');

  parent.appendChild(toolbar);
};


/**
 * Call the update function on the currently loaded effect.
 *
 * @param {number} dt Time since last update (ms)
 *
 * @private
 */
shed.view.effect_editor.prototype.update_ = function(dt) {
  if (this.effect_) {
    this.effect_.update(dt);
  }
};


/**
 * Toggle the terrain on/off.
 *
 * @param {boolean} display
 *
 * @private
 */
shed.view.effect_editor.prototype.scene_toggle_terrain_ = function(display) {
  if (!this.terrain_) {
    this.terrain_ = new THREE.Object3D();

    // Grass
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.99, 10), // Slightly shorter so lines on the surface don't z-fight
      new THREE.MeshBasicMaterial({'color': 0x80c47b })
    );
    mesh.position.y = -0.5;
    this.terrain_.add(mesh);

    // Dirt
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2, 10),
      new THREE.MeshBasicMaterial({'color': 0x48402b })
    );
    mesh.position.y = -2;
    this.terrain_.add(mesh);

    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2, 10),
      new THREE.MeshBasicMaterial({'color': 0x403823 })
    );
    mesh.position.y = -4;
    this.terrain_.add(mesh);

    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2, 10),
      new THREE.MeshBasicMaterial({'color': 0x48402b })
    );
    mesh.position.y = -6;
    this.terrain_.add(mesh);

    this.webgl_.get_scene().add(this.terrain_);
  }

  this.terrain_.visible = display;
  shed.setting.set('effect_editor_terrain', display);
};


/**
 * Toggle the axis on/off.
 *
 * @param {boolean} display
 *
 * @private
 */
shed.view.effect_editor.prototype.scene_toggle_axis_ = function(display) {
  if (!this.axis_) {
    this.axis_ = new THREE.Object3D();

    var geometry, material, line, map, sprite;

    // X
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(6, 0, 0));
    material = new THREE.LineBasicMaterial({'color': 0xff0000});
    line = new THREE.Line(geometry, material);
    this.axis_.add(line);

    map = THREE.ImageUtils.loadTexture('img/x.png');
    material = new THREE.SpriteMaterial({'map': map});
    sprite = new THREE.Sprite(material);
    sprite.scale.set(0.2, 0.2, 1);
    sprite.position.set(6.2, 0, 0);
    this.axis_.add(sprite);

    // Y
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 6, 0));
    material = new THREE.LineBasicMaterial({'color': 0x00ff00});
    line = new THREE.Line(geometry, material);
    this.axis_.add(line);

    map = THREE.ImageUtils.loadTexture('img/y.png');
    material = new THREE.SpriteMaterial({'map': map});
    sprite = new THREE.Sprite(material);
    sprite.scale.set(0.2, 0.2, 1);
    sprite.position.set(0, 6.2, 0);
    this.axis_.add(sprite);

    // Z
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 6));
    material = new THREE.LineBasicMaterial({'color': 0x0000ff});
    line = new THREE.Line(geometry, material);
    this.axis_.add(line);

    map = THREE.ImageUtils.loadTexture('img/z.png');
    material = new THREE.SpriteMaterial({'map': map});
    sprite = new THREE.Sprite(material);
    sprite.scale.set(0.2, 0.2, 1);
    sprite.position.set(0, 0, 6.2);
    this.axis_.add(sprite);

    this.webgl_.get_scene().add(this.axis_);
  }

  this.axis_.visible = display;
  shed.setting.set('effect_editor_axis', display);
};


/**
 * Toggle the cubemitter emitter on/off.
 *
 * @param {boolean} display
 *
 * @private
 */
shed.view.effect_editor.prototype.scene_toggle_emitter_ = function(display) {
  if (this.effect_) {
    var tracks = this.effect_.get_tracks();
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].attributes.type === 'cubemitter') {
        tracks[i].object.toggle_emitter(display);
      }
    }
  }
  shed.setting.set('effect_editor_emitter', display);
};


/**
 * Dispose of this view by stopping the webgl component. This will cancel all
 * updates and requestAnimationFrames.
 *
 * @private
 */
shed.view.effect_editor.prototype.dispose_ = function() {
  // Save a few settings
  shed.setting.set(
    'effect_editor_camera_position',
    {
      'x': this.webgl_.get_camera().position.x,
      'y': this.webgl_.get_camera().position.y,
      'z': this.webgl_.get_camera().position.z
    }
  );

  this.webgl_.stop();
  this.effect_.dispose();

  // Delete these so they can be recreated if rerendering.
  delete this.terrain_;
  delete this.axis_;
};
