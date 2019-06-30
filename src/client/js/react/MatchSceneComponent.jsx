/* global React */

import inject from '../Injection.js';

export default class MatchSceneComponent extends React.Component {
  constructor () {
    super();
    this.leaveGame = this.leaveGame.bind(this);
  }

  leaveGame () {
    let game = inject('game');
    game.scene.keys.matchScene.room.leave();
    game.scene.keys.matchScene.fade();
  }

  render () {
    return <div>
      <div className='centered' id='instructions'>
        WASD to move (for now).
      </div>
      <div className='centered' >
        <button id='leave_btn' onClick={this.leaveGame}>
          Leave Game
        </button>
      </div>
    </div>;
  }
}
