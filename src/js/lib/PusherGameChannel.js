import {EventEmitter} from 'events';
import {autobind} from 'core-decorators';
import getDrone from './drone';

// @TODO : Rename this file to ScaleDroneRoom

@autobind
export default class Room extends EventEmitter{
  constructor(roomName){
    super();
    this.roomName = roomName;
    this.__init__();
  }

  async __init__(){
    const drone = await getDrone();
    this.room = drone.subscribe(roomName);
    this.room.on('open', this.__handleOpen);
    this.room.on('data', this.__handleData);
    this.room.on('error', this.__handleError);
  }

  __handleError(err){
    this.emit('error', err)
    this.close();
  }

  __handleOpen(err){
    if( err ){
      this.emit('error', err);
      return;
    }
    this.emit('open');
  }

  __handleData(message){
    const {action, payload} = message;
    this.emit(action, payload);
  }

  send(action, payload){
    const message = JSON.stringify({action, payload});
    const room = this.roomName;
    drone.publish({room, message});
  }

  close(){
    drone.unsubscribe(this.roomName);
    this.emit('close');
  }
}
