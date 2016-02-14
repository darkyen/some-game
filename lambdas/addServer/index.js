var credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

var Dynasty = require('dynasty')(credentials);
var jwt = require('jsonwebtoken');
var uuid = require('uuid');
var shortid = require('shortid');
var servers = Dynasty.table('servers');

export.handler = function (event, context){
  if( !event.headers['x-identity'] ){
    return context.fail(new Error('Unauthorized, no identity provided'));
  }

  if( !event.body ){
    return context.fail(new Error('Bad request, must send map'));
  }

  var identity     = {};
  var idJwt        = event.headers['x-identity'];
  var serverParams = event.body;


  try{
    identity = jwt.verify(idJwt, AUTH_0_SECRET);
  }catch(e){
    return context.fail(new Error('Unauthorized'));
  }


  var gameId       = uuid.v4();
  var shortUrl     = shortid.generate();

  // just return serverDict.public when allowing
  // others to connect.
  var serverDict   = {
    uuid: gameId,
    isPublicServer : identity.publicServer;
    publicData: {
      allowsSpectators: serverParams.allowsSpectators,
      maxClients: serverParams.maxClients,
      freeSlots: serverParams.maxClients,
      name: serverParams.name,
      map: serverParms.map,
      isAccepting: true,
      url: shortUrl
    },
    ownerId: identity.sub
  };


  // Only public servers will be listed in lobby.
  // you can join a game by simply doing /servers/<serverId>/join
  // where uuid is the server short uuid
  servers.insert(serverDict)
    .then(function(){
      context.success(serverDict.publicData);
    }).error(function(){
      context.fail(new Error('Internal Server Error'));
    });
};
