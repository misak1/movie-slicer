import { execCommand } from './util/ipc';
import { shell, remote } from 'electron';
import path from 'path';
import timestamp from 'time-stamp';

class Event {
  constructor(store) {
    this._store = store;
  }

  async loadFile(file) {
    const { movie, timeline } = this._store;

    this.clearFile();

    let probeInfo;
    try {
      const probeRes = await execCommand('cmd:ffprobe', {
        input: file.path,
      });
      probeInfo = JSON.parse(probeRes);
    } catch (err) {
      console.error(err);
      // remote.dialog.showErrorBox('Error', 'Open devtools for more detail.');
      return;
    }

    movie.bfProbe = probeInfo;
    timeline.totalSec = movie.duration;

    if (movie.duration < timeline.selectingSec) {
      // value is not a problem
      // timeline.selectingSec = movie.duration / 2;
      // 短い動画を読み込んだ時の初期 動画長
      timeline.selectingSec = movie.duration;
    }
  }

  clearFile() {
    const { movie } = this._store;
    movie.bfProbe = {};
    movie.afProbe = {};
  }

  togglePause() {
    const { movie } = this._store;
    movie.isPaused = !movie.isPaused;
  }
  toggleMute() {
    const { movie } = this._store;
    movie.isMuted = !movie.isMuted;
  }
  getVideoCurrentTime(el) {
    const { movie } = this._store;
    movie.currentTimeDisp = el.currentTime;
  }

  zoomIn() {
    const { ui } = this._store;
    ui.zoomIn();
  }
  zoomOut() {
    const { ui } = this._store;
    ui.zoomOut();
  }

  dragSelector(percentage) {
    const { movie, timeline } = this._store;
    movie.updateCurrentTime(percentage);
    timeline.updateSelectStartSec(percentage);
  }
  resizeSelectorByLeft(lPercentage, rPercentage) {
    const { movie, timeline } = this._store;
    movie.updateCurrentTime(lPercentage);
    timeline.updateSelectStartSec(lPercentage);
    timeline.updateSelectingSec(rPercentage);
  }
  resizeSelectorByRight(rPercentage) {
    const { movie, timeline } = this._store;
    movie.updateCurrentTime(rPercentage);
    timeline.updateSelectingSec(rPercentage);
  }

  showSettings(bool) {
    const { ui } = this._store;
    ui.isSettingsShown = bool;
  }
  updateSettings(prop, value) {
    const { settings } = this._store;
    settings[prop] = value;
  }
  selectOutputDir() {
    const { settings } = this._store;
    const dir = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (dir) {
      settings.outputDir = dir;
    }
  }

  showProgress(bool) {
    const { ui } = this._store;
    ui.isProgressShown = bool;
  }

  async saveSlice() {
    const { timeline, movie, settings, ui } = this._store;

    if (!movie.hasBfFile) {
      return;
    }

    ui.isSlicing = true;
    // clear previous if exists
    movie.afProbe = {};

    const outputName = `${timeline.selectStartSec}-${timeline.selectStartSec + timeline.selectingSec}.mp4`;
    const output = path.normalize(`${settings.outputDir}/${outputName}`);

    try {
      await execCommand('cmd:ffmpeg-slice', {
        startSec: timeline.selectStartSec,
        input: movie.bfPath,
        time: timeline.selectingSec,
        frameRate: settings.frameRate,
        preset: settings.preset,
        output,
      });
    } catch (err) {
      console.error(err);
      remote.dialog.showErrorBox('Error', 'Open devtools for more detail.');
      return;
    }

    let probeInfo;
    try {
      const probeRes = await execCommand('cmd:ffprobe', {
        input: output,
      });
      probeInfo = JSON.parse(probeRes);
    } catch (err) {
      console.error(err);
      remote.dialog.showErrorBox('Error', 'Open devtools for more detail.');
      return;
    }

    movie.afProbe = probeInfo;
    shell.showItemInFolder(movie.afPath);
    ui.isSlicing = false;
  }

  saveSnapshot() {

    const { timeline, movie, settings } = this._store;

    if (!movie.hasBfFile) {
      return;
    }

    const outputName = `${timeline.selectStartSec}.gif`;
    const output = `${settings.outputDir}/${outputName}`;

    // do not need to await for taking snapshot
    execCommand('cmd:ffmpeg-snap', {
      startSec: movie.currentTimeDisp,
      input: movie.bfPath,
      output,
    })
      .then(() => {
        shell.showItemInFolder(output);
      })
      .catch(err => {
        console.error(err);
        remote.dialog.showErrorBox('Error', 'Open devtools for more detail.');
        return;
      });
  }

  convertGif() {
    const { timeline, movie, settings } = this._store;

    if (!movie.hasBfFile) {
      return;
    }
    let count = settings.gifSplit;

    const date = timestamp('YYYYMMDD_HHmmss');
    const outputName = `${date}.gif`;
    const output = `${settings.outputDir}/${outputName}`;

    // do not need to await for taking snapshot
    execCommand('cmd:ffmpeg-convert-gif', {
      startSec: movie.currentTimeDisp,
      input: movie.bfPath,
      output,
    })
      .then(() => {
        shell.showItemInFolder(output);
      })
      .catch(err => {
        console.error(err);
        remote.dialog.showErrorBox('Error', 'Open devtools for more detail.');
        return;
      });

  }

  cropGif() {
    const { timeline, movie, settings } = this._store;

    if (!movie.hasBfFile) {
      return;
    }
    const gifSplit = settings.gifSplit;
    let count = settings.gifSplit;
    for (let i = 0; i < count; i++) {

      const date = timestamp('YYYYMMDD_HHmmss');
      const outputName = `${date}-${i}.mp4`;
      const output = `${settings.outputDir}/${outputName}`;

      // do not need to await for taking snapshot
      execCommand('cmd:ffmpeg-crop-gif', {
        startSec: movie.currentTimeDisp,
        input: movie.bfPath,
        output,
        gifSplit,
        i,
      })
        .then(() => {
          shell.showItemInFolder(output);
        })
        .catch(err => {
          console.error(err);
          remote.dialog.showErrorBox('Error', 'Open devtools for more detail.');
          return;
        });
    }
  }

  toTwitterGif() {
    const { timeline, movie, settings } = this._store;

    if (!movie.hasBfFile) {
      return;
    }
    const gifWidth = settings.gifWidth;
    // let count = settings.gifSplit;
    // for (let i = 0; i < count; i++) {

      const date = timestamp('YYYYMMDD_HHmmss');
      // const outputName = `${date}-${i}.mp4`;
      const outputName = `${date}.gif`;
      const output = `${settings.outputDir}/${outputName}`;

      // do not need to await for taking snapshot
      execCommand('cmd:ffmpeg-toTwitter-gif', {
        startSec: timeline.selectStartSec,
        input: movie.bfPath,
        time: timeline.selectingSec,
        frameRate: settings.frameRate,
        preset: settings.preset,
        output,
        gifWidth,
      })
        .then(() => {
          shell.showItemInFolder(output);
        })
        .catch(err => {
          console.error(err);
          remote.dialog.showErrorBox('Error', 'Open devtools for more detail.');
          return;
        });
    // }
  }

  openUrl(url) {
    shell.openExternal(url);
  }
}

export default Event;
