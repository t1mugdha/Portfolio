import type { CharacterSheet, Interest, Profile, SocialLink } from './types';

export const profile: Profile = {
  name: 'Tahmidul Islam Mugdha',
  handle: 'MUGDHA',
  role: 'Computer Science student · aspiring software & game developer',
  city: 'Bangladesh',
  // Used for the live clock in the corner. Change if you're elsewhere.
  timeZone: 'Asia/Dhaka',
  availability: 'Open to internships and early-career roles',
  intro:
    'Final-year CSE student who builds interactive 3D, games and front-end experiences — with a year of real-world operations work behind me.',
  email: 'tahmidulmugdha2@gmail.com',
  cvPath: '/cv/cv.pdf',
};

export const character: CharacterSheet = {
  className: 'CSE student · interactive 3D & UI/UX',
  origin: 'Dhaka, Bangladesh',
  mainQuest: 'Build games and interactive worlds that feel as good to play as they look — starting with an internship or junior role in game, front-end or interactive development.',
  bio: [
    'I’m a final-year Computer Science & Engineering student at Daffodil International University. I like the part of software you can see and touch: 3D scenes, game feel, interfaces that react the way you expect them to.',
    'Before this room existed, I spent a year as a Junior Business Analyst on U.S. property-preservation operations. It taught me the unglamorous superpowers: clear follow-ups, tidy documentation and hitting targets every week.',
    'These days I bounce between Blender, Unity and React — modelling props, rigging characters and building AR for my capstone. This portfolio is all of that in one room: click around, poke the duck.',
  ],
  traits: [
    'Has more skills than inventory slots — still working out when to equip which one, and still levelling them all up anyway.',
    'Business-analyst brain: will turn a messy workflow into a checklist before lunch.',
    'Opens Blender to fix one thing, closes it three hours later with a new rig.',
    'Speaks Bengali and English, gets by in Hindi, and is collecting Japanese and German one word at a time.',
  ],
  photo: { src: '/photo.webp', alt: 'Portrait of Tahmidul Islam Mugdha, smiling, in glasses and a navy blazer' },
};

export const interests: Interest[] = [
  { id: 'games', title: 'Games & interactive worlds', note: 'How games teach without explaining — feedback, pacing, the small response that makes a control feel right.' },
  { id: 'anime', title: 'Anime & visual storytelling', note: 'Framing and composition. One good panel can carry a whole mood; it shapes how I think about layout.' },
  { id: 'design', title: 'Design experiments', note: 'Small UI and visual experiments that don’t need to be anything — just a way to try an idea.' },
  { id: 'making', title: 'Learning by making', note: 'I pick up new tools by building something small with them. This room is one of those.' },
];

export const social: SocialLink[] = [
  { label: 'GitHub', url: 'https://github.com/t1mugdha', handle: 'github.com/t1mugdha' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/t1mugdha/', handle: 'linkedin.com/in/t1mugdha' },
  { label: 'ArtStation', url: 'https://www.artstation.com/t1mugdha', handle: 'artstation.com/t1mugdha' },
];

/** Things the rubber duck says when you click it. Keep them light. */
export const duckLines: string[] = [
  'Quack. Have you tried explaining it to me?',
  'I’ve reviewed your code. It’s… a choice.',
  'Hydrate. The fridge is right there.',
  'Fun fact: I am the senior engineer here.',
  'git commit -m "quack"',
  'Press the arcade. I dare you.',
  'It works on my desk.',
  'I don’t debug. I just listen. Loudly.',
];
