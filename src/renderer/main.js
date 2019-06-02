import path from 'path';
import { homedir } from 'os';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';

import Store from './store';
import Event from './event';
import Root from './container/root';
import { listenCommand } from './util/ipc';
const { app } = require('electron').remote;
const appDir = app.getPath('exe');

const store = new Store({
  settings: {
    outputDir: path.join(homedir(), 'Desktop'),
  },
});
const event = new Event(store);

if (process.env.NODE_ENV === 'development') {
  window.store = store;
  window.event = event;

  requestIdleCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      event.loadFile({
        // path: '/Users/leader22/Sandbox/ffmpeg-test/mov.mp4',
        path: path.join(homedir(), 'sample.mp4'),
      });
    }else{
        event.loadFile({
          // path: '/Users/leader22/Sandbox/ffmpeg-test/mov.mp4',
          path: path.join(appDir, 'sample.mp4'),
        });
    }
  });
}

listenCommand('shortcut:openSettings', () => event.showSettings(true));
listenCommand('shortcut:togglePause', () => event.togglePause());
listenCommand('shortcut:clearFile', () => event.clearFile());
listenCommand('shortcut:saveSnapshot', () => event.saveSnapshot());
listenCommand('shortcut:convertGif', () => event.convertGif());
listenCommand('shortcut:cropGif', () => event.cropGif());
listenCommand('shortcut:toTwitter', () => event.toTwitterGif());
listenCommand('shortcut:saveSlice', () => {
  event.showProgress(true);
  event.saveSlice();
});

window.addEventListener('load', () => {
  ReactDOM.render(
    <Provider
      {...store}
      event={event}
    >
      <Root />
    </Provider>,
    document.getElementById('app')
  );
});
