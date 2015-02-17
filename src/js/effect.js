/**
 * An effect.
 *
 * @param {string} file The file describing this effect.
 */
shed.effect = function(file) {
  this.file_ = file;
  this.load_();
};


/**
 * Load the effect file and the tracks.
 */
shed.effect.prototype.load_ = function() {
  this.data_ = shed.read_file(this.file_);

  this.tracks_ = [];
  if(this.data_.tracks) {
    for(var name in this.data_.tracks) {
      if(this.data_.tracks[name].type && this.data_.tracks[name].type === 'cubemitter') {
        this.tracks_.push({
          'name': name,
          'attributes': this.data_.tracks[name],
          'object': new shed.cubemitter({
            'file': localStorage.mod_path + '\\data\\horde\\' + this.data_.tracks[name].cubemitter,
            'transforms': this.data_.tracks[name].transforms
          })
        });
      }
    }
  }

  this.name_ = this.file_.substr(this.file_.lastIndexOf('\\') + 1).replace('.json', '');
}

/**
 * Path of the effect file.
 *
 * @type {string}
 */
shed.effect.prototype.file_;


/**
 * The scene to place graphics in.
 *
 * @type {THREE.Scene}
 */
shed.effect.prototype.scene_;


/**
 * Array of tracks in the effect.
 *
 * @type {Array}
 */
shed.effect.prototype.tracks_;


/**
 * All effect data.
 *
 * @type {Object}
 */
shed.effect.prototype.data_;


/**
 * The file watcher.
 *
 * @type {fs.FSWatcher}
 */
shed.effect.prototype.watcher_;


/**
 * The name of the effect.
 *
 * @type {string}
 */
shed.effect.prototype.name_;


/**
 * Call the update function on each track.
 */
shed.effect.prototype.update = function(dt) {
  console.log(this.tracks_.length);
  for(var i = 0; i < this.tracks_.length; i++) {
    this.tracks_[i].object.update(dt);
  }
}


/**
 * Get the name of the effect.
 *
 * @return {string}
 */
shed.effect.prototype.get_name = function() {
  return this.name_;
}


/**
 * Get all tracks on this effect.
 *
 * @return {Array}
 */
shed.effect.prototype.get_tracks = function() {
  return this.tracks_;
}


/**
 * Set the scene this effect is part of.
 */
shed.effect.prototype.set_scene = function(scene) {
  this.watch_();
  this.scene_ = scene;
  for(var i = 0; i < this.tracks_.length; i++) {
    this.tracks_[i].object.set_scene(this.scene_);
  }
}


/**
 * Dispose of this. This is REQUIRED when you're done with it to ensure that
 * it stops listening for file changes and other stuff.
 */
shed.effect.prototype.dispose = function() {
  this.scene_ = null;
  this.watcher_.close();
  for(var i = 0; i < this.tracks_.length; i++) {
    this.tracks_[i].object.dispose();
  }
}


/**
 * Watch this file for changes. When it changes, dispose it (which will
 * dispose all tracks and remove it from the scene), then reload the file and
 * re-add it to the scene.
 */
shed.effect.prototype.watch_ = function() {
  var self = this;
  this.watcher_ = shed.watch_file(this.file_, function() {
    var scene = self.scene_; // Back this up before disposing.
    self.dispose();
    self.load_();
    self.set_scene(scene);
  });
}


/**
 * Find all effects. For now, assuming they are in the data/effects folder.
 * Asynchronous.
 *
 * TODO: Probably move this into shed.js with a callback every time it finds a
 * file. Maybe add a file matching regex or some kind of JSONPath or more
 * likely just a callback on each file that will determine if it's something
 * I'm looking for.
 *
 * @link http://stackoverflow.com/a/5827895
 */
shed.effect.get_effects = function(callback) {
  var effects = [];

  var fs = require('fs');
  var walk = function(directory, callback) {
    fs.readdir(directory, function(error, list) {
      if(error) {
        return callback(error);
      }

      var pending = list.length;
      if(!pending) {
        return callback();
      }

      list.forEach(function(file) {
        file = directory + '\\' + file;
        fs.stat(file, function(error, stat) {
          if(stat && stat.isDirectory()) {
            walk(file, function(error, result) {
              if(!--pending) {
                callback();
              }
            });
          } else {
            effects.push(new shed.effect(file));
            if(!--pending) {
              callback();
            }
          }
        });
      });
    });
  };

  // TODO: Eh, for now assume all effects are located here...
  walk(localStorage.mod_path + '\\data\\effects', function(error) {
    if(error) {
      throw error;
    }
    callback(effects);
  });
}
