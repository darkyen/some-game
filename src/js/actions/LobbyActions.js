import PusherGameChannel from '../lib/PusherGameChannel';
import dispatcher from '../Dispatcher';
import Constants from '../Constants';
import uuid from 'uuid';

let lobbyChannel = null;
let advertisement = null;

function closeChannel(){
  if( lobbyChannel ) {
    lobbyChannel.close();
  }
}

// Emits it for the store to handle some
// stuff like finding new peers and stuff.
function handleMessage({action, payload}){
  dispatcher.dispatch({
    payload: payload,
    action: action,
  })
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

  startAdvertising(gameInfo){
    // Emit an advertisement every 5 seconds
    // with updated game state.
    console.log("Started Advertising");
    gameInfo.uuid = uuid.v4();
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
  joinGame(game){

  }
};
