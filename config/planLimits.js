const PLAN_LIMITS = {
  starter: {
    documents_per_month: 25,
    ai_calls_per_month: 50,
    saved_profiles: 3,
  },

  business: {
    documents_per_month: 250,
    ai_calls_per_month: 500,
    saved_profiles: 20,
  },

  professional: {
    documents_per_month: 2000,
    ai_calls_per_month: 5000,
    saved_profiles: 100,
  },
};

// 👇 DEFAULT LIMITS FOR UNPAID USERS
const DEFAULT_LIMITS = {
  documents_per_month: 5,
  saved_profiles: 1,
};

module.exports = { PLAN_LIMITS, DEFAULT_LIMITS };
