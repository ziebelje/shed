


/**
 * If there was nothing found of something, use this.
 *
 * @param {string} text The text of the none.
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
  var todo = $.createElement('div').addClass('none'); // TODO: This is for the sass namespace. I will be able to remove this once the frame is automatically adding this.

  var container = $.createElement('div').style('text-align', 'center');
  var none_icon = $.createElement('img')
    .setAttribute('src', 'img/none.png');
  container.appendChild(none_icon);
  container.appendChild($.createElement('h2').innerHTML(this.text_));
  container.appendChild($.createElement('p').innerHTML(this.subtext_));
  todo.appendChild(container);

  parent.appendChild(todo);
};

