"""Build a signed, arm64 Android DSP test APK without Gradle.
python android/build.py --ndk PATH --platform PATH_TO_ANDROID_JAR --tools BUILD_TOOLS_DIR
"""
import argparse,os,subprocess,shutil,zipfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--ndk',required=True);p.add_argument('--platform',required=True);p.add_argument('--tools',required=True);p.add_argument('--output',default='build/android/PocketSample-DSP-test.apk');a=p.parse_args()
root=Path(__file__).resolve().parent.parent;os.chdir(root)
build=root/'build/android';classes=build/'classes';dex=build/'dex';lib=build/'apk/lib/arm64-v8a/libpocket.so'
for d in [classes,dex,lib.parent]:d.mkdir(parents=True,exist_ok=True)
tools=Path(a.tools);platform=Path(a.platform).resolve();ndk=Path(a.ndk)
def run(*args):subprocess.run([str(x) for x in args],check=True)
compiler=ndk/'toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android26-clang++'
run(compiler,'-std=c++17','-O2','-fPIC','-shared','-ffp-contract=off','-fno-fast-math','-static-libstdc++','-Inative',*sorted((root/'native').glob('*.cpp')),root/'android/native_bridge.cpp','-o',lib)
javac=[shutil.which('javac')] if shutil.which('javac') else ['java','com.sun.tools.javac.Main']
run(*javac,'--release','8','-classpath',platform,'-d',classes,root/'android/src/com/gary/pocketsample/MainActivity.java')
run(tools/'d8','--lib',platform,'--min-api','26','--output',dex,*sorted(classes.rglob('*.class')))
unsigned=build/'unsigned.apk';aligned=build/'aligned.apk';key=build/'debug.keystore'
run(tools/'aapt2','link','--manifest',root/'android/AndroidManifest.xml','-I',platform,'-o',unsigned,'--min-sdk-version','26','--target-sdk-version','35')
with zipfile.ZipFile(unsigned,'a') as z:
 z.write(dex/'classes.dex','classes.dex',compress_type=zipfile.ZIP_DEFLATED)
 z.write(lib,'lib/arm64-v8a/libpocket.so',compress_type=zipfile.ZIP_STORED)
run(tools/'zipalign','-f','-P','16','4',unsigned,aligned)
if not key.exists():
 keytool=[shutil.which('keytool')] if shutil.which('keytool') else ['java','sun.security.tools.keytool.Main']
 run(*keytool,'-genkeypair','-keystore',key,'-alias','androiddebugkey','-keyalg','RSA','-keysize','2048','-validity','3650','-dname','CN=Android Debug,O=Android,C=US','-storepass','android','-keypass','android')
output=Path(a.output).resolve();output.parent.mkdir(parents=True,exist_ok=True)
run(tools/'apksigner','sign','--ks',key,'--ks-key-alias','androiddebugkey','--ks-pass','pass:android','--key-pass','pass:android','--out',output,aligned)
run(tools/'apksigner','verify','--verbose',output)
run(tools/'zipalign','-c','-P','16','4',output)
print('APK_READY',output,output.stat().st_size)
