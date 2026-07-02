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
import {loadFont} from '@remotion/google-fonts/DMSans';

const {fontFamily: DM} = loadFont();

export const HERO_DURATION = 1200; /* 40s @ 30fps */

/* ---------- palette ---------- */
const BG = '#FCFBF9';
const INK = '#1A1F2B';
const GREY = '#E9E9EB';
const BLUE = '#0A84FF';
const RED = '#E23D3D';
const LI_BLUE = '#3E7BC6';
const MUTED = 'rgba(20,22,28,0.45)';

/* ---------- timeline (frames @30fps) ---------- */
const T = {
  pushStart: 105,
  pushEnd: 162,
  swapStart: 118,
  swapEnd: 150,
  typing1: [172, 202] as const,
  m1: 205,
  memo: 268,
  memoPlayEnd: 330,
  typing2: [328, 352] as const,
  post: 355,
  kbUp: 400,
  typeStart: 424,
  typeEnd: 478,
  send: 488,
  kbDown: 495,
  typing3: [535, 558] as const,
  m5: 561,
  chips: 610,
  pick: 672,
  sep: 725,
  typing4: [745, 768] as const,
  m8: 771,
  results: 820,
  countStart: 832,
  countEnd: 950,
  typing5: [938, 962] as const,
  m10: 965,
  pullStart: 1060,
  pullEnd: 1150,
  swapBackStart: 1075,
  swapBackEnd: 1115,
};

const easePage = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/* ---------- helpers ---------- */
const pop = (frame: number, at: number, fps: number): React.CSSProperties =>
  frame < at
    ? {opacity: 0, transform: 'scale(0.7) translateY(12px)'}
    : (() => {
        const s = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 140, mass: 0.9}});
        return {
          opacity: Math.min(1, s * 1.4),
          transform: `scale(${0.7 + 0.3 * s}) translateY(${12 * (1 - s)}px)`,
        };
      })();

const rise = (frame: number, at: number, fps: number) =>
  frame < at ? 0 : spring({frame: frame - at, fps, config: {damping: 16, stiffness: 150, mass: 0.9}});

/* ---------- svg bits ---------- */
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

const Check: React.FC<{color?: string; size?: number}> = ({color = '#fff', size = 14}) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2 6.5L4.8 9L10 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- chat message shells ---------- */
const Bubble: React.FC<{
  side: 'in' | 'out';
  bottom: number;
  anim: React.CSSProperties;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({side, bottom, style, anim, children}) => (
  <div
    style={{
      position: 'absolute',
      bottom,
      [side === 'in' ? 'left' : 'right']: 0,
      maxWidth: 560,
      padding: '16px 22px',
      borderRadius: 30,
      [side === 'in' ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: 8,
      background: side === 'in' ? GREY : BLUE,
      color: side === 'in' ? '#111' : '#fff',
      fontSize: 24,
      lineHeight: 1.35,
      fontWeight: 500,
      transformOrigin: side === 'in' ? 'bottom left' : 'bottom right',
      ...anim,
      ...style,
    }}
  >
    {children}
  </div>
);

const Card: React.FC<{
  bottom: number;
  anim: React.CSSProperties;
  width?: number;
  children: React.ReactNode;
}> = ({bottom, anim, width = 430, children}) => (
  <div
    style={{
      position: 'absolute',
      bottom,
      left: 0,
      width,
      background: '#fff',
      borderRadius: 24,
      borderBottomLeftRadius: 8,
      padding: '20px 22px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.09), 0 14px 34px rgba(0,0,0,0.07)',
      transformOrigin: 'bottom left',
      ...anim,
    }}
  >
    {children}
  </div>
);

const TypingDots: React.FC<{frame: number; range: readonly [number, number]; bottom: number; fps: number}> = ({
  frame,
  range,
  bottom,
  fps,
}) => {
  const [a, b] = range;
  if (frame < a || frame > b + 4) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 14, stiffness: 160}});
  const fadeOut = interpolate(frame, [b, b + 4], [1, 0], clamp);
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
        transform: `scale(${0.7 + 0.3 * s})`,
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
            opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.28 - i * 0.9)),
          }}
        />
      ))}
    </div>
  );
};

