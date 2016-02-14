// Singleton
import {EventEmitter} from 'events';
import {GameServer, GameClient} from './index';
import getDrone from '../drone';

class GameManager extends EventEmitter{
  constructor(){
    super();
    this.currentGame = null;

    ( global || window ).gx = (...args) => {
      this.__runCmd(...args);
    }
  }

  async __initDrone__(){
    this.drone = getDrone();
    this.droneInitiated = true;
  }

  async __deacDrone(){

  }

  __runCmd(cmd, ...params){
      this[cmd](...params);
  }

  async createServer(params){
    if( this.currentGame ){
      throw new Error('Cannot create a server when a game is already in progress');
    }
    await this.__initDrone__();
    this.currentGame = new GameServer(params, this.drone);
  }

  async createClient(params){
    if( this.currentGame ){
      throw new Error('Cannot create a client when a game is already in progress');
    }
    await this.__initDrone__();
    this.currentGame = new GameClient(params);
    this.currentGame.once('connected', e => this.drone.close());
  }
}


export default new GameManager();
