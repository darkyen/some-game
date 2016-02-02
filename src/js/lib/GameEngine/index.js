import P2PServer from '../P2PConnection';
import P2PClient from '../P2PClient';
import {EventEmitter} from 'events';

// 45 ticks per seconds
// Simple player stuff.// Does Game Logic
export class Game extends EventEmitter{
    // Ticks per second
    static TPS = 45;
    static IDEAL_WAIT = 1000/45;

    constructor(gameInfo){
      super();
      this.round      = 0;
      this.tick       = 0;
      this.players    = new Map();
      this.entities   = new Map();
      this.maxClients = gameInfo.maxClients;
      this.numClients = gameInfo.clients;
      this.name       = gameInfo.name;
      this.map        = gameInfo.map;
    }

    start(){
      this.queue(0);
    }

    queue(dt){
      const time = dt > Game.IDEAL_WAIT ? 0 : IDEAL_WAIT - dt;
      setTimeout(logic, dt);
    }
    // Private methods only a deriving class can use.
    __updateClient(clientData){
      this.player.set(clientData.uuid, clientData);
    }

    __updateEntity(entity){
      this.entities.set(entity.uuid, entity);
    }

    logic(){
      // time management
      const now = Date.now();
      const dt = this.last - now;
      const currentTick = this.tick++;
      this.last = now;

      // Move all entities
      for( let entity of this.entities.values() ){
        entity.logic(dt);
      }

      // Move all the players
      for( let player of this.players.values() ){
        player.logic(dt);
      }

      this.queue(dt);
      // Move all Players.
    }
}

// Does Game Client handling and
// handles controls.
export class GameClient extends Game{
  constructor(gameInfo){
    super(gameInfo);
  }

  addEvents(){
    // document.addEventListener('keydown', e => );
    // document.addEventListener('keyup', e => )
  }

  addTransport(dataChannel){

  }

  onNewState(state){
    this.updateGameState(state);
  }
}


// Syncs the multiple client stuff
export class GameServer extends Game{
  //
  constructor(gameInfo){
    super(gameInfo);
  }

  // ServerOnly
  addClient(){

  }

}
