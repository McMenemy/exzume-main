var React = require('react');

var NavbarHolder = React.createClass({

  render: function () {
    var style = {
      zIndex: '-2',
      boxShadow: 'none',
      border: 'none',
    };

    return (
      <div className="ui top white menu" style={  style } />
    );
  },

});

module.exports = NavbarHolder;