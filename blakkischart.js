const ChartjsNode = require('chartjs-node');
const fs = require('fs');
const when = require('when');

const blakkisChart = {};

const lineChartTemplate = {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    elements: {
      line: {
        tension: 0, // disables bezier curves
      }
    },
    title:{
      display:true,
      text:'Chart.js Line Chart'
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Aika'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Promillet'
        }
      }]
    }
  }
};

blakkisChart.getLineGraphBuffer = function(data, title) {
  let deferred = when.defer();
  console.log("Trying to make a line graph from data");
  try {
    var chartNode = new ChartjsNode(1024, 728);
    var lineChartConfig = lineChartTemplate;

    lineChartConfig.data = data;
    lineChartConfig.options.title.text = title;

    chartNode.drawChart(lineChartConfig)
      .then(() => {
        console.log('Generated PNG buffer...');
        deferred.resolve(chartNode.getImageBuffer('image/png'));
      }, (err) => {
        console.log("Error writing PNG to buffer:")
        console.error(err)
        deferred.reject()
      });
  } catch(err){
    console.log("ChartJS err: " + err);
    deferred.reject();
  }

  return deferred.promise;
};

module.exports = blakkisChart;
