// Small audio cue layer. Audio is opt-in and safely degrades when WebAudio is unavailable.
export function createFightAudio({enabled=false}={}){
 let context=null,muted=!enabled;
 function cue(frequency=180,duration=.07,wave='triangle'){
  if(muted||typeof window==='undefined')return;
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  context??=new Ctx();if(context.state==='suspended')context.resume();
  const osc=context.createOscillator(),gain=context.createGain();osc.type=wave;osc.frequency.value=frequency;
  gain.gain.setValueAtTime(.0001,context.currentTime);gain.gain.exponentialRampToValueAtTime(.08,context.currentTime+.008);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+duration);
  osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+duration+.01);
 }
 return {setEnabled(value){muted=!value},strike(){cue(125,.055,'sawtooth')},block(){cue(320,.045)},bell(){cue(740,.22,'sine')},impact(){cue(90,.08,'triangle')},dispose(){context?.close();context=null}};
}
