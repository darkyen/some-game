import {autobind} from 'core-decorators';
import {EventEmitter} from 'events';
import uuid from 'uuid';
import PeerConnection from './PeerConnection';

export default class P2PClient extends EventEmitter{
  // peerDetails must be known here
  // in any case.
  constructor(signalTransport, peerDetails){
    super();
    this.uuid = uuid.v4();
    this.pc   = new PeerConnection(signalTransport, peerDetails, {
      isOffering: true
    });
    this.pc.on('connect', e => this.emit('connected', e));
  }
}
