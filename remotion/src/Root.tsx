import React from 'react';
import {Composition, Still} from 'remotion';
import {Hero, HERO_DURATION, MOBILE_DURATION, LAUNCH_DURATION} from './Hero';
import {Outro, OUTRO_DURATION} from './Outro';
import {MeetScene, MEET_DURATION} from './MeetScene';
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
        durationInFrames={MOBILE_DURATION}
        fps={60}
        width={1080}
        height={1440}
      />
      <Composition
        id="DraperMeetScene"
        component={MeetScene}
        durationInFrames={MEET_DURATION}
        fps={60}
        width={1440}
        height={1080}
      />
      <Composition
        id="DraperHeroLaunch"
        component={Hero}
        defaultProps={{launch: true}}
        durationInFrames={LAUNCH_DURATION}
        fps={60}
        width={1440}
        height={1080}
      />
      <Composition
        id="DraperOutro"
        component={Outro}
        durationInFrames={OUTRO_DURATION}
        fps={60}
        width={1440}
        height={1080}
      />
      <Still id="SocialCard" component={SocialCard} width={1200} height={630} />
    </>
  );
};
