/* global React */

import inject from '../Injection.js';
import { TITLE_SCENE_ID } from '../scenes/TitleScene.js';

export default class MatchSceneComponent extends React.Component {
  constructor () {
    super();
    this.leaveGame = this.leaveGame.bind(this);
  }

  leaveGame () {
    let game = inject('game');
    game.scene.keys.matchScene.room.leave();
    game.scene.start(TITLE_SCENE_ID);
  }

  render () {
    return <div>
      <div className='centered'>
        WASD to move (for now). Open multiple tabs to see syncing
      </div>
      <div className='centered'>
        <button onClick={this.leaveGame}>
          Leave Game because it totally sucks and ain't worth it
        </button>
      </div>
    </div>;
  }
}
