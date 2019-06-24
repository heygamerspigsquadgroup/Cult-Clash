/* global Phaser */

export default class SplashScene extends Phaser.Scene {
  preload () {
  }

  getSession(){
    return this.room.sessionId;
  }

  create () {
    // connect
    this.client = new Colyseus.Client('ws://localhost:2567');
    this.room = this.client.join("my_room");

    this.room.onMessage.add((message) => {
      this.updateText(message);
    });

    // place text elements
    this.roomText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#FFF' });
    for(var i = 0; i < 4; i++) {
        this.playerText[i] = this.add.text(16, 50 + 30 * i, '', { fontSize: '32px', fill: '#FFF' });
    }

    // add handlers for key presses
    this.input.keyboard.on('keydown', (event) => {
      this.keyDown(event);
    });

    this.input.keyboard.on('keyup', (event) => {
      this.keyUp(event);
    });
  }

  update() {

  }

  keyDown(event){
    this.room.send({ press: "down", key: event.key });

  }

  keyUp(event){
    this.room.send({ press: "up", key: event.key });
  }


  // update room name and player list
  updateText (message) {
    this.roomText.setText('Room: ' + message.roomId);

    for(var i = 0; i < 4; i++) {
      if (message.playerList[i]){
        this.playerText[i].setText('Player #' + (i+1) + ": " + message.playerList[i]);
                // color green if this is you
        if (message.playerList[i] === this.getSession()){
            this.playerText[i].setColor("#00ff00", 0);
        }
        else{
            this.playerText[i].setColor("#ffffff", 0);
        }

      }
      else{
        this.playerText[i].setText('');
      }
    }
  }
}
SplashScene.prototype.client;
SplashScene.prototype.room;

SplashScene.prototype.roomText;
SplashScene.prototype.playerText = [];