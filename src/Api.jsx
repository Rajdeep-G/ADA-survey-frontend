const BASE = import.meta.env.VITE_SURVEY_API_URL?.replace(/\/$/, "") ?? "";

async function _post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

async function _get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// Landing: has this prolific_id already submitted?
export async function checkUidExists(prolificId) {
  try {
    const data = await _get(`/survey/check?prolific_id=${encodeURIComponent(prolificId)}`);
    return data.exists === true;
  } catch {
    // return false; // fail open — let them proceed
    console.error("Error checking UID existence");
  }
}

// Landing: record participant arrival
export async function startSurvey(prolificId) {
  return _post("/survey/start", { prolific_id: prolificId });
}

// SurveyPage: save progress after each subsection
export async function saveProgress(prolificId, subsection, answers) {
  return _post("/survey/progress", {
    prolific_id: prolificId,
    subsection,
    answers,
  });
}

// SurveyPage: verify ADA code after subsection 6
export async function verifyCode(prolificId, code) {
  return _post("/survey/verify-code", {
    prolific_id: prolificId,
    code,
  });
}

// SurveyPage: final submission after subsection 9
export async function submitSurvey({ uid, answers }) {
  return _post("/survey/submit", {
    prolific_id: uid,
    answers,
  });
}