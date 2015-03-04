


/**
 * Extends frame.view so that I can add the title bar component on everything.
 *
 * @constructor
 */
shed.view = function() {
  frame.view.apply(this, arguments);
};
$.inherits(shed.view, frame.view);


/**
 * Render
 */
shed.view.prototype.render = function() {
  var global_container = $.createElement('div').addClass('global');

  // Title bar
  var title_bar_container = $.createElement('div');

  // View
  var chain = this.chain_.split('.');
  var containers = [];
  for (var i = 0; i < chain.length; i++) {
    var container = $.createElement('div').addClass(chain[i]);
    if (containers[containers.length - 1]) {
      containers[containers.length - 1].appendChild(container);
    }
    containers.push(container);
  }

  global_container.appendChild(title_bar_container);
  global_container.appendChild(containers[0]);

  frame.view.prototype.render.call(this, containers[containers.length - 1]);

  (new shed.component.title_bar(this.title_)).render(title_bar_container);
};
