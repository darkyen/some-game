import keyMirror from 'keymirror';

export default {
  // event name triggered from store, listened to by views
  CHANGE_EVENT: 'change',

  // Each time you add an action, add it here... They should be past-tense
  ActionTypes: keyMirror({
    TASK_ADDED: null,

    // Lobby Events
    LOBBY_OPENED: null,
    LOBBY_ADVERTISE_START: null,
    LOBBY_ADVERTISE_STOP: null,
    LOBBY_CLOSED: null,
    LOBBY_START_BROWSING: null,
    LOBBY_STOP_BROWSING: null,

    LOBBY_CONNECTED: null,
    LOBBY_DISCONNECTED: null,
    LOBBY_ERROR: null,
    LOBBY_SERVER_UP: null,
    LOBBY_SERVER_GONE: null,

    // Peer to Peer events

    // Server Handshake events

    // Game Actions events
  }),

  ActionSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
};
