import {EventEmitter} from 'events';
import DataChannel from './DataChannel';
import {autobind} from 'core-decorators';
import {
  RTCConfig,
  RTCConstraints,
  DataSDPConstraints,
  AudioSDPConstraints
} from './P2PConfig';

function w(...names){
  return names.reduce((ref, name) => ref || window[name], null);
}

const RTCIceCandidate = w(
  'RTCIceCandidate',
  'mozRTCIceCandidate',
  'webkitRTCPeerConnection'
);

const RTCSessionDescription = w(
  'RTCSessionDescription',
  'mozRTCSessionDescription',
  'webkitRTCPeerConnection'
);

const RTCPeerConnection = w(
  'RTCPeerConnection',
  'webkitRTCPeerConnection',
  'mozRTCPeerConnection'
);

const defaultConfig = {
  channelName:'game-sock',
  channelOpts: {
    maxRetransmitTime: 250,
    ordered: false,
  },
  SDPConstraints: DataSDPConstraints
};

// This class handles only the task of opening
// a peer connection and opening DataChannel
// or AudioChannel at the end of that process
@autobind
export default class PeerConnection extends EventEmitter{

  constructor(signalTransport, config = {}){
    super();
    this.config = Object.assign(defaultConfig, config);
    this.__initializeTransport(signalTransport);
    this.once('error', this.__handleError);
    signalTransport.send('ready');
  }

  __handleError(){
    this.hasError = true;
    this.close();
  }

  __handleNewDataChannel(dataChannel){
    const dc = new DataChannel(dataChannel);
    this.emit('dataChannel', dc);
  }


  __initializeTransport(signalTransport){
    this.signalTransport = signalTransport;
    this.signalTransport.on('error',  this.__handleSingalTransportError);
    this.signalTransport.on('ready',  this.__initializePeerConnection);
    this.signalTransport.on('ice',    this.__processPeerIce);
    this.signalTransport.on('offer',  this.__processPeerOffer);
    this.signalTransport.on('answer', this.__processPeerAnswer);
    this.signalTransport.on('close',  this.__handleSignalTransportClose);
  }

  __handleSingalTransportError(err){
    this.emit('error', err);
  }

  __handleSignalTransportClose(){
    console.info("Signal Transport is now closed, nothing to do here");
  }

  __initializePeerConnection(){
    // Personally I'd override the PeerConnection.prototype.createDataChannel
    const pc = new RTCPeerConnection(RTCConfig, RTCConstraints);
    if(this.config.channelName){
      this.__initializeDataChannel(pc.createDataChannel(
        this.config.channelName,
        this.config.channelOpts
      ));
    }
    pc.on('ice', this.__sendIceCandidate);
    pc.createOffer(
      this.__handleLocalOffer,
      this.__handleError,
      this.config.SDPConstraints
    )
    this.connection = pc;
  }

  // This is called when a 1:1 signalTransport is connected.
  // Keep in mind that the connection MUST be 1:1
  // the API does not handle 1:N or N:N cases, this MUST
  // be handled by the signalling connection layer.
  __handleDataChannelError(err){
    this.emit('error', err);
  }


  __handleDataChannelMessage(data){
    this.emit('message', data);
  }

  __handleOfferWithLocalDescription(completeOffer){
    this.signalTransport.send('offer', completeOffer);
  }


  __sendPeerIceCandidate({candidate}){
    if( ! candidate ){
      return;
    }
    this.signalTransport.send('ice', candidate);
  }

  __processPeerOffer(peerOffer){
    const rd = new RTCSessionDescription(peerOffer);
    this.connection.setRemoteDescription(rd);
    this.connection.createAnswer((sdp) => {
      this.connection.setLocalDescription(sdp);
      this.signalTransport.send('answer', sdp);
    }, null, Peer.SDPConstraints);
  }

  __processPeerAnswer(peerAnswer){
    const rd = new RTCSessionDescription(peerAnswer);
    this.connection.setRemoteDescription(rd);
  }

  __processPeerIce(iceCandidateData){
    const iceCandidate = new RTCIceCandidate(iceCandidateData);
    this.addIceCandidate(iceCandidate);
  }

  // Offer the other guy.
  __handleLocalOffer(offer){
    this.connection.setLocalDescription(
      offer,
      this.__handleOfferWithLocalDescription,
      this.__handleError
    );
  }

  close(){
    // close the signalling signalTransport
    this.signalTransport.close();
    this.dataChannel.close();
    this.connection.close();
  }

}
