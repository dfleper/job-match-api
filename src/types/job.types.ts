export interface CandidateProfile {
  skills: string[];
  experienceYears?: number;
}

export interface JobPosting {
  id: string;
  title: string;
  skills: string[];
  experienceYears?: number;
}

export interface JobMatchRequest {
  candidate: CandidateProfile;
  jobs: JobPosting[];
}

export interface JobMatchResult {
  jobId: string;
  title: string;
  score: number;
  matchedSkills: string[];
}