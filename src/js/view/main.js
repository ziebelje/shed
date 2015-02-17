


/**
 * Main
 *
 * @constructor
 */
shed.view.main = function() {
  shed.view.apply(this, arguments);
};
$.inherits(shed.view.main, shed.view);


/**
 * Decorate.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.main.prototype.decorate_ = function(parent) {
  if (localStorage.path === undefined || $.trim(localStorage.path) === '') {
    this.guess_path_();
  }

  var stonehearth_logo = $.createElement('img')
    .setAttribute('src', 'img/stonehearth_logo.png')
    .style({
      'display': 'block',
      'margin': '20px auto 20px auto',
      'width': '600px'
    });

  parent.appendChild(stonehearth_logo);

  var manage_mods_button = $.createElement('button')
    .addClass('button_main')
    .innerHTML('Manage Mods');
  parent.appendChild(manage_mods_button);

  manage_mods_button.addEventListener('click', function() {
    new shed.view.mod_manager();
  });

  var effect_editor_button = $.createElement('button')
    .addClass('button_main')
    .innerHTML('Effect Editor');
  parent.appendChild(effect_editor_button);

  effect_editor_button.addEventListener('click', function() {
    new shed.view.effect_editor();
  });

  var settings_button = $.createElement('button')
    .addClass('button_main')
    .innerHTML('Settings');
  parent.appendChild(settings_button);

  settings_button.addEventListener('click', function() {
    new shed.view.settings();
  });
};


/**
 * Try and guess where the Stonehearth folder is at. If this cannot be
 * guessed, the user will have to manually enter this value in.
 *
 * @private
 */
shed.view.main.prototype.guess_path_ = function() {
  var fs = require('fs');

  // Default steam and non-steam install locations.
  var possible_paths = [
    process.env['ProgramFiles'] + '\\Steam\\SteamApps\\common\\Stonehearth',
    process.env['ProgramFiles(x86)'] + '\\Steam\\SteamApps\\common\\Stonehearth',
    process.env['ProgramFiles'] + '\\Stonehearth',
    process.env['ProgramFiles(x86)'] + '\\Stonehearth'
  ];

  // Pick the first detected path.
  for (var i = 0; i < possible_paths.length; i++) {
    try {
      fs.readdirSync(possible_paths[i]);
      localStorage.path = possible_paths[i];
      localStorage.mod_path = possible_paths[i] + '\\mods\\stonehearth'; // TODO: For now...
      return;
    }
    catch (e) {}
  }
};
