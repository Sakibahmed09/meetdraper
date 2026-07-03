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
import {loadFont} from '@remotion/google-fonts/SchibstedGrotesk';

const {fontFamily: SANS} = loadFont();

/* ============================================================
   A WEEK WITH DRAPER — five chapters, one looping week.
   Mon: the ear · Mon: the craft · Tue: the outcome ·
   Wed: the veto · Fri: the relay. The loop is the promise.
   ============================================================ */

export const HERO_DURATION = 2880; /* 48s @ 60fps */
export const MOBILE_DURATION = 900; /* 15s @ 60fps */

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
  | {kind: 'in'; at: number; text: React.ReactNode; w?: number; typingFor?: number}
  | {kind: 'out'; at: number; text: string; big?: boolean}
  | {kind: 'draft'; at: number; revAt?: number};

type Scene = {stamp: string; enter: number; msgs: Msg[]};

const SCENES_FULL: Scene[] = [
  {
    stamp: 'Monday 14:47',
    enter: 268,
    msgs: [
      {
        kind: 'in',
        at: 330,
        typingFor: 38,
        w: 540,
        text: (
          <>
            heard on your 2pm: <U>&ldquo;we hire slow on purpose&rdquo;</U>
          </>
        ),
      },
      {kind: 'in', at: 432, typingFor: 34, w: 520, text: <>founder arc. contrarian, costs you something to say</>},
      {kind: 'in', at: 508, typingFor: 24, text: <>draft it?</>},
      {kind: 'out', at: 578, text: 'go'},
    ],
  },
  {
    stamp: 'Monday 15:12',
    enter: 648,
    msgs: [
      {kind: 'draft', at: 718, revAt: 940},
      {kind: 'out', at: 858, text: 'spikier'},
      {kind: 'in', at: 1040, typingFor: 32, text: <>queued. tuesday 9am, best slot left this week</>},
    ],
  },
  {
    stamp: 'Tuesday 12:40',
    enter: 1172,
    msgs: [
      {kind: 'in', at: 1238, typingFor: 36, w: 520, text: <>live. 40 comments before lunch, three from investors</>},
      {
        kind: 'in',
        at: 1345,
        typingFor: 38,
        w: 545,
        text: <>sandra from meridian commented. second touch this month. worth a dm while it&rsquo;s warm?</>,
      },
      {kind: 'out', at: 1452, text: 'draft it'},
      {kind: 'in', at: 1512, typingFor: 26, text: <>done, it&rsquo;s in your drafts</>},
    ],
  },
  {
    stamp: 'Wednesday 17:20',
    enter: 1612,
    msgs: [
      {kind: 'in', at: 1678, typingFor: 30, text: <>heads up. skipping tomorrow&rsquo;s slot</>},
      {kind: 'in', at: 1784, typingFor: 36, w: 520, text: <>nothing in the backlog earns it. fine doesn&rsquo;t get posted</>},
      {kind: 'out', at: 1918, text: 'ok fair'},
    ],
  },
  {
    stamp: 'Friday 09:30',
    enter: 2002,
    msgs: [
      {kind: 'in', at: 2068, typingFor: 30, text: <>you&rsquo;ve been quiet since tuesday</>},
      {
        kind: 'in',
        at: 2170,
        typingFor: 38,
        w: 545,
        text: <>i&rsquo;d run your take on ai pricing. sharpest thing you said all week and nobody&rsquo;s heard it</>,
      },
      {kind: 'in', at: 2275, typingFor: 34, w: 510, text: <>monday 9am, approving unless you say otherwise</>},
      {kind: 'out', at: 2364, text: '👍', big: true},
    ],
  },
];

const SCENES_MOBILE: Scene[] = [
  {
    stamp: 'Monday 14:47',
    enter: 200,
    msgs: [
      {
        kind: 'in',
        at: 252,
        typingFor: 30,
        w: 540,
        text: (
          <>
            heard on your 2pm: <U>&ldquo;we hire slow on purpose&rdquo;</U>
          </>
        ),
      },
      {kind: 'in', at: 352, typingFor: 22, text: <>draft it?</>},
      {kind: 'out', at: 415, text: 'go'},
    ],
  },
  {
    stamp: 'Tuesday',
    enter: 480,
    msgs: [
      {kind: 'draft', at: 545},
      {kind: 'in', at: 688, typingFor: 28, w: 500, text: <>live. 40 comments, three from investors</>},
    ],
  },
];

