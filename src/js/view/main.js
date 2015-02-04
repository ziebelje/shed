shed.view.main = function() {
  shed.view.apply(this, arguments);
}
$.inherits(shed.view.main, shed.view);

shed.view.main.prototype.decorate_ = function(parent) {
  if(localStorage.path === undefined || $.trim(localStorage.path) === '') {
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
    .addClass('button_red')
    .innerHTML('Manage Mods');
  parent.appendChild(manage_mods_button);

  manage_mods_button.addEventListener('click', function() {
    new shed.view.mod_manager();
  });

  var settings_button = $.createElement('button')
    .addClass('button_red')
    .innerHTML('Settings');
  parent.appendChild(settings_button);

  settings_button.addEventListener('click', function() {
    new shed.view.settings();
  });

  // Footer
  var table = new jex.table({'rows': 1, 'columns': 2});
  table.table().addClass('main_footer');

  var jonzoid_image = $.createElement('img')
    .setAttribute('src', 'img/jonzoid.png');
  table.td(0, 0).appendChild(jonzoid_image);

  var message = $.createElement('p')
    .innerHTML('Hi, I\'m Jonzoid! SHED is an unofficial tool pack for Stonehearth. Please let me know if you have any feedback or ideas by getting in touch with me on the Stonehearth Discourse. Thanks!');
  table.td(1, 0).appendChild(message);

  parent.appendChild(table.table());
};


/**
 * Try and guess where the Stonehearth folder is at. If this cannot be
 * guessed, the user will have to manually enter this value in.
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
  for(var i = 0; i < possible_paths.length; i++) {
    try {
      fs.readdirSync(possible_paths[i]);
      localStorage.path = possible_paths[i];
      return;
    }
    catch(e) {}
  }
};