/* ---------- rich pieces ---------- */
const VoiceMemo: React.FC<{frame: number; anim: React.CSSProperties; bottom: number}> = ({frame, anim, bottom}) => {
  const playing = frame >= T.memo && frame <= T.memoPlayEnd;
  const bars = Array.from({length: 26}, (_, i) => 8 + Math.abs(Math.sin(i * 1.37)) * 20);
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: '#fff',
        borderRadius: 30,
        borderBottomRightRadius: 8,
        padding: '16px 22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transformOrigin: 'bottom right',
        ...anim,
      }}
    >
      <div style={{width: 30, height: 30, borderRadius: '50%', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 11, height: 11, background: '#fff', borderRadius: 3}} />
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 3, height: 30}}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3.5,
              height: h * (playing ? 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.35 + i * 0.55)) : 1),
              borderRadius: 2,
              background: RED,
            }}
          />
        ))}
      </div>
      <div style={{fontSize: 20, fontWeight: 600, color: RED}}>0:41</div>
    </div>
  );
};

const SkeletonLines: React.FC<{widths: number[]}> = ({widths}) => (
  <>
    {widths.map((w, i) => (
      <div key={i} style={{height: 13, width: `${w * 100}%`, borderRadius: 7, background: 'rgba(20,22,28,0.08)', marginBottom: 10}} />
    ))}
  </>
);

const DraftCard: React.FC<{anim: React.CSSProperties; bottom: number}> = ({anim, bottom}) => (
  <Card bottom={bottom} anim={anim}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
      <Img src={staticFile('linkedin_com.png')} style={{width: 34, height: 34, borderRadius: 8}} />
      <span style={{fontSize: 18, fontWeight: 600, color: 'rgba(20,22,28,0.6)'}}>Drafted in your voice</span>
    </div>
    <SkeletonLines widths={[1, 0.94, 0.6]} />
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
        fontSize: 17,
        fontWeight: 600,
        color: LI_BLUE,
        background: 'rgba(62,123,198,0.1)',
        borderRadius: 999,
        padding: '7px 16px',
      }}
    >
      <Check color={LI_BLUE} />
      queued · tuesday 8am
    </div>
  </Card>
);

/* rich action: pick-the-cut choice chips */
const ChoiceCard: React.FC<{frame: number; anim: React.CSSProperties; bottom: number; fps: number}> = ({frame, anim, bottom, fps}) => {
  const picked = frame >= T.pick;
  const pickS = picked ? spring({frame: frame - T.pick, fps, config: {damping: 12, stiffness: 180}}) : 0;
  const Row: React.FC<{label: string; desc: string; selected: boolean}> = ({label, desc, selected}) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 14px',
        borderRadius: 14,
        background: selected && picked ? 'rgba(10,132,255,0.08)' : 'transparent',
        opacity: !selected && picked ? 0.45 : 1,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: `2px solid ${selected && picked ? BLUE : 'rgba(20,22,28,0.25)'}`,
          background: selected && picked ? BLUE : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: selected && picked ? `scale(${0.8 + 0.2 * pickS})` : 'scale(1)',
          flex: 'none',
        }}
      >
        {selected && picked && <Check size={15} />}
      </div>
      <div>
        <div style={{fontSize: 21, fontWeight: 600, color: '#20242c'}}>{label}</div>
        <div style={{fontSize: 17, fontWeight: 500, color: MUTED}}>{desc}</div>
      </div>
    </div>
  );
  return (
    <Card bottom={bottom} anim={anim} width={440}>
      <div style={{fontSize: 18, fontWeight: 600, color: 'rgba(20,22,28,0.6)', marginBottom: 10, padding: '0 4px'}}>Which cut?</div>
      <Row label="the spiky one" desc="sharper opener, picks a fight" selected />
      <Row label="the safe one" desc="softer landing, same story" selected={false} />
    </Card>
  );
};

