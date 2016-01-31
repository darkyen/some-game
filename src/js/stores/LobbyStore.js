import dispatcher from '../Dispatcher';
import {Store} from 'flux/utils';
import Constants from '../Constants';

class LobbyStore extends Store{

	constructor(dispatcher){
		super(dispatcher);
    this.lobby = {
      isOpen: false,
      isConnected: false,
      isAdvertising: false,
      isBrowsing: false,
      servers: new Map(),
      error: null
    };
	}

  __handleLobbyOpened(){
    this.lobby.isOpen = true;
    this.__emitChange();
  }

  __handleLobbyClosed(){
    this.lobby.isOpen = false;
    this.__emitChange();
  }

  __handleAdvertiseStart(){
    this.lobby.isAdvertising = true;
    this.__emitChange();
  }

  __handleAdvertiseStop(){
    this.lobby.isAdvertising = false;
    this.__emitChange();
  }

  __handleStartBrowsing(){
    this.lobby.isBrowsing = true;
    this.__emitChange();
  }

  __handleStopBrowsing(){
    this.lobby.isBrowsing = false;
    this.__emitChange();
  }

  __handleServerUp(server){
    this.lobby.servers.set(server.uuid, server);
    this.lobby.servers = new Map(this.lobby.servers);
    this.__emitChange();
  }

  __handleServerGone(server){
    this.lobby.servers.delete(server.uuid, server);
    this.lobby.servers = new Map(this.lobby.servers);
    this.__emitChange();
  }

  __handleLobbyError(err){
    this.error = err;
    this.__emitChange();
  }

  __handleConnected(){
    this.isConnected = true;
    this.__emitChange();
  }

  __handleDisconnected(){
    this.isConnected = false;
    this.__emitChange();
  }

  __onDispatch({action, payload}){
    switch(action){
      case Constants.ActionTypes.LOBBY_OPENED:
        this.__handleLobbyOpened();
      break;

      case Constants.ActionTypes.LOBBY_ADVERTISE_START:
        this.__handleAdvertiseStart();
      break;

      case Constants.ActionTypes.LOBBY_ADVERTISE_STOP:
        this.__handleAdvertiseStop();
      break;

      case Constants.ActionTypes.LOBBY_CLOSED:
        this.__handleLobbyClosed();
      break;

      case Constants.ActionTypes.LOBBY_START_BROWSING:
        this.__handleStartBrowsing();
      break;

      case Constants.ActionTypes.LOBBY_STOP_BROWSING:
        this.__handleStopBrowsing();
      break;

      case Constants.ActionTypes.LOBBY_CONNECTED:
        this.__handleConnected();
      break;

      case Constants.ActionTypes.LOBBY_DISCONNECTED:
        this.__handleDisconnected();
      break;

      case Constants.ActionTypes.LOBBY_ERROR:
        this.__handleLobbyError(payload);
      break;

      case Constants.ActionTypes.LOBBY_SERVER_UP:
        this.__handleServerUp(payload);
      break;

      case Constants.ActionTypes.LOBBY_SERVER_GONE:
        this.__handleServerGone(payload);
      break;
    }
  }

  getState(){
    return Object.assign({}, this.lobby);
  }
}

export default new LobbyStore(dispatcher);
