import {EventEmitter} from 'events';
import Debug from 'debug';
import {autobind} from 'core-decorators';

const authLog = Debug('auth:auth0');
const userLog = Debug('user:service');

const lock = new Auth0Lock(
  'f0aTaNKR9T54iMesSlMpnqd7PfEjXJHo',
  'some-game.auth0.com'
);

function loginWithAuth0(details){
  return new Promise((resolve, reject) => {
    authLog('Attempting login');
    function lockCallback(err, profile, authToken){
      if( err ){
        // Most likely a 404
        authLog('Login failed', err);
        reject(err);
      }

      if( authToken ){
        sessionStorage.authToken = authToken;
      }else{
        authToken = sessionStorage.authToken;
      }

      authLog('Authentication complete');
      resolve({profile, authToken});
    }

    if( sessionStorage.authToken ){
      authLog('Logging in from token', sessionStorage.authToken);
      lock.getProfile(sessionStorage.authToken, lockCallback);
      return;
    }

    authLog('Logging in from scratch is server ? ');

    lock.show({
      authParams: {
        scope: 'openid',
      }
    }, lockCallback);

  });
};


function getDelegationToken(options){
    return new Promise((resolve, reject) => {
      lock.$auth0.getDelegationToken(options, function(err, delRes){
        if( err ){
          reject(err);
        }
        resolve(delRes.id_token);
      });
    });
}

@autobind
class UserService extends EventEmitter{
  constructor(){
    super();
    this.__init__();
  }

  async __init__(){
    const {profile, authToken} = await loginWithAuth0();
    userLog('User Initialized');
    this.authToken = authToken;
    this.profile = profile;
  }

  // Get Firebase token
  async getFirebaseToken(){
    // Check if profile exists
    // if not bail out ... do not wait
    userLog('Requesting delegate token for firebase');
    if( !this.profile ){
      userLog('Profile not ready');
      throw new Error('Profile not ready');
    }

    // Return the cached token
    if( this.__fbDelToken){
      return this.__fbDelToken;
    }

    const options = {
      id_token: this.authToken,
      api: 'firebase',
      scope: 'openid publicServer'
    };

    const fbDelToken = getDelegationToken(options);
    this.__fbDelToken = fbDelToken;
    return fbDelToken;
  }

  // Get token for aws
  async getLambdaToken(){
    userLog('Requesting delegation token for Amazon Lambda');
    if( !this.profile ){
      userLog('Profile not ready');
      throw new Error('Profile not ready');
    }

    if( this.__lambdaToken) {
      return this.__lambdaToken;
    }

    const options = {
      api: 'aws',
      scope: 'openid'
    };

    const lambdaToken = await getDelegationToken(options);
    this.__lambdaToken = lambdaToken;
    return lambdaToken;
  }
}

export default new UserService();
