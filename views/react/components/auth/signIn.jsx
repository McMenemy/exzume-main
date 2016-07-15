var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var FastFlux = require('../../util/fast-flux-react/fastFlux');
var History = require('react-router').History;

var SignIn = React.createClass({
  mixins: [LinkedStateMixin, History],

  getInitialState: function () {
    return { errors: '', username: '', password: '', loading: false };
  },

  handleSubmit: function (event) {
    event.preventDefault();

    this.setState({ errors: '' });

    if (this.state.username === '') {
      this.setState({ errors: 'username required' });
    } else if (this.state.password === '') {
      this.setState({ errors: 'password required' });
    } else {
      var signInBody = {
        username: this.state.username,
        password: this.state.password,
      };

      // will remain in loading state until AJAX callback changes state
      this.setState({ loading: true });
      FastFlux.webCycle('post', '/signin', {
        body: signInBody,
        success: this.successCallback,
        error: this.errorCallback,
        shouldReceive: true,
        type: 'SESSION_RECEIVED',
      });
    }
  },

  errorCallback: function (errorMessage) {
    this.setState({ loading: false });
    this.setState({ errors: errorMessage });
  },

  successCallback: function () {
    this.history.push('/dashboard');
  },

  makeErrors: function () {
    if (this.state.errors !== '') {
      return (
        <div className="ui red message">{this.state.errors}</div>
      );
    }
  },

  makeSubmitButton: function () {
    if (this.state.loading) {
      return (
        <div
          className="ui teal disabled loading button"
          type="submit">Submit
        </div>
      );
    } else {
      return (
        <div className="ui teal button" type="submit" onClick={this.handleSubmit}>Submit</div>
      );
    }
  },

  clickHomeLink: function () {
    this.history.push('/');
  },

  clickSignUpLink: function () {
    this.history.push('/signup');
  },

  render: function () {
    var containerStyle = { margin: '10%' };
    var linkStyle = { cursor: 'pointer', color: '#008080' };

    return (
      <div className="ui container" style={containerStyle}>
        <form className="ui form">
          <h2 className="ui header">Sign In</h2>
          {this.makeErrors()}
          <div className="required field">
            <label>username</label>
            <input
              type="text"
              name="username"
              placeholder=""
              valueLink={this.linkState('username')}
            ></input>
          </div>

          <div className="required field">
            <label>password</label>
            <input
              type="password"
              name="password"
              placeholder=""
              valueLink={this.linkState('password')}
            ></input>
          </div>

          <p>Don't have an account? Then go back to the <a style={linkStyle} onClick={this.clickHomeLink}>Home Page</a> and request beta access!
          </p>

          {this.makeSubmitButton()}
        </form>
      </div>
    );
  },

});

module.exports = SignIn;
