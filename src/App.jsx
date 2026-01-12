import React, { useState } from "react";
import "./App.css";
// import getFeedback from "./feedback.js";

// Replace with your Apps Script Web App URL
const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbxQCYgKrkmzOI_oSKIkQa7esAcIaESx9e943AvR2Fthj61FtakwQL7KBcXyHxE1UEW79g/exec";

async function saveLead(name, email, answers,results) {
  // Send URL-encoded form data (simple request → no preflight)
  // Build a payload (URL-encoded to avoid preflight)
  const payload = new URLSearchParams({
    name,
    email,
    source: "Relationship Reflection Quiz",
    userAgent: navigator.userAgent,
    // ip: include if you fetch one client-side
    
    // Store answers as JSON string (easy to parse in Apps Script)
    answers: JSON.stringify(answers),
    // Optional: store computed results too
    tags: JSON.stringify(results?.tags || []),
    chapters: JSON.stringify(results?.chapters || []),
    messages: JSON.stringify(results?.messages || [])
  });

  const res = await fetch(LEAD_ENDPOINT, {
    method: "POST",
    body: payload // IMPORTANT: no headers; let the browser set Content-Type
  });

  // Optional: read JSON response from Apps Script
  let json = {};
  try { json = await res.json(); } catch (_) {}
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || `Lead save failed (status ${res.status})`);
  }
}


const questions = [
  /* questions will be inserted later */
 {
      question: "When you think about marriage, what emotion shows up most often?",
      image: "/images/q1.png",   
      options: [
        "Fear of making the wrong choice",
        "Anxiety about whether it will ever happen",
        "Hope mixed with peace",
        "Pressure to “figure it out quickly"
      ],
      type: "single"
    },
    {
      question: "How would you describe your relationship history right now?",
      image: "/images/q2.png",  
      options: [
        "I’m still affected by past heartbreak",
        "I’ve healed, but I’m cautious",
        "I’ve fully healed and feel emotionally free",
        "I try not to think about the past at all"
      ],
      type: "single"
    },
    {
      question: "When making relationship decisions, what guides you most?",
      image: "/images/q3.png",   
      options: [
        "My emotions and chemistry",
        "Advice from others",
        "Prayer and inner peace",
        "Timing and pressure"
      ],
      type: "single"
    },
    {
      question: "How involved is prayer in your search for a spouse?",
      image: "/images/q4.png",   
      options: [
        "I pray occasionally",
        "I pray only when I feel worried",
        "I intentionally pray and seek God’s guidance",
        "I struggle to know how to pray about it"
      ],
      type: "single"
    },
    {
      question: "How open are you to meeting potential partners?",
      image: "/images/q5.png",   
      options: [
        "I prefer to leave it entirely to God",
        "I’m open but unsure where to start",
        "I actively engage in healthy opportunities",
        "I avoid connections due to fear or disappointment"
      ],
      type: "single"
    },
    {
      question: "How do you feel about receiving recommendations or advice?",
      image: "/images/q6.png",   
      options: [
        "I prefer to decide alone",
        "I listen but rarely act on advice",
        "I value wise counsel",
        "I feel uncomfortable with recommendations"
      ],
      type: "single"
    },
    {
      question: "What is your main focus right now?",
      image: "/images/q7.png",   
      options: [
        "Finding the right man",
        "Healing and personal growth",
        "Building my purpose and identity",
        "Waiting and trusting God"
      ],
      type: "single"
    },
    {
      question: "Which statement resonates most with you?",
      image: "/images/q8.png",   
      options: [
        "Marriage will complete me",
        "Marriage is a partnership, not a solution",
        "I fear marriage may limit me",
        "I haven’t thought deeply about it"
      ],
      type: "single"
    },
    {
      question: "How do you approach self-presentation?",
      image: "/images/q9.png",   
      options: [
        "I dress to attract attention",
        "I dress modestly but without confidence",
        "I present myself with dignity and confidence",
        "I struggle to find balance"
      ],
      type: "single"
    },
    {
      question: "If a man shows interest but doesn’t commit, what do you usually do?",
      image: "/images/q10.png",   
      options: [
        "Wait and hope he proposes",
        "Confront him immediately",
        "Set boundaries and seek clarity",
        "Feel confused and emotionally drained"
      ],
      type: "single"
    }
  ];

  // For each question index, map option text -> tag
