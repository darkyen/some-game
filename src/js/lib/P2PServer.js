import DataChannel from './DataChannel';
import PeerConnection from './PeerConnection';
import uuid from 'uuid';
import {openChannelWithPeer} from './channelUtils';
import {autobind} from 'core-decorators';
import {RTCConfig, RTCConstraints} from './P2PConfig';
import {EventEmitter} from 'events';

// Handles delta and stuff
@autobind
export class P2PSyncer{
  constructor(dc, peerData){
    this.channel = new DataChannel(dc);
    this.channel.on('message', this.__handleMessage);
    this.channel.once('error', this.__handleError);
    this.bufferedStates = [];
    this.nextMessage = {};
    this.states = 0;
  }

  // This is actually a very fake method
  // it barely queues the transport
  send(newState){
    newState.stateId = this.states++;
    this.__injectStateToBuffer(newState);
    this.__prepareDeltaOutput();
  }

  tick(){
    this.channel.send(this.nextMessage);
  }

  __injectStateToBuffer(newState){
    this.bufferedStates.push(newState);
  }

  __prepareDeltaOutput(){
    this.nextMessage = delta(
      this.bufferedStates.first(),
      this.bufferedStates.last()
    );
  }

  __handleError(err){
    this.hasError = true;
    this.emit('error', err);
    this.close();
  }

  __handleEvt({tick, playerState}){
    this.__updateAck(uuid, ack);
  }

  __handleReqFullState(){
    this.__updateAck(-1);
  }


  // some quake style networking
  __handleMessage({action, payload}){
    switch(action){
      // Ideal case
      case 'GAME_TICK':
        this.__handleEvt(payload);
        break;

      // Too much packet loss
      case 'REQ_FULL_STATE':
        this.__handleReqFullState(payload);
        break;
    }
  }

  // closes the data channel
  close(){
    this.channel.close();
    this.emit('close');
  }
}



// Handles creating a connection and then creating a P2P socket
// at which point this will handle the P2PSocket to the Gserver
// Server *ALWAYS* runs on a thread

@autobind
export default class PeerServer extends EventEmitter{
  constructor(){
    super();
    this.uuid = uuid.v4();
    this.clients = [];
  }

  __clientTick(client){
    client.tick();
  }

  serverTick(){
    this.clients.forEach(this.__clientTick);
  }


  async __handleConnRequest({connChannelId}){
    const tempChannel    = await openChannelWithPeer(connChannelId);
    const peerConnection = new PeerConnection(tempChannel);
    peerConnection.on('data-channel', d => this.__handleNewDataChannel(d));
  }

  async __handleSignallingMessage({action, payload}){
  }

  async __connect(){
    this.channel = await openChannel(`private-server-${this.uuid}`);
    this.channel.on('message', this.__handleSignallingMessage);
  }

  // starts listening for connections
  // ignores the port.
  async listen(){
    await this.__connect();
    this.__startTicking();
  }
}
