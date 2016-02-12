import 'whatwg-fetch';
import uuid from 'uuid';
import Constants from '../Constants';
import dispatcher from '../Dispatcher';
import GameEngine from '../lib/GameEngine';
import {openChannelWithPeer} from '../lib/channelUtils';
import user from '../lib/user';
import Debug from 'debug';

// fbc - firebase client client
// fbs - firebase server client
const fbcLog = Debug('firebase:client');
const fbsLog = Debug('firebase:server');
const lobbyLog = Debug('lobby');

// Advertises a server on the server dictionary
async function postServerAd(gameData, fbToken){
  fbsLog('Posting server advertisement to firebase');
  const firebaseURL = 'https://sweltering-fire-296.firebaseio.com/servers/'
                      + (Date.now()) + '.json?auth=' + fbToken;

  const response = await fetch(firebaseURL, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gameData),
  });

  if( response.status < 200 && response.status >= 300 ){
    const err = new Error(response.statusText);
    err.response = response;
    err.request  = request;
    fbsLog('Request failed', err);
    throw err;
  }

  try{
    const result = response.json();
    fbsLog('Queueing succeeded', result);
    return result;
  }catch(e){
    fbsLog('Failed to parse json');
    return {};
  }

}

// Gets the list of servers.
async function getServerList(fbToken){
  fbcLog('Requesting servers from firebase');
  const firebaseURL = 'https://sweltering-fire-296.firebaseio.com/servers.json?auth=' + fbToken;
  const response = await fetch(firebaseURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if( response.status < 200 && response.status >= 300 ){
    const err = new Error(response.statusText);
    err.response = response;
    err.request  = request;
    fbcLog('Request failed', err);
    throw err;
  }

  try{
    const serverList = response.json();
    fbcLog('Got server list', serverList);
    return serverList;
  }catch(e){
    fbcLog('Failed to parse response json from firebase');
    return [];
  }

}

export default {
  openLobby(){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_OPENED
    });
  },

  closeLobby(){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_CLOSED
    });
  },


  // Creates a server and starts advertising it.
  async startAdvertising(parameters){
    // Emit an advertisement every 5 seconds
    // with updated game state.
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_ADVERTISE_START
    });

    lobbyLog("Trying to host");

    const token = await user.getFirebaseToken();
    const server = gm.startServer(parameters);
    const gameInfo  = server.gameInfo();
    const serverAd = await postServerAd(server.gameInfo(), token);

    lobbyLog("Posted to server");

    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_SERVER_LISTED,
      server: server
    });
  },

  stopAdvertising(gameInfo){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_ADVERTISE_STOP
    });
    lobbyChannel.send(Constants.ActionTypes.LOBBY_SERVER_GONE, gameInfo);
    clearInterval(advertisement);
  },

  async startBrowsingGames(){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_START_BROWSING
    })
    lobbyLog("Trying to join");
    const token = await user.getFirebaseToken();
    const serverList = await getServerList(token);
    lobbyLog('Accquired list of servers', serverList);
  },

  stopBrowsingGames(){
    dispatcher.dispatch({
      action: Constants.ActionTypes.LOBBY_STOP_BROWSING
    })
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
  }
};
