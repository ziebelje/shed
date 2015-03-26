


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
 * Current progress from 0 to 100.
 *
 * @type {number}
 *
 * @private
 */
shed.component.progress.prototype.percent_ = 0;


/**
 * A container around the progress bar frame.
 *
 * @type {rocket.Elements}
 *
 * @private
 */
// shed.component.progress.prototype.frame_;


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.progress.prototype.decorate_ = function(parent) {
  var self = this;

  // Bypasses the relative positioning of the component parent so this can cover
  // the entire parent properly.
  parent.style('position', '');

  var mask = new shed.component.mask();
  mask.render(parent);

  this.progress_ = $.createElement('div');

  this.frame_container_ = $.createElement('div').addClass('frame_container');

  var frame = $.createElement('div').addClass('frame');
  frame.appendChild(this.meter_);
  frame.appendChild(this.text_);

  this.frame_container_.appendChild(frame);

  this.slide_amount_ = -25;

  frame.style({'opacity': '0', 'margin-top': this.slide_amount_ + 'px'});

  parent.appendChild(this.frame_container_);

  $.step(function(percentage, sine) {
    frame.style({
      'opacity': sine,
      'margin-top': (self.slide_amount_ + self.slide_amount_ * sine * -1) + 'px'
    });
  }, 250, null, 60);
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
 * Set the percentage complete. This forces a minimum interval of 5% before it
 * will update. This helps prevent things which update the progress bar very
 * frequently from constantly clearing the interval before the progress bar
 * even gets a chance to move.
 *
 * @param {number} percent Between 0 and 100.
 * @param {Function=} opt_callback Function to call when the step function
 * completes.
 */
shed.component.progress.prototype.set_progress = function(percent, opt_callback) {
  if (percent - this.percent_ > 5 || percent === 100) {
    var self = this;

    this.percent_ = percent;

    var total_width = 377;
    var current_width = parseInt(this.meter_.style('width')) || 0;
    var new_width = Math.min(total_width, total_width * percent / 100);

    clearInterval(this.step_interval_);
    this.step_interval_ = $.step(function(percentage, sine) {
      self.meter_.style('width', (current_width + ((new_width - current_width) * sine)) + 'px');
    }, 750, opt_callback, 60);
  }
};
