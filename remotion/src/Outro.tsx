import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';

const {fontFamily: PLAYFAIR} = loadPlayfair();
const SANS = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif";
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* The film closes into the icon; the outro opens on it and lets the name land.
   Same cream, same icon, one held breath: wordmark, the line, the address. */
export const OUTRO_DURATION = 252; /* 4.2s @ 60fps */

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const settle = spring({frame, fps, config: {damping: 16, stiffness: 90, mass: 1.1}});
  const iconY = interpolate(settle, [0, 1], [40, 0]);
  const iconS = interpolate(settle, [0, 1], [1.14, 1]);

  const wm = spring({frame: frame - 26, fps, config: {damping: 15, stiffness: 110}});
  const tag = interpolate(frame, [64, 100], [0, 1], {...clamp, easing: Easing.bezier(0.23, 1, 0.32, 1)});
  const url = spring({frame: frame - 108, fps, config: {damping: 14, stiffness: 120}});

  return (
    <AbsoluteFill style={{background: '#FCFBF9', fontFamily: SANS, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(-26px)`}}>
        <div
          style={{
            width: 148,
            height: 148,
            borderRadius: 37,
            overflow: 'hidden',
            boxShadow: '0 14px 40px rgba(20,20,40,0.22)',
            transform: `translateY(${iconY}px) scale(${iconS})`,
          }}
        >
          <Img src={staticFile('app-icon.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>

        <div
          style={{
            marginTop: 34,
            fontFamily: PLAYFAIR,
            fontWeight: 700,
            fontSize: 92,
            letterSpacing: '-0.05em',
            color: '#111110',
            lineHeight: 1,
            opacity: Math.min(1, wm * 1.2),
            transform: `translateY(${18 * (1 - wm)}px)`,
          }}
        >
          Draper
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 27,
            fontWeight: 500,
            color: 'rgba(20,22,28,0.55)',
            opacity: tag,
            transform: `translateY(${10 * (1 - tag)}px)`,
          }}
        >
          Your own content hire, inside iMessage
        </div>

        <div
          style={{
            marginTop: 40,
            height: 60,
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 19,
            background: 'linear-gradient(#3A3A3A 0%,#3A3A3A 52.4%,#2C2C2C 80.29%,#1F1F1F 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.12), inset 0 0 0 1.5px #353535, inset 0 0 14px rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: 23,
            fontWeight: 500,
            opacity: Math.min(1, url * 1.2),
            transform: `translateY(${16 * (1 - url)}px) scale(${0.94 + 0.06 * Math.min(1, url)})`,
          }}
        >
          draperhq.com/meetdraper
        </div>
      </div>
    </AbsoluteFill>
  );
};
