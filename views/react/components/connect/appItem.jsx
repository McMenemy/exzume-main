var React = require('react');
var Style = require('../../util/style');

// components
var Rating = require('../util/rating');
var ConnectButton = require('./connectButton');

var AppItem = React.createClass({
  propTypes: {
    app: React.PropTypes.object.isRequired,
    isConnected: React.PropTypes.bool.isRequired,
  },

  // makeRatingCount: function () {
  //   var ratingCount = this.props.app.ratings.length;
  //   if (ratingCount === 1) {
  //     return ratingCount + ' rating';
  //   } else {
  //     return ratingCount + ' ratings';
  //   }
  // },

  render: function () {
    cardStyle = { marginTop: '1%', marginBottom: '1%' };
    return (
      <div className="ui card" style={cardStyle}>
        <div className="content">
          <img
            className="left floated tiny ui image"
            src={'/images/' + this.props.app.connectIcon}
            style={{ marginTop: '1%' }}
          />
        <div className="header" style={{ paddingTop: '3%' }}>
            {this.props.app.name}
          </div>
          <div className="meta">
            {this.props.app.categories.join(', ')}
          </div>
          <div className="ui one column grid">
            {/*<div className="row" style={{ paddingBottom: '0' }}>
              <Rating currentRating={this.props.app.avgRating} />
              <p style={{ marginLeft: '3%' }}>{this.makeRatingCount()}</p>
            </div>*/}
            <div className="row"></div>
            <div className="row" style={{ paddingTop: '0' }}>
              <ConnectButton
                appName={this.props.app.name}
                isConnected={this.props.isConnected}
                openUrl={this.props.app.openUrl}
                connectUrl={'/auth/datastreams/' + this.props.app.name.toLowerCase()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },

});

module.exports = AppItem;
