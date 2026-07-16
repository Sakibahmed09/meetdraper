import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {noise2D} from '@remotion/noise';
import {measureText} from '@remotion/layout-utils';
import {CameraMotionBlur} from '@remotion/motion-blur';
/* Apple system stack: the chat and feed are native UI, so they render in the
   platform's own face (SF Pro on the Mac that renders this comp), not our web font */
const SANS = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif";

/* ============================================================
   A WEEK WITH DRAPER — five chapters, one looping week.
   Mon: the ear · Mon: the craft · Tue: the outcome ·
   Wed: the veto · Fri: the relay. The loop is the promise.
   ============================================================ */

export const HERO_DURATION = 3300; /* 55s @ 60fps */
export const MOBILE_DURATION = 1680; /* 28s @ 60fps, portrait cut */

/* ---------- palette ---------- */
const BG = '#FCFBF9';
const GREY = '#E9E9EB';
const BLUE = '#0A84FF';
const LI_BLUE = '#3E7BC6';
const MUTED = 'rgba(20,22,28,0.45)';

const easePage = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/* ============================================================
   SCRIPT — every Draper line at doc-register: lowercase,
   fragments, one thought per bubble, numbers as compliments.
   ============================================================ */
type Msg =
  | {kind: 'in'; at: number; text: React.ReactNode; plain?: string; w?: number; typingFor?: number}
  | {kind: 'out'; at: number; text: string; big?: boolean; reactAt?: number}
  | {kind: 'draft'; at: number; revAt?: number}
  | {kind: 'vn'; at: number; dur: string; transcript: string; playFrom: number; playTo: number; w?: number}
  | {kind: 'photo'; at: number; src: string; w?: number};

type Scene = {stamp: string; enter: number; msgs: Msg[]};

const SCENES_FULL: Scene[] = [
  {
    stamp: 'Monday 14:47',
    enter: 260,
    msgs: [
      {kind: 'in', at: 322, typingFor: 36, w: 540, plain: 'heard on your 2pm: "we hire slow on purpose"', text: (<>heard on your 2pm: <U>&ldquo;we hire slow on purpose&rdquo;</U></>)},
      {kind: 'in', at: 414, typingFor: 30, w: 520, text: <>founder arc. contrarian, costs you something to say</>},
      {kind: 'in', at: 484, typingFor: 20, text: <>draft it?</>},
      {kind: 'out', at: 544, text: 'go'},
    ],
  },
  {
    stamp: 'Monday 15:12',
    enter: 600,
    msgs: [
      {kind: 'draft', at: 668, revAt: 872},
      {kind: 'out', at: 800, text: 'less motivational poster'},
      {kind: 'in', at: 960, typingFor: 30, text: <>fair. queued for tuesday 9am, best slot left</>},
    ],
  },
  {
    stamp: 'Tuesday 12:40',
    enter: 1030,
    msgs: [
      {kind: 'in', at: 1094, typingFor: 28, w: 440, text: <>live as of 9. it&rsquo;s doing numbers</>},
      /* camera visits the feed here: 1150 → 1625 */
      {kind: 'in', at: 1665, typingFor: 40, w: 555, text: <>40 comments before lunch, three from investors. sandra from meridian&rsquo;s in the thread</>},
      {kind: 'out', at: 1785, text: 'draft the dm'},
      {kind: 'in', at: 1848, typingFor: 24, w: 530, text: <>drafted. try to sound surprised when she replies</>},
    ],
  },
  {
    stamp: 'Wednesday 09:15',
    enter: 1915,
    msgs: [
      {kind: 'in', at: 1980, typingFor: 34, w: 500, text: <>quiet calendar this week, backlog&rsquo;s thin. founder arc needs one</>},
      {kind: 'in', at: 2075, typingFor: 44, w: 555, text: <>so i&rsquo;ll pull one out of you. what did you believe about hiring when you started that you don&rsquo;t now?</>},
      {kind: 'vn', at: 2190, dur: '0:52', playFrom: 2190, playTo: 2285, transcript: 'we thought speed was everything. rushed one and it nearly took the wheels off'},
      {kind: 'in', at: 2330, typingFor: 32, w: 540, text: <>there it is. belief, the cost, what changed. done asking</>},
    ],
  },
  {
    stamp: 'Thursday 17:20',
    enter: 2415,
    msgs: [
      {kind: 'in', at: 2475, typingFor: 28, text: <>heads up. skipping tomorrow&rsquo;s slot</>},
      {kind: 'in', at: 2570, typingFor: 36, w: 520, text: <>nothing in the backlog earns it. fine doesn&rsquo;t get posted</>},
      {kind: 'out', at: 2700, text: 'ok fair', reactAt: 2752},
    ],
  },
  {
    stamp: 'Friday 09:30',
    enter: 2805,
    msgs: [
      {kind: 'in', at: 2862, typingFor: 28, text: <>builder arc&rsquo;s gone quiet this week</>},
      {kind: 'in', at: 2950, typingFor: 42, w: 545, text: <>i&rsquo;d run your take on ai pricing. sharpest thing you said all week and nobody&rsquo;s heard it</>},
      {kind: 'in', at: 3048, typingFor: 30, w: 510, text: <>monday 9am, approving unless you say otherwise</>},
      {kind: 'out', at: 3105, text: '👍', big: true},
    ],
  },
];


const SCENES_MOBILE: Scene[] = [
  /* the desktop week, cut for the hand: hear → craft → extract → veto.
     same beats, half the dwell */
  {
    stamp: 'Monday 14:47',
    enter: 230,
    msgs: [
      {kind: 'in', at: 282, typingFor: 28, w: 540, plain: 'heard on your 2pm: "we hire slow on purpose"', text: (<>heard on your 2pm: <U>&ldquo;we hire slow on purpose&rdquo;</U></>)},
      {kind: 'in', at: 384, typingFor: 20, text: <>draft it?</>},
      {kind: 'out', at: 448, text: 'go'},
    ],
  },
  {
    stamp: 'Monday 15:12',
    enter: 520,
    msgs: [
      {kind: 'draft', at: 580, revAt: 790},
      {kind: 'out', at: 706, text: 'make it spikier'},
      {kind: 'in', at: 878, typingFor: 26, text: <>queued for tuesday 9am</>},
    ],
  },
  {
    stamp: 'Wednesday 09:15',
    enter: 960,
    msgs: [
      {kind: 'in', at: 1012, typingFor: 28, w: 500, text: <>quiet week. i&rsquo;ll pull one out of you</>},
      {kind: 'vn', at: 1090, dur: '0:41', playFrom: 1090, playTo: 1206, transcript: 'we thought speed was everything, then we rushed a hire and it nearly cost us'},
      {kind: 'in', at: 1252, typingFor: 26, text: <>that&rsquo;s the post. done asking</>},
    ],
  },
  {
    stamp: 'Thursday 17:20',
    enter: 1330,
    msgs: [
      {kind: 'in', at: 1382, typingFor: 26, text: <>heads up. skipping tomorrow&rsquo;s slot</>},
      {kind: 'in', at: 1458, typingFor: 34, w: 520, text: <>nothing in the backlog earns it. fine doesn&rsquo;t get posted</>},
      {kind: 'out', at: 1560, text: 'ok fair', reactAt: 1606},
    ],
  },
];