/* day separator */
const DaySep: React.FC<{frame: number; bottom: number}> = ({frame, bottom}) => {
  const op = interpolate(frame, [T.sep, T.sep + 16], [0, 1], clamp);
  const y = interpolate(frame, [T.sep, T.sep + 16], [8, 0], {...clamp, easing: easePage});
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 17,
        fontWeight: 600,
        color: 'rgba(20,22,28,0.35)',
        opacity: op,
        transform: `translateY(${y}px)`,
      }}
    >
      Monday 8:02
    </div>
  );
};

/* live results with ticking counters */
const ResultsCard: React.FC<{frame: number; anim: React.CSSProperties; bottom: number}> = ({frame, anim, bottom}) => {
  const n = (to: number) =>
    Math.floor(interpolate(frame, [T.countStart, T.countEnd], [0, to], {...clamp, easing: Easing.out(Easing.cubic)}));
  const Stat: React.FC<{v: number; label: string}> = ({v, label}) => (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 7}}>
      <span style={{fontSize: 26, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums'}}>{v}</span>
      <span style={{fontSize: 16, fontWeight: 500, color: MUTED}}>{label}</span>
    </div>
  );
  return (
    <Card bottom={bottom} anim={anim} width={450}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
        <Img src={staticFile('linkedin_com.png')} style={{width: 34, height: 34, borderRadius: 8}} />
        <span style={{fontSize: 18, fontWeight: 600, color: 'rgba(20,22,28,0.6)'}}>Live on LinkedIn</span>
        <span
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 15,
            fontWeight: 700,
            color: '#3E8E4F',
          }}
        >
          <span style={{width: 9, height: 9, borderRadius: '50%', background: '#3E8E4F', opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame * 0.12))}} />
          LIVE
        </span>
      </div>
      <SkeletonLines widths={[1, 0.7]} />
      <div style={{display: 'flex', gap: 26, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(20,22,28,0.07)'}}>
        <Stat v={n(214)} label="reactions" />
        <Stat v={n(41)} label="comments" />
        <Stat v={n(9)} label="reposts" />
      </div>
    </Card>
  );
};

/* ---------- iOS keyboard with suggestion strip ---------- */
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const Keyboard: React.FC<{progress: number; width: number}> = ({progress, width}) => {
  const H = 336;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: H,
        background: '#D6D9DE',
        transform: `translateY(${(1 - progress) * (H + 30)}px)`,
        padding: '0 10px 14px',
        borderBottomLeftRadius: 44,
        borderBottomRightRadius: 44,
      }}
    >
      <div style={{display: 'flex', alignItems: 'stretch', height: 52, marginBottom: 8}}>
        {['"instead"', 'monday', 'tuesday'].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 19,
              fontWeight: i === 1 ? 600 : 400,
              color: '#1b1b1d',
              borderRight: i < 2 ? '1px solid rgba(0,0,0,0.12)' : 'none',
            }}
          >
            {s}
          </div>
        ))}
      </div>
      {KEY_ROWS.map((row, ri) => (
        <div key={ri} style={{display: 'flex', justifyContent: 'center', gap: 9, marginBottom: 12}}>
          {row.split('').map((k) => (
            <div
              key={k}
              style={{
                width: (width - 20 - 9 * 9) / 10,
                height: 56,
                background: '#FEFEFE',
                borderRadius: 8,
                boxShadow: '0 1px 0 rgba(0,0,0,0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: '#1b1b1d',
              }}
            >
              {k}
            </div>
          ))}
        </div>
      ))}
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            width: width * 0.5,
            height: 56,
            background: '#FEFEFE',
            borderRadius: 8,
            boxShadow: '0 1px 0 rgba(0,0,0,0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
            color: 'rgba(27,27,29,0.55)',
          }}
        >
          space
        </div>
      </div>
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
    }}
  >
    <div style={{width: 160, height: 160, borderRadius: 40, overflow: 'hidden', boxShadow: '0 12px 34px rgba(20,20,40,0.24)'}}>
      <Img src={staticFile('app-icon.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 12, fontSize: 40, fontWeight: 600, color: '#26262a', letterSpacing: '-0.01em'}}>
      Draper <Verified size={34} />
    </div>
    <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16, width: '64%'}}>
      <div style={{height: 52, borderRadius: 18, background: 'rgba(20,22,28,0.045)'}} />
      <div style={{height: 52, width: '72%', borderRadius: 18, background: 'rgba(20,22,28,0.045)'}} />
    </div>
  </div>
);

