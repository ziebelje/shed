shed.component.header = function(title) {
  this.title_ = title;
  shed.component.apply(this, arguments);
}
$.inherits(shed.component.header, shed.component);

shed.component.header.prototype.title_;

shed.component.header.prototype.decorate_ = function(parent) {
  var table = new jex.table({'rows': 1, 'columns': 3});

  table.table().style('width', '100%');

  var home_icon = $.createElement('img')
    .style('cursor', 'pointer')
    .setAttribute('src', 'img/arrow_left.png')
    .addEventListener('click', function() {
      new shed.view.main();
    });
  table.td(0, 0).style('width', '30px').appendChild(home_icon);

  var title = $.createElement('h1').innerHTML(this.title_);
  table.td(1, 0).appendChild(title);

  var stonehearth_logo = $.createElement('img')
    .setAttribute('src', 'img/stonehearth_logo.png')
    .style('width', '200px');
  table.td(2, 0).style('text-align', 'right').appendChild(stonehearth_logo);

  parent.appendChild(table.table());
};
