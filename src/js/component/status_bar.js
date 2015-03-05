


/**
 *
 *
 * @constructor
 */
shed.component.status_bar = function() {
  shed.component.apply(this, arguments);
};
$.inherits(shed.component.status_bar, shed.component);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.status_bar.prototype.chain_ = 'component.status_bar';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.status_bar.prototype.decorate_ = function(parent) {
  // TODO: Display errors on here if SH folder is wrong or if no mods, etc.

  var status_bar = $.createElement('div').addClass('status_bar');

  var table = new jex.table({'rows': 1, 'columns': 3});
  table.table().style('width', '100%');

  // Launch button
  var launch = $.createElement('img')
    .setAttribute('src', 'img/launch.png')
    .addClass('launch');
  launch.addEventListener('click', function() {
    // TODO error handling if this doesn't exist

    // TODO: Make this open a modal with a list of profiles. That will also
    // serve as the confirm box. This could get annoying during testing, so
    // maybe add an option to always launch with a certain default profile.
    // require('nw.gui').Shell.openItem(shed.setting.get('path') + 'stonehearth.exe');
    alert('launched...');
  });
  table.td(0, 0).appendChild(launch);


  // var profile_select = $.createElement('select');
  // profile_select.appendChild($.createElement('option').innerHTML('Profile 1'));
  // profile_select.appendChild($.createElement('option').innerHTML('Profile 2'));
  table.td(0, 0).style({'width': '660px', 'padding-left': '55px'});
  table.td(0, 0).appendChild($.createElement('span').innerHTML('Launch Stonehearth'));

  table.td(1, 0).style({'width': '110px'});
  // table.td(1, 0).innerHTML('Current Mod');

  var mods = shed.mod.get_mods();
  var mod_select = $.createElement('select');
  for (var i = 0; i < mods.length; i++) {
    var option = $.createElement('option')
      .value(mods[i].get_name())
      .innerHTML(mods[i].get_name());

    if (shed.setting.get('mod') === mods[i].get_name()) {
      option.setAttribute('selected', 'selected');
    }

    mod_select.appendChild(option);
  }
  mod_select.addEventListener('change', function() {
    shed.setting.set('mod', $(this).value());
    shed.view.rerender();
    // TODO: Rerendering certain views (like viewing an effect) is no good
  });
  // table.td(2, 0).appendChild(mod_select);

  status_bar.appendChild(table.table());

  parent.appendChild(status_bar);
};
