import {EventEmitter} from 'events';
import DataChannel from './DataChannel';
import PeerConnection from './PeerConnection';
import {autobind, deprecate} from 'core-decorators';

// This expects a parameter a communication channel
// Notably this itself follows the channel interface.
// The Interface is defined as follows
@autobind
export class Peer extends EventEmitter{
    // const PeerConnection = webkitRTCPeerConnection;
    static RTCConfig = {"iceServers":[{"urls": ["stun:stun.l.google.com:19302"] }]};
    static RTCConstraints = {
        'mandatory': [
          {'DtlsSrtpKeyAgreement': true},
          {'RtpDataChannels': true }
        ]
    };
    // no av required.
    static SDPConstraints = {
        {
          'OfferToRecieveAudio': false,
          'OfferToRecieveVideo': false
        }
    };


    constructor(signalTransport, dataChannelConfig){
      super();
      this.config = dataChannelConfig || {
        channelName:'game-sock',
        channelOpts: {
          maxRetransmitTime: 250,
          ordered: false,
        }
      }
      this.__initializeTransport(signalTransport);
      this.once('error', ()=>{
        this.has_errors = false;
        this.close();
      });
    }

    __initializeTransport(signalTransport){
      this.signalTransport = signalTransport;
      this.signalTransport.on('error', this.__handleSingalTransportError);
      this.signalTransport.on('message', this.__handleSignalTransportMessage);
      this.signalTransport.on('connect', this.__handleSignalTransportConnected);
      this.signalTransport.on('close', this.__handleSignalTransportClose);
    }

    __handleSingalTransportError(err){
      this.emit('error', err);
    }

    __handleSignalTransportMessage({action, data}){
      switch(action){
        case 'ice':
          this.__processPeerIce(data);
          break;
        case 'offer':
          this.__processPeerOffer(data);
          break;
        case 'answer':
          this.__processPeerAnswer(data);
          break;
        default
          throw new Error('Unknown Action');
          break;
      }
    }

    __handleSignalTransportConnected(){
      this.__initializePeerConnection();
      this.__initializeDataChannel();
    }

    __handleSignalTransportClose(){
      console.warn("Signal Transport is now closed, nothing to do here");
    }


    __initializePeerConnection(){
      // Personally I'd override the PeerConnection.prototype.createDataChannel
      this.connection = new PeerConnection(Peer.RTCConfig, Peer.RTCConstraints);
      this.connection.on('ice', this.__sendIceCandidate);
    }

    __initializeDataChannel(dcName, dcConfig){
      // We cannot use this, its really a terrible api.
      const {channelName, channelOpts} = this.config;
      const dc = new DataChannel(this.connection.createDataChannel(
        channelName, channelOpts
      ));

      dc.on('open', this.__handleDataChannelOpen);
      dc.on('close', this.__handleDataChannelClose);
      dc.on('error', this.__handleDataChannelError);
      dc.on('message', this.__handleDataChannelMessage);
      this.dataChannel = dc;
    }

    // This is called when a 1:1 signalTransport is connected.
    // Keep in mind that the connection MUST be 1:1
    // the API does not handle 1:N or N:N cases, this MUST
    // be handled by the signalling connection layer.

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
      const iceCandidate = new iceCandidate(iceCandidateData);
      this.addIceCandidate(iceCandidate);
    }

    __handleDataChannelOpen(){
      this.open = true;
      this.emit('connect');
    }

    __handleDataChannelError(err){
      this.emit('error', err);
    }

    __handleChannelClose(){
      this.open = false;
      this.emit('close');
    }

    __handleDataChannelMessage(data){
      this.emit('message', data);
    }

    // this will send data to the specific
    // client.
    send(data){
      this.dataChannel.send(data);
    }

    close(){
      // close the signalling signalTransport
      this.signalTransport.close();
      this.dataChannel.close();
    }
}
