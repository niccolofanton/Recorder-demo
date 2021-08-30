import { Component, VERSION } from '@angular/core';
import Recorder from 'opus-recorder';

const CONSTRAINTS = {
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    sampleRate: 44100,
    channelCount: 2,
    sampleSize: 16
  }
};

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  streamSettings = null;

  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  recorder ;

  audios = [];

  startRecording() {
    navigator.mediaDevices.getUserMedia(CONSTRAINTS).then(stream => {

      this.ctx = new AudioContext();
      this.source = this.ctx.createMediaStreamSource(stream);

      this.recorder = new Recorder({
        numberOfChannels: 2,
        encoderPath:
          'https://culo.s3.eu-south-1.amazonaws.com/encoderWorker.min.js',
        sourceNode: this.source
      });

      this.recorder.ondataavailable = function(typedArray) {
        var dataBlob = new Blob([typedArray], { type: 'audio/ogg' });
        var fileName = new Date().toISOString() + '.ogg';
        var url = URL.createObjectURL(dataBlob);
        console.log(url)
        this.audios.push(url)
      };

      this.recorder.start()
      .then(() => this.streamSettings = this.recorder?.sourceNode?.mediaStream?.getTracks()[0]?.getSettings());

    
  })
}

  stopRecording() {

   this.recorder.stop();

  //  this.source?.disconnect();
   this.ctx?.close();

   this.ctx = null;
   this.source = null;

   this.recorder.ondataavailable = () => {};
   this.recorder.start = () => {};
   this.recorder?.close()
   this.recorder = null;

  }
}
