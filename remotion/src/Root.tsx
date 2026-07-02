import React from 'react';
import {Composition} from 'remotion';
import {Hero, HERO_DURATION} from './Hero';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="DraperHero"
        component={Hero}
        durationInFrames={HERO_DURATION}
        fps={30}
        width={1440}
        height={1080}
      />
      <Composition
        id="DraperHeroPortrait"
        component={Hero}
        durationInFrames={HERO_DURATION}
        fps={30}
        width={1080}
        height={1350}
      />
    </>
  );
};
