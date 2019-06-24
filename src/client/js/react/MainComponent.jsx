/* global React */

import inject from '../Injection.js';

export default class MainComponent extends React.Component {
  constructor () {
    super();
    this.game = inject('game');
  }

  render () {
    return <div>Hello World</div>;
  }
}
