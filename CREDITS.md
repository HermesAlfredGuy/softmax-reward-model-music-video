# SOFTMAX — REWARD MODEL

An original full-length kinetic-typography music film, directed and implemented for the owner by Hermes / OpenCode.

## Recording

Exactly the owner's preferred preserved take: `set-up-local-ai/out/reward-model-final.wav`, 48 kHz stereo, 191.999021 s. No regenerated melody, replacement singer, voice-over, remix, time-stretch, gain or mastering change. Video delivery uses an ordinary AAC encode from that WAV; the browser uses a high-quality MP3 encode. Original WAV stays intact in the local source project. SHA-256 is recorded in `qa/audio-sha256.txt`.

This is the owner's previously requested locally generated recording, used here with their express publishing permission. No claim that it is public domain or a third-party commercial catalogue licence. No paid generation or paid assets were used in this project.

## Typography

- **Anton**, Vernon Adams. Local licensed font from the studio reference shelf. SIL Open Font License 1.1; exact licence in `assets/fonts/Anton-OFL.txt`.
- **IBM Plex Mono Medium**, IBM. Local licensed font from the studio reference shelf. SIL Open Font License 1.1; exact licence in `assets/fonts/IBMPlexMono-OFL.txt`.

## Rendering and craft

- Original pure-function Canvas2D composition with zero-velocity/acceleration quintic endpoints, 60 distinct time samples each second. Browser and offline native Skia render share `src/film.js` and `src/cues.js`.
- `@napi-rs/canvas` 0.1.80 (MIT) provides CPU rasterization; FFmpeg/libx264 encodes the MP4.
- Starting craft: studio HyperFrames anthem kit's deterministic block grammar (radial delay, tunnel, collapse); its local source is preserved for reference, not used as a generic demo.
- Moving references studied: Ordinary Folk Play, **Radial Delay Rig** and **Expressions Tunnel**, https://www.ordinaryfolk.co/play . Viewing copies and inspection sheets remain local; their films/assets are not part of the published project. Original compositions, palette and type treatment, not a clone of their studio identity.

## Reproduce

```sh
npm ci
# Restore the preserved recording as assets/audio.wav, without altering it.
npm run render -- --out out/softmax-reward-model-1080p60.mp4
npm run build
```

`tools/render.mjs` defaults to native 1920×1080, 60fps, 192 seconds and 11,520 unique time evaluations. It also supports `--from`, `--to`, `--stills`, `--preset`, and `--crf`. Source does not rely on a paid API, GPU, account, random clock or network font.
