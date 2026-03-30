// App identity
export const APP_NAME = 'NightShift';
export const APP_TAGLINE = 'Reach the right client at the right time.';
export const APP_DESCRIPTION = 'AI-powered client outreach for freelancers working across timezones.';

// AI generation config — adjust these to tune output quality
export const AI_CONFIG = {
  // Max words for generated email drafts
  draftWordLimit: parseInt(process.env.DRAFT_WORD_LIMIT || '120'),

  // Max words for generated email drafts
  emailSubjectLimit: parseInt(process.env.EMAIL_SUBJECT_LIMIT || '8'),

  // Number of previously sent messages to include as context
  sentHistoryLimit: parseInt(process.env.SENT_HISTORY_LIMIT || '3'),

  // Number of previous drafts to show in the history panel
  draftHistoryLimit: parseInt(process.env.DRAFT_HISTORY_LIMIT || '10'),

  // Freelancer name used in email sign-offs
  freelancerName: process.env.FREELANCER_NAME || 'Your Freelancer',
};
