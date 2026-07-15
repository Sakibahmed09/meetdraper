import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont as loadDM} from '@remotion/google-fonts/SchibstedGrotesk';
import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';

const {fontFamily: DM} = loadDM();
const {fontFamily: FRAUNCES} = loadFraunces();
const {fontFamily: PLAYFAIR} = loadPlayfair();

const INK = '#1A1F2B';

export const SocialCard: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#FCFBF9', fontFamily: DM, overflow: 'hidden'}}>
      {/* sunset backdrop, heavily fogged */}
      <Img
        src={staticFile('sunset-sky.jpg')}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9}}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(105deg, rgba(252,251,249,0.99) 0%, rgba(252,251,249,0.96) 38%, rgba(252,251,249,0.75) 58%, rgba(252,251,249,0.18) 100%)',
        }}
      />

      {/* right: floating contact card with the denim icon */}
      <div
        style={{
          position: 'absolute',
          right: 74,
          top: 118,
          width: 350,
          height: 396,
          borderRadius: 40,
          background: 'linear-gradient(180deg,#ffffff 0%,#f7f6f3 100%)',
          boxShadow: '0 6px 16px rgba(30,30,25,0.07), 0 40px 90px rgba(30,30,25,0.20)',
          transform: 'rotate(3.5deg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 62,
        }}
      >
        <div style={{width: 128, height: 128, borderRadius: 32, overflow: 'hidden', boxShadow: '0 12px 30px rgba(20,20,40,0.24)'}}>
          <Img src={staticFile('app-icon.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, fontSize: 33, fontWeight: 600, color: '#26262a'}}>
          Draper
          <svg width={27} height={27} viewBox="0 0 22 22" fill="none">
            <path
              d="M11 1.5l2.2 1.9 2.9-.4 1 2.7 2.7 1-.4 2.9 1.9 2.2-1.9 2.2.4 2.9-2.7 1-1 2.7-2.9-.4L11 22l-2.2-1.9-2.9.4-1-2.7-2.7-1 .4-2.9L.7 11.7 2.6 9.5l-.4-2.9 2.7-1 1-2.7 2.9.4L11 1.5z"
              fill="#9C9C9C"
              transform="scale(.95) translate(.5 -1)"
            />
            <path d="M7.5 11.2l2.3 2.3 4.7-4.7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* grey message bubble peeking from the card */}
        <div
          style={{
            marginTop: 34,
            marginLeft: -46,
            alignSelf: 'flex-start',
            background: '#E9E9EB',
            color: '#111',
            fontSize: 17.5,
            fontWeight: 500,
            lineHeight: 1.4,
            padding: '14px 20px',
            borderRadius: 24,
            borderBottomLeftRadius: 7,
            width: 316,
            boxShadow: '0 10px 26px rgba(30,30,25,0.13)',
          }}
        >
          caught something in your 2pm. <span style={{borderBottom: '2px solid rgba(17,17,17,0.45)'}}>&ldquo;we hire slow on purpose&rdquo;</span> is a post. want it?
        </div>
      </div>

      {/* left: wordmark, headline, sub */}
      <div style={{position: 'absolute', left: 84, top: 92, width: 690}}>
        <div style={{fontFamily: PLAYFAIR, fontWeight: 700, fontSize: 54, letterSpacing: '-0.05em', color: '#111110'}}>Draper</div>
        <div
          style={{
            marginTop: 40,
            fontFamily: FRAUNCES,
            fontWeight: 600,
            fontSize: 66,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: '#0e0e0c',
          }}
        >
          You do the talking.
          <br />
          Draper does LinkedIn.
        </div>
        <div style={{marginTop: 28, fontSize: 26, fontWeight: 500, color: 'rgba(20,22,28,0.55)', lineHeight: 1.4, width: 600}}>
          It joins your calls, writes the way you talk, and won&rsquo;t post anything that reads like AI
        </div>
        <div
          style={{
            marginTop: 42,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 62,
            padding: '0 44px',
            borderRadius: 20,
            background: 'linear-gradient(#3A3A3A 0%,#3A3A3A 52.4%,#2C2C2C 80.29%,#1F1F1F 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.12), inset 0 0 0 1.5px #353535, inset 0 0 14px rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          Join the Waitlist
        </div>
      </div>
      {/* ink accent so the ink var isn't unused: subtle bottom hairline */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, background: INK, opacity: 0.06}} />
    </AbsoluteFill>
  );
};
