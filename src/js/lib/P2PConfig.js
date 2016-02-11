import {EventEmitter} from 'events';
import DataChannel from './DataChannel';
import PeerConnection from 'rtcpeerconnection';
import {autobind, deprecate} from 'core-decorators';
const RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
const RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;

// This expects a parameter a communication channel
// Notably this itself follows the channel interface.
// The Interface is defined as follows
export default {
    // const PeerConnection = webkitRTCPeerConnection;
    RTCConfig : {
      "iceServers":[
        {"urls": ["stun:stun.l.google.com:19302"] }
      ]
    },

    RTCConstraints : {
        'mandatory': [
          {'DtlsSrtpKeyAgreement': true},
          {'RtpDataChannels': true }
        ]
    },

    DataSDPConstraints : {
      'mandatory': {
        'OfferToRecieveAudio': false,
        'OfferToRecieveVideo': false
      }
    },

    AudioSDPConstraints: {
      'mandatory': {
        'OfferToRecieveVideo': false,
        'OfferToRecieveAudio': true
      }
    }
};
