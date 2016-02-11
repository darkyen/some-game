import PusherGameChannel from './PusherGameChannel';
import Promise from 'bluebird';

export function openRoom(channelId){
  return new Promise((resolve, reject) => {
    const newChannel = new PusherGameChannel(channelId);
    newChannel.once('connect', resolve);
    newChannel.once('error', reject);
  });
}

export async function openRoomWithPeer(channeId){
  const connection = await openChannel(channelId);
  const interval   = setInterval(() => {
    connection.send('ping');
  }, 1000);

  return new Promise((resolve, reject) => {
    connection.on('message', ({action}) => {
      if( action === 'ping' ){
        clearInterval(interval);
        resolve(connection);
      }
    });

    connection.on('error', e => {
      clearInterval(interval);
      reject(e);
    });
  });
}
