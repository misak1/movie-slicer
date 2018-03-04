import React from 'react';
import { observer } from 'mobx-react';

import { InfoLabelColumn, InfoColumn } from './info';

const Progress = ({ movie, onClickClose }) => (
  <div className="Progress">
    <div className="Progress_Col">
      <div>
        <div>&nbsp;</div>
        <InfoLabelColumn />
      </div>
      <div>
        <div>Before</div>
        <InfoColumn {...movie.bfInfo} />
      </div>
      <div>
        <div>After</div>
        { movie.afInfo ? (
          <InfoColumn {...movie.afInfo} />
        ) : (
          <div>...</div>
        ) }
      </div>
    </div>
    <hr />
    <div>
      {movie.afInfo ? 'Done!' : 'Processing...'}
    </div>
    <hr />
    <button onClick={() => onClickClose()}>OK</button>
  </div>
);


export default observer(Progress);
