var credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

var AUTH_0_SECRET = process.env.AUTH_0_SECRET;
var SCALEDRONE_CHANNEL = process.env.SCALEDRONE_CHANNEL;
var SCALEDRONE_SECRET  = process.env.SCALEDRONE_SECRET;
var Dynasty = require('dynasty')(credentials);
var jwt = require('jsonwebtoken');


var servers = Dynasty.table('servers');

export.handler = function (event, context){
  if( !event.identity ){
    return context.fail(new Error('Unauthorized, no identity provided'));
  }

  if( !event.clientId ){
    return context.fail(new Error('Bad request'));
  }

  var identity = {};
  var clientId = event.clientId;

  var payload = {
    "channel" : SCALEDRONE_CHANNEL,
    "exp": Date.now() + 180000,
    "client": clientId,
    "permissions": {

    }
  };

  try{
    identity = jwt.verify(event.identity, AUTH_0_SECRET);
  }catch(e){
    return context.fail(new Error('Unauthorized'));
  }

  if( identity.publicServer ){
    var roomMatchRegExp = "^srv-.*-" + identity.user_id + "$";
    // unidirectional channel
    payload.permissions[roomMatchRegExp] = {
      "publish": false,
      "subscribe": true
    };
  }else{
    var roomMatchRegExp = "^temp-conn-.*" + identity.user_id + "$";
    payload.permissions[roomMatchRegExp] = {
      "publish": true,
      "subscribe": true
    };
  }


  var jwt = jwt.sign(payload, SCALEDRONE_SECRET, {
    algorithm: 'HS256'
  })

  context.success(JSON.stringify({
    jwt: jwt
  }));
};
