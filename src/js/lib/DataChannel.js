import {EventEmitter} from 'events';

// Expects a RTCDataChannel
export class DataChannel extends EventEmitter{
  static eventTypes = ['error', 'message', 'open', 'close', 'bufferedamountlow'];

  constructor(channel){
    super();

    this.__channel = channel;
    // add events;
    DataChannel.eventTypes.forEach((eName) => {
      channel[`on${eName}`] = (...args) => this.emit(eName, ...args);
    })
  }

  send(..args){
    this.__channel.send(...args);
  }

  close(){
    this.__channel.send();
  }

  get label(){
    return this.__channel.label;
  }

  get ordered(){
    return this.__channel.ordered;
  }

  get maxPacketLifeTime(){
    return this.__channel.maxPacketLifeTime;
  }

  get maxRetransmits(){
    return this.__channel.maxRetransmits;
  }

  get protocol(){
    return this.__channel.protocol;
  }

  get negotiated(){
    return this.__channel.negotiated;
  }

  get id(){
    return this.__channel.id;
  }

  get readyState(){
    return this.__channel.readyState;
  }

  get bufferedAmount(){
    return this.__channel.bufferedAmount;
  }

  get bufferedAmountLowThreshold(){
    return this.__channel.bufferedAmountLowThreshold;
  }

  get binaryType(){
    return this.__channel.binaryType;
  }

  set binaryType(type){
    this.__channel.binaryType = type;
  }

}
