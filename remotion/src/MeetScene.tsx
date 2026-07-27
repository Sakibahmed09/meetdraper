import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const SANS = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif";
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* The cold open, fast-forwarded: 41 minutes of meeting blitz past in three
   seconds. Timer spins, captions race, the call ends, and the cut lands on
   the text already waiting. The pace IS the hook. */
export const MEET_DURATION = 210; /* 3.5s @ 60fps */

/* words race in, fast-forward style */
const WORDS = [
  {at: 30, w: '…so'}, {at: 36, w: 'we'}, {at: 42, w: 'hire'}, {at: 48, w: 'slow'},
  {at: 62, w: 'on'}, {at: 68, w: 'purpose,'},
  {at: 84, w: 'that’s'}, {at: 90, w: 'the'}, {at: 96, w: 'whole'},
  {at: 110, w: 'point'}, {at: 116, w: 'of'}, {at: 122, w: 'it…'},
];

const Tile: React.FC<{img?: string; name: string; you?: boolean; talking?: boolean}> = ({img, name, you, talking}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 18,
      overflow: 'hidden',
      background: '#2a2d34',
      aspectRatio: '16/10.2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: talking ? 'inset 0 0 0 4px #7BA7F0' : undefined,
    }}
  >
    {img ? <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
    {you ? (
      <div style={{width: 84, height: 84, borderRadius: '50%', background: '#5C82C9', color: '#fff', fontSize: 36, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>S</div>
    ) : null}
    <span style={{position: 'absolute', left: 14, bottom: 10, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,.94)', textShadow: '0 1px 6px rgba(0,0,0,.55)'}}>{name}</span>
  </div>
);

export const MeetScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  /* slow push for life; the whole card drifts imperceptibly */
  const push = interpolate(frame, [0, MEET_DURATION], [1, 1.045], {...clamp, easing: Easing.bezier(0.3, 0, 0.7, 1)});

  const talking = frame >= 24 && frame < 150;

  /* the call wraps: tiles dim under the ended chip, then the cut */
  const endedP = frame < 156 ? 0 : Math.min(1, spring({frame: frame - 156, fps, config: {damping: 15, stiffness: 130}}));

  /* the timer spins ~12x: the visual tell that we're fast-forwarding */
  const secs = 41 * 60 + 12 + Math.floor(Math.min(frame, 156) / 5);
  const timer = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  /* dissolve out: the card breathes down into cream just before the cut */
  const out = interpolate(frame, [192, 210], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.8, 1)});

  return (
    <AbsoluteFill style={{background: '#FCFBF9', fontFamily: SANS, alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          width: 1180,
          borderRadius: 34,
          overflow: 'hidden',
          background: '#1d1f24',
          boxShadow: '0 4px 12px rgba(30,30,25,0.05), 0 28px 80px rgba(30,30,25,0.14)',
          padding: '26px 26px 0',
          transform: `scale(${push * (1 - 0.012 * endedP)})`,
          opacity: 1 - out,
        }}
      >
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, opacity: 1 - 0.72 * endedP, filter: endedP > 0.01 ? `saturate(${1 - 0.6 * endedP})` : undefined}}>
          <Tile img="meet-ronnie.jpg" name="Ronnie" />
          <Tile img="meet-lena.jpg" name="Lena" />
          <Tile img="meet-theo.jpg" name="Theo" />
          <Tile name="You" you talking={talking && endedP === 0} />
        </div>

        <div style={{margin: '20px 6px 0', minHeight: 56, display: 'flex', gap: 14, alignItems: 'baseline', opacity: 1 - 0.72 * endedP}}>
          <span style={{fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: '.05em'}}>YOU</span>
          <span style={{fontSize: 21, fontStyle: 'italic', lineHeight: 1.4, color: 'rgba(255,255,255,.88)'}}>
            {WORDS.map((wd, i) => {
              const p = interpolate(frame, [wd.at, wd.at + 6], [0, 1], {...clamp, easing: Easing.bezier(0.23, 1, 0.32, 1)});
              return (
                <span key={i} style={{opacity: p, display: 'inline-block', transform: `translateY(${3 * (1 - p)}px)`, whiteSpace: 'pre'}}>
                  {(i ? ' ' : '') + wd.w}
                </span>
              );
            })}
          </span>
        </div>

        <div style={{height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative', opacity: 1 - 0.72 * endedP}}>
          <span style={{position: 'absolute', left: 6, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,.42)', fontVariantNumeric: 'tabular-nums'}}>{timer}</span>
          <span style={{width: 52, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.13)'}} />
          <span style={{width: 66, height: 38, borderRadius: 19, background: '#D0463C'}} />
        </div>

        {/* meeting ended */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * endedP})`,
            opacity: endedP,
            fontSize: 22,
            fontWeight: 600,
            color: 'rgba(255,255,255,.94)',
            background: 'rgba(255,255,255,.15)',
            padding: '13px 26px',
            borderRadius: 999,
            backdropFilter: 'blur(6px)',
          }}
        >
          Meeting ended
        </div>
      </div>
    </AbsoluteFill>
  );
};
