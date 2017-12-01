/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

const ChartjsNode = require('chartjs-node');
const when = require('when');
const log = require('loglevel').getLogger('commands');

const blakkisChart = module.exports = {};

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
        title: {
            display: true,
            text: 'Chart.js Line Chart'
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
    log.debug('Trying to make a line chart from data');
    let deferred = when.defer();
    try {
        var chartNode = new ChartjsNode(1024, 728);
        var lineChartConfig = lineChartTemplate;

        lineChartConfig.data = data;
        lineChartConfig.options.title.text = title;

        chartNode.drawChart(lineChartConfig)
            .then(() => {
                let buffer = chartNode.getImageBuffer('image/png');
                log.debug('Drawing line chart succeeded');
                deferred.resolve(buffer);
            }, (err) => {
                log.error('Error writing PNG to buffer:');
                log.error(err);
                deferred.reject();
            });
    } catch (err) {
        log.error('ChartJS err: ' + err);
        deferred.reject();
    }

    return deferred.promise;
};