


/**
 * Progress bar
 *
 * @param {string=} opt_text Text to display in the progress bar. This can be
 * changed later.
 *
 * @constructor
 */
shed.component.progress = function(opt_text) {
  this.text_ = $.createElement('div').addClass('text');
  this.meter_ = $.createElement('div').addClass('meter');

  if (opt_text !== undefined) {
    this.set_text(opt_text);
  }

  shed.component.apply(this, arguments);
};
$.inherits(shed.component.progress, shed.component);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.progress.prototype.chain_ = 'component.progress';


/**
 * Text div.
 *
 * @type {rocket.Elements}
 *
 * @private
 */
shed.component.progress.prototype.text_;


/**
 * Progress meter.
 *
 * @type {rocket.Elements}
 *
 * @private
 */
shed.component.progress.prototype.meter_;


/**
 * Step interval so the step can be killed if a new one is started before it
 * finished.
 *
 * @type {number}
 *
 * @private
 */
shed.component.progress.prototype.step_interval_;


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.progress.prototype.decorate_ = function(parent) {
  // Bypasses the relative positioning of the component parent so this can cover
  // the entire parent properly.
  parent.style('position', '');

  var mask = $.createElement('div').addClass('mask');
  var frame = $.createElement('div').addClass('frame');

  frame.appendChild(this.meter_);
  frame.appendChild(this.text_);

  parent.appendChild(mask);
  parent.appendChild(frame);
};


/**
 * Set the text.
 *
 * @param {string} text
 */
shed.component.progress.prototype.set_text = function(text) {
  this.text_.innerHTML(text);
};


/**
 * Set the percentage complete.
 *
 * @param {number} percent Between 0 and 100.
 * @param {Function=} opt_callback Function to call when the step function completes.
 */
shed.component.progress.prototype.set_progress = function(percent, opt_callback) {
  var self = this;

  var total_width = 377;
  var current_width = parseInt(this.meter_.style('width')) || 0;
  var new_width = Math.min(total_width, total_width * percent / 100);

  clearInterval(this.step_interval_);
  this.step_interval_ = $.step(function(percentage, sine) {
    self.meter_.style('width', (current_width + ((new_width - current_width) * sine)) + 'px');
  }, 1000, opt_callback, 60);
};