const TAGS_BY_QUESTION = {
  0: { // Q1
    "Fear of making the wrong choice": "Emotional Healing & Fear",
    "Anxiety about whether it will ever happen": "Loneliness & Emotional Strain",
    "Hope mixed with peace": "Healthy Alignment",
    "Pressure to “figure it out quickly": "Pressure from Others"
  },
  1: { // Q2
    "I’m still affected by past heartbreak": "Emotional Healing",
    "I’ve healed, but I’m cautious": "Partial Healing",
    "I’ve fully healed and feel emotionally free": "Healthy Readiness",
    "I try not to think about the past at all": "Avoidance / Unresolved Hurt"
  },
  2: { // Q3
    "My emotions and chemistry": "Emotion-led",
    "Advice from others": "External Voices",
    "Prayer and inner peace": "Discerning God’s Will",
    "Timing and pressure": "Pressure-driven"
  },
  3: { // Q4
    "I pray occasionally": "Inconsistent Prayer",
    "I pray only when I feel worried": "Reactive Prayer",
    "I intentionally pray and seek God’s guidance": "Strong Spiritual Foundation",
    "I struggle to know how to pray about it": "Need for Guidance"
  },
  4: { // Q5
    "I prefer to leave it entirely to God": "Passive Waiting",
    "I’m open but unsure where to start": "Unclear Process",
    "I actively engage in healthy opportunities": "Healthy Engagement",
    "I avoid connections due to fear or disappointment": "Fear-based Withdrawal"
  },
  5: { // Q6
    "I prefer to decide alone": "Isolation",
    "I listen but rarely act on advice": "Selective Listening",
    "I value wise counsel": "Wise Engagement",
    "I feel uncomfortable with recommendations": "Emotional Guarding"
  },
  6: { // Q7
    "Finding the right man": "External Focus",
    "Healing and personal growth": "Emotional Readiness",
    "Building my purpose and identity": "Strong Preparation",
    "Waiting and trusting God": "Passive Trust"
  },
  7: { // Q8
    "Marriage will complete me": "Unrealistic Expectations",
    "Marriage is a partnership, not a solution": "Healthy Mindset",
    "I fear marriage may limit me": "Fear-based Thinking",
    "I haven’t thought deeply about it": "Undefined Beliefs"
  },
  8: { // Q9
    "I dress to attract attention": "Attention-Driven",
    "I dress modestly but without confidence": "Low Confidence",
    "I present myself with dignity and confidence": "Healthy Self-Worth",
    "I struggle to find balance": "Need for Guidance"
  },
  9: { // Q10
    "Wait and hope he proposes": "Passive Waiting",
    "Confront him immediately": "Reactive",
    "Set boundaries and seek clarity": "Healthy Boundaries",
    "Feel confused and emotionally drained": "Emotional Confusion"
  }
};

// If they choose     "Pressure to “figure it out quickly": "Pressure from Others"
// for question 1 then I should point them up to chapter 4 as well
// 
// "I pray occasionally",
 //       "I pray only when I feel worried",
 //       "I struggle to know how to pray about it"
