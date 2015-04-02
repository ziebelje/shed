


/**
 * Cubemitter editor.
 *
 * @constructor
 */
shed.view.cubemitter_editor = function() {
  shed.view.apply(this, arguments);
};
$.inherits(shed.view.cubemitter_editor, shed.view);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.view.cubemitter_editor.prototype.chain_ = 'view.cubemitter_editor';


/**
 * Title of this view.
 *
 * @type {string}
 *
 * @private
 */
shed.view.cubemitter_editor.prototype.title_ = 'Effect Editor';


/**
 * Decorate the view.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.cubemitter_editor.prototype.decorate_ = function(parent) {
  var foo = JSON.parse('{"name": "fire","duration": 20,"material": "materials/cubemitter_bloom.material.json","particle": {"lifetime": {"start": {"kind": "RANDOM_BETWEEN","values": [1.0, 1.3]}},"speed": {"start": {"kind": "RANDOM_BETWEEN","values": [4, 7]},"over_lifetime": {"kind": "CURVE","values": [[0.0, 1.0], [0.7, 1.0], [0.80, 0.4], [1.0, 0.0]]}},"color": {"start": {"kind": "CONSTANT","values": [1.0, 0.8, 0.0, 1.0]},"over_lifetime_g": {"kind": "CURVE","values": [[0.0, 0.7], [0.4, 0.7], [0.7, 0.1], [1.0, 0.0]]},"over_lifetime_a": {"kind": "CURVE","values": [[0.0, 1.0], [0.9, 1.0], [1.0, 0.0]]}},"scale": {"start": {"kind": "RANDOM_BETWEEN","values": [0.1, 0.3]},"over_lifetime": {"kind": "RANDOM_BETWEEN_CURVES","values": [[[0.0, 1.0],[1.0, 0.2]],[[0.0, 1.8],[1.0, 0.5]]]}},"rotation": {"over_lifetime_x": {"kind": "RANDOM_BETWEEN_CURVES","values": [[[0.0, -360.0], [1.0, 360.0]],[[0.0, 360.0], [1.0, 360.0]]]}},"velocity": {"over_lifetime_z": {"kind": "RANDOM_BETWEEN_CURVES","values": [[[0.0, 0.0], [0.4, 0.0], [0.6, 2.0], [1.0, -2.0]],[[0.0, 0.0], [0.4, 0.0], [0.6, 7.0], [1.0, -7.0]]]},"over_lifetime_x": {"kind": "RANDOM_BETWEEN_CURVES","values": [[[0.0, 0.0], [0.4, 0.0], [0.6, 2.0], [1.0, -2.0]],[[0.0, 0.0], [0.4, 0.0], [0.6, 7.0], [1.0, -7.0]]]}}},"emission": {"rate": {"kind": "CONSTANT","values": [100]},"origin": {"surface": "RECTANGLE","values": [2, 2]},"angle": {"kind": "CONSTANT","values": [0]}}}');
  // parent.appendChild($.createElement('div').innerHTML('HI MOM!'));
  // (new shed.component.json_editor(null, {"key1": "value1", "key2": "value2", "key3": {"k1": "v1", "k2": "v2"}})).render(parent);

  var container = $.createElement('div');
  container.style('overflow-y', 'scroll');
  container.style('height', '500px');

  // (new shed.component.json_editor({
  //   'key': null,
  //   'value': foo,
  //   'file_type': 'cubemitter',
  //   'opt_expand': ['particle', 'emission', 'emission.rate']
  // })).render(container);

  (new shed.component.json_editor({
    'value': foo,
    'file_type': 'cubemitter',
    'expand': ['particle', 'emission', 'emission.rate', 'particle.speed']
  })).render(container);

  parent.appendChild(container);
};
