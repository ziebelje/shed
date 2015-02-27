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
  localStorage.path = path.replace(/\//g, '\\');
  if (localStorage.path.slice(-1) !== '\\') {
    localStorage.path = localStorage.path + '\\';
  }
};
