import Pusher from 'pusher-js';
import lock from './lock';

// Inject lock in pusher.
Pusher.PrivateChannel.prototype.authorize = function (socketId, callback) {
  console.log("Trying to login");
  const lockOptions = {
    popup: true,
    closable: false,
    authParams: {
      socket_id: socketId,
      channel: this.name
    }
  };

  const handleAuthComplete = (err, profile, token) => {
    if (err) {
      console.error(err);
      return;
    }

    callback(false, {
      auth: profile.pusherAuth,
    });
  };
  lock.show(lockOptions, handleAuthComplete);
};

const pusher = new Pusher('048da0f43d321a34888b', {
  encrypted: true
});

export default pusher;
