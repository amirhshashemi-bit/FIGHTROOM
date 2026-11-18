// Device-aware renderer profile and quality gates for mobile browsers.
export function qualityProfile({width=1280,height=720,deviceMemory=4,hardwareConcurrency=4,reducedMotion=false}={}){
 const constrained=deviceMemory<=4||hardwareConcurrency<=4||width<700;
 const lowPower=constrained||reducedMotion;
 return {tier:constrained?'low':'high',pixelRatio:constrained?.8:1.5,shadows:!constrained,antialias:!constrained,crowdDetail:constrained?'impostors':'instanced',maxLights:constrained?2:8,maxFPS:lowPower?30:60,reducedMotion:!!reducedMotion};
}
export function assessFrameTimes(samples){if(!Array.isArray(samples)||samples.length<10)return {valid:false,reason:'need-at-least-10-samples'};const sorted=[...samples].filter(Number.isFinite).sort((a,b)=>a-b);if(sorted.length<10)return {valid:false,reason:'invalid-samples'};const at=p=>sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];return {valid:true,fps:Math.round(1000/at(.5)),p95FrameMs:+at(.95).toFixed(2),stable:at(.95)<=33.34};}