const SideCard: React.FC<{x: number; y: number; w: number; img: string; name: string; drift: number}> = ({x, y, w, img, name, drift}) => (
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
      filter: 'blur(6px)',
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

/* ================= the film ================= */
export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const isPortrait = H > W;

  /* format-aware layout */
  const cardW = isPortrait ? 900 : 780;
  const cardH = 586;
  const cardX = (W - cardW) / 2;
  const cardY = isPortrait ? (H - cardH) / 2 - 70 : 252;
  const zoomTarget = isPortrait ? (W * 1.05) / cardW : 1.78;
  const originX = W / 2;
  const originY = cardY + cardH / 2;

  /* ambient drift — period divides duration so frame 0 == frame 1200 */
  const drift = Math.sin((frame / 600) * Math.PI * 2);
  const driftY = drift * 5;

  /* camera */
  const pushIn = interpolate(frame, [T.pushStart, T.pushEnd], [0, 1], {...clamp, easing: easePage});
  const pullOut = interpolate(frame, [T.pullStart, T.pullEnd], [0, 1], {...clamp, easing: easePage});
  const creep = interpolate(frame, [T.pushEnd, T.pullStart], [0, 0.05], clamp);
  const zoomed = 1 + pushIn * (zoomTarget - 1) - creep * pushIn;
  const camScale = zoomed + (1 - zoomed) * pullOut;
  const cam = camScale * (1 + 0.004 * drift);

  /* face crossfades */
  const toChat = interpolate(frame, [T.swapStart, T.swapEnd], [0, 1], {...clamp, easing: easePage});
  const toContact = interpolate(frame, [T.swapBackStart, T.swapBackEnd], [0, 1], {...clamp, easing: easePage});
  const chatOp = toChat * (1 - toContact);
  const contactOp = 1 - chatOp;

  /* keyboard */
  const kbUp = frame < T.kbUp ? 0 : spring({frame: frame - T.kbUp, fps, config: {damping: 17, stiffness: 120}});
  const kbDown = frame < T.kbDown + 26 ? 0 : spring({frame: frame - (T.kbDown + 26), fps, config: {damping: 17, stiffness: 120}});
  const kb = Math.max(0, kbUp - kbDown);

  /* compose typing */
  const TYPED = 'go monday instead';
  const nChars = Math.floor(interpolate(frame, [T.typeStart, T.typeEnd], [0, TYPED.length], clamp));
  const typedText = frame >= T.send ? '' : TYPED.slice(0, nChars);
  const caretOn = frame >= T.typeStart - 12 && frame < T.send && Math.floor(frame / 9) % 2 === 0;
  const placeholderVisible = !(frame >= T.typeStart - 12 && frame < T.send) && !typedText;

  /* message stack — bottom-anchored, springs push older messages up */
  const GAP = 14;
  const STACK: Array<{key: string; at: number; h: number}> = [
    {key: 'm1', at: T.m1, h: 130},
    {key: 'memo', at: T.memo, h: 66},
    {key: 'post', at: T.post, h: 236},
    {key: 'm4', at: T.send, h: 60},
    {key: 'm5', at: T.m5, h: 96},
    {key: 'chips', at: T.chips, h: 226},
    {key: 'sep', at: T.sep, h: 46},
    {key: 'm8', at: T.m8, h: 56},
    {key: 'results', at: T.results, h: 262},
    {key: 'm10', at: T.m10, h: 96},
  ];
  const kbLift = kb * 290;
  const base = 108 + kbLift;
  const bottoms: Record<string, number> = {};
  STACK.forEach((m, i) => {
    let b = base;
    for (let j = i + 1; j < STACK.length; j++) {
      b += rise(frame, STACK[j].at, fps) * (STACK[j].h + GAP);
    }
    bottoms[m.key] = b;
  });

  return (
    <AbsoluteFill style={{background: BG, fontFamily: DM}}>
      <AbsoluteFill style={{transform: `scale(${cam}) translateY(${driftY}px)`, transformOrigin: `${originX}px ${originY}px`}}>
        {/* side contacts */}
        <SideCard x={cardX - cardW - 120} y={cardY + 10} w={cardW} img={staticFile('memoji-man.jpg')} name="Mustafa" drift={drift * 8} />
        <SideCard x={cardX + cardW + 120} y={cardY + 10} w={cardW} img={staticFile('memoji-woman.jpg')} name="Maryam" drift={drift * -8} />

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
          <div style={{position: 'absolute', inset: 0, opacity: chatOp, transform: `scale(${0.985 + 0.015 * chatOp})`}}>
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

            {/* thread */}
            <div style={{position: 'absolute', top: 92, left: 26, right: 26, bottom: 0, overflow: 'hidden'}}>
              <Bubble side="in" bottom={bottoms.m1} anim={pop(frame, T.m1, fps)} style={{width: 560}}>
                caught something in your 2pm. you said{' '}
                <span style={{borderBottom: '2.5px solid rgba(17,17,17,0.5)', paddingBottom: 1}}>
                  &ldquo;we hire slow on purpose, speed is a tax&rdquo;
                </span>
                . that is a post
              </Bubble>
              <TypingDots frame={frame} range={T.typing1} bottom={base} fps={fps} />
              <VoiceMemo frame={frame} anim={pop(frame, T.memo, fps)} bottom={bottoms.memo} />
              <TypingDots frame={frame} range={T.typing2} bottom={base} fps={fps} />
              <DraftCard anim={pop(frame, T.post, fps)} bottom={bottoms.post} />
              <Bubble side="out" bottom={bottoms.m4} anim={pop(frame, T.send, fps)}>
                go monday instead
              </Bubble>
              <TypingDots frame={frame} range={T.typing3} bottom={base} fps={fps} />
              <Bubble side="in" bottom={bottoms.m5} anim={pop(frame, T.m5, fps)} style={{width: 500}}>
                done. monday, 8am. spiky cut or the safe one?
              </Bubble>
              <ChoiceCard frame={frame} anim={pop(frame, T.chips, fps)} bottom={bottoms.chips} fps={fps} />
              <DaySep frame={frame} bottom={bottoms.sep} />
              <TypingDots frame={frame} range={T.typing4} bottom={base} fps={fps} />
              <Bubble side="in" bottom={bottoms.m8} anim={pop(frame, T.m8, fps)}>
                it&rsquo;s live.
              </Bubble>
              <ResultsCard frame={frame} anim={pop(frame, T.results, fps)} bottom={bottoms.results} />
              <TypingDots frame={frame} range={T.typing5} bottom={base} fps={fps} />
              <Bubble side="in" bottom={bottoms.m10} anim={pop(frame, T.m10, fps)} style={{width: 520}}>
                three investors in your DMs. want intros drafted?
              </Bubble>
            </div>

            {/* compose bar */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: kb * 290,
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
                  color: typedText ? INK : MUTED,
                }}
              >
                <span>
                  {typedText || (placeholderVisible ? 'Message Draper' : '')}
                  {caretOn && (
                    <span style={{display: 'inline-block', width: 2.5, height: 26, background: BLUE, verticalAlign: -4, marginLeft: 2}} />
                  )}
                </span>
                <Mic />
              </div>
            </div>

            {/* keyboard */}
            <Keyboard progress={kb} width={cardW} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
