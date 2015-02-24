


/**
 * An effect.
 *
 * @constructor
 *
 * @param {string} file The file describing this effect.
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
  this.data_ = shed.read_file(this.file_);

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
            'file': localStorage.mod_path + '\\data\\horde\\' + this.data_.tracks[name].cubemitter,
            'transforms': this.data_.tracks[name].transforms
            // TODO: Add event listener on the cubemitter to reload this effect when any cubemitter changes
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

  // Sort the tracks
  this.tracks_.sort(function(a, b) {
    var a_score = 0;
    if (a.object === null && b.object !== null) {
      a_score += 10;
    }
    if (a.object !== null && b.object === null) {
      a_score -= 10;
    }
    if (a.name > b.name) {
      a_score += 1;
    }
    if (a.name < b.name) {
      a_score -= 1;
    }
    return a_score;
  });

  this.name_ = this.file_.substr(this.file_.lastIndexOf('\\') + 1).replace('.json', '');

  this.dispatchEvent('load');
};


/**
 * Path of the effect file.
 *
 * @type {string}
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
 * The file watcher.
 *
 * @type {fs.FSWatcher}
 *
 * @private
 */
shed.effect.prototype.watcher_;


/**
 * The name of the effect.
 *
 * @type {string}
 *
 * @private
 */
shed.effect.prototype.name_;


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
  return this.name_;
};


/**
 * Get the filename.
 *
 * @return {string}
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
  if (this.watcher_) {
    console.log('- watcher');
    this.watcher_.close();
  }

  // Delete some stuff
  delete this.scene_;
  delete this.tracks_;
  delete this.data_;
  delete this.watcher_;
  delete this.name_;
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
  console.log('+ watcher');
  this.watcher_ = shed.watch_file(this.file_, function() {
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
  var effects = [];

  var fs = require('fs');
  var walk = function(directory, callback) {
    fs.readdir(directory, function(error, list) {
      if (error) {
        return callback(error);
      }

      var pending = list.length;
      if (!pending) {
        return callback();
      }

      list.forEach(function(file) {
        file = directory + '\\' + file;
        fs.stat(file, function(error, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function(error, result) {
              if (!--pending) {
                callback();
              }
            });
          } else {
            effects.push(new shed.effect(file));
            if (!--pending) {
              callback();
            }
          }
        });
      });
    });
  };

  walk(localStorage.mod_path + '\\data\\effects', function(error) {
    if (error) {
      throw error;
    }

    effects.sort(function(a, b) {
      var a_score = 0;
      if (a.is_supported() === false && b.is_supported() === true) {
        a_score += 10;
      }
      if (a.is_supported() === true && b.is_supported() === false) {
        a_score -= 10;
      }
      if (a.get_name() > b.get_name()) {
        a_score += 1;
      }
      if (a.get_name() < b.get_name()) {
        a_score -= 1;
      }
      return a_score;
    });

    callback(effects);
  });
};
