
import {EventEmitter} from 'events';
import {autobind} from 'core-decorators';
import pusher from './pusher';

export default class PusherGameChannel extends EventEmitter{
  // Common pusher guy shall do it for now.

  constructor(channelName){
    super();
    this.channelName = channelName;
    this.channel = pusher.subscribe(channelName);
    this.channel.bind(
      'pusher:subscription_succeeded',
      this.__subscriptionSuccededHandler
    );

    this.channel.bind(
      'pusher:subscription_error',
      this.__subscriptionErrorHandler
    );

    this.channel.bind(
      'client-message',
      this.__handleMessage
    );
  }

  @autobind
  __handleMessage(message){
    console.log("Got Message");
    this.emit('message', message);
  }

  @autobind
  __subscriptionSuccededHandler(){
    this.emit('connect');
  }

  @autobind
  __subscriptionErrorHandler(err){
    this.emit('error', err);
  }

  send(action, payload){
    this.channel.trigger('client-message', {
      payload, action
    });
  }

  close(){
    this.emit('close');
    this.channel.unsubscribe();
  }

}
