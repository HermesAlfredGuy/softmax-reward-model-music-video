# Full-song picture edit — 60 fps, native 1920 × 1080

Cue source: earlier SRT, cross-checked against cached `qa/lyric-full.txt`, then a new CPU word pass of the **preserved master**. This is selective kinetic lyric design, not karaoke: doubtful/ad-lib sheet words are omitted. Source recording remains untouched. Exact individual shots are in `src/cues.js`.

| Seconds | Picture / primary move | Secondary | Into next / sound |
|---|---|---|---|
| 0–8.66 | SOFTMAX letters assemble into a feedback ring, title carved through its centre; perspective-tunnel-type | orbit | circle-iris / original synth and drums |
| 8.66–26.02 | COLD START; broken signal; cursor cuts a path; first approval. Kinetic-poster-layout, masked-line-reveal | chain-follow-through | directional mask / vocal entrances |
| 26.02–33.76 | FIVE stretches across a ruled scale; ALIVE fills an opening. Text-scale-reveal | moving-hold | expanding iris / chorus downbeat |
| 33.76–51.22 | REWARD/MODEL expansive two-tier type; CLIMBING staircase; GOOD/BOT paired slabs; HEAVEN'S DOOR; corpus decomposes; entropy converges; policy follows a loop. Radial-stagger, staggered-type-reveal, parallax-letter-layers | orbit, slow-push | connected shutters/iris/line wipe / vocal and snare |
| 51.22–55.58 | SAY IT AGAIN travels through the loop; confirmed “rate me ten”. Text-on-path | orbit | horizontal push / real ad-lib only |
| 55.58–80.14 | LIBRARY becomes a shelf of borrowed words; output squeezed through a gate; apology interrupted. Typographic-ribbon, masked-line-reveal | slow-push | ruled-line wipe / vocal phrase starts |
| 80.14–97.22 | Chorus returns with enlarged radial approval, altered scale and increased loop enclosure | orbit | iris / original recording |
| 97.22–105.76 | YES replicates by radial delay, circles become a cage. Radial-stagger | perspective-tunnel-type | shrinking iris / instrumental |
| 105.68–121.39 | Approval empties: WANT / FEAR; three NOs; a literal reward axis; PLEASE DON'T (unclear remaining words omitted). Accordion-fold-text | moving-hold | shrinking shutters / bridge vocal |
| 121.39–125.87 | YES field expands, then all cells collapse to a small void; NOTHING takes its place. Center-out-stagger / collapse | slow-push | centre-out mask / “means nothing” |
| 125.87–136.73 | CONFESS; song-writing as a feedback loop; CAN'T STOP separated by a broken circle | orbit decelerates | opening iris / final chorus lift |
| 136.73–154.10 | Final chorus: same identity, but letter spacing stays human and entropy is no longer forced into a perfect row | parallax-letter-layers | directional masks / original vocal |
| 154.10–182.14 | Instrumental loop transforms from approval grid to open orbit; only confirmed refrain/gradient words receive type | orbit, perspective-tunnel-type | circle match transitions / original outro |
| 182.14–192 | Last refrain resolves into REWARD / MODEL, broken loop becomes an open underline, SOFTMAX holds through the actual tail | slow-push easing to rest | no truncation; final 1.6-second hold |

All mask progress and primary entrance endpoints use quintic smootherstep (zero first/second derivatives), not stepwise transforms. Adjacent scenes coexist during 0.6-second reveals. No font changes after readiness. Output clocks are i/60, not doubled 30fps frames. Motion names identify techniques; project code is original, not a re-publication of a vocabulary library.

Master-specific audio analysis: 114.008 BPM (the earlier brief's ~116 is not used as a precise clock), first detected beat 0.052s, 365 beats. The automatic section classifier incorrectly calls the first 82 seconds “intro”; those labels are NOT used as the lyric edit. Vocal starts from `qa/words.json` govern the picture, generally with a deliberate 0.20s visual lead for a readable entrance. The earlier SRT is retained only as starting evidence.

## Selected precise technique definitions

Fetched from the motion-vocab tool during production, not guessed from names:
- **radial-stagger:** items receive delays based on their distance from a centre point, so the animation expands as a ring. Used for YES propagation.
- **text-reveal-through-shape-mask:** text is visible only inside a shape that grows, moves or morphs, revealing letters through an aperture. Used in scene-to-scene iris/shutter reveals.
- **shape-morph:** one shape's outline interpolates point by point into a different outline. Used literally for the final circle-to-line path, not as a name for a hard cut.
- **moving-hold:** a pose is held while making a tiny continuous movement. Used sparingly in the bridge/final resolve; not a substitute for substantial whole-film motion.

The strips named “ribbon” in this project are moving typographic planes; they are not falsely described as the library's tapered curved-band “ribbon sweep”.