export const LAUNCH_DURATION = 2606; /* 38s @ 60fps, the standalone launch cut */

/* the launch cut: the meeting cold-open carries the quote, so the film opens
   on the text already waiting. five beats, nothing repeated, no jargon */
const SCENES_LAUNCH: Scene[] = [
  {
    stamp: 'Monday 14:47',
    enter: 0,
    msgs: [
      {kind: 'in', at: 12, typingFor: 0, w: 540, plain: 'heard on your 2pm: "we hire slow on purpose"', text: (<>heard on your 2pm: <U>&ldquo;we hire slow on purpose&rdquo;</U></>)},
      {kind: 'in', at: 96, typingFor: 16, text: <>draft it?</>},
      {kind: 'out', at: 168, text: 'go'},
    ],
  },
  {
    stamp: 'Monday 15:12',
    enter: 240,
    msgs: [
      {kind: 'draft', at: 300, revAt: 480},
      {kind: 'out', at: 415, text: 'less motivational poster'},
      {kind: 'in', at: 570, typingFor: 24, text: <>fair. queued for tuesday 9am, best slot left</>},
      {kind: 'photo', at: 660, src: 'event-snap.jpg', w: 330},
      {kind: 'in', at: 742, typingFor: 22, w: 460, text: <>keeper. thursday&rsquo;s post, photo leads</>},
    ],
  },
  {
    stamp: 'Tuesday 12:40',
    enter: 870,
    msgs: [
      {kind: 'in', at: 928, typingFor: 26, w: 440, text: <>live as of 9. it&rsquo;s doing numbers</>},
      /* camera visits the feed here: 987 -> 1522, and the numbers speak */
    ],
  },
  {
    stamp: 'Wednesday 09:15',
    enter: 1560,
    msgs: [
      {kind: 'in', at: 1614, typingFor: 24, w: 500, text: <>quiet week. i&rsquo;ll pull one out of you</>},
      {kind: 'in', at: 1692, typingFor: 34, w: 555, text: <>what did you believe about hiring when you started that you don&rsquo;t now?</>},
      {kind: 'vn', at: 1809, dur: '0:52', playFrom: 1809, playTo: 1929, transcript: 'we thought speed was everything. rushed one and it nearly took the wheels off'},
      {kind: 'in', at: 1980, typingFor: 28, w: 520, text: <>that&rsquo;s the safe version. took the wheels off how?</>},
      {kind: 'out', at: 2092, text: 'nearly lost our biggest account'},
      {kind: 'in', at: 2180, typingFor: 26, w: 520, text: <>there&rsquo;s the post. the account, not the lesson</>},
    ],
  },
  {
    stamp: 'Thursday 17:20',
    enter: 2262,
    msgs: [
      {kind: 'in', at: 2314, typingFor: 22, text: <>heads up. skipping tomorrow&rsquo;s slot</>},
      {kind: 'in', at: 2392, typingFor: 32, w: 520, text: <>nothing in the backlog earns it. fine doesn&rsquo;t get posted</>},
      {kind: 'out', at: 2504, text: 'ok fair', reactAt: 2548},
    ],
  },
];

/* underline data-detector */
function U({children}: {children: React.ReactNode}) {
  return <span style={{borderBottom: '2.5px solid rgba(17,17,17,0.5)', paddingBottom: 1}}>{children}</span>;
}

/* ---------- text measurement (memoized) ---------- */
/* this remotion version's measureText is single-line only (no maxWidth),
   so wrap ourselves: measure word widths, pack lines greedily. The break
   width is slightly conservative — a rare extra line means extra gap,
   never an overlap. */
const wordMemo = new Map<string, number>();
const wordW = (word: string, fontSize: number, fontStyle?: string) => {
  const key = `${word}|${fontSize}|${fontStyle ?? ''}`;
  const hit = wordMemo.get(key);
  if (hit !== undefined) return hit;
  const m = measureText({
    text: word,
    fontFamily: SANS,
    fontSize,
    fontWeight: '500',
    validateFontIsLoaded: false,
    additionalStyles: fontStyle ? {fontStyle} : undefined,
  });
  wordMemo.set(key, m.width);
  return m.width;
};
const measureCached = (text: string, fontSize: number, maxWidth: number, lineHeight: number, fontStyle?: string) => {
  const usable = maxWidth - 4;
  const space = wordW(' ', fontSize, fontStyle);
  let lines = 1;
  let lineW = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const w = wordW(word, fontSize, fontStyle);
    if (lineW === 0) {
      lineW = w;
    } else if (lineW + space + w <= usable) {
      lineW += space + w;
    } else {
      lines += 1;
      lineW = w;
    }
  }
  return Math.round(lines * fontSize * lineHeight);
};

/* ---------- physics ---------- */
/* rack-focus arrival: elements exist before the camera "reaches" them —
   soft, nearly full-size, out of focus; blur resolves just ahead of the settle */
const pop = (frame: number, at: number, fps: number, mass = 0.9, damping = 14): React.CSSProperties =>
  frame < at
    ? {opacity: 0, transform: 'scale(0.8) translateY(14px)', filter: 'blur(7px)'}
    : (() => {
        const s = spring({frame: frame - at, fps, config: {damping, stiffness: 130, mass}});
        const focus = Math.min(1, s * 1.18);
        return {
          opacity: Math.min(1, s * 1.45),
          transform: `scale(${0.8 + 0.2 * s}) translateY(${14 * (1 - s)}px)`,
          filter: focus >= 1 ? undefined : `blur(${((1 - focus) * 7).toFixed(2)}px)`,
        };
      })();

const rise = (frame: number, at: number, fps: number) =>
  frame < at ? 0 : spring({frame: frame - at, fps, config: {damping: 17, stiffness: 140, mass: 0.95}});

