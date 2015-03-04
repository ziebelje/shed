


/**
 * A view is 100% of what is currently displayed.
 *
 * @constructor
 */
frame.view = function() {};
$.inherits(frame.view, rocket.EventTarget);


/**
 * The view stack.
 *
 * @type {Array.<view>}
 *
 * @private
 */
frame.view.stack_ = [];


/**
 * Create a container for the view and attach it to the body, replacing (if it
 * exists) the current view.
 *
 * @param {rocket.Elements=} opt_parent If provided, the actual view will be
 * rendered inside of this element. Then the top level element on the body
 * will be replaced with the topmost parent of this element.
 */
frame.view.prototype.render = function(opt_parent) {
  $.EventTarget.removeAllEventListeners();

  // Dispose of the currently rendered view (if any).
  if (frame.view.stack_.length > 0) {
    frame.view.stack_[frame.view.stack_.length - 1].dispose_();
  }

  // Add this view to the stack.
  if (frame.view.stack_[frame.view.stack_.length - 1] !== this) {
    frame.view.stack_.push(this);
  }

  // Create the container and decorate it by adding the title bar and then
  // decorating the view into it.
  // var container = attach_to_body ? attach_to_body : $.createElement('div');
  var parent = opt_parent ? opt_parent : $.createElement('div');
  this.decorate_(parent);

  var attach_to_body = parent;
  while (attach_to_body.parentNode().length !== 0) {
    attach_to_body = attach_to_body.parentNode();
  }

  var body = $('body');
  var first_element_child = body.firstElementChild();
  if (first_element_child.length === 0) {
    body.appendChild(attach_to_body);
  }
  else {
    body.replaceChild(attach_to_body, first_element_child);
  }

  // Dispatch the render event so subclasses can listen on this to do things
  // like focus inputs once the view is rendered.
  this.dispatchEvent('render');
};


/**
 * Rerender the current view.
 */
frame.view.prototype.rerender = function() {
  frame.view.stack_.pop().dispose_();
  this.render();
};


/**
 * Dispose the view on the top of the stack and render the next one down.
 */
frame.view.render_previous = function() {
  frame.view.stack_.pop().dispose_();
  frame.view.stack_[frame.view.stack_.length - 1].render();
};


/**
 * Get the stack of views.
 *
 * @return {Array.<frame.view>}
 */
frame.view.get_stack = function() {
  return frame.view.stack_;
};


/**
 * Decorate the current view.
 *
 * @param {rocket.Elements} parent The element to decorate.
 *
 * @private
 */
frame.view.prototype.decorate_ = function(parent) {};


/**
 * Dispose the current view.
 *
 * @private
 */
frame.view.prototype.dispose_ = function() {};
