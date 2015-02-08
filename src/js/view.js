/**
 * A view is a representation of the entire page. It is composed of individual
 * elements or larger groups of elements called components. All child classes
 * should at the very least override the private decorate_() method which is
 * what should describe what goes on the page. Creating a new view will
 * automatically render it.
 */
shed.view = function() {
  var self = this;

  this.render_();
  shed.view.current_view_ = this;

}
$.inherits(shed.view, rocket.EventTarget);


/**
 * The container that we're displaying the current view in.
 *
 * @type {rocket.Elements}
 */
shed.view.current_container_;


/**
 * The current view itself.
 */
shed.view.current_view_;


/**
 * Create a container for the view and attach it to the body, replacing (if it
 * exists) the current view.
 *
 * @param {boolean} opt_keep_event_listeners If set to true, rendering this
 * view will not clear the event listeners. This should really only be used on
 * the loading screen because the loading view renders before the API call
 * returns, which would otherwise remove that event listener and then we would
 * be loading forever.
 */
shed.view.prototype.render_ = function(opt_keep_event_listeners) {
  // Before rendering anything, remove all existing event listeners.
  if(opt_keep_event_listeners !== true) {
    $.EventTarget.removeAllEventListeners();
  }

  // Create the container and decorate it by adding the title bar and then
  // decorating the view into it.
  var new_container = $.createElement('div').addClass('box');

  var title_bar = new shed.component.title_bar(this.title_);
  title_bar.render(new_container);

  this.decorate_(new_container);

  // Attach the new view to the body (replace the old one if it exists).
  if(shed.view.current_container_) {
    $('body').replaceChild(new_container, shed.view.current_container_);
  }
  else {
    $('body').appendChild(new_container);
  }

  // Update the current view with the new one.
  shed.view.current_container_ = new_container;

  // Scroll to top of page.
  // document.body.scrollTop = document.documentElement.scrollTop = 0;

  // Dispatch the render event so subclasses can listen on this to do things
  // like focus inputs once the layer is rendered.
  this.dispatchEvent('render');
}


/**
 * This method should be overridden by child classes. The render_() function
 * calls this.
 *
 * @param {rocket.Elements} parent The element to decorate.
 */
shed.view.prototype.decorate_ = function(parent) {
  parent.innerHTML('You need to override this function.');
}
