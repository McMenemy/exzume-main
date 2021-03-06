var React = require('react');
var Recharts = require('recharts');
var moment = require('moment');
var Style = require('../../util/style');
var ScatterChart = Recharts.ScatterChart;
var Scatter = Recharts.Scatter;
var XAxis = Recharts.XAxis;
var YAxis = Recharts.YAxis;
var ZAxis = Recharts.ZAxis;
var CartesianGrid = Recharts.CartesianGrid;
var Tooltip = Recharts.Tooltip;
var Legend = Recharts.Legend;

const fillColors = [
                    '#023fa5', '#7d87b9', '#bec1d4', '#d6bcc0', '#bb7784', '#8e063b', '#4a6fe3',
                    '#8595e1', '#b5bbe3', '#e6afb9', '#e07b91', '#d33f6a', '#11c638', '#8dd593',
                    '#c6dec7', '#ead3c6', '#f0b98d', '#ef9708', '#0fcfc0', '#9cded6', '#d5eae7',
                    '#f3e1eb', '#f6c4e1', '#f79cd4',
                   ];

const CustomTooltip = React.createClass({
  propTypes: {
    payload: React.PropTypes.array,
    notes: React.PropTypes.array,
    data: React.PropTypes.array,
  },

  getNotes: function (dateTime) {
    if (this.props.notes) {
      var i;
      for (i = 0; i < this.props.notes.length; i++) {
        if (this.props.notes[i].x == dateTime) {
          return (
            <p className="note">{'note:' +  this.props.notes[i].y}</p>
          );
        }
      }
    }

    return null;
  },

  render: function () {
    var active = this.props.active;

    if (active) {
      var payload = this.props.payload;
      var notes = this.props.notes;

      return (
        <div className="custom-tooltip">
          <p className="date">
            {payload[0].name + ':' + moment(payload[0].value).format('MM-DD-YY')}
          </p>
          <p className="value">{payload[1].name + ':' + payload[1].value}</p>
          {this.getNotes(payload[0].value)}
        </div>
      );
    }

    return null;
  },
});

var TimeSeriesGraph = React.createClass({
  propTypes: {
    data: React.PropTypes.array.isRequired,
    moodNoteData: React.PropTypes.object,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
  },

  // makes selected feature larger
  getScatterWidth: function (idx) {
    if (idx == 0) {
      return { strokeWidth: 1 };
    } else {
      return { strokeWidth: 1 };
    }
  },

  makeScatters: function () {
    var _this = this;
    return this.props.data.map(function (series, idx) {
      return (
        <Scatter
          key={idx}
          name={series.name}
          data={series.data}
          line={_this.getScatterWidth(idx)}
          fill={fillColors[idx % fillColors.length]}
        />
      );
    });
  },

  makeTooltip: function () {
    var moodNoteSeriesData = [];
    if (this.props.moodNoteData) {
      moodNoteSeriesData = this.props.moodNoteData.data;
    }

    return (
      <CustomTooltip payload={this.props.data} notes={moodNoteSeriesData} />
    );
  },

  render: function () {
    if (this.props.data[0].name == 'nothing selected') {
      var title = '';
    } else {
      if (this.props.data.length == 1) {
        var title = this.props.data[0].name + ' Over Time';
      } else {
        var title = this.props.data.length + ' Features Over Time';
      }
    }

    // var tickCount = 0;
    // for (var seriesKey in this.props.data) {
    //   if (tickCount < this.props.data[seriesKey].data.length) {
    //     tickCount = this.props.data[seriesKey].data.length;
    //   }
    // }

    return (
      <div style={{ textAlign: 'center' }}>
        <div
          className="ui medium header"
          style={{ display: 'inline-block', margin: '0' }}
        >
          {title}
        </div>
        <ScatterChart
          width={this.props.width}
          height={this.props.height}
          margin={{ top: 20, right: 50, bottom: 20, left: -10 }}
        >
          <XAxis
            dataKey={'x'}
            name='date'
            type='number'
            tickFormatter={
              function (time) {
                return moment(time).format('MM-DD, H') + 'h';
              }
            }
            domain={['dataMin', 'dataMax']}
          />
          <YAxis dataKey={'y'} name='value' />
          <CartesianGrid />
          <Tooltip
            content={this.makeTooltip()}
            wrapperStyle={{ padding: '10px',
                            maxWidth: '200px',
                            backgroundColor: Style.lightBackgroundHover,
                            borderRadius: '10px', }}
            cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          {this.makeScatters()}
        </ScatterChart>
      </div>
    );
  },

});

module.exports = TimeSeriesGraph;
