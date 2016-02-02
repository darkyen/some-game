import PusherGameChannel from '../lib/PusherGameChannel';
import dispatcher from '../Dispatcher';
import Constants from '../Constants';
import uuid from 'uuid';
import GameEngine from '../lib/GameEngine';
import {
  openChannelWithServer,
  openChannelWithClient
} from '../lib/channelUtils';

let lobbyChannel = null;
let advertisement = null;

function closeChannel(){
  if( lobbyChannel ) {
    lobbyChannel.close();
  }
}

// Emits it for the store to handle some
// stuff like finding new peers and stuff.
async function handleMessage({action, payload}){
  switch(action){
    case Constants.ActionTypes.OFFER_JOIN:
      const {serverChannel, clientChannel} = payload;
      const channelId = `private-hs-${serverUUID}-${clientUUID}`;
      window.channel = await openChannelWithClient(channelId);
      console.log("Channel Opened with client");
    break;
    default:
      dispatcher.dispatch({action, payload});
    break;
  }
}

function handleConnect(){
  dispatcher.dispatch({
    action: Constants.ActionTypes.LOBBY_CONNECTED
  });
}

function handleClose(){
  lobbyChannel = null;
  dispatcher.dispatch({
    action: Constants.ActionTypes.LOBBY_DISCONNECTED
  });
}

function handleError(){
  dispatcher.dispatch({
    action: Constants.ActionTypes.LOBBY_ERROR,
    payload: {
      message: 'There was some error on the lobby, you should try refreshing!'
    }
  });
}

function openChannel(){
  if( lobbyChannel ){
    // should never occur but meh
    return handleConnect();
  }
  lobbyChannel = new PusherGameChannel('private-game-lobby');
  // Connected to lobby
  lobbyChannel.on('error',   handleError);
  lobbyChannel.on('connect', handleConnect);
  lobbyChannel.on('message', handleMessage);
  lobbyChannel.on('close',   handleClose);
  lobbyChannel.once('error', closeChannel);
}


export default {
  // Connects using pusher
  // and marks this as a server
  openLobby(){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_OPENED
    });
    openChannel();
  },

  closeLobby(){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_CLOSED
    });
    closeChannel();
  },


  // Creates a server and starts advertising it.
  startAdvertising(gameInfo){
    // Emit an advertisement every 5 seconds
    // with updated game state.
    console.log("Started Advertising");
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_ADVERTISE_START
    });
    lobbyChannel.send(Constants.ActionTypes.LOBBY_SERVER_UP, gameInfo);
    advertisement = setInterval(() => {
      lobbyChannel.send(Constants.ActionTypes.LOBBY_SERVER_UP, gameInfo);
    }, 5000);
  },

  stopAdvertising(gameInfo){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_ADVERTISE_STOP
    });
    lobbyChannel.send(Constants.ActionTypes.LOBBY_SERVER_GONE, gameInfo);
    clearInterval(advertisement);
  },

  startBrowsingGames(){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_START_BROWSING
    })
    closeChannel();
  },

  stopBrowsingGames(){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_STOP_BROWSING
    })
    closeChannel();
  },

  // From here things go slightly hard
  async joinGame(serverUUID, clientUUID){
    // send the channel notification
    dispatcher.dispatch({
      action: Constants.ActionTypes.ATTEMPT_JOIN,
    });

    lobbyChannel.send(Constants.ActionTypes.OFFER_JOIN, {
      serverUUID, clientUUID
    });

    const channelId   = `private-hs-${serverUUID}-${clientUUID}`;
    const gameChannel = await openChannelWithServer(channelId);
    console.log("Channel opened with server");
  }
};
