import React from 'react';
import {last} from 'lodash';
import {fNum2} from './useNumbers';
import ReactEcharts from 'echarts-for-react';

const BalLineChart = (props) => {
  const getChartConfigs = () => ({
    // controls the legend you see at the top
    // formatter allows us to show the latest value for each series
    legend: {
      show: props.showLegend,
      left: 0,
      top: 0,
      icon: 'roundRect',
      itemHeight: 5,
      selected: props.legendState || {},
      textStyle: {
        color: 'gray',
      },
      inactiveColor: 'gray',
    },
    xAxis: {
      type: 'time',
      show: !props.hideXAxis,
      axisTick: {show: true, alignWithLabel: true},
      axisLine: {
        onZero: false,
        lineStyle: {color: 'gray'},
      },
      axisLabel: {
        formatter: props.axisLabelFormatter.xAxis ?
          (value) => fNum2(value, props.axisLabelFormatter.xAxis) :
          undefined,
        color: 'gray',
      },
    },
    // controlling the display of the Y-Axis
    yAxis: {
      axisLine: {
        show: !props.hideYAxis,
        lineStyle: {color: 'gray'},
      },
      min: props.useMinMax ? 'dataMin' : null,
      max: props.useMinMax ? 'dataMax' : null,
      type: 'value',
      show: !props.hideYAxis,
      splitNumber: 4,
      splitLine: {
        show: false,
      },
      position: 'right',
      axisLabel: {
        show: !props.hideYAxis,
        formatter: props.axisLabelFormatter.yAxis ?
          (value) => fNum2(value, props.axisLabelFormatter.yAxis) :
          undefined,
        color: 'gray',
      },
      nameGap: 25,
    },
    color: props.color,
    // Controls the boundaries of the chart from the HTML defined rectangle
    grid: props.customGrid || {
      left: '2.5%',
      right: 0,
      top: '10%',
      bottom: '5%',
      containLabel: true,
    },
    tooltip: {
      show: props.showTooltip,
      trigger: 'axis',
      confine: true,
      axisPointer: {
        type: 'shadow',
        label: {
          show: false,
        },
      },
      backgroundColor: 'white',
      borderColor: 'white',
      formatter: (params) => {
        return `
              <div class='d-flex flex-column bg-white'>
                <span>${params[0].value[0]}</span>
                ${params
          .map(
            (param) => `
                      <span>
                        ${param.marker} ${param.seriesName}
                        <span class='fw-bold'>
                          ${fNum2(param.value[1], props.axisLabelFormatter.yAxis)}
                        </span>
                      </span>
                    `
          )
          .join('')}
              </div>
            `;
      },
    },
    series: props.data.map((d, i) => ({
      data: d.values,
      type: 'line',
      smooth: 0.3,
      showSymbol: false,
      name: d.name,
      silent: true,
      animationEasing: function(k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      },
      lineStyle: {
        width: 2,
      },
      // This is a retrofitted option to show the small pill with the
      // latest value of the series at the end of the line on the RHS
      // the line is hidden, but the label is shown with extra styles
      markLine: {
        symbol: 'roundRect',
        symbolSize: 0,
        lineStyle: {
          color: 'rgba(0, 0, 0, 0)',
        },
        precision: 5,
        label: {
          backgroundColor: (props.color || [])[i] || 'black',
          borderRadius: 3,
          padding: 4,
          formatter: (params) => {
            return fNum2(params.data.yAxis, props.axisLabelFormatter.yAxis);
          },
          color: '#FFF',
          fontSize: 10,
        },
        data: props.isLastValueChipVisible ?
          [
            {
              name: 'Latest',
              yAxis: (last(props.data[i]?.values) || [])[1],
            },
          ] :
          [],
        animation: false,
      },
    })),
  });

  const chartConfig = getChartConfigs();

  if (chartConfig.series[0] && chartConfig.series[0].data) {
    return <ReactEcharts
      option={chartConfig}
      // option={this.getOption()}
      style={{height: '100%', width: '90%'}}
      opts={{renderer: 'svg'}}
      updateAxisPointer={() => alert('calld')}
    />;
  }

  return (
    <div>Loading...</div>
  );
};

export default BalLineChart;
