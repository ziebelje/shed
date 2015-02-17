


/**
 * A mod.
 *
 * @param {string} name The name of the mod.
 *
 * TODO: Probably create this using a file path instead of a name and then get
 * all of the attributes that way. That's how the new effects/cubemitters
 * work.
 *
 * @constructor
 */
shed.mod = function(name) {
  this.name_ = name;
};


/**
 * The name of the mod.
 */
shed.mod.prototype.name_;


/**
 * Get the name of the mod.
 *
 * @return {string}
 */
shed.mod.prototype.get_name = function() {
  return this.name_;
};


/**
 * Zip up a mod folder. http://stackoverflow.com/a/16099450
 *
 * TODO: See TODOs and comments on unpack.
 *
 * @param {Function} callback
 */
shed.mod.prototype.pack = function(callback) {
  if (this.is_disabled() === true) {
    throw 'disable this';
  }

  var folder_name = localStorage.path + '\\mods\\' + this.name_;
  var smod_name = localStorage.path + '\\mods\\' + this.name_ + '.smod';

  var spawn = require('child_process').spawn;
  var process = spawn(
    'tool/7z/7z.exe',
    [
      'a',
      '-tzip',
      smod_name,
      folder_name
    ]
  );

  process.stderr.setEncoding('utf8');
  process.stderr.on('data', function(data) {}); // Prevents buffer overflow

  process.stdout.setEncoding('utf8');
  process.stdout.on('data', function(data) {}); // Prevents buffer overflow

  process.on('close', function(code) {
    callback();
  });
};


/**
 * Unzip a smod archive. http://stackoverflow.com/a/16099450
 *
 * TODO: Handle errors
 * TODO: Handle overwriting
 * TODO: Show spinner on frontend while this is working
 * TODO: Optionally show 7zip output while it's extracting?
 *
 * @param {Function} callback
 */
shed.mod.prototype.unpack = function(callback) {
  if (this.is_disabled() === true) {
    throw 'disable this';
  }

  var folder_name = localStorage.path + '\\mods\\';
  var smod_name = localStorage.path + '\\mods\\' + this.name_ + '.smod';

  // Spawn will run an asynchronous process (using the same nw module) and
  // return a data stream. I'm not using the stream right now, but if I wanted
  // to display live output from 7zip as it extracts then I could do so. I am
  // calling the stderr and stdout functions here because it seems to overflow
  // the buffer when operating on stonehearth.smod otherwise.
  var spawn = require('child_process').spawn;
  var process = spawn(
    'tool/7z/7z.exe',
    [
      'x',
      smod_name,
      '-o' + folder_name
    ]
  );

  process.stderr.setEncoding('utf8');
  process.stderr.on('data', function(data) {}); // Prevents buffer overflow

  process.stdout.setEncoding('utf8');
  process.stdout.on('data', function(data) {}); // Prevents buffer overflow

  process.on('close', function(code) {
    callback();
  });
};


/**
 * Enable a mod by removing ".disabled" to the end of it's directories or smod
 * packages.
 */
shed.mod.prototype.enable = function() {
  var fs = require('fs');
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    if (file_entries[i].substr(-9) === '.disabled') {
      var old_name = localStorage.path + '\\mods\\' + file_entries[i];
      var new_name = localStorage.path + '\\mods\\' + file_entries[i].replace('.disabled', '');
      fs.renameSync(old_name, new_name);
    }
  }
};


/**
 * Disable a mod by appending ".disabled" to the end of it's directories or smod
 * packages.
 */
shed.mod.prototype.disable = function() {
  var fs = require('fs');
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    if (file_entries[i].substr(-9) !== '.disabled') {
      var old_name = localStorage.path + '\\mods\\' + file_entries[i];
      var new_name = localStorage.path + '\\mods\\' + file_entries[i] + '.disabled';
      fs.renameSync(old_name, new_name);
    }
  }
};


/**
 * Check to see whether or not this mod is disabled. This looks at both
 * directories and smods and looks for them to end with .disabled. Note that
 * if you name something "stonehearth.whatever", it won't be returned in the
 * file entries array anyways so that still counts as disabled.
 *
 * @return {Boolean}
 */
shed.mod.prototype.is_disabled = function() {
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    if (file_entries[i].substr(-9) !== '.disabled') {
      return false;
    }
  }

  return true;
};


/**
 * Check to see whether or not this mod is enabled. See shed.mod.is_disabled()
 * for more info.
 *
 * @return {Boolean} [description]
 */
shed.mod.prototype.is_enabled = function() {
  return !this.is_disabled();
};


/**
 * Determine if this mod has a directory package.
 *
 * @return {Boolean}
 */
shed.mod.prototype.has_directory = function() {
  var fs = require('fs');
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    var stat = fs.statSync(localStorage.path + '\\mods\\' + file_entries[i]);
    if (stat.isDirectory() === true) {
      return true;
    }
  }

  return false;
};


/**
 * Determine if this mod has an .smod package.
 *
 * @return {Boolean}
 */
shed.mod.prototype.has_smod = function() {
  var fs = require('fs');
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    var stat = fs.statSync(localStorage.path + '\\mods\\' + file_entries[i]);
    if (stat.isFile() === true && file_entries[i].indexOf('.smod') !== -1) {
      return true;
    }
  }

  return false;
};


/**
 * Get a list of file entries (files or folders) that seem to belong to this
 * mod object. This is allowing for the following:
 *
 * mod/
 * mod.disabled/
 * mod.smod
 * mod.smod.disabled
 *
 * @private
 *
 * @return {Array.<string>}
 */
shed.mod.prototype.get_file_entries_ = function() {
  var fs = require('fs');
  var all_file_entries = fs.readdirSync(localStorage.path + '\\mods');

  var file_entries = [];
  for (var i = 0; i < all_file_entries.length; i++) {
    if (
      all_file_entries[i] === this.name_ ||
      all_file_entries[i] === this.name_ + '.disabled' ||
      all_file_entries[i] === this.name_ + '.smod' ||
      all_file_entries[i] === this.name_ + '.smod.disabled'
    ) {
      file_entries.push(all_file_entries[i]);
    }
  }

  return file_entries;
};
