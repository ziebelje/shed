


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
  'effect_editor_camera_position': {'x': 12, 'y': 7, 'z': 12},
  'mod': 'stonehearth'
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
  // Path default can be a number of different values.
  if (key === 'path' && localStorage[key] === undefined) {
    shed.setting.set('path', shed.setting.guess_path_());
  }

  if (localStorage[key] === undefined) {
    if (shed.setting.defaults_[key] !== undefined) {
      return shed.setting.defaults_[key];
    }
    else {
      return null;
    }
  }
  else {
    try {
      return JSON.parse(localStorage[key]);
    }
    catch (e) {
      delete localStorage[key];
      return shed.setting.get(key);

      // throw new Error('Failed to parse setting [' + key + ']: "' + localStorage[key] + '"');
    }
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


/**
 * Try and guess where the Stonehearth folder is at. If this cannot be
 * guessed, the user will have to manually enter this value in.
 *
 * @private
 *
 * @return {string} The detected install path or null if not found.
 */
shed.setting.guess_path_ = function() {
  // Default steam and non-steam install locations.
  var possible_paths = [
    process.env['ProgramFiles'] + '\\Steam\\SteamApps\\common\\Stonehearth\\',
    process.env['ProgramFiles(x86)'] + '\\Steam\\SteamApps\\common\\Stonehearth\\',
    process.env['ProgramFiles'] + '\\Stonehearth\\',
    process.env['ProgramFiles(x86)'] + '\\Stonehearth\\'
  ];

  // Pick the first detected path.
  for (var i = 0; i < possible_paths.length; i++) {
    if (shed.filesystem.exists(possible_paths[i]) === true) {
      return possible_paths[i];
    }
  }

  return null;
};
