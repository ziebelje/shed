


/**
 * A collection of static functions that do various filesystem actions.
 *
 * @constructor
 */
shed.filesystem = function() {};


/**
 * Check to see whether or not a file or folder exists.
 *
 * @param {string} path
 *
 * @return {boolean}
 */
shed.filesystem.exists = function(path) {
  try {
    require('fs').statSync(path);
    return true;
  }
  catch (e) {
    return false;
  }
};


/**
 * Determine if this path is a directory.
 *
 * @param {string} path
 *
 * @return {boolean}
 */
shed.filesystem.is_directory = function(path) {
  return require('fs').statSync(path).isDirectory();
};


/**
 * Determine if this path is a file.
 *
 * @param {string} path
 *
 * @return {boolean}
 */
shed.filesystem.is_file = function(path) {
  return shed.filesystem.is_directory(path) === false;
};


/**
 * Maximum number of files that can be open at a time.
 *
 * @type {number}
 *
 * @private
 */
shed.filesystem.max_files_open_ = 100;


/**
 * Number of files currently open. Opening too many files breaks stuff.
 *
 * @type {number}
 *
 * @private
 */
shed.filesystem.files_open_ = 0;


/**
 * A list of copy functions queued. Each of these copy functions needs to open
 * the file so they need to be queued up if there are too many.
 *
 * @type {Array.<Function>}
 *
 * @private
 */
shed.filesystem.file_queue_ = [];


/**
 * Copy a file or folder into a new location. Always overwrites existing files and
 * merges with existing folders.
 *
 * @param {string} source The source file or directory.
 * @param {string} destination The destination directory.
 * @param {Function=} opt_data_callback A function to call when data is written
 * to the destination file. The number of bytes copied in that operation will
 * be passed as an argument.
 */
shed.filesystem.copy = function(source, destination, opt_data_callback) {
  if (shed.filesystem.is_directory(source) === true) {
    shed.filesystem.copy_directory_(source, destination, opt_data_callback);
  }
  else {
    shed.filesystem.copy_file_(source, destination, opt_data_callback);
  }
};


/**
 * Copy a directory into a new folder. Always overwrites existing files and
 * merges with existing folders.
 *
 * @param {string} source The folder to copy.
 * @param {string} destination The folder to copy into.
 * @param {Function=} opt_data_callback A function to call when data is written
 * to the destination file. The number of bytes copied in that operation will
 * be passed as an argument.
 *
 * @private
 */
shed.filesystem.copy_directory_ = function(source, destination, opt_data_callback) {
  var folder = source.substr(source.lastIndexOf('\\') + 1, source.length);

  // Create the folder we're copying in the destination folder.
  try {
    require('fs').mkdirSync(destination + '\\' + folder);
  }
  catch (e) {
    // Ignore directory exists exceptions.
    if (e.code !== 'EEXIST') {
      throw e.message;
    }
  }

  // Walk through the source tree and create everything.
  shed.filesystem.walk_synchronous(
    source,
    function(path, stat) {
      // Takes just a little bit of manipulation to get the right destination
      // path.
      var path_minus_source = path.replace(source, '');
      var path_minus_file = path_minus_source.substr(0, path_minus_source.lastIndexOf('\\'));
      shed.filesystem.copy_file_(
        path,
        destination + '\\' + folder + '\\' + path_minus_file,
        opt_data_callback
      );
    },
    function(path, stat) {
      try {
        require('fs').mkdirSync(destination + '\\' + folder + path.replace(source, ''));
      }
      catch (e) {
        // Ignore directory exists exceptions.
        if (e.code !== 'EEXIST') {
          throw e.message;
        }
      }
    }
  );
};


/**
 * Copy a file to a new folder. Always overwrites.
 *
 * @param {string} source The file to copy.
 * @param {string} destination The folder to copy into.
 * @param {Function=} opt_data_callback A function to call when data is written
 * to the destination file. The number of bytes copied in that operation will
 * be passed as an argument.
 *
 * @private
 */
