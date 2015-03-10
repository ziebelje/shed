


/**
 * Extends frame.component for the sake of consistency since I also have
 * shed.view.
 *
 * @constructor
 */
shed.component = function() {};
$.inherits(shed.component, frame.component);


/**
 * Render
 *
 * @param {rocket.Elements} parent
 */
shed.component.prototype.render = function(parent) {
  var chain = this.chain_.split('.');
  var containers = [];
  for (var i = 0; i < chain.length; i++) {
    var container = $.createElement('div').addClass(chain[i]);
    if (containers[containers.length - 1]) {
      containers[containers.length - 1].appendChild(container);
    }
    containers.push(container);
  }

  parent.appendChild(containers[0]);

  frame.component.prototype.render.call(this, containers[containers.length - 1]);
};
