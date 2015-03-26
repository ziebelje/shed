


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
 * The actual modal window.
 *
 * @type {rocket.ELements}
 *
 * @private
 */
shed.component.modal.prototype.modal_;


/**
 * Effect slide amount.
 *
 * @type {rocket.ELements}
 *
 * @private
 */
shed.component.modal.prototype.slide_amount_ = -25;


/**
 * The mask component that sits behind the modal.
 *
 * @type {shed.component.mask}
 *
 * @private
 */
shed.component.modal.mask_;


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
  var self = this;

  // Bypasses the relative positioning of the component parent so this can cover
  // the entire parent properly.
  parent.style('position', '');

  this.modal_ = $.createElement('div').addClass('container');
  var title = $.createElement('div').addClass('title').innerHTML(this.title_);
  var text = $.createElement('div').addClass('text').innerHTML(this.text_);

  var buttons = $.createElement('div').addClass('buttons');
  for (var i = 0; i < this.buttons_.length; i++) {
    var button = $.createElement('button')
      .innerHTML(this.buttons_[i].text)
      .addEventListener('click', this.buttons_[i].callback);
    buttons.appendChild(button);
  }

  this.modal_.appendChild(title);
  this.modal_.appendChild(text);
  this.modal_.appendChild(buttons);

  this.mask_ = new shed.component.mask();
  this.mask_.render(parent);

  this.modal_.style({'opacity': '0', 'margin-top': this.slide_amount_ + 'px'});
  parent.appendChild(this.modal_);

  $.step(function(percentage, sine) {
    self.modal_.style({
      'opacity': sine,
      'margin-top': (self.slide_amount_ + self.slide_amount_ * sine * -1) + 'px'
    });
  }, 250, null, 60);
};


/**
 * Dispose of the modal by fading it back up and out.
 */
shed.component.modal.prototype.dispose = function() {
  var self = this;

  this.mask_.dispose();

  $.step(
    function(percentage, sine) {
      self.modal_.style({
        'opacity': (1 - sine),
        'margin-top': (self.slide_amount_ + self.slide_amount_ * (1 - sine) * -1) + 'px'
      });
    },
    250,
    function() {
      shed.component.prototype.dispose.call(self);
    },
    60
  );
};
