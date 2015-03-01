var $ = rocket.extend(rocket.$, rocket);

$.ready(function() {
  // Should catch all errors.
  // process.on('uncaughtException', function(error) {
  //   try {
  //     console.error(error);
  //     (new shed.view.error(error)).render();
  //   }
  //   catch (e) {}
  // });

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
