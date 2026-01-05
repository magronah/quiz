import { useEffect, useRef, useState } from "react";

const YT_ID = "dQw4w9WgXcQ"; // your video id

export default function IntroVideo() {
  const containerRef = useRef(null);
  const [readyToLoad, setReadyToLoad] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const playerRef = useRef(null);

  // 1) Observe when the container is on screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setReadyToLoad(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: "200px 0px" } // start a bit early
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 2) Load YT IFrame API once and create the player when readyToLoad
  useEffect(() => {
    if (!readyToLoad || playerLoaded) return;

    function onYouTubeIframeAPIReady() {
      // Create the player only when API is ready
      /* global YT */
      playerRef.current = new window.YT.Player("intro-yt-player", {
        width: "100%",
        height: "100%",
        videoId: YT_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          playsinline: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          loop: 1,
          playlist: YT_ID, // required for loop
          origin: window.location.origin,
        },
        events: {
          onReady: (ev) => {
            try {
              ev.target.mute(); // ensure autoplay works everywhere
              ev.target.playVideo();
            } catch {}
          },
        },
      });
      setPlayerLoaded(true);
    }

    // If API already loaded, call immediately
    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      const existing = document.getElementById("yt-iframe-api");
      if (existing) {
        // API script already loading; wait and then init
        const interval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(interval);
            onYouTubeIframeAPIReady();
          }
        }, 50);
        return () => clearInterval(interval);
      }

      // Inject API script
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);

      // Wire global callback
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
  }, [readyToLoad, playerLoaded]);

  return (
    <div
      ref={containerRef}
      className="video-wrapper"
      role="region"
      aria-label="Intro video"
    >
      {/* Poster (shows instantly) */}
      {!playerLoaded && (
        <div
          className="video poster"
          style={{
            backgroundImage: `url(https://i.ytimg.com/vi/${YT_ID}/hqdefault.jpg)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* The actual player mounts here when visible */}
      <div id="intro-yt-player" className="video" />
    </div>
  );
}