// Personalized rules that trigger messages + chapter recommendations
const RULES = [
  {
    id: "q1_fear_anxiety",
    when: (answers) => answers[0] === "Fear of making the wrong choice" ||
                      answers[0] === "Anxiety about whether it will ever happen",
    message:
      "Fear and anxiety may be shaping your expectations. God desires to lead you from peace, not pressure or fear.",
    chapters: ["Chapter 1 (Fear)", "Chapter 2 (Loneliness)"]
  },
  {
    id: "q2_unhealed",
    when: (answers) => answers[1] === "I’m still affected by past heartbreak" ||
                      answers[1] === "I try not to think about the past at all",
    message:
      "Unhealed wounds can quietly shape who we attract and how we respond to love.",
    chapters: ["Chapter 3 (Hurt from Past Love Relationships)"]
  },
  {
    id: "q3_emotion_pressure",
    when: (answers) => answers[2] === "My emotions and chemistry" ||
                      answers[2] === "Timing and pressure",
    message:
      "God’s will is often confirmed through peace, not urgency or emotional highs.",
    chapters: ["Chapter 6 (Identifying God’s Will)"]
  },
  {
    id: "q4_prayer",
    when: (answers) => answers[3] === "I pray only when I feel worried" ||
                      answers[3] === "I struggle to know how to pray about it" ||
                      answers[3] ===  "I pray occasionally",
    message:
      "Prayer is not a last resort; it’s the foundation of clarity and peace.",
    chapters: ["Chapter 7 (The Role of Prayer)", "Chapter 8 (Real-Life Stories)"]
  },
  {
    id: "q5_connections",
    when: (answers) => answers[4] === "I prefer to leave it entirely to God" ||
                      answers[4] === "I avoid connections due to fear or disappointment",
    message:
      "Faith includes action. God often works through connections and community.",
    chapters: ["Chapter 9 (Circles of Connection)"]
  },
  {
    id: "q6_wise_voices",
    when: (answers) => answers[5] === "I prefer to decide alone" ||
                      answers[5] === "I feel uncomfortable with recommendations",
    message:
      "God often uses trusted voices to protect and guide us.",
    chapters: ["Chapter 10 (Opening Up & Wise Voices)"]
  },
  {
    id: "q7_external_focus",
    when: (answers) => answers[6] === "Finding the right man",
    message:
      "Preparation attracts healthy love more than pursuit ever could.",
    chapters: ["Chapter 13 (Becoming the Woman He Wants to Marry)"]
  },
  {
    id: "q8_mindset",
    when: (answers) => answers[7] === "Marriage will complete me" ||
                      answers[7] === "I fear marriage may limit me",
    message:
      "A healthy mindset creates a healthy marriage foundation.",
    chapters: ["Chapter 14 (Right Mindset About Marriage)"]
  },
  {
    id: "q9_presentation",
    when: (answers) => answers[8] === "I dress to attract attention" ||
                      answers[8] === "I struggle to find balance",
    message:
      "How you present yourself communicates your values before words do.",
    chapters: ["Chapter 15 (Look Presentable, Not Seductive)"]
  },
  {
    id: "q10_commitment",
    when: (answers) => answers[9] === "Wait and hope he proposes" ||
                      answers[9] === "Feel confused and emotionally drained",
    message:
      "Clarity protects your heart and time.",
    chapters: ["Chapter 16 (Responding to Proposals)", "Chapter 17 (Interest Without Commitment)"]
  }
];

 function App() {
    // NEW: gate the intro screen
  const [showIntro, setShowIntro] = useState(true);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(questions.map(q => q.type === "multiple" ? [] : ""));
  const [otherAnswers, setOtherAnswers] = useState(questions.map(() => ""));
  const [submitted, setSubmitted] = useState(false);


  // New: track quiz start and user info
  const [quizStarted, setQuizStarted] = useState(false);
  //const [name, setName] = useState("");
  //const [email, setEmail] = useState("");
  //const [formError, setFormError] = useState("");

  // Lead capture (now happens at the end)
  const [showLeadForm, setShowLeadForm] = useState(false);
  //const [leadSaved, setLeadSaved] = useState(false);
  const [savingLead, setSavingLead] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  const currentQuestion = questions[current];
  const isLast = current === questions.length - 1;
  const isFirst = current === 0;

  const handleAnswer = (value, isCheckbox = false) => {
    const newAnswers = [...answers];
    if (isCheckbox) {
      const currentValues = newAnswers[current] || [];
      if (currentValues.includes(value)) {
        newAnswers[current] = currentValues.filter(v => v !== value);
      } else {
        newAnswers[current] = [...currentValues, value];
      }
    } else {
      newAnswers[current] = value;
    }
    setAnswers(newAnswers);

    if (currentQuestion.type === "single" && value !== "Other") {
      setTimeout(() => {
        if (!isLast) {
          setCurrent(prev => prev + 1);
        } else {
          //setSubmitted(true);
          setShowLeadForm(true);
        }
      }, 300);
    }
  };

  const handleOtherChange = (text) => {
    const updated = [...otherAnswers];
    updated[current] = text;
    const updatedAnswers = [...answers];
    if (currentQuestion.type === "multiple") {
      if (!updatedAnswers[current].includes("Other")) {
        updatedAnswers[current] = [...updatedAnswers[current], "Other"];
      }
    } else {
      updatedAnswers[current] = "Other";
    }
    setOtherAnswers(updated);
    setAnswers(updatedAnswers);
  };

  const validateAndNext = () => {
    if (currentQuestion.type === "multiple") {
      if (answers[current].length === 0) {
        alert("Please select at least one option.");
        return;
      }
      if (answers[current].includes("Other") && !otherAnswers[current].trim()) {
        alert("Please specify your 'Other' answer.");
        return;
      }
    }
    if (!isLast) {
      setCurrent(current + 1);
    } else {
      //setSubmitted(true);
      setShowLeadForm(true);
    }
  };

  const displayAnswer = (qIndex) => {
    const ans = answers[qIndex];
    const other = otherAnswers[qIndex];
    if (Array.isArray(ans)) {
      return ans.map(a => a === "Other" ? `Other: ${other}` : a).join(", ");
    } else {
      return ans === "Other" ? `Other: ${other}` : ans;
    }
  };


const startQuiz = () => {
  setQuizStarted(true);
};

// ADD IT RIGHT HERE
const submitLeadAndShowResults = async () => {
  if (!name.trim() || !email.trim()) {
    setFormError("Please enter both name and email to see your results.");
    return;
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    setFormError("Please enter a valid email address.");
    return;
  }

  setFormError("");
  setSavingLead(true);

  try {
    const computed = buildResults(answers); // compute once
    await saveLead(name.trim(), email.trim(), answers, computed);
    setShowLeadForm(false);
    setSubmitted(true);
  } catch (err) {
    console.warn("Lead save failed:", err);
    setFormError("We couldn’t save your details. Please try again.");
  } finally {
    setSavingLead(false);
  }
};

 // const startQuiz = async () => {
 // if (!name.trim() || !email.trim()) {
  //  setFormError("Please enter both name and email to begin.");
  //  return;
 // }

//  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//  if (!emailOk) {
//    setFormError("Please enter a valid email address.");
//    return;
//  }
//  setFormError("");
  
//  setQuizStarted(true);

// saveLead(name.trim(), email.trim()).catch((err) => {
 //   console.warn("Lead save failed:", err);
    // optional: set a non-blocking message somewhere
    // setFormError("We couldn't save your details, but you can continue.");
//  });
//};

const buildResults = (answers) => {
  // Collect tags (unique)
  const tags = [];
  for (let i = 0; i < answers.length; i++) {
    const tag = TAGS_BY_QUESTION[i]?.[answers[i]];
    if (tag) tags.push(tag);
  }
  const uniqueTags = Array.from(new Set(tags));

  // Trigger messages + chapters
  const triggered = RULES.filter(r => r.when(answers));
  const messages = triggered.map(r => r.message);
  const chapters = Array.from(new Set(triggered.flatMap(r => r.chapters)));

  return { tags: uniqueTags, messages, chapters };
};

const results = submitted ? buildResults(answers) : null;

const BrandHeader = () => (
  <div className="brand-header">
    <img
      src={`${import.meta.env.BASE_URL}images/logo.png`}
      alt="Beautiful Marriage Garden"
      className="brand-logo"
    />
    <span className="brand-name">Beautiful Marriage Garden</span>
  </div>
);

const showBrandHeader =
  (showIntro && !quizStarted && !submitted) ||
  (showLeadForm && !submitted) ||
  (submitted && results);

  return (
  
    <div className="App">  
        {showBrandHeader && <BrandHeader />}

     {/* INTRO SCREEN — high-conversion version */}
{showIntro && !quizStarted && !submitted && (
  <section className="intro">

    <h1 className="intro-title">Single and Searching?</h1>
    <h1 className="intro-title">You’re not behind.</h1>
    <h2 className="intro-subtitle">
      Discover what may be holding you back — and what God is preparing you for next.
    </h2>
 <button
      className="primary-btn"
      onClick={() => {
        setShowIntro(false);
        setQuizStarted(true);
      }}
    >
      Take the Quiz
    </button>
    <p className="intro-description">
      Answer 10 quick questions to receive a personalized reflection
      based on where you are emotionally, spiritually, and relationally.
    </p>

    {/* Hero image */}
    <img
      src={`${import.meta.env.BASE_URL}images/cover_page.png`}
      alt="Single and Searching Audiobook"
      className="intro-hero-image"
      loading="eager"
    />

    <p className="intro-meta">
      ⏱ Takes less than 3 minutes • 🙏 Faith-centered • 💛 Private
    </p>
  </section>
)}
          {/* Option B: local/video file (uncomment and remove the iframe if you prefer)
          <video className="video-file" controls playsInline preload="metadata">
            <source src="/intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <button className="primary-btn" onClick={() => setShowIntro(false)}>
            Take the Quiz
          </button> 
            <button className="primary-btn"
            onClick={() => {
              setShowIntro(false);
              setQuizStarted(true);
              }} >
                Take the Quiz
                </button>
        </section>
      )}*/}
      
      

      {/* Start Screen */}
        {/* {!showIntro && !quizStarted && !submitted && !showLeadForm && (
        <div className="start-screen">
          <h1><em>Single and Searching?</em></h1>
          <h2><em>The Ladies Guide To Find A Godly Husband</em></h2>
          <h4>Answer These 10 Questions to Discover What You Need to Work on to Find a Godly Husband.</h4>
          <h4>Get a personalized result based on where you are right now</h4>
           <p>Click below to begin.</p>
             <button onClick={startQuiz}>Start Quiz</button>
        </div>)}

   
       {!showIntro && !quizStarted && !submitted && (
        <div className="start-screen">
          <h2>Welcome to the Relationship Reflection Quiz</h2>
          <p>Please enter your details to begin.</p>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />     
          {formError && <p style={{ color: "red" }}>{formError}</p>}
          <button onClick={startQuiz}>Start Quiz</button>
        </div>
      )} */}


      {/* Quiz Questions */}
      {quizStarted && !submitted && !showLeadForm && (
        <div className="question-container">
          {!isFirst && (
            <button className="back-btn" onClick={() => setCurrent(current - 1)}>
              ← Back
            </button>
          )}

          <h2 className="question-text">{currentQuestion.question}</h2>
          {currentQuestion.image && (
            <img
            src={`${import.meta.env.BASE_URL}${currentQuestion.image.replace(/^\//, "")}`}
            alt={currentQuestion.alt || `Question ${current + 1} illustration`}
            className="question-image"
            loading="lazy"
             />
          )}

          <div className="options">
            {currentQuestion.options.map((opt, i) => {
              const isOther = opt === "Other";
              const isChecked = currentQuestion.type === "multiple"
                ? answers[current].includes(opt)
                : answers[current] === opt;

              return (
                <div key={i}>
                  <label>
                    <input
                      type={currentQuestion.type === "multiple" ? "checkbox" : "radio"}
                      name={`q${current}`}
                      value={opt}
                      checked={isChecked}
                      onChange={() => handleAnswer(opt, currentQuestion.type === "multiple")}
                    />
                    {isOther ? "Other:" : opt}
                  </label>
                  {isOther && isChecked && (
                    <input
                      type="text"
                      value={otherAnswers[current]}
                      onChange={e => handleOtherChange(e.target.value)}
                      placeholder="Please specify"
                    />
                  )}
                </div>
              );
            })}

            {currentQuestion.type === "multiple" && (
              <button className="next-btn" onClick={validateAndNext}>
                {isLast ? "Submit" : "Next"}
              </button>
            )}
          </div>

          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            ></div>
            <p className="progress-label">
              {Math.round(((current + 1) / questions.length) * 100)}% Complete
            </p>
          </div>
        </div>
      )}

{/* Lead Capture (after questions, before results) */}
{showLeadForm && !submitted && (
  <div className="start-screen">
    <h2>Almost done 🎉</h2>
    <p>Enter your details to view your personalized results.</p>

    <input
      type="text"
      placeholder="Your Name"
      value={name}
      onChange={e => setName(e.target.value)}
    />
    <input
      type="email"
      placeholder="Your Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
    />

    {formError && <p style={{ color: "red" }}>{formError}</p>}

    <button onClick={submitLeadAndShowResults} disabled={savingLead}>
      {savingLead ? "Saving..." : "Show My Results"}
    </button>
  </div>
)}


{/* Results */}
{submitted && results && (
  <div className="results">
    <div className="report-card">
      <div className="report-header">
        <div>
          <p className="report-label">Beautiful Marriage Garden • Quiz Report</p>
          <h2 className="report-title">Your Personalized Results</h2>
          <p className="report-subtitle">A snapshot of where you are right now — and what to focus on next.</p>
        </div>

        {/* Optional badge (you can change the label) */}
        <div className="report-badge">
          <div className="badge-top">Status</div>
          <div className="badge-main">In Progress</div>
          <div className="badge-bottom">Growth Season</div>
        </div>
      </div>

      <div className="report-grid">
        <section className="report-section">
          <h3 className="section-title">Tags (Your Current Season)</h3>
          <div className="pill-wrap">
            {results.tags.map((t, i) => (
              <span className="pill" key={i}>{t}</span>
            ))}
          </div>
        </section>

        <section className="report-section">
          <h3 className="section-title">Insight</h3>
          <ul className="bullets">
            {results.messages.length > 0 ? (
              results.messages.map((m, i) => <li key={i}>{m}</li>)
            ) : (
              <li>Thank you for completing the quiz. Keep seeking God’s peace and wisdom in your journey.</li>
            )}
          </ul>
        </section>
        
      <section className="report-section">
  <h3 className="section-title">Recommended Chapters</h3>

  <ol className="chapters">
    {results.chapters.map((c, i) => (
      <li key={i} className="chapter-item">{c}</li>
    ))}
  </ol>

  {/* Audiobook preview */}
  <div className="audiobook-preview">
    <img
      src={`${import.meta.env.BASE_URL}images/phone_book.png`}
      alt="Single and Searching Audiobook"
      className="audiobook-image"
      loading="lazy"
    />

    <p className="audiobook-caption">
      🎧 Prefer to listen? Here’s a short audio introduction to help you reflect on your results.
    </p>

    <audio
      controls
      preload="none"
      className="audiobook-audio"
      src={`${import.meta.env.BASE_URL}audio/intro.mp3`}
    >
      Your browser does not support the audio element.
    </audio>

    <p className="audiobook-link-text">
      Want to go deeper?
    </p>

    <a
      href="https://payhip.com/b/bO6Gw"
      target="_blank"
      rel="noreferrer"
      className="audiobook-link"
    >
      🎧 Listen to the full audiobook
    </a>
  </div>
</section>

        {/* Optional call-to-action area */}
        <section className="report-section report-cta">
          <h3 className="section-title">Next Step</h3>
          <p className="cta-text">
            Want a clear plan? Start with the chapters above and take notes on what stands out.
          </p>

          {/* Replace with your real link later */}
          <a className="cta-btn" href="https://beautifulmarriagegarden.com" target="_blank" rel="noreferrer">
            Visit Beautiful Marriage Garden
          </a>
        </section>
      </div>

      <div className="report-footer">
        <span>Powered by Beautiful Marriage Garden</span>
      </div>
    </div>
  </div> 
)}
{/*  {!showIntro && (
  <footer className="app-footer">
    <img
      src={`${import.meta.env.BASE_URL}images/logo.png`}
      alt="Beautiful Marriage Garden"
      className="footer-logo"
    />
  </footer>
)} */}
</div>
  );}

export default App;