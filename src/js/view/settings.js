


/**
 * SHED Settings.
 *
 * @constructor
 */
shed.view.settings = function() {
  shed.view.apply(this, arguments);
};
$.inherits(shed.view.settings, shed.view);


/**
 * View title.
 *
 * @type {string}
 *
 * @private
 */
shed.view.settings.prototype.title_ = 'Settings';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.settings.prototype.decorate_ = function(parent) {
  var self = this;

  var path_header = $.createElement('h2').innerHTML('Stonehearth Installation Directory');
  parent.appendChild(path_header);

  var path_table = new jex.table({'rows': 1, 'columns': 2});
  path_table.table().style('width', '100%');

  var path_input = $.createElement('input')
    .addClass('settings_path')
    .value(localStorage.path)
    .setAttribute('type', 'text');
  if (this.path_is_valid_() === true) {
    path_input.addClass('settings_path_valid');
  }
  else {
    path_input.addClass('settings_path_invalid');
  }

  path_table.td(0, 0).appendChild(path_input);

  path_input.addEventListener('blur', function() {
    localStorage.path = $(this).value();
    localStorage.mod_path = $(this).value() + '\\mods\\stonehearth'; // TODO: For now...
    self.render_();
  });

  var open_path_icon = $.createElement('img')
    .style('cursor', 'pointer')
    .setAttribute('src', 'img/forward.png');
  path_table.td(1, 0)
    .style({'width': '50px', 'text-align': 'right'})
    .appendChild(open_path_icon);

  open_path_icon.addEventListener('click', function() {
    var gui = require('nw.gui');
    gui.Shell.openExternal(path_input.value());
  });

  parent.appendChild(path_table.table());
};


/**
 * Return whether or not an installation path is valid by checking for the
 * presence of Stonehearth.exe.
 *
 * @return {boolean}
 *
 * @private
 */
shed.view.settings.prototype.path_is_valid_ = function() {
  try {
    var fs = require('fs');
    var files = fs.readdirSync(localStorage.path);
    if ($.indexOf(files, 'Stonehearth.exe') === -1) {
      // Stonehearth.exe does not exist inside directory
      return false;
    }
    else {
      return true;
    }
  }
  catch (e) {
    // Could not read directory
    return false;
  }
};
