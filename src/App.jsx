import React, { useState } from "react";
import "./App.css";
import getFeedback from "./feedback.js";

// Replace with your Apps Script Web App URL
const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbxQCYgKrkmzOI_oSKIkQa7esAcIaESx9e943AvR2Fthj61FtakwQL7KBcXyHxE1UEW79g/exec";

async function saveLead(name, email) {
  // Send URL-encoded form data (simple request → no preflight)
  const payload = new URLSearchParams({
    name,
    email,
    source: "Relationship Reflection Quiz",
    userAgent: navigator.userAgent
    // ip: include if you fetch one client-side
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
      options: [
        "Wait and hope he proposes",
        "Confront him immediately",
        "Set boundaries and seek clarity",
        "Feel confused and emotionally drained"
      ],
      type: "single"
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
    await saveLead(name.trim(), email.trim());
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

  return (
    <div className="App">
      <header className="header">
        <img src="/logo-placeholder.png" alt="Logo" className="logo" />
      </header>

      {/* INTRO SCREEN — video centered + button */}
      {showIntro && !quizStarted && !submitted && (
        <section className="intro">
          <h1 className="intro-title">Welcome to the Relationship Reflection Quiz</h1>

          {/* Use one of the two options below */}

          {/* Option A: YouTube/Vimeo embed */}
          <div className="video-wrapper" role="region" aria-label="Intro video">
            <iframe
              className="video"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Introduction to the Relationship Reflection Quiz"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Option B: local/video file (uncomment and remove the iframe if you prefer)
          <video className="video-file" controls playsInline preload="metadata">
            <source src="/intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          */}

          <button className="primary-btn" onClick={() => setShowIntro(false)}>
            Take the Quiz
          </button>
        </section>
      )}

      {/* Start Screen */}
      {!showIntro && !quizStarted && !submitted && !showLeadForm && (
        <div className="start-screen">
           <h2>Welcome to the Relationship Reflection Quiz</h2>
            <p>Click below to begin.</p>
             <button onClick={startQuiz}>Start Quiz</button>
        </div>)}

      {/*
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
            src={currentQuestion.image}
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
      {submitted && (
        <div className="results">
          <div className="custom-feedback">
            <h3>💡 Customized Insight Based on Your Answers</h3>
            <ul>
              {getFeedback(answers, otherAnswers).map((fb, idx) => (
                <li key={idx}>{fb}</li>
              ))}
            </ul>
          </div>

          <h2>Your Reflections:</h2>
          <ul>
            {questions.map((q, i) => (
              <li key={i}>
                <strong>{q.question}</strong>
                <br />
                Answer: {displayAnswer(i)}
              </li>
            ))}
          </ul>

          <footer className="footer">
            Powered by Beautiful Marriage Garden
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;