/* ---------- svg ---------- */
const Verified: React.FC<{size?: number}> = ({size = 30}) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" style={{flex: 'none'}}>
    <path
      d="M11 1.5l2.2 1.9 2.9-.4 1 2.7 2.7 1-.4 2.9 1.9 2.2-1.9 2.2.4 2.9-2.7 1-1 2.7-2.9-.4L11 22l-2.2-1.9-2.9.4-1-2.7-2.7-1 .4-2.9L.7 11.7 2.6 9.5l-.4-2.9 2.7-1 1-2.7 2.9.4L11 1.5z"
      fill="#9C9C9C"
      transform="scale(.95) translate(.5 -1)"
    />
    <path d="M7.5 11.2l2.3 2.3 4.7-4.7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BackChevron: React.FC = () => (
  <svg width={16} height={26} viewBox="0 0 11 18" fill="none">
    <path d="M9.5 1.5L2 9l7.5 7.5" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Mic: React.FC = () => (
  <svg width={16} height={22} viewBox="0 0 12 16" fill="rgba(20,22,28,0.45)">
    <rect x="3.5" y="1" width="5" height="9" rx="2.5" />
    <path d="M1 8a5 5 0 0 0 10 0M6 13v2.5" stroke="rgba(20,22,28,0.45)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
);

/* ---------- chat pieces ---------- */
const Bubble: React.FC<{
  side: 'in' | 'out';
  bottom: number;
  anim: React.CSSProperties;
  w?: number;
  big?: boolean;
  react?: number; /* 0..1+ spring progress of a tapback from the other side */
  children: React.ReactNode;
}> = ({side, bottom, anim, w, big, react = 0, children}) => (
  <div
    style={{
      position: 'absolute',
      bottom,
      [side === 'in' ? 'left' : 'right']: 0,
      boxSizing: 'border-box',
      maxWidth: w ?? 560,
      padding: big ? '10px 16px' : '16px 22px',
      borderRadius: 30,
      [side === 'in' ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: 8,
      background: big ? 'transparent' : side === 'in' ? GREY : BLUE,
      color: side === 'in' ? '#111' : '#fff',
      fontSize: big ? 54 : 24,
      lineHeight: big ? 1.1 : 1.35,
      fontWeight: 500,
      transformOrigin: side === 'in' ? 'bottom left' : 'bottom right',
      ...anim,
    }}
  >
    {children}
    {react > 0 ? (
      /* incoming reaction balloon: overlaps the corner nearest the reactor */
      <div
        style={{
          position: 'absolute',
          top: -30,
          [side === 'out' ? 'left' : 'right']: -18,
          transform: `scale(${Math.min(1.6, react)})`,
          transformOrigin: side === 'out' ? 'bottom right' : 'bottom left',
          opacity: Math.min(1, react * 1.6),
          background: GREY,
          border: '3px solid #fff',
          borderRadius: 999,
          padding: '7px 12px 8px',
          fontSize: 25,
          lineHeight: 1,
          boxShadow: '0 3px 10px rgba(0,0,0,0.10)',
          zIndex: 2,
        }}
      >
        ❤️
        <div style={{position: 'absolute', bottom: -4, [side === 'out' ? 'right' : 'left']: -2, width: 12, height: 12, borderRadius: '50%', background: GREY, border: '2.5px solid #fff'}} />
        <div style={{position: 'absolute', bottom: -12, [side === 'out' ? 'right' : 'left']: -9, width: 6, height: 6, borderRadius: '50%', background: GREY, border: '2px solid #fff'}} />
      </div>
    ) : null}
  </div>
);

const TypingDots: React.FC<{frame: number; from: number; until: number; bottom: number; fps: number}> = ({
  frame,
  from,
  until,
  bottom,
  fps,
}) => {
  if (frame < from || frame > until + 5) return null;
  const s = spring({frame: frame - from, fps, config: {damping: 14, stiffness: 160}});
  const fadeOut = interpolate(frame, [until, until + 5], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        width: 96,
        height: 58,
        borderRadius: 30,
        borderBottomLeftRadius: 8,
        background: GREY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: Math.min(s, fadeOut),
        transform: `scale(${0.72 + 0.28 * s})`,
        transformOrigin: 'bottom left',
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: 'rgba(20,22,28,0.4)',
            opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.14 - i * 0.9)),
          }}
        />
      ))}
    </div>
  );
};

/* the draft card: real copy, morphs to the spikier cut in place */
const DraftCard: React.FC<{frame: number; at: number; revAt?: number; bottom: number; fps: number}> = ({
  frame,
  at,
  revAt,
  bottom,
  fps,
}) => {
  const entry = pop(frame, at, fps, 1.05, 16);
  const rev = revAt && frame >= revAt ? spring({frame: frame - revAt, fps, config: {damping: 13, stiffness: 150}}) : revAt ? 0 : 1;
  /* squeeze reaction on revision */
  const squeeze = revAt && frame >= revAt ? 1 - 0.03 * Math.sin(Math.min(1, (frame - revAt) / 18) * Math.PI) : 1;
  const v1o = 1 - rev;
  const Line: React.FC<{s: React.CSSProperties; children: React.ReactNode}> = ({s, children}) => (
    <div style={{position: 'absolute', left: 0, right: 0, ...s}}>{children}</div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        width: 470,
        background: '#fff',
        borderRadius: 24,
        borderBottomLeftRadius: 8,
        padding: '20px 22px 18px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.09), 0 16px 38px rgba(0,0,0,0.08)',
        transformOrigin: 'bottom left',
        ...entry,
        transform: `${(entry.transform as string) || ''} scale(${squeeze})`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: LI_BLUE,
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          in
        </div>
        <span style={{fontSize: 15, fontWeight: 500, color: MUTED}}>Draft</span>
        {revAt ? (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 13,
              fontWeight: 600,
              color: LI_BLUE,
              opacity: rev,
              transform: `translateY(${4 * (1 - rev)}px)`,
            }}
          >
            v2
          </span>
        ) : null}
      </div>
      <div style={{position: 'relative', height: 96, fontSize: 20.5, lineHeight: 1.42, color: '#26262a', fontWeight: 500}}>
        <Line s={{opacity: v1o, transform: `translateY(${-5 * rev}px)`}}>
          We fired our fastest hire and promoted our slowest one.
          <span style={{color: 'rgba(38,38,42,0.4)'}}> Eighteen months ago I made the hire everyone told me to…</span>
        </Line>
        <Line s={{opacity: rev, transform: `translateY(${5 * (1 - rev)}px)`}}>
          The best hire I ever made looked like the worst one on paper.
          <span style={{color: 'rgba(38,38,42,0.4)'}}> And the worst one looked perfect…</span>
        </Line>
      </div>
    </div>
  );
};

