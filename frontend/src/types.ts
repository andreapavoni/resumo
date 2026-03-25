export interface Resume {
  basics?: Basics;
  work?: Work[];
  education?: Education[];
  skills?: Skill[];
}

export interface Basics {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: Location;
}

export type Theme = "classic" | "modern";

export interface Location {
  city?: string;
  region?: string;
  countryCode?: string;
}

export interface Work {
  name?: string;
  location?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

export interface Education {
  institution?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
}

export interface Skill {
  name?: string;
  level?: string;
  keywords?: string[];
}
