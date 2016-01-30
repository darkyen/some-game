import Dispatcher from '../Dispatcher';
import Constants from '../Constants';
import Pusher from 'pusher-js';
/* eslint-disable no-console */

const lock  = new Auth0Lock(
  'f0aTaNKR9T54iMesSlMpnqd7PfEjXJHo',
  'some-game.auth0.com'
);
const channelName = 'private-channel-test_channel-234';

Pusher.PrivateChannel.prototype.authorize = function (socketId, callback) {
  console.log("Trying to login");
  lock.show({
    popup: true,
    authParams: {
      socket_id: socketId,
      channel: channelName
    }
  }, function(err, profile, token) {
    if (err) {
      console.log("There was an error");
      console.error(err);
      return;
    }
    console.log("PushPushPusher", profile);
    callback(false, {
      auth: profile.pusherAuth
    });
  });
};


const pusher = new Pusher('048da0f43d321a34888b', {
  encrypted: true
});

const channel = pusher.subscribe(channelName);


function emitEvent(){
  channel.trigger('client-my_event', {
    timestamp: Date.now()
  });
}

channel.bind('client-my_event', function(data){
  const ts = data.timestamp;
  console.log(`Ping ${ts - Date.now()}ms`);
  emitEvent();
});

channel.bind('pusher:subscription_succeeded', function(){
  emitEvent();
});


export default {
  addItem(text) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.TASK_ADDED,
      text: text
    });
  },

  clearList() {
    console.warn('clearList action not yet implemented...');
  },

  completeTask(task) {
    console.warn('completeTask action not yet implemented...', task);
  }
};
