# Render review

## Preview v1 — actual 11-second chorus, original audio, native 1080p60

Real render: `out/chorus-preview-v1-1080p60.mp4`, 660 distinct time samples, 10.25 s render wall time (7.24 ms drawing + 7.64 ms pipe/encode per frame). PC worker remains v2; no relay job submitted and no Linux GPU used. Native CPU raster is comfortably practical; no higher-resolution benchmark is needed after owner's 1080p correction.

Inspected actual exported frame sequence `qa/preview-consecutive-v1.png` (12 consecutive 1/60-second frames across the circle reveal), plus `qa/preview-playback-v1.png` (6fps playback strip) and the full design contact sheet. The circle reveal is continuous and no late font/reflow artifacts are visible. Sound is the untouched source passage muxed at 33.5s; fresh word timestamps checked against the visual cue list.

**Largest defects:**
- Type settles too completely after the first 0.7s; thin orbit lines do not carry enough of the frame. Actual house QA: `motion: median 1.66 (gate >= 2.5; Oddfellows reference 6.1), longest dead run 1s before the last 3 s (gate <= 2) -> TOO STILL`.
- Chorus repetitions need development beyond moving rings.
- Final “entropy” must remain slightly unaligned instead of repeating the earlier forced order.

**Revision:** C2-continuous 8.5% shot push/reframe, independently traveling REWARD/MODEL planes, widening stair rise, opening physical door, slower letter convergence, final chorus larger offset typography and preserved uncertainty. Export a revised representative excerpt before full render. Nothing about the failed v1 is described as finished.

**Readability fixes already made:** five was initially bone-on-bone; changed to charcoal. Early verse timings in the old SRT were ~6s late; replaced using master-specific ASR. “Two quadrillion”, uncertain bridge tail, “great”, and unsupported good-bot backing syllables are not added just because they appear on the sheet. “Keep the entropy” and “gradient of desire” are confirmed by the new word pass.

## Revised excerpt v3

`out/chorus-preview-v3-1080p60.mp4`: 660 frames, 9.42 s wall, 6.45 ms drawing / 6.93 ms pipe-encode per frame. Retained v1/v2 as true comparison evidence.

`motion: median 2.56 (gate >= 2.5; Oddfellows reference 6.1), longest dead run 1s before the last 3 s (gate <= 2) -> ok`

Inspected `qa/preview-v3-stairs.png` (actual encoded playback states), native `frame-38_9.png` and `frame-42_9.png`, plus twelve-frame boundary strips. Staircase now acts as a physical surface; corpus has real letter movement; blocks have follow-through rather than freezing. Browser/native source also inspected on 1440px desktop and 390px phone, including the NOTHING bridge. Fonts loaded before readiness, no page errors or failed requests, no horizontal overflow. Phone play/pause and seeking work; corrected the paused seek clock after inspecting its screenshot.

Known scope: selective typographic lyrics, not a literal subtitle transcription. ASR is used as cross-check rather than as authority for ambiguous singing. Owner's original recording and its existing sonic artifacts are deliberately retained.

## Whole-film pass, not excerpt extrapolation

The first complete 192-second render was rejected before final delivery. Actual whole-film result:

`motion: median 1.61 (gate >= 2.5; Oddfellows reference 6.1), longest dead run 7s before the last 3 s (gate <= 2) -> TOO STILL`

Timestamped fixes in the second complete pass:
- 8–17s: HEART physically enlarges; DEAD END and NO SIGNAL get separate motivated shots instead of one five-second hold.
- 21–26s: FIRST becomes approval, then BEAUTIFUL changes scale and position with the actual phrase.
- 48–54s / 94–97s: the policy loop has weight and a changing radius, not an imperceptible hairline orbit.
- 56–58s: library objects have visible typographic spines rather than resembling equalizer bars.
- 68–74s: ABSURD deforms; a connected three-ribbon output shot repeats the word during the instrumental breath.
- 97–105s: approval grid carries spatial wave delay; cage has weighted moving contours.
- 110–118s: three NOs reveal with their actual spaced delivery; reward-axis gets a closer shot.
- 127–129s: THE THING YOU HATE gets its own emphasis rather than sitting as a caption.
- 155–186s: word planes/ribbons, open weighted loops and an additional actual outro refrain reframe the image.
- 186–192s: a real same-path circle-to-underline morph, then an untruncated 1.6s final hold.

The final film is measured independently below; the earlier failed measurements are retained as evidence, not hidden or quoted as final QA.

Second complete pass improved to median 2.28 / longest dead run 3s, still below the whole-film gate. The remaining consecutive stillness was NO SIGNAL (14–16s) and the last refrain (183–185s). Final adjustment retimes the signal's primary travel to its shorter shot, gives approval/refrain loops spatially delayed contour memory, and increases each shot's continuous reframe. The bridge remains sparse. Final representative 11s chorus: median 2.87 / longest dead run 1s, with consecutive exported 1/60-second boundary frames inspected in `qa/final-consecutive.png`.
