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

/*
    linechart.js
    Library to easily draw linecharts.
*/

'use strict';

const ChartjsNode = require('chartjs-node');
const log = require('loglevel').getLogger('system');

const linechart = module.exports = {};

const lineChartTemplate = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        elements: {
            line: {
                tension: 0.4
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

linechart.getLineGraphBuffer = function(data, title) {
    log.debug('Trying to make a line chart from data');
    try {
        var chartNode = new ChartjsNode(1024, 728);
        var lineChartConfig = lineChartTemplate;

        lineChartConfig.data = data;
        lineChartConfig.options.title.text = title;

        return chartNode.drawChart(lineChartConfig)
            .then(() => {
                let buffer = chartNode.getImageBuffer('image/png');
                log.debug('Drawing line chart succeeded');
                return Promise.resolve(buffer);
            }).catch((err) => {
                log.error('Error writing PNG to buffer:');
                log.error(err);
                return Promise.reject();
            });
    } catch (err) {
        log.error('ChartJS err: ' + err);
        return Promise.reject();
    }
};