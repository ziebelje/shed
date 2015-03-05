


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
 * @param {Function} callback
 */
shed.mod.prototype.pack = function(callback) {
  var folder_name = shed.setting.get('path') + 'mods\\' + this.name_;
  var smod_name = shed.setting.get('path') + 'mods\\' + this.name_ + '.smod';

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
 * @param {Function} callback
 */
shed.mod.prototype.unpack = function(callback) {
  var folder_name = shed.setting.get('path') + 'mods\\';
  var smod_name = shed.setting.get('path') + 'mods\\' + this.name_ + '.smod';

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
 * Determine if this mod has a directory.
 *
 * @return {boolean}
 */
shed.mod.prototype.has_directory = function() {
  var fs = require('fs');
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    var stat = fs.statSync(shed.setting.get('path') + 'mods\\' + file_entries[i]);
    if (stat.isDirectory() === true) {
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
  var fs = require('fs');
  var file_entries = this.get_file_entries_();

  for (var i = 0; i < file_entries.length; i++) {
    var stat = fs.statSync(shed.setting.get('path') + 'mods\\' + file_entries[i]);
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
 * mod.smod
 *
 * @private
 *
 * @return {Array.<string>}
 */
shed.mod.prototype.get_file_entries_ = function() {
  var fs = require('fs');
  var all_file_entries = fs.readdirSync(shed.setting.get('path') + 'mods');

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
  var fs = require('fs');

  var mod_names = [];
  var mods = [];
  // At this point we know where the mods folder is, so now get a list of
  // available mods.
  try {
    var file_entries = fs.readdirSync(shed.setting.get('path') + 'mods');
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
    mods.push(mod);
  }

  // Sort the mods and stick stonehearth/radiant up top.
  mods.sort(function(a, b) {
    var order = ['radiant', 'stonehearth']; // Inverted, but both of these will sort to the top.
    var a_index = order.indexOf(a.get_name());
    var b_index = order.indexOf(b.get_name());

    if (a_index === -1 && b_index === -1) {
      return a.get_name().toLowerCase() > b.get_name().toLowerCase();
    }
    else {
      return a_index < b_index;
    }
  });

  return mods;
};
