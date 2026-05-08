import type { CandidateProfile, JobMatchResult, JobPosting } from '../types/job.types';

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

function uniqueNormalizedSkills(skills: string[]): Set<string> {
  return new Set(skills.map(normalizeSkill).filter(Boolean));
}

function matchJobs(candidate: CandidateProfile, jobs: JobPosting[]): JobMatchResult[] {
  const candidateSkills = uniqueNormalizedSkills(candidate.skills);

  return jobs
    .map((job) => {
      const jobSkills = uniqueNormalizedSkills(job.skills);
      const matchedSkills = [...jobSkills].filter((skill) => candidateSkills.has(skill));
      const skillScore = jobSkills.size === 0 ? 0 : matchedSkills.length / jobSkills.size;
      const experienceScore =
        typeof job.experienceYears === 'number' && typeof candidate.experienceYears === 'number'
          ? Math.min(candidate.experienceYears / Math.max(job.experienceYears, 1), 1)
          : 1;

      return {
        jobId: job.id,
        title: job.title,
        score: Number(((skillScore * 0.8 + experienceScore * 0.2) * 100).toFixed(2)),
        matchedSkills,
      };
    })
    .sort((first, second) => second.score - first.score);
}

export = { matchJobs };