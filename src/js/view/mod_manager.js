


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

  parent.appendChild($.createElement('p').innerHTML('Drag & drop mods in this window to install. Use buttons in listing to manage mods.'));

  this.mods_ = shed.mod.get_mods();

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

  this.add_drag_handlers_();

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

  var table = new jex.table({'rows': this.mods_.length + 1, 'columns': 4, 'header': true});
  table.table()
    .style({
      'margin': 'auto',
      'width': '100%',
      'table-layout': 'fixed'
    });

  table.td(1, 0).style('width', '80px');
  table.td(2, 0).style('width', '150px');
  table.td(3, 0).style('width', '250px');

  table.fill_row(0, [null, 'SMOD', 'Unpacked']);

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

    var pack_button = $.createElement('button')
      .innerHTML('SMOD')
      .style('margin-right', '5px')
      .addClass('pack_button')
      .dataset('mod_id', i)
      .disabled(this.mods_[i].has_directory() === false);

    var unpack_button = $.createElement('button')
      .innerHTML('Unpack')
      .dataset('mod_id', i)
      .addClass('unpack_button')
      .disabled(this.mods_[i].has_smod() === false);


    table.td(3, i + 1).style('text-align', 'right').appendChild(pack_button);
    table.td(3, i + 1).style('text-align', 'right').appendChild(unpack_button);
  }

  table.table().live('.pack_button', 'click', function() {
    var callback = function() {
      if (modal !== undefined) {
        modal.dispose();
      }

      var progress = new shed.component.progress();
      progress.set_text('Creating SMOD...');
      progress.render($('.view'));

      mod.addEventListener('pack_progress', function() {
        progress.set_progress(mod.get_pack_progress());
      });
      mod.pack(function(error) {
        if (error !== null) {
          throw new Error('SMOD creation failed: ' + error);
        }
        else {
          progress.set_progress(100, self.rerender.bind(self));
        }
      });
    };

    // TODO: get rid of the mod_id stuff
    var mod = self.mods_[$(this).dataset('mod_id')];

    if (mod.has_smod() === true) {
      var modal = new shed.component.modal(
        'Are you sure?',
        'This SMOD file already exists. Overwrite?',
        [
          {
            'text': 'Cancel',
            'callback': function() { modal.dispose(); }
          },
          {
            'text': 'Yes, overwrite',
            'callback': callback.bind(this)
          }
        ]
      );
      modal.render($('.view'));
    }
    else {
      callback();
    }
  });

  table.table().live('.unpack_button', 'click', function() {
    var callback = function() {
      if (modal !== undefined) {
        modal.dispose();
      }

      var progress = new shed.component.progress();
      progress.set_text('Unpacking...');
      progress.render($('.view'));

      mod.addEventListener('unpack_progress', function() {
        progress.set_progress(mod.get_unpack_progress());
      });
      mod.unpack(function(error) {
        if (error !== null) {
          throw new Error('Unpack failed: ' + error);
        }
        else {
          progress.set_progress(100, self.rerender.bind(self));
        }
      });
    };

    // TODO: get rid of the mod_id stuff
    var mod = self.mods_[$(this).dataset('mod_id')];

    if (mod.has_directory() === true) {
      var modal = new shed.component.modal(
        'Are you sure?',
        'This mod has already been unpacked. Overwrite?',
        [
          {
            'text': 'Cancel',
            'callback': function() { modal.dispose(); }
          },
          {
            'text': 'Yes, overwrite',
            'callback': callback.bind(this)
          }
        ]
      );
      modal.render($('.view'));
    }
    else {
      callback();
    }
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
 * Add the drag handlers for uploading dragging and dropping mods.
 *
 * @private
 */
shed.view.mod_manager.prototype.add_drag_handlers_ = function() {
  var self = this;

  var mask = $.createElement('div')
    .style({
      'font-family': 'Grobold',
      'text-align': 'center',
      'padding-top': '250px',
      'font-size': '22px', // These styles will get cleaned up when I switch this over to the mask component.
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'width': '100%',
      'height': '100%',
      'background': 'rgba(0, 0, 0, 0.5)',
      'z-index': '1000'
    })
    .innerHTML('Drop mod here to install');

  var body_dragover = function(e) {
    $('.view').appendChild(mask);
    $('body').removeEventListener('dragover');
    mask.addEventListener('dragover', mask_dragover);

    e.preventDefault();
    return false;
  };

  var mask_dragover = function(e) {
    // This doesn't do anything other than actually enable the drag/drop
    // functionality in the browser.
    e.preventDefault();
    return false;
  };

  var dragleave = function(e) {
    $('.view').removeChild(mask);

    // The dragover event will fire on the body even when I drag onto the
    // border. There might be a more elegant solution for this, but removing the
    // listener and only re-adding it after the user has had time to move their
    // mouse past the border works decently well.
    setTimeout(function() {
      $('body').addEventListener('dragover', body_dragover);
    }, 200);

    e.preventDefault();
    return false;
  };

  var drop = function(e) {
    $('.view').removeChild(mask);
    $('body').addEventListener('dragover', body_dragover);

    if (e.originalEvent.dataTransfer.files.length > 1) {
      var modal = new shed.component.modal(
        'Error',
        'Only one mod may be installed at a time.',
        [
          {
            'text': 'Oops, sorry!',
            'callback': function() { modal.dispose(); }
          }
        ]
      );
      modal.render($('.view'));
    }
    else {
      self.upload_mod_(e.originalEvent.dataTransfer.files[0]);
    }

    e.preventDefault();
    return false;
  };

  $('body').addEventListener('dragover', body_dragover);
  mask.addEventListener('dragleave', dragleave);
  mask.addEventListener('drop', drop);
};


/**
 * Upload a mod to the SH mods folder.
 *
 * @param {Object} file File to copy from the drop event handler.
 *
 * @private
 */
shed.view.mod_manager.prototype.upload_mod_ = function(file) {
  var self = this;

  var bytes_to_copy = 0;
  var bytes_copied = 0;

  var progress = new shed.component.progress();

  var update_progress = function() {
    progress.set_progress(bytes_copied / bytes_to_copy * 100);
    if (bytes_copied === bytes_to_copy) {
      progress.set_progress(100, self.rerender.bind(self));
    }
  };

  var copy = function() {
    if (modal !== undefined) {
      modal.dispose();
    }

    progress.set_text('Preparing...');
    progress.render($('.view'));

    // Get the size of the files/folders to copy and start the copy when that's
    // done.
    shed.filesystem.get_size_asynchronous(
      file.path,
      function(size) {
        bytes_to_copy += size;
        progress.set_text('Installing...');
        shed.filesystem.copy(
          file.path,
          shed.setting.get('path') + 'mods',
          function(bytes) {
            bytes_copied += bytes;
            update_progress();
          }
        );
      }
    );
  };

  var name = file.path.substring(
    file.path.lastIndexOf('\\') + 1,
    file.path.length
  );

  var destination = shed.setting.get('path') + 'mods\\' + name;

  if (shed.filesystem.exists(destination) === true) {
    var modal = new shed.component.modal(
      'Are you sure?',
      'You already have a mod installed named ' + name + '. Overwrite?',
      [
        {
          'text': 'Cancel',
          'callback': function() { modal.dispose(); }
        },
        {
          'text': 'Yes, overwrite',
          'callback': copy.bind(this)
        }
      ]
    );
    modal.render($('.view'));
  }
  else {
    copy();
  }
};
