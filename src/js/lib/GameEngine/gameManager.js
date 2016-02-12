// Singleton
import {EventEmitter} from 'events';
import {GameServer, GameClient} from './index';

class GameManager extends EventEmitter{
  constructor(){
    super();
    this.currentGame = null;
    ( global || window ).gx = (...args) => {
      this.__runCmd(...args);
    }
  }

  __runCmd(cmd, ...params){
      this[cmd](...params);
  }

  createServer(params){
    this.currentGame = new GameServer(params);
  }

  createClient(params){
    this.currentGame = new GameClient(params);
  }
}


export default new GameManager();
