


/**
 * JSON Editor.
 *
 * @constructor
 */
shed.component.json_editor.boolean = function() {
  shed.component.json_editor.apply(this, arguments);
};
$.inherits(shed.component.json_editor.boolean, shed.component.json_editor);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {boolean}
 *
 * @private
 */
shed.component.json_editor.boolean.prototype.chain_ = 'component.json_editor.boolean';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
// shed.component.json_editor.boolean.prototype.decorate_value_ = function(parent) {
//   parent.appendChild($.createElement('span').innerHTML(this.value_));
// };
