import wtRequire from 'webtask-require';
const wt = wtRequire('someGame');

export default async function getRoomToken(clientId){
  const authToken = localStorage.authToken;

  if( authToken ){
    throw new Error('User Not Logged In');
  }

  const roomToken = await wt.withAuth(taskToken)('scaleDroneAuth', {
    isServer,
    clientId
  });
}
