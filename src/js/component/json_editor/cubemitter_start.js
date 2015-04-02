


/**
 * JSON Editor.
 *
 * @constructor
 */
shed.component.json_editor.cubemitter_start = function() {
  shed.component.json_editor.apply(this, arguments);
};
$.inherits(shed.component.json_editor.cubemitter_start, shed.component.json_editor);


/**
 * Can't figure out an elegant way to do this dynamically in JavaScript.
 *
 * @type {cubemitter_start}
 *
 * @private
 */
shed.component.json_editor.cubemitter_start.prototype.chain_ = 'component.json_editor.cubemitter_start';


/**
 * Decorate
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.component.json_editor.cubemitter_start.prototype.decorate_value_ = function(parent) {
  var table = $.createElement('table');
  var tbody = $.createElement('tbody');
  var tr1 = $.createElement('tr');
  var tr2 = $.createElement('tr');
  var constant_td = $.createElement('td');
  var random_between_td = $.createElement('td');
  var values_td = $.createElement('td').setAttribute('rowspan', '2');

  tr1.appendChild(constant_td);
  tr1.appendChild(values_td);
  tr2.appendChild(random_between_td);

  tbody.appendChild(tr1);
  tbody.appendChild(tr2);

  table.appendChild(tbody);
  table.setAttribute('border', '1');



  var radio = $.createElement('input').setAttribute({'type': 'radio', 'name': this.path_.join()}).addClass('radio').checked(this.get_value_().kind === 'CONSTANT');
  var label = $.createElement('label');
  var label_text = $.createElement('span').innerHTML('Constant');

  label.appendChild(radio);
  label.appendChild(label_text);
  constant_td.appendChild(label);

  var radio = $.createElement('input').setAttribute({'type': 'radio', 'name': this.path_.join()}).addClass('radio').checked(this.get_value_().kind === 'RANDOM_BETWEEN');
  var label = $.createElement('label');
  var label_text = $.createElement('span').innerHTML('Random between');

  label.appendChild(radio);
  label.appendChild(label_text);
  random_between_td.appendChild(label);


  // parent.appendChild($.createElement('span').innerHTML('CONSTANT '));
  // parent.appendChild($.createElement('span').innerHTML('RANDOM_BETWEEN '));
  values_td.appendChild($.createElement('input').setAttribute('type', 'text').value(this.get_value_().values[0]));
  values_td.appendChild($.createElement('input').setAttribute('type', 'text').value(this.get_value_().values[1]));
  values_td.appendChild($.createElement('span').innerHTML(' seconds'));

  parent.appendChild(table);

  // var self = this;

  // var select = $.createElement('select');
  // for (var i = 0; i < this.settings_.values.length; i++) {
  //   var option = $.createElement('option').innerHTML(this.settings_.values[i]);
  //   if (this.get_value_() === this.settings_.values[i]) {
  //     option.setAttribute('selected', 'selected');
  //   }
  //   select.appendChild(option);
  // }

  // select.addEventListener('change', function() {
  //   self.set_value_(JSON.parse('"' + $(this).value() + '"'));
  // });

  // parent.appendChild(select);
};
