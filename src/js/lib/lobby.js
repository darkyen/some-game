//
import fetch from 'fetch';
import geolib from 'geolocation';

function getLocationAsync(){
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true
    });
  });
}

const SERVERLIST_URL = '/we/.json';

function distanceDiff(candidateServer){
  return candidateServer.distance > 4000;
}

// Finds the server to join
export default async function getMatchedServer(skillLevel){
  const {coords}  = await getLocationAsync();
  let serverList  = fetch(SERVERLIST_URL);

  serverList = geolib.orderByDistance(coords, serverList);
  serverList = serverList.filter(distanceDiff);

  return serverList[0];
}
