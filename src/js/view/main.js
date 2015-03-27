


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