/* underline data-detector */
function U({children}: {children: React.ReactNode}) {
  return <span style={{borderBottom: '2.5px solid rgba(17,17,17,0.5)', paddingBottom: 1}}>{children}</span>;
}

/* ---------- physics ---------- */
const pop = (frame: number, at: number, fps: number, mass = 0.9, damping = 14): React.CSSProperties =>
  frame < at
    ? {opacity: 0, transform: 'scale(0.72) translateY(13px)'}
    : (() => {
        const s = spring({frame: frame - at, fps, config: {damping, stiffness: 130, mass}});
        return {
          opacity: Math.min(1, s * 1.45),
          transform: `scale(${0.72 + 0.28 * s}) translateY(${13 * (1 - s)}px)`,
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
  children: React.ReactNode;
}> = ({side, bottom, anim, w, big, children}) => (
  <div
    style={{
      position: 'absolute',
      bottom,
      [side === 'in' ? 'left' : 'right']: 0,
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
        <span style={{fontSize: 15, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED}}>
          founder arc · draft
        </span>
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

/* chapter mark: day stamp with an expanding hairline */
const Stamp: React.FC<{frame: number; at: number; text: string; fps: number}> = ({frame, at, text, fps}) => {
  const s = frame < at ? 0 : spring({frame: frame - at, fps, config: {damping: 16, stiffness: 120}});
  return (
    <div style={{position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', alignItems: 'center', gap: 16, opacity: s}}>
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

const SideCard: React.FC<{x: number; y: number; w: number; img: string; name: string; drift: number; blur: number}> = ({
  x,
  y,
  w,
  img,
  name,
  drift,
  blur,
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
      opacity: 0.55,
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
   camera rig: keyframed scale/y track, evaluated per frame
   ============================================================ */
type CamKey = {f: number; s: number; y: number};
const camAt = (keys: CamKey[], f: number) => {
  if (f <= keys[0].f) return {s: keys[0].s, y: keys[0].y};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f >= a.f && f <= b.f) {
      const p = easePage((f - a.f) / Math.max(1, b.f - a.f));
      return {s: a.s + (b.s - a.s) * p, y: a.y + (b.y - a.y) * p};
    }
  }
  const last = keys[keys.length - 1];
  return {s: last.s, y: last.y};
};

/* ============================================================
   THE FILM
   ============================================================ */
export const Hero: React.FC<{mobile?: boolean}> = ({mobile = false}) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const DUR = mobile ? MOBILE_DURATION : HERO_DURATION;
  const SCENES = mobile ? SCENES_MOBILE : SCENES_FULL;

  /* layout */
  const cardW = mobile ? 900 : 780;
  const cardH = 586;
  const cardX = (W - cardW) / 2;
  const cardY = mobile ? (H - cardH) / 2 - 16 : 252;
  const zoomT = mobile ? (W * 0.97) / cardW : 1.78;
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

  /* camera track: a micro-reframe per chapter, tightest on the veto */
  const CAM: CamKey[] = mobile
    ? [
        {f: 0, s: 1, y: 0},
        {f: 100, s: 1, y: 0},
        {f: 190, s: zoomT, y: -8},
        {f: 470, s: zoomT * 0.99, y: -8},
        {f: 510, s: zoomT * 1.005, y: -12},
        {f: 740, s: zoomT * 0.995, y: -10},
        {f: 860, s: 1, y: 0},
        {f: 900, s: 1, y: 0},
      ]
    : [
        {f: 0, s: 1, y: 0},
        {f: 150, s: 1, y: 0},
        {f: 258, s: 1.78, y: -12},
        {f: 620, s: 1.745, y: -12},
        {f: 662, s: 1.7, y: -8},
        {f: 1130, s: 1.735, y: -10},
        {f: 1176, s: 1.76, y: -16},
        {f: 1570, s: 1.72, y: -10},
        {f: 1616, s: 1.82, y: -18},
        {f: 1960, s: 1.78, y: -16},
        {f: 2006, s: 1.71, y: -10},
        {f: 2430, s: 1.71, y: -10},
        {f: 2620, s: 1, y: 0},
        {f: 2880, s: 1, y: 0},
      ];
  const cam = camAt(CAM, frame);
  const camPrev = camAt(CAM, frame - 1);
  const camVel = Math.abs(cam.s - camPrev.s) + Math.abs(cam.y - camPrev.y) / 400;
  const motionBlur = Math.min(2.4, camVel * 180);
  const zoomP = (cam.s - 1) / (zoomT - 1); /* 0 wide … 1 tight */

  /* contact <-> chat crossfade */
  const swap = mobile ? {in: [112, 178] as const, out: [750, 838] as const} : {in: [166, 246] as const, out: [2450, 2560] as const};
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

  /* bottom-anchored stack inside a scene */
  const heightOf = (m: Msg) => (m.kind === 'draft' ? 172 : m.kind === 'out' ? (m.big ? 78 : 60) : 64 + (m.w && m.w > 500 ? 34 : 0));
  const GAP = 14;
  const base = 112;
  const riseAt = (m: Msg) => (m.kind === 'in' && m.typingFor ? m.at - m.typingFor : m.at);
  const bottoms = (msgs: Msg[]) =>
    msgs.map((_, i) => {
      let b = base;
      for (let j = i + 1; j < msgs.length; j++) b += rise(frame, riseAt(msgs[j]), fps) * (heightOf(msgs[j]) + GAP);
      return b;
    });

  const renderScene = (sc: Scene, style: React.CSSProperties) => {
    const bs = bottoms(sc.msgs);
    return (
      <div style={{position: 'absolute', inset: 0, ...style}}>
        <Stamp frame={frame} at={sc.enter + (sc === SCENES[0] ? 0 : 14)} text={sc.stamp} fps={fps} />
        {sc.msgs.map((m, i) => {
          if (m.kind === 'draft') {
            return <DraftCard key={i} frame={frame} at={m.at} revAt={m.revAt} bottom={bs[i]} fps={fps} />;
          }
          if (m.kind === 'out') {
            return (
              <Bubble key={i} side="out" bottom={bs[i]} big={m.big} anim={pop(frame, m.at, fps, 0.8, 13)}>
                {m.text}
              </Bubble>
            );
          }
          return (
            <React.Fragment key={i}>
              {m.typingFor ? <TypingDots frame={frame} from={m.at - m.typingFor} until={m.at - 3} bottom={bs[i]} fps={fps} /> : null}
              <Bubble side="in" bottom={bs[i]} w={m.w} anim={pop(frame, m.at, fps)}>
                {m.text}
              </Bubble>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: BG, fontFamily: SANS}}>
      <AbsoluteFill
        style={{
          transform: `scale(${cam.s}) translate(${drift.x}px, ${drift.y + cam.y}px)`,
          transformOrigin: `${originX}px ${originY}px`,
          filter: motionBlur > 0.08 ? `blur(${motionBlur.toFixed(2)}px)` : undefined,
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
        />
        <SideCard
          x={cardX + cardW + 120}
          y={cardY + 10}
          w={cardW}
          img={staticFile('memoji-woman.jpg')}
          name="Maryam"
          drift={drift.y * -1.6}
          blur={6 + zoomP * 5}
        />

        {/* center card */}
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

            {/* thread: current scene, with the previous one archiving upward */}
            <div style={{position: 'absolute', top: 92, left: 26, right: 26, bottom: 0, overflow: 'hidden'}}>
              {prev && wipeP < 1
                ? renderScene(prev, {
                    transform: `translateY(${-460 * wipeP}px)`,
                    opacity: 1 - wipeP,
                    filter: `blur(${wipeP * 5}px)`,
                  })
                : null}
              {renderScene(scene, prev ? {transform: `translateY(${34 * (1 - wipeP)}px)`, opacity: wipeP} : {})}
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
