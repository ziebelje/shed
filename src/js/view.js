


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
  var container = $.createElement('div').addClass('main');
  var title_bar_container = $.createElement('div');
  var view_container = $.createElement('div');

  container.appendChild(title_bar_container);
  container.appendChild(view_container);

  frame.view.prototype.render.call(this, container);

  (new shed.component.title_bar(this.title_)).render(title_bar_container);
};
