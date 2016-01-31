import React, {PropTypes, Component} from 'react';
import Lobby from './Lobby.jsx';
import {Locations, Location, Link} from 'react-router-component';

export default class App extends Component{
  render(){
    return <Locations hash>
            <Location path="/lobby(/*)" handler={Lobby} />
           </Locations>;
  }
}