/* founder voice note: waveform fills as it plays, transcript fades in under it */
const VoiceNote: React.FC<{
  frame: number;
  at: number;
  dur: string;
  transcript: string;
  playFrom: number;
  playTo: number;
  bottom: number;
  w: number;
  fps: number;
}> = ({frame, at, dur, transcript, playFrom, playTo, bottom, w, fps}) => {
  const entry = pop(frame, at, fps, 0.85, 13);
  const prog = frame < playFrom ? 0 : frame > playTo ? 1 : (frame - playFrom) / (playTo - playFrom);
  /* speech-shaped waveform: syllable bursts over a noise floor, so tall
     clusters, short runs and near-silent dots land like a real recording */
  const N = 46;
  const bars = Array.from({length: N}, (_, i) => {
    const fast = Math.abs(noise2D('vn-fast', i * 0.61, 7.3));
    const burst = Math.max(0, noise2D('vn-burst', i * 0.16, 2.1)) ** 0.7;
    return 3.5 + 20 * Math.min(1, fast * (0.25 + burst * 1.35));
  });
  return (
    <div style={{position: 'absolute', bottom, right: 0, width: w, transformOrigin: 'bottom right', ...entry}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, background: BLUE, borderRadius: 30, borderBottomRightRadius: 8, padding: '14px 18px'}}>
        <div style={{width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
          <div style={{width: 0, height: 0, marginLeft: 3, borderLeft: '9px solid #fff', borderTop: '6px solid transparent', borderBottom: '6px solid transparent'}} />
        </div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 2, flex: 1, height: 26, paddingBottom: 1}}>
          {bars.map((h, i) => (
            <div key={i} style={{flex: 1, height: h, alignSelf: 'center', borderRadius: 99, background: i / N <= prog ? '#fff' : 'rgba(255,255,255,0.42)'}} />
          ))}
        </div>
        <span style={{fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>{dur}</span>
      </div>
      <div style={{marginTop: 8, fontSize: 16, fontStyle: 'italic', color: MUTED, textAlign: 'right', lineHeight: 1.4, opacity: interpolate(frame, [at + 10, at + 30], [0, 1], clamp)}}>
        &ldquo;{transcript}&rdquo;
      </div>
    </div>
  );
};

/* chapter mark: day stamp with an expanding hairline */
const Stamp: React.FC<{frame: number; at: number; text: string; fps: number}> = ({frame, at, text, fps}) => {
  const s = frame < at ? 0 : spring({frame: frame - at, fps, config: {damping: 16, stiffness: 120}});
  return (
    <div style={{position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', alignItems: 'center', gap: 16, opacity: s, filter: s < 0.98 ? `blur(${((1 - s) * 4).toFixed(2)}px)` : undefined}}>
      <div style={{flex: 1, height: 1, background: 'rgba(20,22,28,0.10)', transform: `scaleX(${s})`, transformOrigin: 'right'}} />
      <span style={{fontSize: 17, fontWeight: 600, color: 'rgba(20,22,28,0.38)', letterSpacing: '0.04em', whiteSpace: 'nowrap'}}>
        {text}
      </span>
      <div style={{flex: 1, height: 1, background: 'rgba(20,22,28,0.10)', transform: `scaleX(${s})`, transformOrigin: 'left'}} />
    </div>
  );
};

/* ---------- contact faces ---------- */
const ContactFace: React.FC<{opacity: number; scale: number}> = ({opacity, scale}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 96,
      opacity,
      transform: `scale(${scale})`,
      filter: opacity < 0.99 ? `blur(${(1 - opacity) * 3}px)` : undefined,
    }}
  >
    <div style={{width: 160, height: 160, borderRadius: 40, overflow: 'hidden', boxShadow: '0 12px 34px rgba(20,20,40,0.24)'}}>
      <Img src={staticFile('app-icon.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 12, fontSize: 40, fontWeight: 600, color: '#26262a'}}>
      Draper <Verified size={34} />
    </div>
    <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16, width: '64%'}}>
      <div style={{height: 52, borderRadius: 18, background: 'rgba(20,22,28,0.045)'}} />
      <div style={{height: 52, width: '72%', borderRadius: 18, background: 'rgba(20,22,28,0.045)'}} />
    </div>
  </div>
);

/* ---------- the outcome surface: a feed card where the post performs ----------
   Sits to the right of the chat. Blurred neighbour for most of the film;
   the camera pans over on Tuesday and the numbers climb while we watch. */
const tick = (frame: number, from: number, to: number, a: number, b: number) => {
  const p = interpolate(frame, [from, to], [0, 1], {...clamp, easing: Easing.bezier(0.3, 0.6, 0.3, 1)});
  return Math.round(a + (b - a) * p);
};

const FeedCard: React.FC<{x: number; y: number; w: number; frame: number; fps: number; drift: number; blur: number; opacity: number}> = ({
  x,
  y,
  w,
  frame,
  fps,
  drift,
  blur,
  opacity,
}) => {
  const comments = tick(frame, 1240, 1560, 4, 41);
  const impressions = tick(frame, 1240, 1560, 1204, 12408);
  const others = tick(frame, 1240, 1560, 9, 173);
  const rx = [1236, 1254, 1272]; /* reaction pops, staggered */
  const c1 = pop(frame, 1330, fps, 0.85, 13); /* first comment */
  const c2 = pop(frame, 1420, fps, 0.85, 13); /* sandra */
  const ring = frame < 1450 ? 0 : Math.min(1, spring({frame: frame - 1450, fps, config: {damping: 14, stiffness: 120}}));
  const Row: React.FC<{s?: React.CSSProperties; children: React.ReactNode}> = ({s, children}) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, ...s}}>{children}</div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + drift,
        width: w,
        height: 556,
        borderRadius: 48,
        background: 'linear-gradient(180deg,#ffffff 0%,#f8f7f5 100%)',
        boxShadow: '0 24px 70px rgba(30,30,25,0.12)',
        filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : undefined,
        opacity,
        overflow: 'hidden',
        padding: '30px 34px',
      }}
    >
      {/* the post */}
      <div style={{background: '#fff', border: '1px solid rgba(20,22,28,0.08)', borderRadius: 22, padding: '22px 24px 16px', boxShadow: '0 2px 8px rgba(20,22,28,0.04)'}}>
        <Row>
          <div style={{width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', flex: 'none'}}>
            <Img src={staticFile('sakib-profile.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{lineHeight: 1.25}}>
            <div style={{fontSize: 19, fontWeight: 600, color: '#191b20'}}>Sakib Ahmed</div>
            <div style={{fontSize: 14.5, color: MUTED}}>Co-founder, Draper · 3h · 🌐</div>
          </div>
        </Row>
        <div style={{marginTop: 14, fontSize: 19.5, lineHeight: 1.42, color: '#26262a', fontWeight: 500}}>
          The best hire I ever made looked like the worst one on paper.
          <span style={{color: 'rgba(38,38,42,0.45)'}}> And the worst one looked perfect. Eighteen months ago…</span>
          <span style={{color: MUTED, fontWeight: 600}}> see more</span>
        </div>
        <div style={{marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(20,22,28,0.07)', display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{display: 'flex'}}>
            {['👍', '❤️', '💡'].map((e, i) => (
              <div
                key={e}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: ['#DCE9FF', '#FFE1E1', '#FFF3D1'][i],
                  border: '2.5px solid #fff',
                  marginLeft: i ? -9 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  ...pop(frame, rx[i], fps, 0.7, 10),
                }}
              >
                {e}
              </div>
            ))}
          </div>
          <span style={{fontSize: 14.5, fontWeight: 500, color: MUTED}}>
            Ibrahim Khan and {others} others
          </span>
          <span style={{marginLeft: 'auto', fontSize: 14.5, fontWeight: 500, color: MUTED}}>{comments} comments</span>
        </div>
      </div>

      {/* impressions strip */}
      <div style={{marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px'}}>
        <span style={{fontSize: 15, fontWeight: 600, color: 'rgba(20,22,28,0.6)'}}>
          {impressions.toLocaleString('en-GB')} impressions
        </span>
      </div>

      {/* comments */}
      <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{background: '#fff', borderRadius: 18, padding: '13px 16px', border: '1px solid rgba(20,22,28,0.07)', display: 'flex', gap: 11, ...c1}}>
          <div style={{width: 36, height: 36, borderRadius: '50%', flex: 'none', overflow: 'hidden'}}>
            <Img src={staticFile('ammar-avatar.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div>
            <span style={{fontSize: 15, fontWeight: 600, color: '#22242a'}}>Ammar Khan</span>
            <span style={{fontSize: 13.5, color: MUTED}}> · Sahl AI</span>
            <div style={{fontSize: 15.5, color: '#33353c', marginTop: 3}}>this one hurt. in a useful way</div>
          </div>
        </div>
        <div
          style={{
            background: '#fff',
            borderRadius: 18,
            padding: '13px 16px',
            border: '1px solid rgba(20,22,28,0.07)',
            boxShadow: ring ? `0 0 0 ${(2.5 * ring).toFixed(1)}px rgba(62,123,198,${0.45 * ring})` : undefined,
            ...c2,
          }}
        >
          <div style={{display: 'flex', gap: 11}}>
            <div style={{width: 36, height: 36, borderRadius: '50%', flex: 'none', overflow: 'hidden'}}>
              <Img src={staticFile('sandra-avatar.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div>
              <span style={{fontSize: 15, fontWeight: 600, color: '#22242a'}}>Sandra Whitfield</span>
              <span style={{fontSize: 13.5, color: MUTED}}> · Partner, Meridian</span>
              <div style={{fontSize: 15.5, color: '#33353c', marginTop: 3}}>we should talk. DMing you</div>
            </div>
          </div>
        </div>
        {/* the thread continues below the fold */}
        <div style={{background: 'rgba(255,255,255,0.6)', borderRadius: 18, padding: '13px 16px', border: '1px solid rgba(20,22,28,0.05)', opacity: 0.55, ...pop(frame, 1470, fps, 0.85, 13)}}>
          <div style={{width: 150, height: 12, borderRadius: 6, background: 'rgba(20,22,28,0.10)'}} />
          <div style={{width: 260, height: 12, borderRadius: 6, background: 'rgba(20,22,28,0.07)', marginTop: 8}} />
        </div>
      </div>
    </div>
  );
};

const SideCard: React.FC<{x: number; y: number; w: number; img: string; name: string; drift: number; blur: number; opacity?: number}> = ({
  x,
  y,
  w,
  img,
  name,
  drift,
  blur,
  opacity = 0.55,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y + drift,
      width: w,
      height: 556,
      borderRadius: 48,
      background: 'linear-gradient(180deg,#ffffff 0%,#f7f6f3 100%)',
      boxShadow: '0 24px 70px rgba(30,30,25,0.12)',
      filter: `blur(${blur}px)`,
      opacity,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 96,
    }}
  >
    <div style={{width: 160, height: 160, borderRadius: '50%', overflow: 'hidden'}}>
      <Img src={img} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <div style={{marginTop: 26, fontSize: 40, fontWeight: 600, color: 'rgba(38,38,42,0.6)'}}>{name}</div>
  </div>
);

/* ============================================================
   camera rig: keyframed scale/x/y track, evaluated per frame.
   ease-in-out per segment = zero velocity at every keyframe, so
   consecutive moves chain without a visible velocity jump.
   ============================================================ */
type CamKey = {f: number; s: number; y: number; x?: number};
const easeCam = Easing.bezier(0.45, 0, 0.22, 1);
const camAt = (keys: CamKey[], f: number) => {
  if (f <= keys[0].f) return {s: keys[0].s, y: keys[0].y, x: keys[0].x ?? 0};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f >= a.f && f <= b.f) {
      const p = easeCam((f - a.f) / Math.max(1, b.f - a.f));
      return {
        s: a.s + (b.s - a.s) * p,
        y: a.y + (b.y - a.y) * p,
        x: (a.x ?? 0) + ((b.x ?? 0) - (a.x ?? 0)) * p,
      };
    }
  }
  const last = keys[keys.length - 1];
  return {s: last.s, y: last.y, x: last.x ?? 0};
};

/* ============================================================
   THE FILM
   ============================================================ */
/* print pipeline: true multi-sample motion blur — every output frame is four
   sub-frame exposures of the whole scene, so camera moves and element motion
   smear like a filmed shutter, not a post blur */
export const Hero: React.FC<{mobile?: boolean; launch?: boolean}> = ({mobile = false, launch = false}) => (
  <CameraMotionBlur shutterAngle={200} samples={4}>
    <HeroInner mobile={mobile} launch={launch} />
  </CameraMotionBlur>
);

const HeroInner: React.FC<{mobile?: boolean; launch?: boolean}> = ({mobile = false, launch = false}) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const DUR = launch ? LAUNCH_DURATION : mobile ? MOBILE_DURATION : HERO_DURATION;
  const SCENES = launch ? SCENES_LAUNCH : mobile ? SCENES_MOBILE : SCENES_FULL;

  /* layout: desktop = landscape card; mobile = phone-proportioned portrait card */
  const cardW = mobile ? 820 : 780;
  const cardH = mobile ? 1180 : 586;
  const cardX = (W - cardW) / 2;
  const cardY = mobile ? (H - cardH) / 2 - 12 : 252;
  const zoomT = mobile ? (W * 0.94) / cardW : 1.78;
  const originX = W / 2;
  const originY = cardY + cardH / 2;

  /* organic drift: seeded noise, loop-blended over the final 150 frames */
  const driftOf = (f: number) => ({
    x: noise2D('draper-x', f * 0.0021, 0) * 4,
    y: noise2D('draper-y', 0, f * 0.0017) * 5,
  });
  const blendW = interpolate(frame, [DUR - 150, DUR], [0, 1], clamp);
  const dNow = driftOf(frame);
  const dLoop = driftOf(frame - DUR);
  const drift = {
    x: dNow.x * (1 - blendW) + dLoop.x * blendW,
    y: dNow.y * (1 - blendW) + dLoop.y * blendW,
  };

  /* camera track — the breathing grammar:
     pull to a valley at every chapter boundary (re-establish), push into the
     new chapter, and rack in DEEP on the hero beats: the draft reveal, both
     voice notes, and — tightest of the film — the veto. */
  const CAM_LAUNCH: CamKey[] = [
    /* opens already inside the thread: the text was waiting before we arrived */
    {f: 0, s: 1.66, y: -8},
    {f: 70, s: 1.78, y: -12} /* push as "draft it?" types */,
    {f: 190, s: 1.815, y: -14} /* creep on "go" */,
    {f: 240, s: 1.6, y: -6} /* valley: the craft */,
    {f: 315, s: 1.78, y: -12},
    {f: 465, s: 1.9, y: -17} /* rack: v2 reveal */,
    {f: 545, s: 1.9, y: -17},
    {f: 610, s: 1.72, y: -11},
    {f: 655, s: 1.82, y: -14} /* creep: the photo drops in */,
    {f: 758, s: 1.82, y: -14},
    {f: 827, s: 1.58, y: -6} /* valley: the outcome */,
    {f: 887, s: 1.72, y: -10},
    {f: 987, s: 1.34, y: -6, x: -900} /* pan: over to the feed */,
    {f: 1462, s: 1.4, y: -8, x: -900} /* slow push while the numbers climb */,
    {f: 1522, s: 1.72, y: -10, x: 0} /* pan home */,
    {f: 1562, s: 1.56, y: -4} /* valley: the extraction */,
    {f: 1626, s: 1.74, y: -10},
    {f: 1779, s: 1.74, y: -10},
    {f: 1824, s: 1.88, y: -18} /* rack: the voice note */,
    {f: 1929, s: 1.88, y: -18},
    {f: 1980, s: 1.76, y: -11} /* the dig */,
    {f: 2092, s: 1.9, y: -19} /* creep: the confession */,
    {f: 2172, s: 1.9, y: -19},
    {f: 2226, s: 1.78, y: -12},
    {f: 2258, s: 1.54, y: -2} /* deepest valley: before the veto */,
    {f: 2328, s: 1.8, y: -14},
    {f: 2378, s: 1.8, y: -14},
    {f: 2418, s: 1.93, y: -22} /* tightest of the film: the no */,
    {f: 2531, s: 1.93, y: -22},
    {f: 2581, s: 1.78, y: -12} /* ease as the heart lands */,
    {f: 2606, s: 1.74, y: -10} /* cut to the outro card */,
  ];
  const CAM: CamKey[] = launch
    ? CAM_LAUNCH
    : mobile
    ? [
        /* portrait cut, same grammar as the film: open on the identity mark,
           reveal, push per chapter, valley between, tightest on the veto.
           the portrait card is tall and the thread is bottom-anchored, so
           tight racks aim DOWN at the live bubbles (~440px below centre) */
        {f: 0, s: 2.2, y: 414},
        {f: 50, s: 2.2, y: 414},
        {f: 160, s: 1, y: 0} /* reveal: the contact card */,
        {f: 240, s: zoomT, y: -70} /* push in: Monday, the ear */,
        {f: 420, s: zoomT * 1.01, y: -85},
        {f: 468, s: zoomT * 1.035, y: -130} /* creep on "go" */,
        {f: 500, s: zoomT * 1.035, y: -130},
        {f: 540, s: zoomT * 0.9, y: 0} /* valley: the craft */,
        {f: 610, s: zoomT * 1.02, y: -95},
        {f: 756, s: zoomT * 1.02, y: -95},
        {f: 794, s: zoomT * 1.14, y: -400} /* rack in: draft v2 reveal */,
        {f: 862, s: zoomT * 1.14, y: -400},
        {f: 912, s: zoomT * 1.0, y: -70},
        {f: 972, s: zoomT * 0.88, y: 0} /* valley: the extraction */,
        {f: 1040, s: zoomT * 1.03, y: -110},
        {f: 1074, s: zoomT * 1.03, y: -110},
        {f: 1108, s: zoomT * 1.13, y: -390} /* push: the voice note */,
        {f: 1210, s: zoomT * 1.13, y: -390},
        {f: 1262, s: zoomT * 1.0, y: -70},
        {f: 1300, s: zoomT * 0.86, y: 0} /* deepest valley: before the veto */,
        {f: 1372, s: zoomT * 1.05, y: -140},
        {f: 1428, s: zoomT * 1.05, y: -140},
        {f: 1466, s: zoomT * 1.18, y: -410} /* tightest of the film: the no */,
        {f: 1556, s: zoomT * 1.18, y: -410},
        {f: 1600, s: zoomT * 1.02, y: -80} /* ease while the heart lands */,
        {f: 1680, s: 2.2, y: 414} /* close into the icon; the loop reopens */,
      ]
    : [
        /* the loop passes through the identity mark: open tight on the icon,
           pull back to reveal who this is, then push into the conversation */
        {f: 0, s: 2.55, y: 114},
        {f: 56, s: 2.55, y: 114},
        {f: 170, s: 1, y: 0} /* reveal: the contact card */,
        {f: 250, s: 1.78, y: -12} /* push in: Monday, the ear */,
        {f: 460, s: 1.79, y: -13},
        {f: 526, s: 1.815, y: -14} /* creep on "go" */,
        {f: 580, s: 1.815, y: -14},
        {f: 626, s: 1.6, y: -6} /* valley: the craft */,
        {f: 700, s: 1.78, y: -12},
        {f: 856, s: 1.78, y: -12},
        {f: 890, s: 1.9, y: -17} /* rack in: draft v2 reveal */,
        {f: 962, s: 1.9, y: -17},
        {f: 1006, s: 1.78, y: -12},
        {f: 1056, s: 1.58, y: -6} /* valley: the outcome */,
        {f: 1110, s: 1.72, y: -10},
        {f: 1150, s: 1.72, y: -10},
        {f: 1215, s: 1.34, y: -6, x: -900} /* pan: over to the feed */,
        {f: 1560, s: 1.4, y: -8, x: -900} /* slow push while the numbers climb */,
        {f: 1625, s: 1.72, y: -10, x: 0} /* pan home */,
        {f: 1900, s: 1.72, y: -10},
        {f: 1946, s: 1.56, y: -4} /* valley: the extraction */,
        {f: 2010, s: 1.74, y: -10},
        {f: 2150, s: 1.74, y: -10},
        {f: 2205, s: 1.88, y: -18} /* rack in: the voice note */,
        {f: 2290, s: 1.88, y: -18},
        {f: 2338, s: 1.75, y: -10},
        {f: 2400, s: 1.75, y: -10},
        {f: 2446, s: 1.54, y: -2} /* deepest valley: before the veto */,
        {f: 2510, s: 1.8, y: -14},
        {f: 2560, s: 1.8, y: -14},
        {f: 2598, s: 1.93, y: -22} /* tightest of the film: the no */,
        {f: 2710, s: 1.93, y: -22},
        {f: 2758, s: 1.82, y: -14} /* ease while the heart lands */,
        {f: 2792, s: 1.82, y: -14},
        {f: 2838, s: 1.56, y: -4} /* valley: the relay */,
        {f: 2902, s: 1.74, y: -10},
        {f: 3092, s: 1.74, y: -10},
        {f: 3128, s: 1.79, y: -12} /* nod on the 👍 */,
        {f: 3170, s: 1.79, y: -12},
        {f: 3300, s: 2.55, y: 114} /* the week closes into the icon; the loop reopens from it */,
      ];
  const cam = camAt(CAM, frame);
  const zoomP = Math.min(1, Math.max(0, (cam.s - 1) / (zoomT - 1))); /* 0 wide … 1 tight */

  /* feed visit: 0 → 1 while the camera is over the LinkedIn card */
  const visitP = mobile
    ? 0
    : launch
    ? interpolate(frame, [987, 1052, 1462, 1522], [0, 1, 1, 0], {...clamp, easing: easeCam})
    : interpolate(frame, [1150, 1215, 1560, 1625], [0, 1, 1, 0], {...clamp, easing: easeCam});

  /* contact <-> chat crossfade */
  const swap = launch
    ? {in: [0, 1] as const, out: [999900, 999990] as const}
    : mobile ? {in: [150, 226] as const, out: [1580, 1656] as const} : {in: [166, 246] as const, out: [3150, 3240] as const};
  const toChat = interpolate(frame, [...swap.in], [0, 1], {...clamp, easing: easePage});
  const toContact = interpolate(frame, [...swap.out], [0, 1], {...clamp, easing: easePage});
  const chatOp = toChat * (1 - toContact);
  const contactOp = 1 - chatOp;

  /* scene machinery: active scene + scroll-wipe of the previous one */
  const WIPE = 46;
  let sceneIdx = 0;
  for (let i = 0; i < SCENES.length; i++) if (frame >= SCENES[i].enter) sceneIdx = i;
  const scene = SCENES[sceneIdx];
  const prev = sceneIdx > 0 ? SCENES[sceneIdx - 1] : null;
  const wipeP = prev ? interpolate(frame, [scene.enter, scene.enter + WIPE], [0, 1], {...clamp, easing: easePage}) : 1;

  /* bottom-anchored stack inside a scene: real text measurement, not estimates,
     so long bubbles can never overlap their neighbours */
  const nodeText = (n: React.ReactNode): string => {
    if (n == null || typeof n === 'boolean') return '';
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (Array.isArray(n)) return n.map(nodeText).join('');
    if (React.isValidElement(n)) return nodeText((n.props as {children?: React.ReactNode}).children);
    return '';
  };
  const heightOf = (m: Msg) => {
    if (m.kind === 'draft') return 172;
    if (m.kind === 'photo') return Math.round((m.w ?? 330) * 0.747) + 6;
    if (m.kind === 'vn') {
      const t = measureCached(`“${m.transcript}”`, 16, m.w ?? 384, 1.4, 'italic');
      return 58 + 16 + t;
    }
    if (m.kind === 'out' && m.big) return 78;
    const plain = m.kind === 'in' ? (m.plain ?? nodeText(m.text)) : m.text;
    const body = measureCached(plain || 'x', 24, (m.kind === 'in' ? (m.w ?? 560) : 560) - 44, 1.35);
    return body + 32;
  };
  const GAP = 14;
  const base = 112;
  const riseAt = (m: Msg) => (m.kind === 'in' && m.typingFor ? m.at - m.typingFor : m.at);
  const bottoms = (msgs: Msg[]) =>
    msgs.map((_, i) => {
      let b = base;
      for (let j = i + 1; j < msgs.length; j++) b += rise(frame, riseAt(msgs[j]), fps) * (heightOf(msgs[j]) + GAP);
      return b;
    });

  /* exposure wash: during a hero hold, everything else recedes to ~40% —
     context stays present, attention goes where the camera goes */
  const FOCUS = mobile
    ? []
    : launch
    ? [
        {from: 476, to: 566, scene: 1, msg: 0} /* draft v2 reveal */,
        {from: 1811, to: 1931, scene: 3, msg: 2} /* the voice note */,
        {from: 2096, to: 2172, scene: 3, msg: 4} /* the confession */,
        {from: 2396, to: 2524, scene: 4, msg: 1} /* the veto line */,
      ]
    : [
        {from: 874, to: 965, scene: 1, msg: 0} /* draft v2 reveal */,
        {from: 2192, to: 2290, scene: 3, msg: 2} /* the voice note */,
        {from: 2572, to: 2705, scene: 4, msg: 1} /* the veto line */,
      ];
  let wash = 0;
  let heroScene = -1;
  let heroMsg = -1;
  for (const fc of FOCUS) {
    const a = interpolate(frame, [fc.from, fc.from + 14, fc.to - 16, fc.to], [0, 1, 1, 0], clamp);
    if (a > wash) {
      wash = a;
      heroScene = fc.scene;
      heroMsg = fc.msg;
    }
  }
  const chromeDim = 1 - 0.45 * wash;

  const renderScene = (sc: Scene, style: React.CSSProperties, scIdx: number) => {
    const bs = bottoms(sc.msgs);
    const dimFor = (i: number) => (wash > 0 && !(scIdx === heroScene && i === heroMsg) ? 1 - 0.6 * wash : 1);
    return (
      <div style={{position: 'absolute', inset: 0, ...style}}>
        <div style={{position: 'absolute', inset: 0, opacity: wash > 0 ? 1 - 0.6 * wash : 1}}>
          <Stamp frame={frame} at={sc.enter + (sc === SCENES[0] ? 0 : 14)} text={sc.stamp} fps={fps} />
        </div>
        {sc.msgs.map((m, i) => {
          let node: React.ReactNode = null;
          if (m.kind === 'vn') {
            node = (
              <VoiceNote frame={frame} at={m.at} dur={m.dur} transcript={m.transcript} playFrom={m.playFrom} playTo={m.playTo} bottom={bs[i]} w={m.w ?? 384} fps={fps} />
            );
          } else if (m.kind === 'draft') {
            node = <DraftCard frame={frame} at={m.at} revAt={m.revAt} bottom={bs[i]} fps={fps} />;
          } else if (m.kind === 'photo') {
            const w = m.w ?? 330;
            node = (
              <div style={{position: 'absolute', bottom: bs[i], right: 0, width: w, borderRadius: 26, borderBottomRightRadius: 8, overflow: 'hidden', boxShadow: '0 3px 12px rgba(20,22,28,0.16)', transformOrigin: 'bottom right', ...pop(frame, m.at, fps, 0.8, 13)}}>
                <Img src={staticFile(m.src)} style={{display: 'block', width: '100%', height: 'auto'}} />
              </div>
            );
          } else if (m.kind === 'out') {
            const reactP =
              m.reactAt && frame >= m.reactAt
                ? spring({frame: frame - m.reactAt, fps, config: {damping: 9, stiffness: 200, mass: 0.7}})
                : 0;
            node = (
              <Bubble side="out" bottom={bs[i]} big={m.big} react={reactP} anim={pop(frame, m.at, fps, 0.8, 13)}>
                {m.text}
              </Bubble>
            );
          } else {
            node = (
              <>
                {m.typingFor ? <TypingDots frame={frame} from={m.at - m.typingFor} until={m.at - 3} bottom={bs[i]} fps={fps} /> : null}
                <Bubble side="in" bottom={bs[i]} w={m.w} anim={pop(frame, m.at, fps)}>
                  {m.text}
                </Bubble>
              </>
            );
          }
          return (
            <div key={i} style={{position: 'absolute', inset: 0, opacity: dimFor(i), zIndex: i + 1}}>
              {node}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: BG, fontFamily: SANS}}>
      <AbsoluteFill
        style={{
          transform: `scale(${cam.s}) translate(${drift.x + cam.x}px, ${drift.y + cam.y}px)`,
          transformOrigin: `${originX}px ${originY}px`,
        }}
      >
        {/* side contacts: depth-of-field deepens as the camera closes */}
        <SideCard
          x={cardX - cardW - 120}
          y={cardY + 10}
          w={cardW}
          img={staticFile('memoji-man.jpg')}
          name="Mustafa"
          drift={drift.y * 1.6}
          blur={6 + zoomP * 5}
          opacity={0.55 * (1 - 0.5 * wash)}
        />
        {mobile ? (
          <SideCard
            x={cardX + cardW + 120}
            y={cardY + 10}
            w={cardW}
            img={staticFile('memoji-woman.jpg')}
            name="Maryam"
            drift={drift.y * -1.6}
            blur={6 + zoomP * 5}
            opacity={0.55 * (1 - 0.5 * wash)}
          />
        ) : (
          /* the outcome surface: blurred neighbour until the camera visits */
          <FeedCard
            x={cardX + cardW + 120}
            y={cardY + 10}
            w={cardW}
            frame={launch ? frame + 163 : frame}
            fps={fps}
            drift={drift.y * -1.6}
            blur={(6 + zoomP * 5) * (1 - visitP)}
            opacity={(0.55 + 0.45 * visitP) * (1 - 0.5 * wash)}
          />
        )}

        {/* center card: softens while the camera visits the feed (reciprocal DOF) */}
        <div
          style={{
            position: 'absolute',
            left: cardX,
            top: cardY,
            width: cardW,
            height: cardH,
            borderRadius: 48,
            background: 'linear-gradient(180deg,#ffffff 0%,#fdfdfc 70%,#f7f6f3 100%)',
            boxShadow: '0 4px 12px rgba(30,30,25,0.05), 0 28px 80px rgba(30,30,25,0.14)',
            overflow: 'hidden',
            filter: visitP > 0.02 ? `blur(${(visitP * 3).toFixed(2)}px)` : undefined,
            opacity: 1 - 0.25 * visitP,
          }}
        >
          <ContactFace opacity={contactOp} scale={1 + toChat * 0.04 - toContact * 0.04} />

          {/* chat face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: chatOp,
              transform: `scale(${0.985 + 0.015 * chatOp}) translateY(${8 * (1 - chatOp)}px)`,
              filter: chatOp < 0.99 && chatOp > 0 ? `blur(${(1 - chatOp) * 3}px)` : undefined,
            }}
          >
            {/* header */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 92,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '0 28px',
                borderBottom: '1px solid rgba(20,22,28,0.07)',
                background: 'rgba(250,250,249,0.94)',
                zIndex: 3,
                opacity: chromeDim,
              }}
            >
              <BackChevron />
              <div style={{width: 52, height: 52, borderRadius: 14, overflow: 'hidden'}}>
                <Img src={staticFile('app-icon.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 9, fontSize: 24, fontWeight: 600, color: '#26262a'}}>
                Draper <Verified size={24} />
              </div>
            </div>

            {/* thread: current scene, with the previous one archiving upward.
                top fade mask = edge falloff, so history melts under the header */}
            <div
              style={{
                position: 'absolute',
                top: 92,
                left: 26,
                right: 26,
                bottom: 0,
                overflow: 'hidden',
                maskImage: 'linear-gradient(to bottom, transparent 0px, #000 46px)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, #000 46px)',
              }}
            >
              {prev && wipeP < 1
                ? renderScene(
                    prev,
                    {
                      transform: `translateY(${-460 * wipeP}px)`,
                      opacity: 1 - wipeP,
                      filter: `blur(${wipeP * 5}px)`,
                    },
                    sceneIdx - 1
                  )
                : null}
              {renderScene(scene, prev ? {transform: `translateY(${34 * (1 - wipeP)}px)`, opacity: wipeP} : {}, sceneIdx)}
            </div>

            {/* compose bar */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 96,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '0 24px 18px',
                zIndex: 2,
                opacity: chromeDim,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(20,22,28,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  color: 'rgba(20,22,28,0.55)',
                  flex: 'none',
                }}
              >
                ＋
              </div>
              <div
                style={{
                  flex: 1,
                  height: 54,
                  border: '1.5px solid rgba(20,22,28,0.14)',
                  borderRadius: 999,
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  fontSize: 21,
                  fontWeight: 500,
                  color: MUTED,
                }}
              >
                <span>Message Draper</span>
                <Mic />
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
