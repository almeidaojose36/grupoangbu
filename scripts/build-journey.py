#!/usr/bin/env python3
"""
Builds the scroll-scrubbed "journey" for the companies section from the
Option B transition clips: joins them with short blends at the seams, then
exports a 1080p video (desktop) and a portrait video (phones) encoded for fast
seeking, plus posters, arrival stills and a manifest the page reads.

    python3 scripts/build-journey.py

Clip order follows the companies section. Each clip ENDS on that company.
If the Telecom -> Comercio transition is missing, the existing Comercio clip
is dissolved in instead.
"""
import glob, json, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'Option B')
OUT = os.path.join(ROOT, 'public', 'media', 'journey')
SEAM = 0.25          # blend between transitions that share a frame
BRIDGE = 1.0         # dissolve used when a transition clip is missing

# (glob inside Option B, company slug the clip arrives at)
ORDER = [
    ('Drone_descending_into_factory*', 'cab-racao'),
    ('Engineer_connecting_factory_data*', 'tchiowa-net'),
    ('Transitioning_from_server_rack*', 'atc'),
    ('Camera_glides_out_window*', 'angbu-empreitada'),
    ('Camera_pans_into_setting_sun*', 'angbu-telecom'),
    ('Circuit_repair_showroom*', 'angbu-comercio'),
]
FALLBACK_COMERCIO = os.path.join(ROOT, 'public', 'media', 'comercio.mp4')


def sh(*args):
    subprocess.run(args, check=True)


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


clips = []
for pattern, slug in ORDER:
    found = sorted(glob.glob(os.path.join(SRC, pattern)))
    if found:
        clips.append({'path': found[0], 'slug': slug, 'fade': SEAM, 'take': None})
    elif slug == 'angbu-comercio':
        print('No Telecom -> Comercio transition yet: dissolving into the existing Comercio clip.')
        clips.append({'path': FALLBACK_COMERCIO, 'slug': slug, 'fade': BRIDGE, 'take': 4.0})
    else:
        sys.exit(f'Missing clip for {slug}: {pattern}')

# Timeline: each clip overlaps the previous one by its fade.
t = 0.0
for i, c in enumerate(clips):
    c['len'] = c['take'] or duration(c['path'])
    c['start'] = 0.0 if i == 0 else t - c['fade']
    t = c['start'] + c['len']
total = t

# Arrival = moment the camera settles on the company (just before the next blend starts).
arrivals = []
for i, c in enumerate(clips):
    end = c['start'] + c['len']
    nxt = clips[i + 1]['fade'] if i + 1 < len(clips) else 0
    arrivals.append({'slug': c['slug'], 'time': round(end - nxt, 3)})

# ffmpeg graph: normalise every clip, then chain xfades.
inputs, chains = [], []
for i, c in enumerate(clips):
    inputs += ['-t', str(c['len']), '-i', c['path']]
    chains.append(f'[{i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24,format=yuv420p,setsar=1[v{i}]')
prev = 'v0'
for i in range(1, len(clips)):
    c = clips[i]
    chains.append(f'[{prev}][v{i}]xfade=transition=fade:duration={c["fade"]}:offset={c["start"]:.3f}[x{i}]')
    prev = f'x{i}'

master = os.path.join(ROOT, 'video-sources', 'journey-master.mp4')
sh('ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(chains), '-map', f'[{prev}]',
   '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-an', master)

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)

# Scroll-scrubbed video: light denoise (AI footage noise costs bits), a keyframe every
# half second and no B-frames so seeking to any moment stays fast.
SCRUB = ['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-tune', 'film', '-g', '12', '-keyint_min', '12',
         '-bf', '0', '-sc_threshold', '0', '-profile:v', 'high', '-level', '4.1', '-movflags', '+faststart']
VARIANTS = {
    'wide': 'hqdn3d=2:1.5:5:5,format=yuv420p',                                   # 1920x1080, desktop
    'tall': 'crop=ih*9/16:ih,scale=720:1280:flags=lanczos,hqdn3d=2:1.5:5:5,format=yuv420p',  # phones
}
for name, vf in VARIANTS.items():
    sh('ffmpeg', '-v', 'error', '-y', '-i', master, '-vf', vf, *SCRUB, os.path.join(OUT, f'{name}.mp4'))
    sh('ffmpeg', '-v', 'error', '-y', '-i', os.path.join(OUT, f'{name}.mp4'), '-frames:v', '1',
       '-c:v', 'libwebp', '-quality', '82', os.path.join(OUT, f'{name}.webp'))

# One still per company arrival, for the reduced-motion layout.
for k, a in enumerate(arrivals):
    sh('ffmpeg', '-v', 'error', '-y', '-ss', str(max(0, min(a['time'], total - 0.2) - 0.05)), '-i', master, '-frames:v', '1',
       '-vf', 'scale=1600:-2', '-c:v', 'libwebp', '-quality', '80', os.path.join(OUT, f'stop-{k + 1}.webp'))

manifest = {
    'duration': round(total, 3),
    'arrivals': [{'slug': a['slug'], 'time': min(a['time'], round(total - 0.1, 3))} for a in arrivals],
}
for path in (os.path.join(OUT, 'manifest.json'), os.path.join(ROOT, 'src', 'data', 'journey.json')):
    with open(path, 'w') as f:
        json.dump(manifest, f, indent=2)

mb = lambda f: os.path.getsize(os.path.join(OUT, f)) / 1e6
print(f'{total:.1f}s | wide.mp4 {mb("wide.mp4"):.1f} MB | tall.mp4 {mb("tall.mp4"):.1f} MB')
print(json.dumps(manifest['arrivals']))
