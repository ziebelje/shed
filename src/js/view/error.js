


/**
 * Error
 *
 * @param {error} error
 *
 * @constructor
 */
shed.view.error = function(error) {
  this.error_ = error;
  shed.view.apply(this, arguments);
};
$.inherits(shed.view.error, shed.view);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.view.error.prototype.chain_ = 'view.error';


/**
 * Error
 *
 * @type {error}
 */
shed.view.error.prototype.error_;


/**
 * Decorate.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.error.prototype.decorate_ = function(parent) {
  console.error(this.error_);

  parent.appendChild($.createElement('h1').innerHTML('Oops!'));
  parent.appendChild(
    $.createElement('textarea')
      .setAttribute('readonly', 'readonly')
      .value(this.error_.stack || this.error_)
  );
};

