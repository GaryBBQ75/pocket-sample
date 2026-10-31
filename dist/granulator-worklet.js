import {makeDSP} from './dsp-runtime.js';
class PocketGranulator extends AudioWorkletProcessor {
  constructor(options){
    super();this.bypass=true;this.failed=false;this.zero=new Float32Array(128);this.module=options.processorOptions.module;this.meterFrames=0;this.inputPower=0;this.outputPower=0;this.peak=0;
    try{this.dsp=makeDSP(this.module,sampleRate);this.configure(options.processorOptions.settings);this.port.postMessage({type:'ready'})}catch(error){this.fail(error)}
    this.port.onmessage=({data})=>{try{if(data.reset){this.dsp?.dispose();this.dsp=makeDSP(this.module,sampleRate);data=data.settings;this.failed=false}this.configure(data)}catch(error){this.fail(error)}};
  }
  configure(data){this.dsp.configure(data);this.bypass=!data.enabled&&!data.delayEnabled}
  fail(error){this.failed=true;this.port.postMessage({type:'error',error:error.message})}
  process(inputs,outputs){
    const output=outputs[0],input=inputs[0];if(!output.length)return true;
    const left=input[0]||this.zero,right=input[1]||left;
    if(this.bypass||this.failed||!this.dsp){output[0].set(left);if(output[1])output[1].set(right)}
    else try{this.dsp.process(left,right,output[0],output[1]||output[0],output[0].length)}catch(error){this.fail(error);output[0].set(left);if(output[1])output[1].set(right)}
    for(let i=0;i<output[0].length;i++){const a=output[0][i],b=output[1]?.[i]??a;if(!Number.isFinite(a)||!Number.isFinite(b)){output[0][i]=0;if(output[1])output[1][i]=0;if(!this.failed)this.fail(Error('Signal audio invalide.'));continue}this.inputPower+=(left[i]*left[i]+right[i]*right[i])*.5;this.outputPower+=(a*a+b*b)*.5;this.peak=Math.max(this.peak,Math.abs(a),Math.abs(b));this.meterFrames++}
    if(this.meterFrames>=sampleRate/4){this.port.postMessage({type:'meter',input:Math.sqrt(this.inputPower/this.meterFrames),output:Math.sqrt(this.outputPower/this.meterFrames),peak:this.peak});this.inputPower=0;this.outputPower=0;this.meterFrames=0;this.peak=0}
    return true;
  }
}
registerProcessor('pocket-granulator',PocketGranulator);
