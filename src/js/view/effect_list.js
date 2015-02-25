


/**
 * Effect editor.
 *
 * @constructor
 */
shed.view.effect_list = function() {
  shed.view.apply(this, arguments);
};
$.inherits(shed.view.effect_list, shed.view);


/**
 * Title of this view.
 *
 * @type {string}
 *
 * @private
 */
shed.view.effect_list.prototype.title_ = 'Effect Editor';


/**
 * Decorate the view.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.effect_list.prototype.decorate_ = function(parent) {
  var self = this;

  // TODO This was the sass namespace stuff. Need to figure this out.
  var todo = $.createElement('div').addClass('effect_list');

  var grid_row = $.createElement('div').addClass('grid_row');
  var left = $.createElement('div').addClass(['list', 'grid_column_5']);
  var right = $.createElement('div').addClass('grid_column_7');

  // Cubemitter list
  this.decorate_list_(left);

  // Well
  var well = $.createElement('div').addClass('well');

  var tip = new shed.component.tip('Select an effect to get started. Effects are updated in real time as you save changes to the JSON files.');
  tip.render(well);

  right.appendChild(well);

  grid_row.appendChild(left);
  grid_row.appendChild(right);
  todo.appendChild(grid_row);

  parent.appendChild(todo);
};


/**
 * Decorate the effect list.
 *
 * @param {rocket.Elements} parent
 *
 * @private
 */
shed.view.effect_list.prototype.decorate_list_ = function(parent) {
  var self = this;

  shed.effect.get_effects(function(effects) {
    if(effects.length === 0) {
      (new shed.component.none(
        'No effects found',
        'Make sure your effects are in the data/effects/ folder of your mod. (This will not be a requirement in the future)'
      )).render(parent);
    }
    else {
      var table = new jex.table({'rows': 0, 'columns': 1});
      table.table().addClass(['zebra', 'highlight'])
        .style('width', '100%');

      for (var i = 0; i < effects.length; i++) {
        var j = table.add_row();
        table.td(0, j).innerHTML(effects[i].get_name());

        if (effects[i].is_supported() === true) {
          (function(effect) {
            table.td(0, j).addEventListener('click', function() {
              (new shed.view.effect_editor(effect)).render();
            });
          })(effects[i]);
        }
        else {
          table.td(0, j).addClass('unsupported');
          table.td(0, j).appendChild($.createElement('small').innerHTML('No supported tracks'));
        }
      }

      parent.appendChild(table.table());
    }

  });
};
