import PusherGameChannel from './PusherGameChannel';
import Promise from 'bluebird';

export function openChannel(channelId){
  return new Promise((resolve, reject) => {
    const newChannel = new PusherGameChannel(channelId);
    newChannel.once('connect', resolve);
    newChannel.once('error', reject);
  });
}


export async function openChannelWithServer(channelId){
  const connection = await openChannel(channelId);
  // connnecting
  const interval   = setInterval(() => {
    connection.send('ping');
  }, 1000);

  return new Promise((resolve, reject) => {
      connection.on(
        'message',
        ({action}) => {
          if( action === 'pong' ){
            resolve(connection);
          }
        }
      );

      connection.on(
        'error',
        (err) => reject(err)
      );
  });
}

export async function openChannelWithClient(channelId){
  const connection = await openChannel(channelId);

  return new Promise((resolve, reject) => {
    connection.on('message', ({action}) => {
      if( action === 'ping' ){
        connection.send('pong');
        resolve(connection);
      }
    });
    connection.on('error', reject);
  });
}
