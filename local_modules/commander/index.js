const fs = require('fs');
const path = require('path');
const exist = function (file) {
  try {
    fs.statSync(file);
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
  }
}
// ffmpeg
let ffmpeg =  __dirname + "\\bin\\ffmpeg.exe";
if (!exist(ffmpeg)) {
  // search %PATH% 
  ffmpeg = 'ffmpeg';
}
// ffprobe
let ffprobeCmd =  __dirname + "\\bin\\ffprobe.exe";
if (!exist(ffprobeCmd)) {
  // search %PATH% 
  ffprobeCmd = 'ffprobe';
}

function ffmpegToTitterGif({
  startSec,
  preset,
  time,
  frameRate,
  input,
  output,
  gifWidth,
}) {
  console.log("ffmpegToTitterGif");
  // fix Windows path
  console.log(input);
  console.log(output);
  input = path.normalize(input).replace(new RegExp('\\' + path.sep, 'g'), '/');
  output = path.normalize(output).replace(new RegExp('\\' + path.sep, 'g'), '/');
  console.log(input);
  console.log(output);
  // base
  let cmd = `${ffmpeg} -y -loglevel error`;
  // input
  // cmd += ` -i "${input}" `;

  cmd += ` -ss ${startSec} -i "${input}"`;
  console.log(cmd);
  // output
  // cmd += ` -vcodec libx264 -acodec libfdk_aac -preset ${preset} -t ${time} -r ${frameRate} ${output}`;
  cmd += ` -t ${time} -r ${frameRate} ${output}`;
  // output
  console.log(cmd);
  // TwitterApp 140sec and 512MB
  cmd += ` -filter_complex "[0:v] fps=10,setpts=PTS/1.0,scale=${gifWidth}:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse=dither=none" -fs 500000k ${output}`;

  return cmd;
}
function ffmpegCropGif({
  input,
  output,
  gifSplit, // 分割数
  i, // 書き出し
}) {
  // fix Windows path
  input = path.normalize(input).replace(new RegExp('\\' + path.sep, 'g'), '/');
  output = path.normalize(output).replace(new RegExp('\\' + path.sep, 'g'), '/');
  // base
  let cmd = `${ffmpeg} -y -loglevel error`;
  // input
  cmd += ` -i "${input}" -ss 0`;
  // output
  let cropNo = parseInt(i);
  if (cropNo > 0) {
    // 1 / ${gifSplit}の幅で書き出し & オフセット
    // cmd += ` -vf scale=320:-1 -b:v 1.0M -vf crop=in_w/${gifSplit}:in_h:in_w/${gifSplit}*${cropNo}:0 ${output}`;
    // cmd += ` -vf scale=320:-1 -fs 100k -vf crop=in_w/${gifSplit}:in_h:in_w/${gifSplit}*${cropNo}:0 ${output}`;
    // cmd += ` -vf scale=in_w:in_w -fs 100k -vf crop=in_w/${gifSplit}:in_h:in_w/${gifSplit}*${cropNo}:0 ${output}`;
    // cmd += ` -fs 100k -vf crop=in_w/${gifSplit}:in_h:in_w/${gifSplit}*${cropNo}:0 ${output}`;
    cmd += ` -vf crop=in_w/${gifSplit}:in_h:in_w/${gifSplit}*${cropNo}:0 ${output}`;
  } else {
    // 1 / ${gifSplit}の幅で書き出し
    // cmd += ` -vf scale=320:-1 -b:v 1.0M crop=in_w/${gifSplit}:in_h:0:0 ${output}`;
    // cmd += ` -vf scale=320:-1 -fs 100k -vf crop=in_w/${gifSplit}:in_h:0:0 ${output}`;
    // cmd += ` -vf scale=in_w:in_w -fs 100k -vf crop=in_w/${gifSplit}:in_h:0:0 ${output}`;
    // cmd += ` -fs 100k -vf crop=in_w/${gifSplit}:in_h:0:0 ${output}`;
    cmd += ` -vf crop=in_w/${gifSplit}:in_h:0:0 ${output}`;
  }

  return cmd;
}
function ffmpegConvertGif({
  input,
  output,
}) {
  // fix Windows path
  input = path.normalize(input).replace(new RegExp('\\' + path.sep, 'g'), '/');
  output = path.normalize(output).replace(new RegExp('\\' + path.sep, 'g'), '/');
  // base
  let cmd = `${ffmpeg} -y -loglevel error`;
  // input
  cmd += ` -i "${input}" `;
  // output
  // cmd += ` -vf scale=320:-1 -b:v 1.0M ${output}`;
  // cmd += ` -vf scale=320:-1 -fs 100k ${output}`;
  // cmd += ` -vf scale=-1:120 -fs 100k -r 5 ${output}`;

  // fps 5 setpts=フレームスキップ(再生速度2)
  // 詳細はhttps://qiita.com/yusuga/items/ba7b5c2cac3f2928f040
  // cmd += ` -filter_complex "[0:v] fps=5,setpts=PTS/2.0,scale=120:120,split [a][b];[a] palettegen [p];[b][p] paletteuse=dither=none" -fs 100k -y ${output}`;
  cmd += ` -filter_complex "[0:v] fps=5,setpts=PTS/2.0,scale=120:120,split [a][b];[a] palettegen [p];[b][p] paletteuse=dither=none" -fs 100k -vframes 22 ${output}`;
  // cmd += ` -fs 100k ${output}`;

  return cmd;
}

function ffmpegSlice({
  startSec,
  input,
  preset,
  time,
  frameRate,
  output,
}) {
  // fix Windows path
  input = path.normalize(input).replace(new RegExp('\\' + path.sep, 'g'), '/');
  output = path.normalize(output).replace(new RegExp('\\' + path.sep, 'g'), '/');
  // base
  let cmd = `${ffmpeg} -y -loglevel error`;
  // input
  cmd += ` -ss ${startSec} -i "${input}"`;
  // output
  cmd += ` -vcodec libx264 -acodec libfdk_aac -preset ${preset} -t ${time} -r ${frameRate} ${output}`;

  return cmd;
}

function ffmpegSnap({
  startSec,
  input,
  output,
}) {
  // fix Windows path
  input = path.normalize(input).replace(new RegExp('\\' + path.sep, 'g'), '/');
  output = path.normalize(output).replace(new RegExp('\\' + path.sep, 'g'), '/');
  // base
  let cmd = `${ffmpeg} -y -loglevel error`;
  // input
  cmd += ` -ss ${startSec} -i "${input}"`;
  // output
  cmd += ` -vframes 1 ${output}`;

  return cmd;
}

function ffprobe({
  input,
}) {
  // base
  let cmd = `${ffprobeCmd} -loglevel error`;
  // input
  cmd += ` -i "${input}"`;
  // output
  cmd += ' -show_streams -show_format -print_format json';

  return cmd;
}

module.exports = {
  ffmpegToTitterGif,
  ffmpegCropGif,
  ffmpegConvertGif,
  ffmpegSlice,
  ffmpegSnap,
  ffprobe,
};
