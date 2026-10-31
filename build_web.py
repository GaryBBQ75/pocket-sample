"""Build the shared C++ browser module with Emscripten. Run from repo root.
python build_web.py --compiler /path/to/emsdk/upstream/emscripten/em++
"""
import argparse,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--compiler',default='em++');a=p.parse_args()
root=Path(__file__).resolve().parent
subprocess.run([a.compiler,'-std=c++17','-O2','-fno-exceptions','-ffp-contract=off','-fno-fast-math',*[str(x) for x in sorted((root/'native').glob('*.cpp'))],'-s','STANDALONE_WASM=1','-s','INITIAL_MEMORY=16777216','-s','EXPORTED_FUNCTIONS=["_pocket_host_create","_pocket_host_destroy","_pocket_host_configure","_pocket_host_process","_pocket_host_set_delay","_pocket_host_set_effects","_malloc","_free"]','--no-entry','-o',str(root/'dist/pocket-dsp.wasm')],check=True)
