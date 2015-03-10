


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
 * Get the number of files in the folder to be packed. This is only
 * asynchronous because get_unpack_count_ has to be.
 *
 * @param {Function} callback
 *
 * @private
 */
shed.mod.prototype.get_pack_count_ = function(callback) {
  var pack_count = 0;

  // TODO: Switch this to the async walker for speed improvement.

  shed.walk(
    this.get_directory_path_(),
    function(path) {
      pack_count++;
    },
    function(path) {
      pack_count++;
    }
  );

  callback(pack_count);
};


/**
 * Delete the mod directory. The node-way of recursing over the folder works
 * fine except that it's blocking and stops the UI from drawing the progress
 * bar while it works. I could do the delete asynchronously, but it would
 * require looping over everything, deleting all the files, then doing it all
 * again and deleting all the folders. This method would still be reasonably
 * quick. If I ever want to support not-windows I would need to do that.
 *
 * @param {Function} callback
 *
 * @private
 */
shed.mod.prototype.delete_directory_ = function(callback) {
  var exec = require('child_process').exec;
  var process = exec(
    'cmd /C rmdir /Q /S "' + this.get_directory_path_() + '"',
    function(error, stdout, stderr) {
      callback();
    }
  );

  /* Keeping this for future reference.
  var fs = require('fs');
  shed.walk(
    this.get_directory_path_(),
    function(path) {
      fs.unlinkSync(path);
    },
    function(path) {
      fs.rmdirSync(path);
    }
  );
  fs.rmdirSync(this.get_directory_path_());
  */
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
  var fs = require('fs');
  fs.unlink(this.get_smod_path_(), callback.bind(this));
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
