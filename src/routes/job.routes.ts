import express = require('express');
import type { Request, Response } from 'express';
import jobMatchService = require('../services/jobMatch.service');
import type { CandidateProfile, JobMatchRequest, JobPosting } from '../types/job.types';

const router = express.Router();
const { matchJobs } = jobMatchService;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isValidExperience(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

function isCandidateProfile(value: unknown): value is CandidateProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as CandidateProfile;
  return isStringArray(candidate.skills) && isValidExperience(candidate.experienceYears);
}

function isJobPosting(value: unknown): value is JobPosting {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const job = value as JobPosting;
  return (
    typeof job.id === 'string' &&
    job.id.trim().length > 0 &&
    typeof job.title === 'string' &&
    job.title.trim().length > 0 &&
    isStringArray(job.skills) &&
    isValidExperience(job.experienceYears)
  );
}

function isJobMatchRequest(value: unknown): value is JobMatchRequest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as JobMatchRequest;
  return isCandidateProfile(payload.candidate) && Array.isArray(payload.jobs) && payload.jobs.every(isJobPosting);
}

router.post('/match', (req: Request, res: Response) => {
  if (!isJobMatchRequest(req.body)) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: 'Expected candidate.skills and jobs[].skills as string arrays, with optional non-negative experienceYears.',
    });
  }

  return res.json({ matches: matchJobs(req.body.candidate, req.body.jobs) });
});

export = router;