/**
 * A group of elements that serves a specific purpose.
 */
shed.component = function() {};
$.inherits(shed.component, rocket.EventTarget);


/**
 * The rendered container for this component.
 *
 * @type {rocket.Elements}
 */
shed.component.prototype.container_


/**
 * Render the component.
 *
 * @param {rocket.Elements} parent The parent element render into.
 */
shed.component.prototype.render = function(parent) {
  var container = $.createElement('div');
  this.container_ = container;
  this.decorate_(container);
  parent.appendChild(container);
};


/**
 * Re-render the component.
 */
shed.component.prototype.render_replace = function() {
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
shed.component.prototype.dispose = function() {
  this.container_.parentNode().removeChild(this.container_);
};
