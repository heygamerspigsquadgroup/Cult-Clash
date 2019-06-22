const React = require('react');

class MainComponent extends React.Component {
  constructor () {
    super();
    this.game = window.inject.get('game');
  }

  render () {
    return <div>Hello World</div>;
  }
}

exports.MainComponent = MainComponent;
