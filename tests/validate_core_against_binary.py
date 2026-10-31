"""Conditional DSP oracle test; no firmware or original instructions included.
Usage: python validate_core_against_binary.py EXTRACTED_ELF NATIVE_SHARED_LIBRARY
Reference uses the caller-supplied ELF, including its seeded PRNG. OS buffer
clearing is replaced by exact zero-fill; TLS is supplied with an explicit seed.
Firmware/UI construction, OS seed selection and hardware are not exercised.
"""
import ctypes as C
import json
import random
import struct
import sys
from elftools.elf.elffile import ELFFile
from unicorn import Uc, UC_ARCH_ARM64, UC_MODE_ARM, UC_HOOK_CODE
from unicorn.arm64_const import *

if len(sys.argv)!=3:
    raise SystemExit(__doc__)
binary_path, library_path=sys.argv[1:]
u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with open(binary_path,'rb') as source:
    elf=ELFFile(source)
    for segment in elf.iter_segments():
        if segment['p_type']=='PT_LOAD':
            start=segment['p_vaddr']; lo=start&~4095
            end=(start+segment['p_memsz']+4095)&~4095
            u.mem_map(lo,end-lo); u.mem_write(start,segment.data())
for start,size in [(0x20000000,0x2000),(0x21000000,0x50000),
                   (0x22000000,0x10000),(0x23000000,0x10000),
                   (0x24000000,0x1000),(0x30000000,0x1000)]:
    u.mem_map(start,size)
u.reg_write(UC_ARM64_REG_CPACR_EL1,3<<20)
u.reg_write(UC_ARM64_REG_TPIDR_EL0,0x23000000)
u.mem_write(0x7164398,struct.pack('<Q',0x24000000))
def clear_buffer(uc,address,size,data):
    pointer=uc.reg_read(UC_ARM64_REG_X0)
    count=uc.reg_read(UC_ARM64_REG_W1)
    uc.mem_write(pointer,b'\0'*(count*4))
    uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
u.hook_add(UC_HOOK_CODE,clear_buffer,begin=0xdd20b0,end=0xdd20b0)

class Cursor(C.Structure):
    _fields_=[('position',C.c_int64),('step',C.c_int64),
              ('envelope_position',C.c_uint64),('envelope_step',C.c_uint64),
              ('left_gain',C.c_float),('right_gain',C.c_float)]
class Grain(C.Structure):
    _fields_=[('cursor',Cursor),('remaining_samples',C.c_int32)]
class Controls(C.Structure):
    _fields_=[(name,C.c_float) for name in ['stereo_spread','speed_spread',
        'base_speed','position_spread','duration_samples','envelope_rate']]+[
        (name,C.c_int32) for name in ['buffer_length','write_position',
                                     'frozen_position','frozen','reverse']]
class Mix(C.Structure):
    _fields_=[(name,C.c_float) for name in ['left','right','coefficient',
        'feedback','wet']]+[('position',C.c_uint),('frozen',C.c_int)]
class Schedule(C.Structure):
    _fields_=[('countdown',C.c_int),('interval',C.c_int),('channels',C.c_int),
              ('spread',C.c_float)]
FP=C.POINTER(C.c_float)
class Core(C.Structure):
    _fields_=[('controls',Controls),('mix',Mix),('schedule',Schedule),
        ('random_state',C.c_uint64),('grains',C.POINTER(Grain)),
        ('grain_count',C.c_uint),('grain_capacity',C.c_uint),
        ('envelope',C.c_float*256)]+[(name,FP) for name in [
        'capture_left','capture_right','ring_left','ring_right',
        'scratch_left','scratch_right']]+[('max_frames',C.c_uint),
        ('amount',C.c_float),('shape',C.c_float),('dirty',C.c_int),
        ('freeze_requested',C.c_int)]
native=C.CDLL(library_path)
native.pocket_granulator_init.argtypes=[C.POINTER(Core),C.POINTER(Grain),
    C.c_uint,FP,FP,FP,FP,C.c_uint,FP,FP,C.c_uint,C.c_uint64]
native.pocket_granulator_process.argtypes=[C.POINTER(Core),FP,FP,C.c_uint]
class Timing(C.Structure):
    _fields_=[('duration',C.c_float),('envelope_rate',C.c_float),('interval',C.c_int32)]
native.pocket_grain_timing.argtypes=[C.c_float,C.c_float,C.c_float,C.POINTER(Timing)]

