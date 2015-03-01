


/**
 * A file with an optional context. The context should be the file, if any,
 * that contains the path to the new file. This will allow the file to be read
 * at the proper location on the disk.
 *
 * @param {string} file The file to read.
 * @param {shed.file=} opt_context Optional file context.
 *
 * @constructor
 */
shed.file = function(file, opt_context) {
  this.file_ = file.replace(/\//g, '\\');
  this.context_ = opt_context || null;

  this.set_system_path_();
};


/**
 * Original file requested.
 *
 * @type {string}
 *
 * @private
 */
shed.file.prototype.file_;


/**
 * Generated system path to the file.
 *
 * @type {string}
 *
 * @private
 */
shed.file.prototype.system_path_;


/**
 * Context for the current file.
 *
 * @type {shed.file}
 *
 * @private
 */
shed.file.prototype.context_;


/**
 * File watcher.
 *
 * @type {fs.FSWatcher}
 *
 * @private
 */
shed.file.prototype.watcher_;


/**
 * Get the name of this file. Optionally include the file extension.
 *
 * @param {boolean=} opt_include_extension Default false.
 *
 * @return {string} The name.
 */
shed.file.prototype.get_name = function(opt_include_extension) {
  var include_extension = opt_include_extension !== undefined ? opt_include_extension : false;

  var name = this.system_path_.match(/[^\\\/:*?"<>]+$/)[0];
  if (include_extension === true) {
    return name;
  }
  else {
    return name.substr(0, name.lastIndexOf('.'));
  }
};


/**
 * Open the file in whatever default editor the system provides.
 */
shed.file.prototype.open = function() {
  require('nw.gui').Shell.openItem(this.system_path_);
};


/**
 * Attempts to read a file. If the file extension is .json, attempts to parse
 * the result.
 *
 * @return {Object|Buffer}
 */
shed.file.prototype.read = function() {
  var fs = require('fs');

  try {
    var contents = fs.readFileSync(this.system_path_);
  }
  catch (e) {
    throw 'File not found: ' + this.system_path_;
  }

  if (this.system_path_.substr(-5) === '.json') {
    contents = JSON.parse(contents);
  }
  return contents;
};


/**
 * Watch a file/folder changes and call the callback if it changed. Note, this
 * particular Node function is rather unstable and often triggers multiple
 * times for a single change. Doing some throttling to help that.
 *
 * @param {Function} callback The callback function.
 */
shed.file.prototype.watch = function(callback) {
  var fs = require('fs');
  this.watcher_ = fs.watch(this.system_path_, {}, $.debounce(200, function() {
    callback();
  }));
};


/**
 * Stop watching for changes.
 */
shed.file.prototype.stop_watch = function() {
  if (this.watcher_) {
    this.watcher_.close();
    delete this.watcher_;
  }
};


/**
 * Get the folder this file is located in.
 *
 * @private
 *
 * @return {string}
 */
shed.file.prototype.get_folder_ = function() {
  return this.file_.replace(/[^\\]*$/, '');
};


/**
 * Set the system path for the file. This takes into account the context,
 * whether or not it's relative or absolute, whether or not it uses the file()
 * macro in Stonehearth, and whether or not it's a horde-relative path.
 *
 * @link {http://discourse.stonehearth.net/t/trying-to-get-a-good-understanding-of-how-to-make-a-mod/7710/13}
 *
 * @private
 */
shed.file.prototype.set_system_path_ = function() {
  // This is kind of tricky. For now I'm assuming that any relative path that
  // starts with one of these folders should be relative to the horde directory.
  // This means that if you create a "fonts" folder somewhere in your mod and
  // try to use a relative path to get there, it will instead try to go to the
  // horde folder. The better way to do this would be to also use the context.
  // For example, a cubemitter pointing at a particle folder should be horde.
  // However, this is tough unless I also begin to identify the type of file,
  // since a cubemitter file can technically exist anywhere in the tree.
  var horde_folders = ['animatedlights', 'fonts', 'materials', 'overlays', 'particles', 'pipelines', 'shaders', 'textures'];

  // Does this file use a file macro?
  var file_macro = this.file_.substr(0, 5) === 'file(';

  // Extract the non-macro'd path
  this.system_path_ = this.file_.match(/^(?:file\()?(.*?)\/?\)?$/)[1];

  if (this.system_path_.substr(1, 2) === ':\\') { // System absolute (starts with drive letter)
    // Do nothing, but leaving this here for completeness and to make sure
    // nothing is done in this case.
  }
  else if (this.system_path_.substr(0, 1) === '\\') { // Stonehearth absolute (starts with slash)
    this.system_path_ = shed.setting.get('path') + 'mods' + this.system_path_;
  }
  else if (horde_folders.indexOf(this.system_path_.substr(0, this.system_path_.indexOf('\\'))) !== -1) { // Horde relative (special)
    this.system_path_ = shed.setting.get('path') + 'mods\\' + shed.setting.get('mod') + '\\data\\horde\\' + this.system_path_;
  }
  else { // Relative
    this.system_path_ = this.context_.get_folder_() + this.system_path_;
  }

  // Evaluate the file() macro if the path specified does not have a file
  // extension. For example, "file(a/b/c)" evaluates to "a/b/c/c.json".
  var has_extension = this.system_path_.match(/\.[0-9a-z]+$/i) !== null ? true : false;
  if (file_macro === true && has_extension === null) {
    var index = this.system_path_.lastIndexOf('\\');
    this.system_path_ += this.system_path_.substring(index) + '.json';
  }
};
