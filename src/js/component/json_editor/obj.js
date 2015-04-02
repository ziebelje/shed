


/**
 * Object type. Note that "object" is a keyword, so shortening it to "obj".
 *
 * @constructor
 */
shed.component.json_editor.obj = function() {
  shed.component.json_editor.apply(this, arguments);
};
$.inherits(shed.component.json_editor.obj, shed.component.json_editor);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {object}
 *
 * @private
 */
shed.component.json_editor.obj.prototype.chain_ = 'component.json_editor.obj';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.json_editor.obj.prototype.decorate_children_ = function(parent) {
  for (var key in this.get_value_()) {
    var path = this.path_.concat([key]);
    var type = shed.component.json_editor.get_type_(this.file_type_, path, this.value_);
    var settings = shed.component.json_editor.get_settings_(this.file_type_, path);
    var component = new shed.component.json_editor[type]({
      'value': this.value_,
      'file_type': this.file_type_,
      'expand': this.expand_,
      'path': path,
      'type': type,
      'settings': settings,
      'parent': this
    });
    component.render(parent);
  }
};
