


/**
 * Modal alert.
 *
 * @param {string} title
 * @param {string} text
 * @param {Array.<Object>} buttons An array of objects describing the buttons
 * that should be attached.
 *
 * @constructor
 */
shed.component.modal = function(title, text, buttons) {
  this.title_ = title;
  this.text_ = text;
  this.buttons_ = buttons;
  shed.component.apply(this, arguments);
};
$.inherits(shed.component.modal, shed.component);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.modal.prototype.chain_ = 'component.modal';


/**
 * Title.
 *
 * @type {string}
 *
 * @private
 */
shed.component.modal.prototype.title_;


/**
 * Text.
 *
 * @type {string}
 *
 * @private
 */
shed.component.modal.prototype.text_;


/**
 * Buttons.
 *
 * @type {Array.<Object>}
 *
 * @private
 */
shed.component.modal.prototype.buttons_;


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.modal.prototype.decorate_ = function(parent) {
  // Bypasses the relative positioning of the component parent so this can cover
  // the entire parent properly.
  parent.style('position', '');

  var mask = $.createElement('div').addClass('mask');

  var container = $.createElement('div').addClass('container');
  var title = $.createElement('div').addClass('title').innerHTML(this.title_);
  var text = $.createElement('div').addClass('text').innerHTML(this.text_);

  var buttons = $.createElement('div').addClass('buttons');
  for (var i = 0; i < this.buttons_.length; i++) {
    var button = $.createElement('button')
      .innerHTML(this.buttons_[i].text)
      .addEventListener('click', this.buttons_[i].callback);
    buttons.appendChild(button);

  }

  container.appendChild(title);
  container.appendChild(text);
  container.appendChild(buttons);

  parent.appendChild(mask);
  parent.appendChild(container);
};


/**
 * Set the text.
 *
 * @param {string} text
 */
// shed.component.modal.prototype.set_text = function(text) {
//   this.text_.innerHTML(text);
// };


/**
 * Set the percentage complete.
 *
 * @param {number} percent Between 0 and 100.
 * @param {Function=} opt_callback Function to call when the step function completes.
 */
// shed.component.modal.prototype.set_progress = function(percent, opt_callback) {
//   var self = this;

//   var total_width = 377;
//   var current_width = parseInt(this.meter_.style('width')) || 0;
//   var new_width = Math.min(total_width, total_width * percent / 100);

//   clearInterval(this.step_interval_);
//   this.step_interval_ = $.step(function(percentage, sine) {
//     self.meter_.style('width', (current_width + ((new_width - current_width) * sine)) + 'px');
//   }, 1000, opt_callback, 60);
// };
