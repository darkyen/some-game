// Ideally we only want to connect to ScaleDrone only in lobby
import user from './user';
import Debug from 'debug';

const sdLog   = Debug('scaledrone');
const authLog = Debug('scaledrone:auth:');

export default function getDrone(){
  return new Promise((resolve, reject) => {
    const drone = new ScaleDrone('lV7nWpodQNR7ofu2');

    async function handleSuccess(){
      resolve(drone);
    }

    async function handleOpen(error){
      if( error ){
        handleError(error);
      }

      sdLog("Drone connecting");
      try{
        sdLog("Drone connecting with client id", drone.clientId);
        const user = await getUser(drone.clientId);
        const jwt = user.droneJwt;
        drone.authenticate(jwt);
      }catch(e){
        authLog("Failed to get user", e);
      }
    };

    async function handleAuthenticate(error){
      if( error ){
        handleError(error);
      }
      handleSuccess();
    }

    async function handleError(error){
      drone.close();
      reject(error);
    }

    async function handleClose(){
      console.info("Drone disconnected");
    }

    drone.on('authenticate', handleAuthenticate);
    drone.on('error', handleError);
    drone.on('close', handleClose);
    drone.on('open', handleOpen);
  });
}
