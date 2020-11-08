
class Game {
  constructor (id, czar, started, packs, players, owner) {
    this.czar = czar
    this.started = started || false
    this.packs = packs || '1.0'
    this.players = players || []
    this.owner = owner || undefined
    this.id = id
  }
}

module.exports = Game
