


/**
 * JSON Editor.
 *
 * @constructor
 */
shed.component.json_editor.enum = function() {
  shed.component.json_editor.apply(this, arguments);
};
$.inherits(shed.component.json_editor.enum, shed.component.json_editor);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {enum}
 *
 * @private
 */
shed.component.json_editor.enum.prototype.chain_ = 'component.json_editor.enum';


/**
 * All of the possible values in this enum.
 *
 * @type {Array.<string>}
 *
 * @private
 */
shed.component.json_editor.enum.prototype.values_;


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.json_editor.enum.prototype.decorate_value_ = function(parent) {
  var self = this;

  var select = $.createElement('select');
  for (var i = 0; i < this.settings_.values.length; i++) {
    var option = $.createElement('option').innerHTML(this.settings_.values[i]);
    if (this.get_value_() === this.settings_.values[i]) {
      option.setAttribute('selected', 'selected');
    }
    select.appendChild(option);
  }

  select.addEventListener('change', function() {
    self.set_value_(JSON.parse('"' + $(this).value() + '"'));
  });

  parent.appendChild(select);
};
