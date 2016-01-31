import React, {PropTypes, Component} from 'react';
import {autobind} from 'core-decorators';
import '../stores/LobbyStore';
import {Container} from 'flux/utils';
import LobbyActions from '../actions/LobbyActions';
import LobbyStore from '../stores/LobbyStore';
import {Locations, Location, Link} from 'react-router-component';


class LobbyHome extends Component{
  render(){
    return  <div className="game-lobby__screen">
              <h1 className="txt-center">Y.A.S.G</h1>
              <h6 className="txt-center">Yet Another Space Game</h6>
              <hr />
              <div className="row">
                <Link
                  className="button game-lobby__create-button"
                  href="/create/"
                  >Host Game</Link>
              </div>
              <div className="row">
                <Link
                  className="button game-lobby__browse-button"
                  href="/browse/"
                  >Browse Game</Link>
              </div>
              <hr />
              <p className="txt-center">Create a game or Browse the lobby to join one, or paste a game link in address bar</p>
            </div>;
  }
}


function ClientListItem(props){
  const {uuid, name, map, clients, maxClients} = props;
  return  <Link global className="game-lobby__client" href={`/arena/${uuid}/`}>
              <h3 className="game-lobby__client-name">{name}</h3>
              <div className="game-lobby__client-details">
                <h4 className="game-lobby__client-map">Map : {map}</h4>
                <h4 className="game-lobby__client-numbers">Clients: {clients}/{maxClients}</h4>
              </div>
            </Link>;
}

@autobind
class LobbyBrowse extends Component{
  constructor(props){
    super(props);
    this.state = {
      query: ''
    };
  }

  componentDidMount(){
    if(!this.isBrowsing){
      LobbyActions.startBrowsingGames();
    }
  }

  componentWillUnmount(){
    if(this.isBrowsing){
      LobbyActions.stopBrowsingGames();
    }
  }

  handleSearchChange(e){
    const {value} = e.target;
    this.setState({
      query: value
    });
  }

  render(){
    const {servers} = this.props;
    const serverArr = [...servers.values()];
    const {query} = this.state;

    return <div className="game-lobby__clients">
            <h3 className="txt-center">YASG - Join A Game</h3>
            <hr />
            <div className="row">
              <input
                placeholder="Search Game"
                className="input"
                value={this.state.query}
                onChange={this.handleSearchChange}
              ></input>
            </div>
            <ul className="game-lobby__client-list">
              {serverArr.map( gameInfo => {
                  return <li>
                           <ClientListItem {...gameInfo} />
                         </li>;
              })}
            </ul>
            <hr />
            <div className="row">
              <Link className="button" href="/create/">Host Game</Link>
            </div>
           </div>;
  }
}


@autobind
class LobbyCreate extends Component{
  constructor(props){
    super(props);
    this.state = {
      name: 'New Game',
      map: 'acd4',
      maxClients: 8,
    };
  }

  createGame(e){
    LobbyActions.startAdvertising(this.state);
    return false;
  }

  handleMapChange(e){
    const value = e.target.value;
    this.setState({
      map: value
    });
  }

  handleNameChange(e){
    const value = e.target.value;
    this.setState({
      name: value
    });
  }

  handleMaxClientChange(e){
    const value = e.target.value;
    this.setState({
      maxClients: value
    });
  }

  render(){
    const {name, map, maxClients} = this.state;
    return <div className="game-lobby__create">
            <h3 className="txt-center">YASG - Create A Game</h3>
            <hr />
            <form onSubmit={this.createGame}>
              <div className="row">
                <input
                  className="input"
                  value={name}
                  onChange={this.handleNameChange}
                />
              </div>
              <div className="row">
                <select
                  className="select"
                  value={map}
                  onChange={this.handleMapChange}>
                  <option value="acd4">Acid 4</option>
                  <option value="acd5">Acid 5</option>
                  <option value="acd6">Acid 6</option>
                </select>
              </div>
              <div className="row">
                <input
                  className="input"
                  value={maxClients}
                  onChange={this.handleMaxClientChange}
                  max="32"
                  min="8"
                />
              </div>
              <hr />
              <div className="row">
                <button
                  className="button"
                  type="submit"
                >Create</button>
              </div>
            </form>
           </div>;
  }
}

class LobbyGame extends Component{
  render(){
    return <div className="game-lobby__wait-screen">
           </div>;
  }
}


@autobind
class Lobby extends Component{
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isConnected: PropTypes.bool.isRequired,
    isBrowsing: PropTypes.bool.isRequired,
    isAdvertising: PropTypes.bool.isRequired,
    servers: PropTypes.object.isRequired
  };

  componentDidMount(){
    if( !this.isOpen ){
      LobbyActions.openLobby();
    }
  }

  componentWillUnmount(){
    if( this.isOpen ){
      LobbyActions.closeLobby();
    }
  }

  render() {
    let {isOpen, isAdvertising, isBrowsing, servers, isConnected} = this.props;
    return (
      <div className="game-lobby">
        <Locations contextual>
          <Location path="/" handler={LobbyHome} />
          <Location
            path="/room/:hostId"
            handler={LobbyGame}
            isAdvertising={isAdvertising}
          />
          <Location
            path="/browse/"
            handler={LobbyBrowse}
            isBrowsing={isBrowsing}
            servers={servers}
          />
          <Location path="/create/" handler={LobbyCreate} />
        </Locations>
      </div>
    );
  }
};


@autobind
class LobbyContainer extends Component{
  static getStores(){
    return [LobbyStore];
  }

  static calculateState(prevState){
    return {
      lobby: LobbyStore.getState()
    }
  }

  render(){
    return <Lobby {...this.state.lobby}/>
  }
}


export default Container.create(LobbyContainer);
