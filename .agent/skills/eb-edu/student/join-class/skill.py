#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
加入班级
"""

from __future__ import annotations
import os, sys, argparse
_d = os.path.dirname(os.path.abspath(__file__))
_u = os.path.join(_d, '..', '..')
if _u not in sys.path: sys.path.insert(0, _u)
try:
    from skill_utils import cross_platform_print as _p
except ImportError:
    _p = lambda t: print(t)

def execute(args):
    try:
        from eb_edu_executor import class_join
        return class_join(args.class_code)
    except Exception as e:
        return {'success': False, 'error': str(e)}

def format_output(_r, _a):
    if _r['success']:
        raw = _r['data']
        out = ['## 加入班级\n']
        if isinstance(raw, str):
            for line in raw.strip().split(chr(34)+chr(34)):
                line = line.strip()
                if not line or chr(61) in line or line.startswith('eb-edu'): continue
                if chr(58)+chr(32) in line:
                    parts = line.split(chr(58)+chr(32), 1)
                    out.append(chr(34)+chr(45)+chr(32)+chr(42)+chr(42) + parts[0].strip() + chr(45)+chr(42)+chr(42)+chr(58)+chr(32) + parts[1].strip().rstrip(chr(44)))
                elif line.startswith(chr(91)): continue
                elif line: out.append(line)
        elif isinstance(raw, dict):
            for k, v in raw.items():
                if not isinstance(v, (dict, list)): out.append(chr(34)+chr(45)+chr(32)+chr(42)+chr(42) + k + chr(45)+chr(42)+chr(42)+chr(58)+chr(32) + str(v))
        elif isinstance(raw, list):
            out.append(chr(34)+chr(45)+chr(32)+chr(233)+chr(130)+chr(84)+chr(227)+chr(131)+chr(136)+chr(32) + str(len(raw)) + chr(32)+chr(233)+chr(148)+chr(139)+chr(227)+chr(130)+chr(147)+chr(34))
        return chr(10).join(out)
    return chr(39)+chr(63)+chr(63)+chr(32) + _r.get('error', chr(39)+chr(63)+chr(63)+chr(39))

def main():
    parser = argparse.ArgumentParser(description='加入班级')
    parser.add_argument("--class-code", type=str, required=True, help="班级码")
    args = parser.parse_args()
    _r = execute(args)
    _p(format_output(_r, args))
    return 0 if _r.get('success') else 1

if __name__ == '__main__':
    sys.exit(main())