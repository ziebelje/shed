// TODO: The Stonehearth JSON files (firepit_effect.json for example) have some
// duplicate keys. This is technically legal but REALLY weird and JavaScript
// won't decode that the same way the game does...I think tracks should be an
// array, not an object.

// TODO: I'm making the effect class (and cubemitter, etc) watch their files on
// behalf of themselves for now. This is a bit weird because I somehow need to
// know when we're done with this object or else I need to manually unwatch the
// file somewhere.

shed.effect = function(file) {
  this.file_ = file;
  this.tracks_ = [];

  this.load_();
  this.watch_();
};


/**
 * Path of the effect file.
 *
 * @type {string}
 */
shed.effect.prototype.file_;


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
 * Read the effect file and load up all of the tracks.
 */
shed.effect.prototype.load_ = function() {
  this.tracks_ = [];

  this.data_ = shed.read_file(this.file_);

  if(this.data_.tracks) {
    for (var name in this.data_.tracks) {
      if(this.data_.tracks[name].type && this.data_.tracks[name].type === 'cubemitter') {
        this.tracks_.push(new shed.cubemitter({
          'file': this.data_.tracks[name].cubemitter, // TODO: I guess this could technically be a path OR an alias. Need a static shed function to interpret these. That means loading up the manifest, which means choosing a mod to load...
          'loop': this.data_.tracks[name].loop,
          'transforms': this.data_.tracks[name].transforms
        }));
      }
    }
  }
};


/**
 * Call the update function on each track.
 */
shed.effect.prototype.update = function() {
  for(var i = 0; i < this.tracks_.length; i++) {
    this.tracks_[i].update();
  }
}


/**
 * Watch this effects file for changes and reload it when that happens.
 */
shed.effect.prototype.watch_ = function() {
  this.watcher_ = shed.watch_file(this.file_, this.load_.bind(this));
}


/**
 * Dispose of this. This is REQUIRED when you're done with it to ensure that
 * it stops listening for file changes.
 */
shed.effect.prototype.dispose_ = function() {
  this.watcher_.close();
}
