import Dispatcher from '../Dispatcher';
import Constants from '../Constants';
import Pusher from 'pusher-js';
import uuid from 'uuid';
import PeerConnection from 'rtcpeerconnection';
import {EventEmitter} from 'events';


export default {
  addItem(text) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.TASK_ADDED,
      text: text
    });
  },

  clearList() {
    console.warn('clearList action not yet implemented...');
  },

  completeTask(task) {
    console.warn('completeTask action not yet implemented...', task);
  }
};
