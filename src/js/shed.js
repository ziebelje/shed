var $ = rocket.extend(rocket.$, rocket);

$.ready(function() {
  // Should catch all errors.
  process.on('uncaughtException', function(error) {
    try {
      console.error(error);
      (new shed.view.error(error)).render();
    }
    catch (e) {}
  });

  // (new shed.view.mod_manager()).render();
  (new shed.view.main()).render();
});

var shed = {};


/**
 * Set the path to the SH installation folder.
 *
 * @param {string} path The path.
 */
shed.set_path = function(path) {
  var path = path.replace(/\//g, '\\');
  if (path.slice(-1) !== '\\') {
    path = path + '\\';
  }
  shed.setting.set('path', path);
};


/**
 * Iterate over a directory and execute an optional callback function on each
 * file and folder. Can be used to get file lists, recursively delete a
 * folder, etc.
 *
 * @param {string} directory
 * @param {Function=} opt_file_callback
 * @param {Function=} opt_directory_callback
 */
shed.walk = function(directory, opt_file_callback, opt_directory_callback) {
  var fs = require('fs');

  var walk = function(directory) {
    var files = fs.readdirSync(directory);
    for (var i = 0; i < files.length; i++) {
      var path = directory + '\\' + files[i];
      if (fs.lstatSync(path).isDirectory() === true) {
        walk(path);
        if (opt_directory_callback) {
          opt_directory_callback(path);
        }
      } else {
        if (opt_file_callback) {
          opt_file_callback(path);
        }
      }
    }
  };

  walk(directory);
};

shed.walk_synchronous = function(path, file_callback, directory_callback) {

}
