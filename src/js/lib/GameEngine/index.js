import P2PServer from '../P2PServer';
import P2PClient from '../P2PClient';
import {EventEmitter} from 'events';
import uuidGen from 'uuid';

// 45 ticks per seconds
// Simple player stuff.// Does Game Logic
export class Game extends EventEmitter{
    // Ticks per second
    static TPS = 45;
    static IDEAL_WAIT = 1000/45;

    constructor({uuid, maxClients, numClients, name, map}){
      super();
      this.uuid       = uuid || uuidGen.v4();
      this.players    = new Map();
      this.entities   = new Map();
      this.maxClients = maxClients;
      this.name       = name;
      this.map        = map;
      this.numClients = 0;
      this.round      = 0;
      this.tick       = 0;
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
  constructor(gameInfo, drone){
    super(gameInfo);

    // This will setup and ask the
    // server to respond on a channel
    this.p2pClient = new P2PClient(gameInfo);
    this.p2pClient.on('connected', e => this.emit('connected', e));
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
  constructor(gameInfo, drone){
    super(gameInfo);
    // this will create a server channel and
    // start listening to it.

    this.p2pServer = new P2PServer(gameInfo.uuid, drone);
    // server.on('authorization', this.handleAuthentication);
    // server.on('connect', this.addClient);
  }

  // Make sure we have a
  // verified game client
  async handleAuthentication(clientSocket){
    const jwt = await this.__getJwt(clientSocket);
  }

  // ServerOnly
  addClient(clientSocket){

  }

}
