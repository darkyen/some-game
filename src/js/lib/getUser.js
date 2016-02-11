const lock = new Auth0Lock(
  'f0aTaNKR9T54iMesSlMpnqd7PfEjXJHo',
  'some-game.auth0.com'
);

export default function getUser(clientId, isServer){
  return new Promise((resolve, reject) => {

    function lockCallback(err, profile, auth_token){
      if( err ){
        // Most likely a 404
        reject(err);
      }

      // if( auth_token ){
      //   sessionStorage.auth_token = auth_token;
      // }

      resolve(profile);
    }

    // if( sessionStorage.auth_token ){
    //   console.log(lock.getProfile);
    //   lock.getProfile(localStorage.auth_token, lockCallback);
    //   return;
    // }

    lock.show({
      authParams: {
        clientId, isServer
      }
    }, lockCallback);

  });
};
