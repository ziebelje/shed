


/**
 * If there was nothing found of something, use this.
 *
 * @param {string} text The text of the none.
 * @param {string=} opt_subtext Optional smaller text to display under the
 * main text.
 *
 * @constructor
 */
shed.component.none = function(text, opt_subtext) {
  this.text_ = text;
  this.subtext_ = opt_subtext || '';
  shed.component.apply(this, arguments);
};
$.inherits(shed.component.none, shed.component);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.none.prototype.chain_ = 'component.none';


/**
 * The none text
 *
 * @type {string}
 *
 * @private
 */
shed.component.none.prototype.text_;


/**
 * The none subtext
 *
 * @type {string}
 *
 * @private
 */
shed.component.none.prototype.subtext_;


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.none.prototype.decorate_ = function(parent) {
  var container = $.createElement('div').style('text-align', 'center');
  var none_icon = $.createElement('img')
    .setAttribute('src', 'img/none.png');
  container.appendChild(none_icon);
  container.appendChild($.createElement('h2').innerHTML(this.text_));
  container.appendChild($.createElement('p').innerHTML(this.subtext_));
  parent.appendChild(container);
};

