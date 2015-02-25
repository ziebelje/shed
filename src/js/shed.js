var $ = rocket.extend(rocket.$, rocket);

$.ready(function() {
  // Should catch all errors.
  process.on('uncaughtException', function(error) {
    console.error(error);
    (new shed.view.error(error)).render();
  });

  // (new shed.view.mod_manager()).render();
  (new shed.view.main()).render();
});

var shed = {};


/**
 * Attempts to read a file. If the file extension is .json, attempts to parse
 * the result.
 *
 * @param {string} file The file path.
 *
 * @return {Object|Buffer}
 */
shed.read_file = function(file) {
  try {
    var fs = require('fs');
    var contents = fs.readFileSync(file);
    if (file.substr(-5) === '.json') {
      contents = JSON.parse(contents);
    }
    return contents;
  }
  catch (e) {
    return null;
  }
};


/**
 * Watch a file/folder changes and call the callback if it changed. Note, this particular Node function is rather unstable and often triggers multiple times for a single change. Doing some throttling to help that.
 *
 * @param {string} file The file path.
 * @param {Function} callback The callback function.
 *
 * @return {fs.FSWatcher} The watcher object.
 */
shed.watch_file = function(file, callback) {
  var fs = require('fs');
  return fs.watch(file, {}, $.debounce(200, function() {
    callback();
  }));
};
