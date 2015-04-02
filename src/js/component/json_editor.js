// TODO: Re-add arguments (and rename it)
// TODO: Put types back in :)
// TODO: Consider renaming this.value_ to differentiate it between when I'm doing something with the local value.
// TODO: Delete/add keys
// TODO: Remove already expanded nodes from expand when passing it down to lower layers
// TODO: Only rerender if value has changed
// TODO: Blurring out of a field triggers a rerender. If I tried to click into another field, that field often doesn't receive focus because it blurs, focuses, then redraws which causes it to lose focus.
// TODO: define whether or not the key is editable
// TODO: rename the value property to something else? Node value vs global value. (get_type_())
// TODO: make keys extend the entire height of the value part



/**
 * JSON Editor.
 *
 * @param {Object} options {file_type, value, path, type, parent, expand}
 *
 * @constructor
 */
shed.component.json_editor = function(options) {
  this.file_type_ = options.file_type;
  this.value_ = options.value;
  this.path_ = options.path || [];
  this.type_ = options.type || 'obj';
  this.parent_ = options.parent || null;
  this.settings_ = options.settings || null;
  this.expand_ = options.expand || [];

  shed.component.apply(this, arguments);
};
$.inherits(shed.component.json_editor, shed.component);


/**
 * A pointer to the entire JSON object that this node is part of.
 *
 * @type {Object}
 *
 * @private
 */
shed.component.json_editor.prototype.value_;


/**
 * The path that this node is located at inside of the JSON object.
 *
 * @type {Array.<string>}
 *
 * @private
 */
shed.component.json_editor.prototype.path_;


/**
 * An array of keys to expand.
 *
 * @type {Array.<string>}
 *
 * @private
 */
shed.component.json_editor.prototype.expand_;


/**
 * The type of the actual JSON file. Ex: cubemitter, effect, etc.
 *
 * @type {string}
 *
 * @private
 */
shed.component.json_editor.prototype.file_type_;


/**
 * The type of the value.
 *
 * @type {string}
 *
 * @private
 */
shed.component.json_editor.prototype.type_;


/**
 * Container element for all of the children.
 *
 * @type {rocket.Elements}
 *
 * @private
 */
shed.component.json_editor.prototype.children_container_;


/**
 * Parent element.
 *
 * @type {shed.component.json_editor}
 *
 * @private
 */
shed.component.json_editor.prototype.parent_;


/**
 * Special key types
 *
 * @type {Object}
 *
 * @private
 */
shed.component.json_editor.types_ = {
  'cubemitter.particle.scale.start.kind': {'type': 'enum', 'settings': {'values': ['RANDOM_BETWEEN', 'CONSTANT']}},
  'cubemitter.emission.rate.kind': {'type': 'enum', 'settings': {'values': ['RANDOM_BETWEEN', 'CONSTANT']}},
  'cubemitter.particle.speed.start': {'type': 'cubemitter_start'},
  'cubemitter.particle.scale.start': {'type': 'cubemitter_start'}
};


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.json_editor.prototype.chain_ = 'component.json_editor';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.json_editor.prototype.decorate_ = function(parent) {
  var self = this;

  var container = $.createElement('div');
  this.children_container_ = $.createElement('div').hide();

  // Root element
  if (this.path_.length === 0) {
    for (var key in this.value_) {
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
      component.render(container);
    }
  }
  else {
    container.style('margin', '0 0 0 10px');

    var table = new jex.table({'rows': 1, 'columns': 3});
    table.table().style('width', '100%');
    table.table().style('margin-bottom', '5px');
    table.table().style('table-layout', 'fixed');

    table.td(0, 0).style('width', '20px').setAttribute('valign', 'top');
    table.td(1, 0).style('width', '100px').style('padding-right', '10px').setAttribute('valign', 'top');

    // Toggle children (+/-) button
    if (this.type_ === 'obj' || this.type_ === 'array') {
      var toggle_children = $.createElement('div')
        .innerHTML('+')
        .addClass('toggle_children');
      table.td(0, 0).appendChild(toggle_children);

      toggle_children.addEventListener('click', function() {
        self.toggle_children_($(this));
      });

      if (this.expand_.indexOf(this.path_.join('.')) !== -1) {
        toggle_children.dispatchEvent('click');
      }
    }

    this.decorate_key_(table.td(1, 0));
    this.decorate_value_(table.td(2, 0));

    container.appendChild(table.table());
  }

  this.decorate_children_(this.children_container_);

  container.appendChild(this.children_container_);
  parent.appendChild(container);
};


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.json_editor.prototype.decorate_key_ = function(parent) {
  var div = $.createElement('div')
    .setAttribute('contentEditable', 'true')
    .addClass(['key', this.type_])
    .innerHTML(this.get_key_());

  parent.appendChild(div);
};


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.json_editor.prototype.decorate_value_ = function(parent) {
  var self = this;

  var div = $.createElement('div')
    .setAttribute('contentEditable', 'true')
    .addClass('value')
    .innerHTML(JSON.stringify(this.get_value_()))
    .addEventListener('blur', function() {
      self.set_value_(JSON.parse($(this).innerHTML()));
    });

  parent.appendChild(div);
};


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.json_editor.prototype.decorate_children_ = function(parent) {};