def write(address,fmt,*values): u.mem_write(address,struct.pack('<'+fmt,*values))
def read(address,fmt): return struct.unpack('<'+fmt,u.mem_read(address,struct.calcsize('<'+fmt)))
def equal(label,expected,actual):
    if expected!=actual:
        if isinstance(expected,bytes):
            at=next((n for n,(a,b) in enumerate(zip(expected,actual)) if a!=b),None)
            raise AssertionError((label,'first byte',at,'expected',expected[at:at+8].hex(),
                                  'actual',actual[at:at+8].hex()))
        raise AssertionError((label,expected,actual))

rng=random.Random(20261030)
ring_length=8192; maximum=64
addresses=[0x21010000,0x21018000,0x21020000,0x21028000]
blocks=outputs=0; saw_full=saw_expiry=saw_signal=saw_wrap=False
def expiry_event(uc,address,size,data):
    global saw_expiry
    saw_expiry=True
u.hook_add(UC_HOOK_CODE,expiry_event,begin=0x18b1190,end=0x18b1190)
for stream,capacity in enumerate([1,2,8,32,8,32]):
    s=Core(); pool=(Grain*capacity)()
    arrays=[(C.c_float*ring_length)(*[rng.uniform(-.2,.2) for _ in range(ring_length)]) for _ in range(4)]
    scratch=[(C.c_float*maximum)() for _ in range(2)]
    seed=[1,17,48271,1234567,0,0x7fffff][stream]
    native.pocket_granulator_init(C.byref(s),pool,capacity,*arrays,ring_length,
        *scratch,maximum,seed)
    duration=[128,64,256,511,32,128][stream]
    speed=[.7,.25,1.,1.5,2.,.9][stream]
    s.controls=Controls(.8,.4,speed,.6,duration,1./duration,ring_length,0,0,0,stream%2)
    s.mix=Mix(.01,-.02,.99,[.7,0.,.99,.3,1.,.6][stream],.85,0,0)
    s.schedule=Schedule(0,17 if capacity<8 else 47,2,.9)
    s.amount=.4; s.shape=.65
    state=bytearray(0x2000)
    struct.pack_into('<QQQ',state,0,0x21000000,0x21000000,0x21000000+48*capacity)
    struct.pack_into('<i',state,0x1c,ring_length)
    for offset,pointer in [(0x28,0x21004000),(0x158,0x21004020),(0x288,0x21004040)]:
        struct.pack_into('<Q',state,offset,pointer)
    struct.pack_into('<ii',state,0x148,2,ring_length)
    struct.pack_into('<ii',state,0x278,2,maximum)
    for offset,value in [(0x7a8,s.amount),(0x7ac,s.shape),(0x7b4,s.mix.coefficient),
        (0x7b8,s.mix.left),(0x7bc,s.mix.right),(0x7dc,s.mix.feedback),(0x800,s.mix.wet),
        (0x7f8,s.controls.stereo_spread),(0x7f4,s.controls.speed_spread),
        (0x7d0,s.controls.base_speed),(0x7fc,s.controls.position_spread),
        (0x7d4,s.controls.duration_samples),(0x7d8,s.controls.envelope_rate),
        (0x7f0,s.schedule.spread)]: struct.pack_into('<f',state,offset,value)
    struct.pack_into('<i',state,0x7cc,s.schedule.interval)
    state[0x7b0]=1; state[0x7e6]=s.controls.reverse
    u.mem_write(0x20000000,bytes(state))
    write(0x20001010,'Q',0x21004060)
    write(0x21004000,'QQ',addresses[2],addresses[3])
    write(0x21004020,'QQ',addresses[0],addresses[1])
    write(0x21004040,'QQ',0x21030000,0x21031000)
    write(0x21004060,'QQ',0x21032000,0x21033000)
    write(0x23007638,'QQQ',1,1,seed)
    for pointer,values in zip(addresses,arrays): u.mem_write(pointer,bytes(values))
    for block in range(400):
        frames=[0,1,16,32,64][block%5]
        if block in [20,60,180,240]:
            s.freeze_requested=1-s.freeze_requested
            u.mem_write(0x200007e5,bytes([s.freeze_requested]))
        if block in [40,150,300]:
            s.controls.reverse=1-s.controls.reverse
            u.mem_write(0x200007e6,bytes([s.controls.reverse]))
            s.amount=.9; s.shape=.15; s.dirty=1
            write(0x200007a8,'ff',s.amount,s.shape);u.mem_write(0x200007b0,b'\1')
        if block in [115,245]:
            length,cadence=(10.,200.) if block==115 else (32.,800.)
            timing=Timing()
            assert native.pocket_grain_timing(48000.,length,cadence,C.byref(timing))==1
            s.controls.duration_samples=timing.duration
            s.controls.envelope_rate=timing.envelope_rate
            s.schedule.interval=timing.interval
            write(0x200007e0,'f',48000.)
            write(0x20001800,'Q',0x20000000-0x1d0)
            for address,value in [(0x250ef80,length),(0x250ef00,cadence)]:
                write(0x20001900,'f',value)
                u.reg_write(UC_ARM64_REG_X0,0x20001800)
                u.reg_write(UC_ARM64_REG_X1,0x20001900)
                u.reg_write(UC_ARM64_REG_LR,0x30000000)
                u.emu_start(address,0x30000000,count=1000)
        left=(C.c_float*maximum)(*[rng.uniform(-1.8,1.8) for _ in range(maximum)])
        right=(C.c_float*maximum)(*[rng.uniform(-1.8,1.8) for _ in range(maximum)])
        u.mem_write(0x21032000,bytes(left));u.mem_write(0x21033000,bytes(right))
        write(0x20001004,'i',frames)
        u.reg_write(UC_ARM64_REG_X0,0x20000000)
        u.reg_write(UC_ARM64_REG_X1,0x20001000)
        u.reg_write(UC_ARM64_REG_SP,0x2200f000)
        u.reg_write(UC_ARM64_REG_LR,0x30000000)
        before_position=s.mix.position
        u.emu_start(0x18b2070,0x30000000,count=2000000)
        if u.reg_read(UC_ARM64_REG_PC)!=0x30000000: raise AssertionError('instruction budget')
        assert native.pocket_granulator_process(C.byref(s),left,right,frames)==1
        label=(stream,block,frames)
        equal((label,'left output'),bytes(left),bytes(u.mem_read(0x21032000,maximum*4)))
        equal((label,'right output'),bytes(right),bytes(u.mem_read(0x21033000,maximum*4)))
        for pointer,values in zip(addresses,arrays):
            equal((label,'ring',pointer),bytes(values),bytes(u.mem_read(pointer,ring_length*4)))
        equal((label,'filter'),struct.pack('<ff',s.mix.left,s.mix.right),bytes(u.mem_read(0x200007b8,8)))
        equal((label,'countdown'),s.schedule.countdown,read(0x200007c8,'i')[0])
        equal((label,'write position'),s.mix.position,read(0x200007c0,'I')[0])
        equal((label,'frozen position'),s.controls.frozen_position,read(0x200007c4,'i')[0])
        equal((label,'seed'),s.random_state,read(0x23007648,'Q')[0])
        original_count=(read(0x20000008,'Q')[0]-0x21000000)//48
        equal((label,'active grains'),s.grain_count,original_count)
        for n in range(s.grain_count):
            equal((label,'grain',n),bytes(pool[n])[:44],bytes(u.mem_read(0x21000000+n*48,44)))
        equal((label,'envelope'),bytes(s.envelope),bytes(u.mem_read(0x200003a8,1024)))
        saw_full|=s.grain_count==capacity
        saw_wrap|=s.mix.position<before_position
        saw_signal|=any(abs(x)>1e-6 for x in s.envelope) and s.grain_count>0
        blocks+=1; outputs+=frames*2
assert saw_full and saw_expiry and saw_signal and saw_wrap
print(json.dumps({'result':'PASS','streams':6,'blocks':blocks,
    'output_float_values':outputs,'output_and_state_comparison':'bitwise_equal',
    'reference_random':'original_seeded_PRNG_with_supplied_TLS',
    'includes':['forward_reverse','freeze_transitions','envelope_updates',
       'grain_pool_full','grain_expiry_swap','variable_host_blocks','zero_frames',
       'feedback','filter_state','ring_buffers','ring_wrap','random_draw_order',
       'duration_and_cadence_callbacks_between_blocks'],
    'limitations':['finite_cases_only','partial_control_mapping','no_OS_seed_selection',
       'no_hardware','no_Android_iOS_build','no_other_effects']},indent=2))