shed.filesystem.copy_file_ = function(source, destination, opt_data_callback) {
  var copy = function() {
    shed.filesystem.files_open_++;
    var fs = require('fs');

    var filename = source.substring(source.lastIndexOf('\\') + 1, source.length);

    var source_stream = fs.createReadStream(source);
    var destination_stream = fs.createWriteStream(destination + '\\' + filename);

    // Leaving these as a reminder for now.
    // source_stream.on('error', function(e) {});
    // destination_stream.on('error', function(e) {});
    // destination_stream.on('close', function(e) {});

    source_stream.on('data', function(data) {
      destination_stream.write(data);
      if (opt_data_callback !== undefined) {
        opt_data_callback(data.length);
      }
    });
    source_stream.on('end', function() {
      destination_stream.end(); // need this or something like it
      shed.filesystem.files_open_--;
      if (shed.filesystem.file_queue_.length > 0) {
        shed.filesystem.file_queue_.shift()();
      }
    });
  };

  // Queue up the copy because otherwise large mods will try to open way too
  // many files at the same time and cause a bunch of erros. Queuing these up
  // allows me to process the copies asynchronously while more carefully
  // limiting how many we do at once.
  if (shed.filesystem.files_open_ < shed.filesystem.max_files_open_) {
    copy();
  }
  else {
    shed.filesystem.file_queue_.push(copy);
  }
};


/**
 * Get the size of a file or folder. Use this when iterating over large
 * directories since the asynchronous version is 100x faster than the
 * synchronous one.
 *
 * @param {string} path
 * @param {Function} callback
 */
shed.filesystem.get_size_asynchronous = function(path, callback) {
  if (shed.filesystem.is_directory(path) === true) {
    var size = 0;
    shed.filesystem.walk_asynchronous(
      path,
      function() {
        callback(size);
      },
      function(path, stat) {
        size += stat.size;
      }
    );
  }
  else {
    callback(require('fs').statSync(path).size);
  }
};


/**
 * Get the size of a file or folder. Use this for single files or small
 * folders since the speed difference is negligible for few files.
 *
 * @param {string} path
 *
 * @return {number} File size in bytes.
 */
shed.filesystem.get_size_synchronous = function(path) {
  var size = 0;
  if (shed.filesystem.is_directory(path) === true) {
    shed.filesystem.walk_synchronous(
      directory,
      function(path, stat) {
        size += stat.size;
      }
    );
  }
  else {
    size = require('fs').statSync(path).size;
  }

  return size;
};


/**
 * Delete a file or folder. Folders are recursively deleted.
 *
 * @param {string} path
 */
shed.filesystem.delete_synchronous = function(path) {
  var fs = require('fs');
  if (shed.filesystem.is_file(path) === true) {
    fs.unlinkSync(path);
  }
  else {
    var directories_to_delete = [];

    // Delete all files
    shed.filesystem.walk_synchronous(
      path,
      function(path, stat) {
        fs.unlinkSync(path);
      },
      function(path, stat) {
        directories_to_delete.push(path);
      }
    );

    // Now delete all folders starting with the top level
    for (var i = directories_to_delete.length - 1; i >= 0; i--) {
      fs.rmdirSync(directories_to_delete[i]);
    }
  }
};


/**
 * Delete a file or folder. Folders are recursively deleted.
 *
 * @param {string} path
 * @param {Function} callback
 */
shed.filesystem.delete_asynchronous = function(path, callback) {
  var fs = require('fs');
  if (shed.filesystem.is_file(path) === true) {
    fs.unlink(path, callback);
  }
  else {
    var directories_to_delete = [];

    // Delete all files
    shed.filesystem.walk_asynchronous(
      path,
      function() {
        // Now delete all folders starting with the top level
        for (var i = directories_to_delete.length - 1; i >= 0; i--) {
          fs.rmdirSync(directories_to_delete[i]);
        }
        callback();
      },
      function(path, stat) {
        fs.unlinkSync(path);
      },
      function(path, stat) {
        directories_to_delete.push(path);
      }
    );
  }
};


/**
 * Read the contents of a directory.
 *
 * @param {string} directory
 *
 * @return {Array.<string>} An array of file/folder strings in the specified
 * directory excluding '.' and '..'.
 */
shed.filesystem.list = function(directory) {
  return require('fs').readdirSync(directory);
};


/**
 * List all of the files/folders in a directory recursively. This is
 * asynchronous because it's way faster for big folders.
 *
 * @param {string} directory
 * @param {Function} callback
 */