/**
 * Since the type of the object is being used as the name of the class, need
 * to replace "object" with "obj" since "object" is a keyword. This is just a
 * simple wrapper for jext.type that does that replace.
 *
 * @param {string} file_type The type of the file.
 * @param {string} path The path to the value to get the type of.
 * @param {string} value The file value to traverse using the path.
 *
 * @private
 *
 * @return {string} The detected type.
 */
shed.component.json_editor.get_type_ = function(file_type, path, value) {
  if (shed.component.json_editor.types_[file_type + '.' + path.join('.')]) {
    return shed.component.json_editor.types_[file_type + '.' + path.join('.')].type;
  }
  else {
    var node_value = path.reduce(
      function(previous, current) {
        return previous[current];
      },
      value
    );

    var type = jex.type(node_value);
    if (type === 'object') {
      type = 'obj';
    }
    return type;
  }
};


/**
 * Get any settings that have been set inside
 * shed.component.json_editor.types_. This would be for things like enum
 * values, min/max values, etc.
 *
 * @param {string} file_type The type of the file.
 * @param {string} path The path to the value to get the type of.
 *
 * @private
 *
 * @return {string} The detected type.
 */
shed.component.json_editor.get_settings_ = function(file_type, path) {
  if (shed.component.json_editor.types_[file_type + '.' + path.join('.')]) {
    return shed.component.json_editor.types_[file_type + '.' + path.join('.')].settings;
  }
  else {
    return null;
  }
};


/**
 * Show or hide child elements.
 *
 * @param {rocket.Elements} element The actual +/- element clicked on that
 * calls this handler.
 *
 * @private
 */
shed.component.json_editor.prototype.toggle_children_ = function(element) {
  if (this.children_container_.style('display') === 'none') {
    this.children_container_.show();
    element.innerHTML('-');

    // Add to the list of expanded nodes.
    this.expand_.push(this.path_.join('.'));
  }
  else {
    this.children_container_.hide();
    element.innerHTML('+');

    // Remove from the list of expanded nodes.
    for (var i = this.expand_.length - 1; i >= 0; i--) {
      if (this.expand_[i] === this.path_.join('.')) {
        delete this.expand_[i];
      }
    }
  }
};


/**
 * Get the parent node.
 *
 * @return {shed.component.json_editor}
 *
 * @private
 */
shed.component.json_editor.prototype.get_parent_ = function() {
  return this.parent_;
};


/**
 * Rerender the top-level node. This makes sure that every possible change
 * gets caught, including type changes since the type will only properly
 * update when the parent of a node is rerendered.
 *
 * @private
 */
shed.component.json_editor.prototype.rerender_oldest_ancestor_ = function() {
  var parent = this;
  while (parent.get_parent_() !== null) {
    parent = parent.get_parent_();
  }
  parent.rerender();

  // Old code that only updated the 2nd oldest ancestor. This worked except it
  // didn't update the type of objects properly at that layer because types are
  // only set by the parent.
  // var ancestors = [this];
  // while (ancestors[ancestors.length - 1] !== null) {
  //   ancestors.push(ancestors[ancestors.length - 1].get_parent_());
  // }
  // ancestors[ancestors.length - 3].rerender();
};


/**
 * Get the key of this node.
 *
 * @return {string}
 *
 * @private
 */
shed.component.json_editor.prototype.get_key_ = function() {
  return this.path_[this.path_.length - 1];
};


/**
 * Get the value of this node.
 *
 * @link http://stackoverflow.com/a/28742365
 *
 * @private
 *
 * @return {Object|Array|string|number|boolean}
 */
shed.component.json_editor.prototype.get_value_ = function() {
  return this.path_.reduce(
    function(previous, current) {
      return previous[current];
    },
    this.value_
  );
};


/**
 * Set the value of this node. This works by reducing the path until we get to
 * the proper attribute to set. Then it rerenders the oldest ancestor so
 * everything at a higher level gets properly updated.
 *
 * @param {Object|Array|string|number|boolean} value The value to set.
 *
 * @private
 */
shed.component.json_editor.prototype.set_value_ = function(value) {
  var path = $.clone(this.path_);
  path.reduce(
    function(previous, current, index) {
      if (index === path.length - 1) {
        previous[current] = value;
      }
      return previous[current];
    },
    this.value_
  );
  this.rerender_oldest_ancestor_();
};
