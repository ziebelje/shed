


/**
 * JSON Editor.
 *
 * @constructor
 */
shed.component.json_editor.string = function() {
  shed.component.json_editor.apply(this, arguments);
};
$.inherits(shed.component.json_editor.string, shed.component.json_editor);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.json_editor.string.prototype.chain_ = 'component.json_editor.string';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
// shed.component.json_editor.string.prototype.decorate_value_ = function(parent) {
//   var input = $.createElement('input');
//   input.setAttribute('type', 'text');
//   input.value(this.value_);

//   parent.appendChild(input);
// };
