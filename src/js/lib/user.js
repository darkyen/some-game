import {EventEmitter} from 'events';
import Debug from 'debug';
import {autobind, deprecate} from 'core-decorators';
import aws4 from 'aws4';

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
        if( err.error === 401 ){
          // Force Login again;
          sessionStorage.clear();
          return resolve(loginWithAuth0(details));
        }
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
        resolve(delRes);
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
  @deprecate
  async getFirebaseToken(){
    // Check if profile exists
    // if not bail out ... do not wait
    userLog('Requesting delegate token for firebase');
    if( !this.profile ){
      userLog('Profile not ready');
      throw new Error('Profile not ready');
    }

    // Return the cached token
    if( this.__fbDelToken ){
      return this.__fbDelToken;
    }

    const options = {
      id_token: this.authToken,
      api: 'firebase',
      scope: 'openid publicServer'
    };

    const fbDelToken = (await getDelegationToken(options)).id_token;
    this.__fbDelToken = fbDelToken;
    return fbDelToken;
  }

  async getScaleDroneToken(clientId){
      userLog('Requesting delegating token for ScaleDrone');
      if( !this.profile ){
        userLog('Profile not ready');
        throw new Error('Profile not ready');
      }

      // We cannot cache this.
      const credentials = (await this.getLambdaToken()).Credentials;

      const lCred = {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken
      };

      const URL = 'https://umnusionr5.execute-api.us-east-1.amazonaws.com/prod/delegation/drone';
      const options = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-identity': this.authToken
        },

        service: 'execute-api',
        host: 'umnusionr5.execute-api.us-east-1.amazonaws.com',
        path: '/prod/delegation/drone',
        method: 'POST',

        body: JSON.stringify({
          clientId
        })
      };

      aws4.sign(options, lCred);
      const r = await fetch(URL, options);
      userLog('Fetch complete');

      if( r.status !== 200 ){
        userLog('Failed to get the scaledrone token', r);
        throw new Error('Unauthorized');
      }

      try{
        const res = await r.json();
        userLog('Got the scaledrone token');
        return JSON.parse(res).jwt;
      }catch(e){
        userLog('Invalid response from API, must be json');
        throw new Error('Internal Server Error');
      }
  }

  // Get token for aws
  async getLambdaToken(){
    userLog('Requesting delegation token for Amazon Lambda');
    if( !this.profile ){
      userLog('Profile not ready');
      throw new Error('Profile not ready');
    }

    if( this.__lambdaToken ) {
      return this.__lambdaToken;
    }

    const options = {
      api: 'aws',
      id_token: this.authToken,
      role: "arn:aws:iam::141612999557:role/access-to-lambda-per-user",
      principal: "arn:aws:iam::141612999557:saml-provider/auth0-provider"
    };

    const lambdaToken = await getDelegationToken(options);
    this.__lambdaToken = lambdaToken;
    return lambdaToken;
  }
}

export default new UserService();
