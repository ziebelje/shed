


/**
 * Mask.
 *
 * @constructor
 */
shed.component.mask = function() {
  shed.component.apply(this, arguments);
};
$.inherits(shed.component.mask, shed.component);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {string}
 *
 * @private
 */
shed.component.mask.prototype.chain_ = 'component.mask';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.mask.prototype.decorate_ = function(parent) {
  // Bypasses the relative positioning of the component parent so this can cover
  // the entire parent properly.
  parent.style({
    'position': '',
    'opacity': '0'
  });

  var mask = $.createElement('div').addClass('the_mask');

  parent.appendChild(mask);

  $.step(function(percentage, sine) {
    parent.style('opacity', sine);
  }, 250, null, 60);
};



/**
 * Dispose of the mask by fading it back out.
 */
shed.component.mask.prototype.dispose = function() {
  var self = this;
  $.step(
    function(percentage, sine) {
      self.container_.style('opacity', (1 - sine));
    },
    250,
    function() {
      shed.component.prototype.dispose.call(self);
    },
    60
  );
};
