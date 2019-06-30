/* global React */

import inject from '../Injection.js';

export default class TitleSceneComponent extends React.Component {
  constructor () {
    super();
    this.playGame = this.playGame.bind(this);
  }

  playGame () {
    let game = inject('game');
    game.scene.keys.titleScene.joinGame();
  }

  currentFading () {
    let game = inject('game');
    return game.scene.keys.titleScene.fadePercent;
  }

  render () {
    let currentFade = this.currentFading();
    return <div>
      <img src='assets/images/title_anim.gif' className='overlay centered' style={{ top: '300px', width: '600px', opacity: currentFade }} />
      <button className='overlay centered' id='join_btn' style={{ top: '500px', opacity: currentFade }} onClick={this.playGame}>
        Join Game
      </button>
    </div>;
  }
}
