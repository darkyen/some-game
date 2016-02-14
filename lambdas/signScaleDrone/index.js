require('dotenv').config();

var AUTH_0_SECRET = process.env.AUTH_SECRET;
var SCALEDRONE_CHANNEL = process.env.SCALEDRONE_CHANNEL;
var SCALEDRONE_SECRET  = process.env.SCALEDRONE_SECRET;

var jwt = require('jsonwebtoken');
exports.handler = function (event, context){
  if( !event.headers['x-identity'] ){
    return context.fail(new Error('Unauthorized, no identity provided'));
  }

  if( !event.body.clientId ){
    return context.fail(new Error('Bad request'));
  }

  var identity = {};
  var clientId = event.body.clientId;
  var idJwt    = event.headers['x-identity'];

  var payload = {
    "channel" : SCALEDRONE_CHANNEL,
    "exp": Date.now() + 180000,
    "client": clientId,
    "permissions": {

    }
  };

  try{
    var secretBuf = new Buffer(AUTH_0_SECRET, 'base64');
    identity = jwt.verify(idJwt, secretBuf);
  }catch(e){
    console.error(e);
    return context.fail(new Error('Unauthorized'));
  }

  if( identity.publicServer ){
    // This looks more like
    // srv-uuid-hostId
    // server hosting this game and is registered to
    var roomMatchRegExp = "^srv-.*-" + identity.user_id + "$";
    // unidirectional channel
    payload.permissions[roomMatchRegExp] = {
      "publish": false,
      "subscribe": true
    };


    // this looks more like
    // temp-conn-gameuuid-serverid-clientid;

    roomMatchRegExp = "^temp-conn-.*-.*" + identity.user_id + "-.*$";
    payload.permissions[roomMatchRegExp] = {
      "publish": true,
      "subscribe": true
    };

  }else{
    var roomMatchRegExp = "^temp-conn-.*-.*-.*" + identity.user_id + "$";
    payload.permissions[roomMatchRegExp] = {
      "publish": true,
      "subscribe": true
    };
  }

  // HAHAHAHAHA
  var generatedJwt = jwt.sign(payload, SCALEDRONE_SECRET, {
    algorithm: 'HS256'
  })

  context.succeed(JSON.stringify({
    jwt: generatedJwt
  }));
};
