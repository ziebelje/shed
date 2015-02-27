


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

  var todo = $.createElement('div').addClass('error');
  todo.appendChild($.createElement('h1').innerHTML('Oops!'));
  todo.appendChild(
    $.createElement('textarea')
      .setAttribute('readonly', 'readonly')
      .value(this.error_.stack || this.error_)
  );

  parent.appendChild(todo);
};