shed.filesystem.list_recursive = function(directory, callback) {
  var list = [];

  shed.filesystem.walk_asynchronous(
    directory,
    function() {
      callback(list);
    },
    function(path, stat) {
      list.push(path);
    },
    function(path, stat) {
      list.push(path);
    }
  );
};


/**
 * Count the number of files/folders in a directory.
 *
 * @param {string} directory
 * @param {Function} callback
 * @param {boolean=} opt_include_files Whether or not to include files in the
 * count.
 * @param {boolean=} opt_include_folders Whether or not to include folders in
 * the count.
 */
shed.filesystem.count = function(directory, callback, opt_include_files, opt_include_folders) {
  var include_files = opt_include_files !== undefined ? opt_include_files : true;
  var include_folders = opt_include_folders !== undefined ? opt_include_folders : true;

  var count = 0;

  shed.filesystem.walk_asynchronous(
    directory,
    function() {
      callback(count);
    },
    function() {
      if (include_files === true) {
        count++;
      }
    },
    function() {
      if (include_folders === true) {
        count++;
      }
    }
  );
};


/**
 * Read a file and return the contents. This does not attempt to do any
 * special parsing of the results, which allows the callee to determine
 * whether or not to try and parse the results, do regex matching, etc.
 *
 * @param {string} file
 *
 * @return {string} The file contents.
 */
shed.filesystem.read = function(file) {
  try {
    return require('fs').readFileSync(file);
  }
  catch (e) {
    throw new Error('File not found: ' + file);
  }
};


/**
 * Watch a file for changes.
 *
 * @param {string} file
 * @param {Function} callback Function to call when the file changes. Fires on
 * a short delay to prevent duplicate firings.
 *
 * @return {fs.FSWatcher}
 */
shed.filesystem.watch = function(file, callback) {
  return require('fs').watch(
    file,
    {},
    $.debounce(200, function() {
      callback();
    })
  );
};


/**
 * Iterate over a directory and execute an optional callback function on each
 * file and folder. Can be used to get file lists, recursively delete a
 * folder, etc.
 *
 * @param {string} directory
 * @param {Function=} opt_file_callback
 * @param {Function=} opt_directory_callback
 */
shed.filesystem.walk_synchronous = function(directory, opt_file_callback, opt_directory_callback) {
  var fs = require('fs');

  var walk = function(directory) {
    var files = fs.readdirSync(directory);
    for (var i = 0; i < files.length; i++) {
      var path = directory + '\\' + files[i];
      var stat = fs.lstatSync(path);
      if (stat.isDirectory() === true) {
        if (opt_directory_callback) {
          opt_directory_callback(path, stat);
        }
        walk(path);
      } else {
        if (opt_file_callback) {
          opt_file_callback(path, stat);
        }
      }
    }
  };

  walk(directory);
};


/**
 * Asynchronously loop over a directory. This is faster than the synchronous
 * version but does not guarantee execution order.
 *
 * @param {string} directory
 * @param {Function} complete_callback
 * @param {Function=} opt_file_callback
 * @param {Function=} opt_directory_callback
 *
 * @link http://stackoverflow.com/a/5827895
 */
shed.filesystem.walk_asynchronous = function(directory, complete_callback, opt_file_callback, opt_directory_callback) {
  var fs = require('fs');

  var walk = function(directory, opt_file_callback, opt_file_callback, complete_callback) {
    fs.readdir(directory, function(error, list) {
      if (error) {
        return complete_callback(error);
      }

      var pending = list.length;
      if (!pending) {
        return complete_callback();
      }

      list.forEach(function(file) {
        var path = directory + '\\' + file;
        fs.stat(path, function(error, stat) {
          if (stat && stat.isDirectory()) {
            if (opt_directory_callback) {
              opt_directory_callback(path, stat);
            }
            walk(path, opt_file_callback, opt_file_callback, function(error, result) {
              if (!--pending) {
                complete_callback();
              }
            });
          } else {
            if (opt_file_callback) {
              opt_file_callback(path, stat);
            }
            if (!--pending) {
              complete_callback();
            }
          }
        });
      });
    });
  };

  walk(directory, opt_file_callback, opt_file_callback, complete_callback);
};
