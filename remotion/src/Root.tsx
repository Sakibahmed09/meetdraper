import React from 'react';
import {Composition, Still} from 'remotion';
import {Hero, HERO_DURATION} from './Hero';
import {SocialCard} from './SocialCard';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="DraperHero"
        component={Hero}
        durationInFrames={HERO_DURATION}
        fps={60}
        width={1440}
        height={1080}
      />
      <Composition
        id="DraperHeroPortrait"
        component={Hero}
        durationInFrames={HERO_DURATION}
        fps={60}
        width={1080}
        height={1350}
      />
      <Composition
        id="DraperHeroMobile"
        component={Hero}
        defaultProps={{mobile: true}}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1350}
      />
      <Still id="SocialCard" component={SocialCard} width={1200} height={630} />
    </>
  );
};
