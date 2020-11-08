
class Game {
  constructor (id, name, owner) {
    this.name = name
    this.owner = owner || undefined
    this.id = id
    this.sockets = []
  }
}

module.exports = Game
