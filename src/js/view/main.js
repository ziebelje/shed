


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
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.view.main.prototype.chain_ = 'view.main';


/**
 * Decorate.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.main.prototype.decorate_ = function(parent) {
  if (shed.setting.get('path') === null || $.trim(shed.setting.get('path')) === '') {
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
    (new shed.view.mod_manager()).render();
  });

  var effect_list_button = $.createElement('button')
    .addClass('button_main')
    .innerHTML('Effect Editor');
  parent.appendChild(effect_list_button);

  effect_list_button.addEventListener('click', function() {
    (new shed.view.effect_list()).render();
  });

  var settings_button = $.createElement('button')
    .addClass('button_main')
    .innerHTML('Settings');
  parent.appendChild(settings_button);

  settings_button.addEventListener('click', function() {
    (new shed.view.settings()).render();
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
      shed.set_path(possible_paths[i]);
      shed.setting.set('mod', 'stonehearth');
      return;
    }
    catch (e) {}
  }
};
