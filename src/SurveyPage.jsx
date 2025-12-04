import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css"; // v2.x
import { submitSurvey } from "./Api";
import { checkUidExists } from "./Api";

// Helper: prefer ?uid=... then fallback to localStorage
function useUid() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const qUid = params.get("uid");
  const lsUid = localStorage.getItem("survey_uid");
  return qUid || lsUid || "";
}

export default function SurveyPage() {
  const uid = useUid();
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Utility: insert a “break page” after a given page name
  function injectBreakPage(json, afterPageName, breakName, heading, message) {
    if (!json?.pages?.length) return;
    const idx = json.pages.findIndex((p) => p.name === afterPageName);
    if (idx === -1) return;

    const htmlName = `${breakName}_html`;
    const page = {
      name: breakName,
      title: heading,
      // simple HTML page with our own CTA button
      elements: [
        {
          type: "html",
          name: htmlName,
          html: `
            <div class="section-break">
              <h2 style="margin-top:0">${heading}</h2>
              <p style="margin:8px 0 20px">${message}</p>
              <button id="${breakName}-btn" type="button" style="
                padding:12px 18px;
                border:0;border-radius:10px;
                font-weight:700;cursor:pointer;
              ">
                Ready for next section
              </button>
            </div>
          `,
        },
      ],
      // keep navigation visible if you want both options; we’ll hide via CSS below
      // navigationButtonsVisibility: "hide" // (works in newer builds; if unsure, use CSS hide below)
    };

    // insert right after the “afterPageName” page
    json.pages.splice(idx + 1, 0, page);
  }

  // Load JSON and inject break pages
  useEffect(() => {
    if (!uid) {
      alert("Unique ID missing. Please start from the landing page.");
      navigate("/");
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/survey.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load survey.json");
        const j = await res.json();
        const clone = JSON.parse(JSON.stringify(j));

        // Insert “you finished Section A” between A2 -> B1
        injectBreakPage(
          clone,
          "A2",
          "A_BREAK",
          "Section A complete 🎉",
          "Take a breather! When you’re ready, click the button below to start Section B."
        );

        // Insert “you finished Section B” between B2 -> C1
        injectBreakPage(
          clone,
          "B2",
          "B_BREAK",
          "Section B complete 🙌",
          "Nice progress so far. Click below when you’re ready to begin Section C."
        );

        if (!cancelled) setSchema(clone);
      } catch (e) {
        if (!cancelled) setError(e.message || "Error loading survey");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, navigate]);

  const model = useMemo(() => {
    if (!schema) return null;
    const m = new Model(schema);

    // labels (fallbacks if not present in JSON)
    if (!schema.pageNextText) m.pageNextText = "Next subsection";
    if (!schema.completeText) m.completeText = "Submit";

    // Handle submission
    m.onComplete.add(async (sender, options) => {
      try {
        await submitSurvey({ uid, answers: sender.data });
        options.showSaveInProgress();
        options.showSaveSuccess("Thanks! Your response has been recorded.");
      } catch (e) {
        console.error(e);

        const trimmed = uid.trim();
        if (!trimmed) return alert("Please enter your Unique ID.");

        const exists = await checkUidExists(trimmed);

        if (exists) {
          options.showSaveError(
            "Our records show that you have already completed this survey. Thank you!"
          );
          return;
        } else {
          options.showSaveError(
            e.message || "Submission failed. Please try again later."
          );
        }
      }
    });

    // Wire the custom “Ready for next section” buttons
    m.onAfterRenderQuestion.add((sender, options) => {
      // only our HTML “break” questions contain the button
      const el = options?.htmlElement;
      if (!el) return;

      const btn = el.querySelector('button[id$="-btn"]');
      if (btn) {
        btn.onclick = () => sender.nextPage();
      }
      // 🔍 make A2_Q8 description clickable
      if (options.question?.name === "A2_Q8") {
        const desc = el.querySelector(".sd-question__description");
        if (desc) {
          desc.innerHTML =
            "To know more about what you can do with “My Activity”, you may check: " +
            "<a href='https://support.google.com/accounts/answer/7028918' target='_blank'>" +
            "support.google.com/accounts/answer/7028918</a>";
        }
      }
    });

    // (Optional) add a body class on break pages to hide default footer buttons
    const BREAK_PAGES = new Set(["A_BREAK", "B_BREAK"]);
    const updateBodyClass = () => {
      if (BREAK_PAGES.has(senderCurrentPageName(m))) {
        document.body.classList.add("break-page");
      } else {
        document.body.classList.remove("break-page");
      }
    };
    const senderCurrentPageName = (sender) => sender?.currentPage?.name || "";
    m.onCurrentPageChanged.add(updateBodyClass);
    // run once on init
    updateBodyClass();

    return m;
  }, [schema, uid]);

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Loading survey…</h2>
          <p className="muted">
            ID: <b>{uid || "—"}</b>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>Survey</h2>
          <p className="muted">
            ID: <b>{uid}</b>
          </p>
          <p style={{ color: "salmon" }}>Error: {error}</p>
          <button onClick={() => location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!model) return null;

  return (
    <div className="container">
      <div className="card">
        <h2>Survey</h2>
        {/* <p className="muted">
          ID: <b>{uid}</b>
        </p> */}
        <Survey model={model} />
      </div>
    </div>
  );
}
