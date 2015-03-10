


/**
 * Title inside the title container.
 *
 * @param {string} title The title of the tip.
 *
 * @constructor
 */
shed.component.title = function(title) {
  this.title_ = title;
  shed.component.apply(this, arguments);
};
$.inherits(shed.component.title, shed.component);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.title.prototype.chain_ = 'component.title';


/**
 * The title to display.
 *
 * @type {string}
 *
 * @private
 */
shed.component.title.prototype.title_;


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.title.prototype.decorate_ = function(parent) {
  parent.appendChild(
    $.createElement('div').addClass('title').innerHTML(this.title_)
  );
};
