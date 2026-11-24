import type { Quest } from './types';

/**
 * Education and experience, shown as a quest log on the corkboard.
 */
export const quests: Quest[] = [
  {
    id: 'degree',
    type: 'education',
    title: 'B.Sc. in Computer Science & Engineering',
    org: 'Daffodil International University',
    start: 'Jan 2023',
    end: 'Apr 2027 (expected)',
    location: 'Dhaka, Bangladesh',
    summary: 'Final-year student focusing on interactive software, graphics and user experience. CGPA 3.16 / 4.00.',
    objectives: [
      'Coursework: Software Quality Assurance, Human-Computer Interaction, Computer Graphics, Web Computing, Database Systems, Algorithms, Data Structures.',
      'Capstone: SMART-LIFE INCLUSION, an AR navigation and daily-living guidance app.',
    ],
  },
  {
    id: 'apex',
    type: 'work',
    title: 'Junior Business Analyst',
    org: 'APEX DMIT Limited',
    start: 'Jan 2025',
    end: 'Jan 2026',
    location: 'Dhaka, Bangladesh (U.S. operations)',
    summary: 'Joined through the DIU × APEX CareerLeap industry–academia programme, coordinating U.S.-based property preservation and maintenance workflows.',
    objectives: [
      'Kept documentation accurate and tasks on time across operational teams.',
      'Ran daily follow-ups with international stakeholders and cleared workflow bottlenecks.',
      'Met strict SLAs and quality benchmarks; Townhall Achiever Award (Q3 2025) for hitting 100% of assigned targets.',
    ],
  },
  {
    id: 'careerleap',
    type: 'award',
    title: 'Selected for DIU × APEX CareerLeap',
    org: 'Daffodil International University × APEX DMIT',
    start: '2025',
    summary: 'One of 7 candidates selected from about 800 applicants after a 6-month assessment process.',
  },
  {
    id: 'cpc',
    type: 'award',
    title: 'Take Off Programming Contest — Top 100 finalist',
    org: 'DIU Computer Programming Club',
    start: 'DIU',
    summary: 'Advanced through the preliminary rounds and placed among the top 100 finalists.',
  },
  {
    id: 'music-club',
    type: 'leadership',
    title: 'Accountant / Treasurer & Senior Executive Member',
    org: 'MCPSC Music Club, Mirpur Cantonment Public School and College',
    start: '2019',
    end: '2021',
    location: 'Dhaka, Bangladesh',
    summary: 'Ran the club’s money and the logistics behind its events.',
    objectives: ['Managed budgets, tracked income and expenses, and handled venue booking, vendor negotiations, invoicing and financial reporting.'],
  },
  {
    id: 'hsc',
    type: 'education',
    title: 'Higher Secondary Certificate (Science)',
    org: 'Mirpur Cantonment Public School and College',
    start: '2021',
    summary: 'GPA 4.83 / 5.00.',
  },
  {
    id: 'python-cert',
    type: 'certification',
    title: 'Python Programming Full Course for Beginners',
    org: 'Udemy',
    start: '2023',
    summary: 'Completed a foundational Python programming certification.',
  },
];
