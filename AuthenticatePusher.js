function sign(secret, channel, socket_id) {
  var string_to_sign = socket_id+":"+channel;
  var sha = crypto.createHmac('sha256',secret);
  return sha.update(string_to_sign).digest('hex');
}


function getSignedToken(pusherKey, pusherSecret, channel, socketId){
  return pusherKey + ":" + sign(pusherSecret, channel, socket_id);
}

module.exports = function(ctx, cb){
  // These gets taken from the app user-id
  var PUSHER_APP_ID     = ctx.data.PUSHER_APP_ID;
  var PUSHER_APP_SECRET = ctx.data.PUSHER_APP_SECRET;
  var APP_USER_ID       = ctx.data.APP_USER_ID;
  var channel           = ctx.request.query.channel;
  var socketId          = ctx.request.query.socket_id;


  if( channel && context.request.query.socket_id ) {
    return cb();
  }

  return cb();
}
