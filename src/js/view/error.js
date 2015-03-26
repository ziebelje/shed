


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
  var message = this.error_ || 'No message';
  // var stack = this.error_.stack || new Error().stack;
  var stack = this.error_.stack;
  var local_storage = JSON.stringify(localStorage);

  console.error(message);

  parent.appendChild($.createElement('h1').innerHTML('Oops!'));
  parent.appendChild(
    $.createElement('textarea')
      .setAttribute('readonly', 'readonly')
      .value('Error\n-----\n' + message + '\n\nStack\n-----\n' + stack + '\n\nLocal storage\n-----\n' + local_storage)
  );
};

