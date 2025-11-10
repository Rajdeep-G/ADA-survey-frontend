export async function submitSurvey({ uid, answers }) {
  const payload = {
    uid,
    answers,
    surveyVersion: "v1",
    metadata: {
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString()
    }
  }

  const res = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Submission failed')
  }
}

export async function checkUidExists(uid) {
  const res = await fetch(`/api/check/${uid}`)
  const data = await res.json()
  return data.exists
}
