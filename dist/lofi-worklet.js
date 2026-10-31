import './lofi-dsp.js?v=15';
class PocketLoFiProcessor extends AudioWorkletProcessor{constructor(options){super();const p=options.processorOptions||{};this.dsp=new PocketLoFiDSP(p.bits,p.decimation)}process(inputs,outputs){this.dsp.process(inputs[0]||[],outputs[0]);return true}}
registerProcessor('pocket-lofi',PocketLoFiProcessor);
