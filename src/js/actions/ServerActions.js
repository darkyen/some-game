import {
  openChannel,
  openChannelWithServer,
  openChannelWithClient
} from '../lib/channelUtils';

import {GameServer} from '../lib/GameEngine';
import dispatcher from '../Dispatcher';
import Constants from '../Constants';

let server = null;
export default {
  createServer(serverInfo, hostInfo){
    let server = new GameServer(serverInfo, hostInfo);
  }
}
