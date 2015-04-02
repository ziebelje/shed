


/**
 * JSON Editor.
 *
 * @constructor
 */
shed.component.json_editor.number = function() {
  shed.component.json_editor.apply(this, arguments);
};
$.inherits(shed.component.json_editor.number, shed.component.json_editor);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {number}
 *
 * @private
 */
shed.component.json_editor.number.prototype.chain_ = 'component.json_editor.number';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
// shed.component.json_editor.number.prototype.decorate_value_ = function(parent) {
//   var input = $.createElement('input');
//   input.setAttribute('type', 'text');
//   input.value(this.value_);

//   parent.appendChild(input);
// };
