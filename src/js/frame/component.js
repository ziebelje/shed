


/**
 * A group of elements that serves a specific purpose.
 *
 * @constructor
 */
frame.component = function() {};
$.inherits(frame.component, rocket.EventTarget);


/**
 * The rendered container for this component.
 *
 * @type {rocket.Elements}
 */
frame.component.prototype.container_;


/**
 * Render the component.
 *
 * @param {rocket.Elements} parent The parent element render into.
 */
frame.component.prototype.render = function(parent) {
  var container = $.createElement('div').style('position', 'relative');
  this.container_ = container;
  this.decorate_(container);
  parent.appendChild(container);
};


/**
 * Re-render the component.
 */
frame.component.prototype.rerender = function() {
  var parent = this.container_.parentNode();
  var old_container = this.container_;
  var new_container = $.createElement('div');
  this.decorate_(new_container);
  parent.replaceChild(new_container, old_container);
  this.container_ = new_container;
};


/**
 * Dispose the component by removing it from the DOM.
 */
frame.component.prototype.dispose = function() {
  this.container_.parentNode().removeChild(this.container_);
};
