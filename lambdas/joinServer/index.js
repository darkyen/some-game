var AUTH_0_SECRET = process.env.AUTH_0_SECRET;
var SCALEDRONE_CHANNEL = process.env.SCALEDRONE_CHANNEL;
var SCALEDRONE_SECRET  = process.env.SCALEDRONE_SECRET;

var jwt = require('jsonwebtoken');
var ScaleDrone = require('scaledrone-node-push');
var sd = new ScaleDrone({
  channelId: SCALEDRONE_CHANNEL,
  secretKey: SCALEDRONE_SECRET
});

var credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

var Dynasty = require('dynasty')(credentials);
var servers = Dynasty.table('servers');

export.handler = function (event, context){
  if( !event.headers['x-identity'] ){
    return context.fail(new Error('Unauthorized, no identity provided'));
  }

  if( !event.params.server ){
    return context.fail(new Error('Bad request'));
  }

  var identify = {};
  var server = event.params.server;
  var idJwt  = event.headers['x-identity'];

  // TODO: Get server here

  try{
    var secretBuf = new Buffer(AUTH_0_SECRET, 'base64');
    identity = jwt.verify(idJwt, secretBuf);
  }catch(e){
    console.error(e);
    return context.fail(new Error('Unauthorized'));
  }

  var tempChannelId = server.serverId;
  var serverChannelId = event;
  sd.publish(serverRoomId, {
    message: 'request',
    payload: {
        tempChannelId: tempChannelId
    }
  });

  context.success({
    tempChannelId: tempChannelId
  });
};
