class RuneBag {
  constructor(...runes) {
    this.possibleRunes = runes;
    this.contents = [];
    this.addRunes(runes);
  }

  addRunes(...runes) {
    runes.forEach(() => this.addRune);
  }

  addRune(rune) {
    if(this.possibleRunes.includes(rune)) {
      this.contents.push(rune);
    }
  }

  takeRune(rune) {
    if(this.contents.includes(rune)) {
      this.contents = this.contents.splice(this.contents.indexOf(rune), 1);
      return rune;
    }
    return null;
  }

  takeRandomRune() {
    let rune = this.contents[Math.floor(Math.random() * this.contents.length)];
    return this.takeRune(rune);
  }
}

exports.RuneBag = RuneBag;

exports.MOVEMENT_SET_1 = new RuneBag('A', 'B', 'C', 'D', 'E', 'F');
exports.MOVEMENT_SET_2 = new RuneBag('G', 'H', 'I', 'J', 'K', 'L', 'M');
exports.MOVEMENT_SET_3 = new RuneBag('N', 'O', 'P', 'Q', 'R', 'S');
exports.MOVEMENT_SET_4 = new RuneBag('T', 'U', 'V', 'W', 'X', 'Y', 'Z');
exports.THROW_SET = new RuneBag('1', '2', '3', '4', '5', '6', '7', '8', '9', '0');
