/** Shapes of the content in this folder. */

export interface Profile {
  name: string;
  /** Short handle used on the boot screen and HUD. */
  handle: string;
  role: string;
  city: string;
  /** IANA time zone for the HUD clock, e.g. "Asia/Dhaka". */
  timeZone: string;
  /** Only shown when set. Keep it true. */
  availability?: string;
  intro: string;
  email: string;
  cvPath: string;
}

export interface CharacterSheet {
  className: string;
  origin: string;
  mainQuest: string;
  bio: string[];
  /** Short facts, each one line. Shown as "traits". */
  traits: string[];
  photo?: { src: string; alt: string };
}

export type ProjectStatus = 'completed' | 'in-progress' | 'prototype' | 'archived';

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  status: ProjectStatus;
  year?: string;
  role: string;
  team?: string;
  stack: string[];
  /** The four README-style blocks shown in the case study. */
  why: string;
  what: string[];
  how: string[];
  decisions?: string[];
  learned?: string;
  /** Screenshot/poster in /public/projects/<slug>/ */
  poster?: { src: string; alt: string };
  /** .mp4/.webm in /public or a YouTube/Vimeo embed URL */
  video?: string;
  repoUrl?: string;
  liveUrl?: string;
  /** Short label for the cartridge on the monitor (max ~15 characters). */
  cartridge?: string;
  /** Cartridge colour on the level-select screen. */
  color: string;
  hidden?: boolean;
}

export type QuestType = 'education' | 'work' | 'internship' | 'volunteering' | 'leadership' | 'award' | 'certification';

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  org: string;
  start: string;
  end?: string;
  location?: string;
  summary: string;
  objectives?: string[];
  hidden?: boolean;
}

export interface LoadoutSlot {
  name: string;
  /** Where/how it's been used. One line. */
  note?: string;
  /** Optional, only if you choose to state it. */
  level?: 'comfortable' | 'familiar' | 'learning';
}

export interface LoadoutGroup {
  id: string;
  title: string;
  icon: string;
  slots: LoadoutSlot[];
}

export interface Interest {
  id: string;
  title: string;
  note: string;
}

export interface SocialLink {
  label: string;
  /** Empty string = hidden on the live site. */
  url: string;
  handle: string;
}
