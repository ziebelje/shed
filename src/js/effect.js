


/**
 * An effect.
 *
 * @constructor
 *
 * @param {shed.file} file The file describing this effect.
 */
shed.effect = function(file) {
  this.file_ = file;
  this.load_();
};
$.inherits(shed.effect, $.EventTarget);


/**
 * Load the effect file and the tracks.
 *
 * @private
 */
shed.effect.prototype.load_ = function() {
  this.data_ = this.file_.read();

  this.supported_ = false;
  this.tracks_ = [];
  this.dt_ = 0;
  if (this.data_.tracks) {
    for (var name in this.data_.tracks) {
      if (this.data_.tracks[name].type && this.data_.tracks[name].type === 'cubemitter') {
        this.supported_ = true;
        this.tracks_.push({
          'name': name,
          'attributes': this.data_.tracks[name],
          'object': new shed.cubemitter({
            'file': new shed.file(this.data_.tracks[name].cubemitter, this.file_),
            'transforms': this.data_.tracks[name].transforms
          })
        });
      }
      else {
        // Dummy track
        this.tracks_.push({
          'name': name,
          'attributes': this.data_.tracks[name],
          'object': null
        });
      }
    }
  }

  // Sort the tracks. All supported tracks (ones with objects) go first. After
  // that, they are sorted by name.
  var supported_tracks = [];
  var unsupported_tracks = [];

  for (var i = 0; i < this.tracks_.length; i++) {
    if (this.tracks_[i].object !== null) {
      supported_tracks.push(this.tracks_[i]);
    }
    else {
      unsupported_tracks.push(this.tracks_[i]);
    }
  }

  supported_tracks.sort(function(a, b) {
    return a.name - b.name;
  });
  unsupported_tracks.sort(function(a, b) {
    return a.name - b.name;
  });

  this.tracks_ = supported_tracks.concat(unsupported_tracks);

  this.dispatchEvent('load');
};


/**
 * This effect file.
 *
 * @type {shed.file}
 *
 * @private
 */
shed.effect.prototype.file_;


/**
 * The scene to place graphics in.
 *
 * @type {THREE.Scene}
 *
 * @private
 */
shed.effect.prototype.scene_;


/**
 * Array of tracks in the effect.
 *
 * @type {Array}
 *
 * @private
 */
shed.effect.prototype.tracks_;


/**
 * All effect data.
 *
 * @type {Object}
 *
 * @private
 */
shed.effect.prototype.data_;


/**
 * How long the effect has been active (ms).
 *
 * @type {number}
 *
 * @private
 */
shed.effect.prototype.dt_;


/**
 * Whether or not this effect is currently supported. This is sort of unique
 * to the effect editor but that's the only place effects are used at the
 * moment so it works.
 *
 * @type {boolean}
 */
shed.effect.prototype.supported_;


/**
 * Call the update function on each track.
 *
 * @param {number} dt
 */
shed.effect.prototype.update = function(dt) {
  this.dt_ += dt;

  for (var i = 0; i < this.tracks_.length; i++) {
    if (this.tracks_[i].attributes.type === 'cubemitter') {
      var start_time = this.tracks_[i].attributes.start_time || 0;
      var end_time = this.tracks_[i].attributes.end_time || Infinity;

      if (this.dt_ >= start_time && this.dt_ <= end_time) {
        this.tracks_[i].object.start_emit();
      }
      else {
        this.tracks_[i].object.stop_emit();
      }

      this.tracks_[i].object.update(dt);
    }
}
};


/**
 * Get the name of the effect.
 *
 * @return {string}
 */
shed.effect.prototype.get_name = function() {
  return this.file_.get_name();
};


/**
 * Get the file.
 *
 * @return {shed.file}
 */
shed.effect.prototype.get_file = function() {
  return this.file_;
};


/**
 * Get effect data.
 *
 * @return {Object}
 */
shed.effect.prototype.get_data = function() {
  return this.data_;
};


/**
 * Get all tracks on this effect.
 *
 * @return {Array}
 */
shed.effect.prototype.get_tracks = function() {
  return this.tracks_;
};


/**
 * See whether or not this effect is supported.
 *
 * @return {boolean}
 */
shed.effect.prototype.is_supported = function() {
  return this.supported_;
};


/**
 * Render this effect into a scene. This will also render all tracks and start
 * watching the effect file for changes.
 *
 * @param {THREE.scene} scene
 */
shed.effect.prototype.render = function(scene) {
  var self = this;

  this.watch_();
  this.scene_ = scene;
  for (var i = 0; i < this.tracks_.length; i++) {
    if (this.tracks_[i].object !== null) {
      this.tracks_[i].object.render(this.scene_);
      this.tracks_[i].object.addEventListener('change', function() {
        self.dispatchEvent('change');
      });
    }
  }
};


/**
 * Dispose of this.
 */
shed.effect.prototype.dispose = function() {
  // Dispose all tracks
  if (this.tracks_) {
    for (var i = 0; i < this.tracks_.length; i++) {
      if (this.tracks_[i].object !== null) {
        this.tracks_[i].object.dispose();
      }
    }
  }

  // Stop watching file for changes (if watching at all)
  this.file_.stop_watch();

  // Delete some stuff
  delete this.scene_;
  delete this.tracks_;
  delete this.data_;
  delete this.dt_;
  delete this.supported_;
};


/**
 * Watch this file for changes. When it changes, dispose it (which will
 * dispose all tracks and remove it from the scene), then reload the file and
 * re-add it to the scene.
 *
 * @private
 */
shed.effect.prototype.watch_ = function() {
  var self = this;
  this.file_.watch(function() {
    self.dispatchEvent('change');
  });
};


/**
 * This disposes the effect, which will dispose all of the tracks as well.
 * Then it reloads this effect, which recreates all of the tracks. If this
 * effect is currently rendered into a scene, re-render it into the scene
 * since the dispose will have removed it.
 */
shed.effect.prototype.reload = function() {
  this.dispose();
  this.load_();

  if (this.scene_) {
    this.render(this.scene_);
  }
};


/**
 * Find all effects. For now, assuming they are in the data/effects folder.
 * Asynchronous.
 *
 * @param {Function} callback
 *
 * @link http://stackoverflow.com/a/5827895
 */
shed.effect.get_effects = function(callback) {
  shed.filesystem.list_recursive(
    shed.setting.get('path') + 'mods\\' + shed.setting.get('mod') + '\\data\\effects',
    function(paths) {
      var effects = [];
      for (var i = 0; i < paths.length; i++) {
        if (shed.filesystem.is_file(paths[i]) === true) {
          effects.push(new shed.effect(new shed.file(paths[i])));
        }
      }

      // Sort with supported effects up top.
      var supported_effects = [];
      var unsupported_effects = [];

      for (var i = 0; i < effects.length; i++) {
        if (effects[i].is_supported() === true) {
          supported_effects.push(effects[i]);
        }
        else {
          unsupported_effects.push(effects[i]);
        }
      }

      supported_effects.sort(function(a, b) {
        return a.name - b.name;
      });
      unsupported_effects.sort(function(a, b) {
        return a.name - b.name;
      });

      effects = supported_effects.concat(unsupported_effects);

      callback(effects);
    }
  );
};
