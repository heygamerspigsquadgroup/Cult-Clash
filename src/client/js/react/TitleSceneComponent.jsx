/* global React */

import inject from '../Injection.js';
import { MATCH_SCENE_ID } from '../scenes/MatchScene.js';

export default class TitleSceneComponent extends React.Component {
  constructor () {
    super();
    this.playGame = this.playGame.bind(this);
  }

  playGame () {
    let game = inject('game');
    game.scene.start(MATCH_SCENE_ID);
  }

  render () {
    return <div>
      <span className='overlay centered' style={{ fontSize: 'xx-large', top: '200px', color: '#ed044c' }}>
        Key Kalamity
      </span>
      <button className='overlay centered' style={{ top: '500px' }} onClick={this.playGame}>
        Join Game
      </button>
    </div>;
  }
}
