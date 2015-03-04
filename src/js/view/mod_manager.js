


/**
 * Mod manager
 *
 * @constructor
 */
shed.view.mod_manager = function() {
  shed.view.apply(this, arguments);
};
$.inherits(shed.view.mod_manager, shed.view);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.view.mod_manager.prototype.chain_ = 'view.mod_manager';


/**
 * Mod list
 *
 * @private
 */
shed.view.mod_manager.prototype.mods_;


/**
 * Title
 *
 * @type {string}
 *
 * @private
 */
shed.view.mod_manager.prototype.title_ = 'Manage Mods';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.mod_manager.prototype.decorate_ = function(parent) {
  var self = this;

  this.mods_ = this.get_mods_();

  var mods_table = $.createElement('div').addClass('mods_table');

  if (this.mods_.length > 0) {
    this.decorate_mods_table_(mods_table);
  }
  else {
    (new shed.component.none(
      'No mods found',
      'Make sure your Stonehearth installation directory is set properly in settings.'
    )).render(mods_table);
  }

  parent.appendChild(mods_table);

  this.decorate_path_(parent);
};


/**
 * Decorate list of mods.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.mod_manager.prototype.decorate_mods_table_ = function(parent) {
  var self = this;

  var table = new jex.table({'rows': this.mods_.length + 1, 'columns': 6, 'header': true});
  table.table()
    .style({
      'margin': 'auto',
      'width': '100%',
      'table-layout': 'fixed'
    });

  table.td(1, 0).style('width', '80px');
  table.td(2, 0).style('width', '150px');
  table.td(3, 0).style('width', '65px');
  table.td(4, 0).style('width', '125px');
  table.td(5, 0).style('width', '150px');

  table.fill_row(0, [null, 'SMOD', 'Unpacked', 'Enabled', 'Loaded']);

  for (var i = 0; i < this.mods_.length; ++i) {
    table.td(0, i + 1)
      .style({'text-overflow': 'ellipsis', 'white-space': 'nowrap', 'overflow': 'hidden'})
      .innerHTML(this.mods_[i].get_name());


    if (this.mods_[i].has_smod() === true) {
      var has_smod_green_check = $.createElement('img')
        .setAttribute('src', 'img/green_check.png')
        .style('width', '45px');

      table.td(1, i + 1)
        .style('text-align', 'center')
        .appendChild(has_smod_green_check);

    }

    if (this.mods_[i].has_directory() === true) {
      var has_directory_green_check = $.createElement('img')
        .setAttribute('src', 'img/green_check.png')
        .style('width', '45px');

      table.td(2, i + 1)
        .style('text-align', 'center')
        .appendChild(has_directory_green_check);

    }

    var enabled_checkbox = $.createElement('input')
      .setAttribute('type', 'checkbox')
      .addClass(['checkbox', 'enabled_checkbox'])
      .dataset('mod_id', i);

    table.td(3, i + 1)
      .style('text-align', 'center')
      .appendChild(enabled_checkbox);

    if (this.mods_[i].is_enabled() === true) {
      enabled_checkbox.checked(true);
    }

    var loaded_radio = $.createElement('input')
      .setAttribute({'type': 'radio', 'name': 'loaded'})
      .addClass(['radio', 'loaded_radio'])
      .dataset('mod_id', i);

    table.td(4, i + 1)
      .style('text-align', 'center')
      .appendChild(loaded_radio);

    if (this.mods_[i].get_name() === shed.setting.get('mod')) {
      loaded_radio.checked(true);
    }

    var pack_button = $.createElement('button')
      .innerHTML('SMOD')
      .style('margin-right', '5px')
      .addClass('pack_button')
      .dataset('mod_id', i);

    var unpack_button = $.createElement('button')
      .innerHTML('Unpack')
      .dataset('mod_id', i)
      .addClass('unpack_button');


    table.td(5, i + 1).style('text-align', 'right').appendChild(pack_button);
    table.td(5, i + 1).style('text-align', 'right').appendChild(unpack_button);
  }

  table.table().live('.enabled_checkbox', 'change', function() {
    var enabled_checkbox = $(this);
    var mod_id = enabled_checkbox.dataset('mod_id');
    if (enabled_checkbox.checked() === true) {
      self.mods_[mod_id].enable();
    }
    else {
      self.mods_[mod_id].disable();
    }
  });

  table.table().live('.loaded_radio', 'change', function() {
    var loaded_radio = $(this);
    var mod_id = loaded_radio.dataset('mod_id');
    shed.setting.set('mod', self.mods_[mod_id].get_name());
  });

  table.table().live('.pack_button', 'click', function() {
    self.mods_[$(this).dataset('mod_id')].pack(function() {
      self.render();
    });
  });

  table.table().live('.unpack_button', 'click', function() {
    self.mods_[$(this).dataset('mod_id')].unpack(function() {
      self.render();
    });
  });

  parent.appendChild(table.table());
};


/**
 * Decorate the mod path at the bottom of the window.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.mod_manager.prototype.decorate_path_ = function(parent) {
  var path_table = new jex.table({'rows': 1, 'columns': 2});
  path_table.table().style('width', '100%');

  var path_input = $.createElement('input')
    .style('width', '100%')
    .value(shed.setting.get('path') + 'mods')
    .setAttribute({'type': 'text', 'disabled': 'disabled'});
  path_table.td(0, 0).appendChild(path_input);

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
 * Get a list of mods currently available in the mods folder.
 *
 * @return {Array.<shed.mod>}
 *
 * @private
 */
shed.view.mod_manager.prototype.get_mods_ = function() {
  var fs = require('fs');

  var mod_names = [];
  var mods = [];
  // At this point we know where the mods folder is, so now get a list of
  // available mods.
  try {
    var file_entries = fs.readdirSync(shed.setting.get('path') + 'mods');
  }
  catch (e) {
    return [];
  }
  for (var i = 0; i < file_entries.length; i++) {
    mod_names.push(file_entries[i].replace('.smod', '').replace('.disabled', ''));
  }
  mod_names = $.unique(mod_names);

  for (var i = 0; i < mod_names.length; ++i) {
    var mod = new shed.mod(mod_names[i]);
    mods.push(mod);
  }

  // Sort the mods and stick stonehearth/radiant up top.
  mods.sort(function(a, b) {
    if (b.get_name() === 'stonehearth') {
      return 3;
    }
    else if (b.get_name() === 'radiant') {
      return 2;
    }
    else {
      return a.get_name().toLowerCase() > b.get_name().toLowerCase();
    }
  });

  return mods;
};
