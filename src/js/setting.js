


/**
 * Settings helper.
 *
 * @constructor
 */
shed.setting = function() {};


/**
 * Default setting values.
 *
 * @type {Object}
 *
 * @private
 */
shed.setting.defaults_ = {
  'effect_editor_terrain': true,
  'effect_editor_emitter': false,
  'effect_editor_axis': false,
  'effect_editor_camera_position': {'x': 12, 'y': 7, 'z': 12}
};


/**
 * Get a setting. If it's not set, use the default value. If the default value
 * isn't set, return null.
 *
 * @param {string} key The setting.
 *
 * @return {*} The setting
 */
shed.setting.get = function(key) {
  if (localStorage[key] === undefined) {
    if (shed.setting.defaults_[key] !== undefined) {
      return shed.setting.defaults_[key];
    }
    else {
      return null;
    }
  }
  else {
    return JSON.parse(localStorage[key]);
  }
};


/**
 * Set a setting
 *
 * @param {string} key The setting.
 * @param {*} value The value.
 */
shed.setting.set = function(key, value) {
  localStorage[key] = JSON.stringify(value);
};


/**
 * Delete a setting.
 *
 * @param {string} key The setting.
 */
shed.setting.del = function(key) {
  delete localStorage[key];
};
