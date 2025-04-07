import * as React from 'react';
import { Dispatch } from '../framework/action';
import { Player, GameState } from './state';

export type GameProps = {
  viewingPlayer: Player,
  state: GameState,
  dispatch: Dispatch,
}

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

export function GameView(props: GameProps): JSX.Element {
  return statusMessage(`${props.viewingPlayer}`);
}
