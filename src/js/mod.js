


/**
 * A mod.
 *
 * @param {string} name The name of the mod.
 *
 * @constructor
 */
shed.mod = function(name) {
  this.name_ = name;
};
$.inherits(shed.mod, $.EventTarget);


/**
 * The name of the mod.
 *
 * @type {string}
 *
 * @private
 */
shed.mod.prototype.name_;


/**
 * Pack progress, from 0 to 100.
 *
 * @type {number}
 *
 * @private
 */
shed.mod.prototype.pack_progress_;


/**
 * Unpack progress, from 0 to 100.
 *
 * @type {number}
 *
 * @private
 */
shed.mod.prototype.unpack_progress_;


/**
 * Get the name of the mod.
 *
 * @return {string}
 */
shed.mod.prototype.get_name = function() {
  return this.name_;
};


/**
 * Get the path to the mod folder (whether or not it exists).
 *
 * @private
 *
 * @return {string}
 */
shed.mod.prototype.get_directory_path_ = function() {
  return shed.setting.get('path') + 'mods\\' + this.name_;
};


/**
 * Get the path to the smod file (whether or not it exists).
 *
 * @private
 *
 * @return {string}
 */
shed.mod.prototype.get_smod_path_ = function() {
  return shed.setting.get('path') + 'mods\\' + this.name_ + '.smod';
};


/**
 * Get the number of files in the mod to be unpacked.
 *
 * @param {Function} callback
 *
 * @private
 */
shed.mod.prototype.get_unpack_count_ = function(callback) {
  var spawn = require('child_process').spawn;
  var process = spawn(
    'tool/7z/7z.exe',
    [
      'l',
      this.get_smod_path_()
    ]
  );

  process.stderr.setEncoding('utf8');
  process.stderr.on('data', function(data) {}); // Prevents buffer overflow

  var output_string;
  process.stdout.setEncoding('utf8');
  process.stdout.on('data', function(data) {
    output_string = data;
  });

  process.on('close', function(code) {
    var matches = output_string.match(/(\d+) files, (\d+) folders/);
    callback(parseInt(matches[1]) + parseInt(matches[2]));
  });
};


/**
 * Get the number of files in the folder to be packed.
 *
 * @param {Function} callback
 *
 * @private
 */
shed.mod.prototype.get_pack_count_ = function(callback) {
  shed.filesystem.count(this.get_directory_path_(), callback, true, true);
};


/**
 * Delete the mod directory.
 *
 * @param {Function} callback
 *
 * @private
 */
shed.mod.prototype.delete_directory_ = function(callback) {
  shed.filesystem.delete_asynchronous(this.get_directory_path_(), callback);
};


/**
 * Delete the .smod file for this mod. This is only asynchronous because
 * delete_directory_ has to be.
 *
 * @param {Function} callback
 *
 * @private
 */
shed.mod.prototype.delete_smod_ = function(callback) {
  shed.filesystem.delete_asynchronous(this.get_smod_path_(), callback);
};


/**
 * Zip up a mod folder. http://stackoverflow.com/a/16099450
 *
 * @param {Function} callback
 */
shed.mod.prototype.pack = function(callback) {
  var self = this;

  var pack = function() {
    self.get_pack_count_(function(pack_count) {
      var spawn = require('child_process').spawn;
      var process = spawn(
        'tool/7z/7z.exe',
        [
          'a',
          '-tzip',
          self.get_smod_path_(),
          self.get_directory_path_()
        ]
      );

      var packed = 0;

      var error = null;
      process.stderr.setEncoding('utf8');
      process.stderr.on('data', function(data) {}); // Prevents buffer overflow

      process.stdout.setEncoding('utf8');
      process.stdout.on('data', function(data) {
        // Check for errors
        var matches = data.match(/^7-Zip.*?\r?\n\r?\n\r?\nError:\r?\n(.*)$/m);
        if (matches !== null) {
          error = matches[1];
        }

        packed += (data.match(/Compressing  /g) || []).length;
        self.pack_progress_ = packed / pack_count * 100;
        self.dispatchEvent('pack_progress');
      });

      process.on('close', function(code) {
        callback(error);
      });
    });
  };

  if (this.has_smod() === true) {
    this.delete_smod_(pack);
  }
  else {
    pack();
  }
};


/**
 * Unzip an smod archive. http://stackoverflow.com/a/16099450
 *
 * @param {Function} callback
 */
