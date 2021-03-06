//import only in browser enviroment
if (__BROWSER__) {
  require('easy-pie-chart/dist/jquery.easypiechart')
  require('toastr/toastr.scss')
  var toastr = require('toastr')
}

export default class Test {
  onMount() {
    $('.chart').easyPieChart({
      easing: 'easeOutBounce',
      onStep: function(from, to, percent) {
        $(this.el).find('.percent').text(Math.round(percent));
      }
    });

    $('#btn').click(function() {
      toastr.success('Have fun storming the castle!', 'Miracle Max Says')
    });
  }

  onCreate(input, out) {
  }

  onRender() {
  }

  onUpdate() {
  }

  inc() {
    this.input = Object.assign({}, this.input, {
      initCount: this.input.initCount + 1
    })
  }

  dec() {
    this.input = Object.assign({}, this.input, {
      initCount: this.input.initCount - 1
    })
  }

  updateChart() {
    var chart = $('.chart').data('easyPieChart');
    chart.update(Math.random() * 200 - 100);
  }
}
