


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
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.tip.prototype.chain_ = 'component.tip';


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
  var icon = $.createElement('img').setAttribute('src', 'img/tip.png');
  var text = $.createElement('h3').innerHTML(this.text_);

  parent.appendChild(icon);
  parent.appendChild(text);
};
