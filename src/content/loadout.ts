import type { LoadoutGroup } from './types';

/**
 * Skills, shown as an inventory on the gear wall.
 * No percentage bars, no "rarity" — deliberately.
 */
export const loadout: LoadoutGroup[] = [
  {
    id: 'languages',
    title: 'Languages',
    icon: '⌘',
    slots: [
      { name: 'TypeScript', note: 'This portfolio' },
      { name: 'JavaScript', note: 'Web projects and this portfolio' },
      { name: 'C#', note: 'Unity scripting for the SMART-LIFE INCLUSION AR app' },
      { name: 'Python', note: 'Blender scripting for this room; Udemy certification' },
      { name: 'C / C++', note: 'Glitched Server (OpenGL horror game); programming contests' },
    ],
  },
  {
    id: 'web',
    title: 'Front-end & web',
    icon: '◧',
    slots: [
      { name: 'React', note: 'UI and panels of this portfolio' },
      { name: 'HTML5 & CSS3', note: 'Every web project, including this one' },
      { name: 'Three.js & React Three Fiber', note: 'The 3D room you’re standing in' },
      { name: 'Web Audio API', note: 'Synthesized sound effects and music here' },
    ],
  },
  {
    id: 'frameworks',
    title: 'Engines & frameworks',
    icon: '⚙',
    slots: [
      { name: 'Unity', note: 'SMART-LIFE INCLUSION capstone' },
      { name: 'Vuforia SDK', note: 'AR tracking in the capstone app' },
      { name: 'OpenGL & FreeGLUT', note: 'Real-time rendering in Glitched Server' },
      { name: 'Vite', note: 'Build tool for this portfolio' },
    ],
  },
  {
    id: 'data',
    title: 'Data & back-end',
    icon: '▤',
    slots: [
      { name: 'SQL / MySQL', note: 'Database Systems coursework and a multi-role web app' },
      { name: 'Firebase', note: 'Shared data for the capstone app and portal' },
      { name: 'Node.js', note: 'Tooling and asset scripts for this site' },
    ],
  },
  {
    id: 'design',
    title: 'Design & 3D',
    icon: '✎',
    slots: [
      { name: 'Blender', note: 'Modelling, Python API and Cycles light baking — this room, the capstone guide character' },
      { name: 'Live2D', note: 'Rigging an original face-tracked character' },
      { name: 'Krita', note: 'Illustration and layered character art' },
      { name: 'UI/UX design', note: 'Capstone front-end architecture; this portfolio' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & workflow',
    icon: '⚒',
    slots: [
      { name: 'Git & GitHub', note: 'Version control for projects' },
      { name: 'VS Code', note: 'Daily editor' },
      { name: 'AI-assisted workflows (Claude)', note: 'Rapid prototyping, Blender scripting and testing for this site' },
      { name: 'QA & accessibility testing', note: 'Software QA coursework; reduced-motion and fallback testing here' },
    ],
  },
  {
    id: 'people',
    title: 'Operations & people',
    icon: '☺',
    slots: [
      { name: 'Stakeholder coordination', note: 'Daily follow-ups with U.S. stakeholders at APEX DMIT' },
      { name: 'Documentation', note: 'Workflow records at APEX; budgets and reports for the music club' },
      { name: 'Teamwork', note: 'Cross-functional ops teams; capstone team' },
    ],
  },
  {
    id: 'learning',
    title: 'Currently grinding',
    icon: '↑',
    slots: [
      { name: 'Game development', note: 'Pushing further into Unity and game feel', level: 'learning' },
      { name: 'Japanese & German', note: 'One word at a time', level: 'learning' },
    ],
  },
];
