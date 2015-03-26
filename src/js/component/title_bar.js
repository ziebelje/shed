


/**
 * Title bar that acts as the window drag handle and container for minimize,
 * close.
 *
 * @param {string} title The title to display. Each view needs to set a
 * private title_ property.
 *
 * @constructor
 */
shed.component.title_bar = function(title) {
  this.title_ = title;
  shed.component.apply(this, arguments);
};
$.inherits(shed.component.title_bar, shed.component);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.title_bar.prototype.chain_ = 'component.title_bar';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.title_bar.prototype.decorate_ = function(parent) {
  var table = new jex.table({'rows': 1, 'columns': 3});
  table.table().style('width', '100%');

  var gui = require('nw.gui');
  var win = gui.Window.get();

  var refresh = $.createElement('button').innerHTML('R');
  refresh.addEventListener('click', function() {
    window.location.reload();
  });

  var dev_tools = $.createElement('button').innerHTML('D');
  dev_tools.addEventListener('click', function() {
    win.showDevTools();
  });

  var minimize = $.createElement('button').innerHTML('_');
  minimize.addEventListener('click', function() {
    win.minimize();
  });

  var close = $.createElement('button').innerHTML('X').addClass('button_red');
  close.addEventListener('click', function() {
    win.close();
  });

  if (frame.view.get_stack().length > 1) {
    var back = $.createElement('img')
      .setAttribute('src', 'img/arrow_left.png')
      .addClass('back');
    back.addEventListener('click', function() {
      frame.view.render_previous();
    });
    table.td(0, 0).style('width', '30px');
    table.td(0, 0).appendChild(back);
  }

  var title = $.createElement('span').innerHTML('SHED (Unofficial)' + ((this.title_) ? ' - ' + this.title_ : ''));
  table.td(1, 0).appendChild(title);

  table.td(2, 0).style('text-align', 'right');
  table.td(2, 0).appendChild(close);
  table.td(2, 0).appendChild(minimize);
  // table.td(2, 0).appendChild(dev_tools);
  // table.td(2, 0).appendChild(refresh);

  var title = $.createElement('div').addClass('title');
  title.appendChild(table.table());
  parent.appendChild(title);
};
