package com.gary.pocketsample;

import android.app.Activity;
import android.os.Bundle;
import android.os.Process;
import android.media.AudioTrack;
import android.media.AudioFormat;
import android.media.AudioAttributes;
import android.view.View;
import android.widget.*;
import android.graphics.Color;

public final class MainActivity extends Activity {
    static { System.loadLibrary("pocket"); }
    private static native long createEngine();
    private static native void destroyEngine(long handle);
    private static native int renderEngine(long handle,float[] output,float[] settings,int source,boolean freeze,boolean reverse,boolean delay);
    private volatile boolean running=false,frozen=false,reversed=false,delayEnabled=false;
    private volatile int source=2;
    private volatile float[] settings={80,40,0,.4f,.8f,.25f,.65f,0,0};
    private Thread audioThread;
    private volatile AudioTrack track;
    private Button play;
    private TextView status;
    private LinearLayout body;
    private int dp(float v){return (int)(v*getResources().getDisplayMetrics().density+.5f);}
    private TextView text(String value,int size){TextView t=new TextView(this);t.setText(value);t.setTextColor(Color.rgb(31,49,48));t.setTextSize(size);t.setPadding(0,dp(10),0,dp(6));return t;}
    @Override public void onCreate(Bundle state){
        super.onCreate(state);ScrollView scroll=new ScrollView(this);body=new LinearLayout(this);
        body.setOrientation(LinearLayout.VERTICAL);body.setPadding(dp(22),dp(35),dp(22),dp(32));
        body.setBackgroundColor(Color.rgb(225,223,214));scroll.addView(body);setContentView(scroll);
        body.addView(text("POCKET SAMPLE",29));body.addView(text("LABORATOIRE AUDIO NATIF · ARM64",11));
        body.addView(text("Test du granulateur C++ sur des sons de synthèse. Le sampler complet reste en développement.",14));
        play=new Button(this);play.setText("▶ DÉMARRER LE SON");body.addView(play);
        play.setOnClickListener(v->{if(running)stopAudio();else startAudio();});
        LinearLayout sounds=new LinearLayout(this);
        String[] names={"KICK","BRUIT","BASSE","ACCORD"};
        for(int i=0;i<4;i++){final int id=i;Button b=new Button(this);b.setText(names[i]);b.setTextSize(11);sounds.addView(b,new LinearLayout.LayoutParams(0,dp(55),1));b.setOnClickListener(v->{source=id;status.setText("Source : "+names[id]);});}body.addView(sounds);
        slider("DURÉE",0,10,200,80," ms");slider("CADENCE",1,1,300,40," grains/s");
        slider("HAUTEUR",2,-12,12,0," demi-tons");slider("FENÊTRE",3,0,100,40," %");
        slider("STÉRÉO",4,0,100,80," %");slider("RÉINJECTION",5,0,100,25," %");slider("EFFET",6,0,100,65," %");
        slider("DÉLAI GAUCHE",7,0,250,0," ms");slider("DÉLAI DROIT",8,0,250,0," ms");
        Switch delay=new Switch(this);delay.setText("ACTIVER LE DÉLAI STÉRÉO");body.addView(delay);delay.setOnCheckedChangeListener((b,on)->delayEnabled=on);
        Switch freeze=new Switch(this);freeze.setText("FIGER LE TAMPON");body.addView(freeze);freeze.setOnCheckedChangeListener((b,on)->frozen=on);
        Switch reverse=new Switch(this);reverse.setText("LECTURE INVERSÉE DES GRAINS");body.addView(reverse);reverse.setOnCheckedChangeListener((b,on)->reversed=on);
        status=text("Prêt. Commencez avec un volume d’écoute modéré.",12);body.addView(status);
    }
    private void slider(String name,int index,int min,int max,int value,String unit){
        TextView label=text(name+"  "+value+unit,12);body.addView(label);SeekBar bar=new SeekBar(this);bar.setMax(max-min);bar.setProgress(value-min);body.addView(bar);
        bar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            public void onProgressChanged(SeekBar view,int progress,boolean fromUser){int n=progress+min;label.setText(name+"  "+n+unit);float[] next=settings.clone();next[index]=index>=3&&index<=6?n/100.f:n;settings=next;}
            public void onStartTrackingTouch(SeekBar view){} public void onStopTrackingTouch(SeekBar view){}
        });
    }
    private void startAudio(){
        if(audioThread!=null&&audioThread.isAlive())return;
        running=true;play.setText("■ ARRÊTER");
        audioThread=new Thread(()->{
            long engine=0;AudioTrack sink=null;
            try{
                Process.setThreadPriority(Process.THREAD_PRIORITY_AUDIO);engine=createEngine();
                if(engine==0)throw new IllegalStateException("Initialisation DSP impossible");
                int minimum=AudioTrack.getMinBufferSize(48000,AudioFormat.CHANNEL_OUT_STEREO,AudioFormat.ENCODING_PCM_FLOAT);
                if(minimum<0)throw new IllegalStateException("Format audio indisponible");
                sink=new AudioTrack.Builder().setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build())
                    .setAudioFormat(new AudioFormat.Builder().setSampleRate(48000).setChannelMask(AudioFormat.CHANNEL_OUT_STEREO).setEncoding(AudioFormat.ENCODING_PCM_FLOAT).build())
                    .setBufferSizeInBytes(Math.max(minimum,4096)).setTransferMode(AudioTrack.MODE_STREAM).build();
                if(sink.getState()!=AudioTrack.STATE_INITIALIZED)throw new IllegalStateException("Sortie audio indisponible");
                track=sink;sink.play();float[] buffer=new float[256];
                runOnUiThread(()->status.setText("Moteur C++ actif · 48 kHz stéréo"));
                while(running){
                    int count=renderEngine(engine,buffer,settings,source,frozen,reversed,delayEnabled);
                    if(count!=256)throw new IllegalStateException("Échec du traitement DSP");
                    int offset=0;
                    while(running&&offset<count){int wrote=sink.write(buffer,offset,count-offset,AudioTrack.WRITE_BLOCKING);if(wrote<=0)throw new IllegalStateException("Sortie interrompue : "+wrote);offset+=wrote;}
                }
            }catch(Exception error){if(running)runOnUiThread(()->status.setText("Audio : "+error.getMessage()));}
            finally{running=false;track=null;if(sink!=null){try{sink.stop();}catch(Exception ignored){}sink.release();}if(engine!=0)destroyEngine(engine);runOnUiThread(()->play.setText("▶ DÉMARRER LE SON"));}
        },"Pocket DSP");audioThread.start();
    }
    private void stopAudio(){running=false;AudioTrack sink=track;if(sink!=null)try{sink.pause();sink.flush();}catch(Exception ignored){}play.setText("▶ DÉMARRER LE SON");}
    @Override protected void onPause(){stopAudio();super.onPause();}
}