shed.mod.prototype.unpack = function(callback) {
  var self = this;

  var unpack = function() {
    self.get_unpack_count_(function(unpack_count) {
      var spawn = require('child_process').spawn;
      var process = spawn(
        'tool/7z/7z.exe',
        [
          'x',
          self.get_smod_path_(),
          '-o' + shed.setting.get('path') + 'mods\\'
        ]
      );

      process.stderr.setEncoding('utf8');
      process.stderr.on('data', function(data) {}); // Prevents buffer overflow

      var unpacked = 0;

      var error = null;
      process.stdout.setEncoding('utf8');
      process.stdout.on('data', function(data) {
        // Check for errors
        var matches = data.match(/^7-Zip.*?\r?\n\r?\n\r?\nError:\r?\n(.*)$/m);
        if (matches !== null) {
          error = matches[1];
        }

        unpacked += (data.match(/Extracting  /g) || []).length;
        self.unpack_progress_ = Math.max(5, (unpacked / unpack_count * 100));
        self.dispatchEvent('unpack_progress');
      });

      process.on('close', function(code) {
        callback(error);
      });
    });
  };

  // Just start this at 5% done. The delete is pretty quick, even for the huge
  // stonehearth mod (~3-4 seconds on a decent PC) so we'll call this good for
  // now.
  this.unpack_progress_ = 5;
  this.dispatchEvent('unpack_progress');

  if (this.has_directory() === true) {
    this.delete_directory_(unpack);
  }
  else {
    unpack();
  }
};


/**
 * Determine if this mod has a directory.
 *
 * @return {boolean}
 */
shed.mod.prototype.has_directory = function() {
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    if (shed.filesystem.is_directory(shed.setting.get('path') + 'mods\\' + file_entries[i]) === true) {
      return true;
    }
  }

  return false;
};


/**
 * Determine if this mod has an .smod package.
 *
 * @return {boolean}
 */
shed.mod.prototype.has_smod = function() {
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    if (
      shed.filesystem.is_file(shed.setting.get('path') + 'mods\\' + file_entries[i]) === true &&
      file_entries[i].indexOf('.smod') !== -1
    ) {
      return true;
    }
  }

  return false;
};


/**
 * Get pack progress.
 *
 * @return {number}
 */
shed.mod.prototype.get_pack_progress = function() {
  return this.pack_progress_;
};


/**
 * Get unpack progress.
 *
 * @return {number}
 */
shed.mod.prototype.get_unpack_progress = function() {
  return this.unpack_progress_;
};


/**
 * Get a list of file entries (files or folders) that seem to belong to this
 * mod object. This is allowing for the following:
 *
 * mod/
 * mod.smod
 *
 * @private
 *
 * @return {Array.<string>}
 */
shed.mod.prototype.get_file_entries_ = function() {
  var all_file_entries = shed.filesystem.list(shed.setting.get('path') + 'mods');

  var file_entries = [];
  for (var i = 0; i < all_file_entries.length; i++) {
    if (
      all_file_entries[i] === this.name_ ||
      all_file_entries[i] === this.name_ + '.smod'
    ) {
      file_entries.push(all_file_entries[i]);
    }
  }

  return file_entries;
};


/**
 * Get a list of mods currently available in the mods folder.
 *
 * @return {Array.<shed.mod>}
 */
shed.mod.get_mods = function() {
  var mod_names = [];
  var reserved_mod_names = ['radiant', 'stonehearth'];

  var mods = [];
  var reserved_mods = [];
  // At this point we know where the mods folder is, so now get a list of
  // available mods.
  try {
    var file_entries = shed.filesystem.list(shed.setting.get('path') + 'mods');
  }
  catch (e) {
    return [];
  }
  for (var i = 0; i < file_entries.length; i++) {
    mod_names.push(file_entries[i].replace('.smod', ''));
  }
  mod_names = $.unique(mod_names);

  for (var i = 0; i < mod_names.length; ++i) {
    var mod = new shed.mod(mod_names[i]);
    if (reserved_mod_names.indexOf(mod_names[i]) !== -1) {
      reserved_mods.push(mod);
    }
    else {
      mods.push(mod);
    }
  }

  // TODO WART WAITING ON ROCKET TO IMPLEMENT THIS.
  mods.sort(function(a, b) {
    return alphanumCase(a.get_name(), b.get_name());
  });

  return reserved_mods.concat(mods);
};
