export const loadFile = file => ({
  type: 'LOAD_FILE',
  payload: file.path,
});

export const getVideoDuration = $video => ({
  type: 'GET_VIDEO_DURATION',
  payload: $video.duration,
});

export const setVideoCurrentTime = percentage => ({
  type: 'SET_VIDEO_CURRENT_TIME',
  payload: percentage,
});

export const getVideoCurrentTime = $video => ({
  type: 'GET_VIDEO_CURRENT_TIME',
  payload: $video.currentTime,
});

export const setSelectStartSec = percentage => ({
  type: 'SET_SELECT_START_SEC',
  payload: percentage,
});

export const setSelectEndSec = percentage => ({
  type: 'SET_SELECT_END_SEC',
  payload: percentage,
});

export const zoomIn = () => ({
  type: 'ZOOM_IN',
  payload: null,
});

export const zoomOut = () => ({
  type: 'ZOOM_OUT',
  payload: null,
});
