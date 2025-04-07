import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { doEffect } from './effect';
import { extractEffects } from './lib/extract-effects';
import { useEffectfulReducer } from './lib/use-effectful-reducer';
import { nullVd, reduce } from './reduce';
import { AppState, mkState } from './state';
import { Dispatch } from './action';
import { Peer } from 'peerjs';
import { init_state } from '../game/state';
import { GameView, loadAssets, ViewData } from '../game/view';

export type AppProps = {
  color: string,
};

function statusMessage(message: string, more?: JSX.Element): JSX.Element {
  console.log(message);
  return <>
    <div className='outerDiv'>
      <div className='innerDiv'>
        {message}{more}
      </div>
    </div>
  </>
}

function InitServer(props: { dispatch: Dispatch, state: AppState & { t: 'initializing' } }): JSX.Element {
  const { state, dispatch } = props;
  const { id } = state;

  React.useEffect(() => {
    const options = { debug: 3 };
    const peer = new Peer(id, options);
    peer.on('open', () => {
      console.log(`open! server peer id = ${peer.id}`);
      peer.on('connection', conn => {
        console.log('got a connection!', conn);

        conn.on('data', data => {
          console.log('server got message', data);
          dispatch({ t: 'rxMessage', message: data });
        });
        dispatch({ t: 'serverGetConn', conn });
      });
      peer.on('close', () => { console.log('server close') });
      peer.on('disconnected', () => { console.log('server disconnected') });
      peer.on('error', err => {
        console.log('err!', err);
      });
      loadAssets()
        .then(() => {
          dispatch({ t: 'setAppState', state: { t: 'server_waiting_for_client', effects: [], id, peer } });
        })
        .catch(e => { console.error(e); });
    });
  });
  return statusMessage('Initializing...');
}

function InitClient(props: { dispatch: Dispatch, state: AppState & { t: 'initializing' }, serverId: string }): JSX.Element {
  const { state, dispatch, serverId } = props;
  const { id } = state;
  React.useEffect(() => {
    const options = { debug: 3 };
    console.log(`client id ${id}`);
    console.log(`client connecting to ${serverId}`);
    const peer = new Peer(id, options);
    peer.on('open', () => {
      console.log('client peer open');
      const conn = peer.connect(serverId);
      conn.on('open', () => {
        console.log('client connection open');
        conn.on('data', data => {
          console.log('client got message', data);
          dispatch({ t: 'rxMessage', message: data });
        });
        loadAssets()
          .then(() => {
            dispatch({
              t: 'setAppState', state: {
                t: 'client',
                effects: [],
                id,
                serverId,
                game: init_state,
                viewData: nullVd,
                peer,
                conn,
                log: [],
              }
            });
          })
          .catch(e => { console.error(e); });
      });
    });
  });
  return statusMessage('Connecting...');
}

function ServerWaiting(props: { dispatch: Dispatch, state: AppState & { t: 'server_waiting_for_client' } }): JSX.Element {
  const { state, dispatch } = props;
  const x = state;
  const { id, peer } = state;
  const url = new URL(document.URL);
  console.log(`server id ${id}`);
  url.searchParams.set('connect', id);
  return <>
    <div className='outerDiv'>
      <div className='innerDiv'>
        Waiting for other players. Send them this invite link: <br /><br />
        <a href={url.toString()}>Join the game</a>
      </div>
    </div>
  </>;
}

export function App(props: AppProps): JSX.Element {
  const [state, dispatch] = useEffectfulReducer(mkState(), extractEffects(reduce), doEffect);
  const { id } = state;
  switch (state.t) {
    case 'initializing': {
      const params = new URLSearchParams(window.location.search);
      const serverId = params.get('connect');
      if (serverId !== null) { // we're the "client"
        return <InitClient dispatch={dispatch} state={state} serverId={serverId} />;
      }
      else {
        return <InitServer dispatch={dispatch} state={state} />;
      }
    }
    case 'server': return <GameView state={state.game} viewingPlayer={0} dispatch={dispatch} viewData={state.viewData} />;
    case 'client': return <GameView state={state.game} viewingPlayer={1} dispatch={dispatch} viewData={state.viewData} />;
    case 'server_waiting_for_client': return <ServerWaiting dispatch={dispatch} state={state} />;
  }
}

export function init() {
  const props: AppProps = {
    color: '#f0f',
  };
  const root = createRoot(document.querySelector('.app')!);
  root.render(<App {...props} />);
}
