


/**
 * Tip to show to help nudge someone in the right direction.
 *
 * @param {string} text The text of the tip.
 *
 * @constructor
 */
shed.component.tip = function(text) {
  this.text_ = text;
  shed.component.apply(this, arguments);
};
$.inherits(shed.component.tip, shed.component);


/**
 * The tip text
 *
 * @type {string}
 *
 * @private
 */
shed.component.tip.prototype.text_;


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.tip.prototype.decorate_ = function(parent) {
  var todo = $.createElement('div').addClass('tip'); // TODO: This is for the sass namespace. I will be able to remove this once the frame is automatically adding this.

  var icon = $.createElement('img').setAttribute('src', 'img/tip.png');
  var text = $.createElement('h3').innerHTML(this.text_);

  todo.appendChild(icon);
  todo.appendChild(text);

  parent.appendChild(todo);
};
