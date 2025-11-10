import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkUidExists } from "./Api";
export default function Landing() {
  const [uid, setUid] = useState('')
  const navigate = useNavigate()

  const onStart = async (e) => {
  e.preventDefault();
  const trimmed = uid.trim();
  if (!trimmed) return alert("Please enter your Unique ID.");

  const exists = await checkUidExists(trimmed);

  if (exists) {
    alert("Our records show that you have already completed this survey. Thank you!");
    return;
  }
  localStorage.setItem("survey_uid", trimmed);
  navigate(`/survey?uid=${encodeURIComponent(trimmed)}`);
};

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome to the Survey</h1>

      

        <h2>Dear Participant,</h2>

            <p>
              Today, a wide range of online services offered by Google—such as Search, YouTube,
              Maps, Chrome, and others—collect and store detailed records of users’ digital
              activities to improve personalization and service quality.
            </p>

            <p>
              We are a group of academic researchers conducting this study to understand how
              users feel about different aspects of the <strong>Google “My Activity” dashboard</strong>,
              a central platform where users can view, manage, and delete the activity data
              associated with their Google Account. You may explore the dashboard here:&nbsp;
              <a href="https://myactivity.google.com/" target="_blank" rel="noopener noreferrer">
                https://myactivity.google.com/
              </a>
            </p>

            <p>
              The goal of our study is to raise awareness about the types of activity data Google
              collects across its services, how users perceive the <strong>sensitivity</strong> of such stored
              data, and the extent to which users feel in control of their digital traces.
              Please read the instructions carefully and answer all questions thoughtfully.
              This survey will take approximately <strong>XXX minutes</strong> to complete.
            </p>

            <p>
              Throughout the survey, you will be asked questions in the context of the
              <strong>Google Account and device you use most often</strong>, unless stated otherwise.
              The term <strong>“sensitive”</strong> will be used to refer to sensitive personal information stored
              within your Google “My Activity” dashboard. Sensitive personal information refers
              to data a person may prefer to keep private. This may include personal data revealing racial or ethnic origin, 
              political opinions, religious or philosophical beliefs, biometric or health-related information, financial
               information, sexual orientation, or any personal activity that could cause discomfort, embarrassment, harm, or 
               privacy risks if exposed. Loss, misuse, modification, or unauthorized access to such information can adversely 
               affect the privacy or welfare of an individual depending on the level of sensitivity and nature of the information.
            </p>

            <p>
              The responses collected from this survey will be used <strong>strictly for academic research</strong>
              to understand the challenges users face when managing their data through the
              Google “My Activity” dashboard and to help design better tools for improving
              privacy awareness and user control.
              <br />
              We will only collect <strong>interaction logs with the extension</strong>. No personally identifiable
              information will be published in any report or academic publication.
            </p>

            <p>
              If you have any questions regarding the study, please contact:
              <strong> [email-id] </strong>.
            </p>

        <p>Please enter your <b>PROLIFIC ID</b> to begin.</p>       
        <form onSubmit={onStart} className="form">
          <input
            type="text"
            placeholder="P1234"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
          <button type="submit">Start Survey</button>
        </form>
        <p className="muted">
          Your responses are saved anonymously under this prolific ID
        </p>
      </div>
    </div>
  )
}
