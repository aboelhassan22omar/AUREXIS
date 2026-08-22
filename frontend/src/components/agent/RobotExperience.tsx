"use client";

import {
  Canvas,
} from "@react-three/fiber";

import {
  usePathname,
} from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import RobotScene from "./RobotScene";

import styles from "./RobotExperience.module.css";


type CursorPosition = {
  x: number;
  y: number;
};


function getPageMessage(
  pathname: string
) {
  if (
    pathname === "/"
  ) {
    return "Hi 👋 I'm AUREXIS. I'm here if you want to explore what we build.";
  }


  if (
    pathname ===
    "/projects"
  ) {
    return "These are some of the projects AUREXIS has worked on. Take a look and see what we can build.";
  }


  if (
    pathname.startsWith(
      "/projects/"
    )
  ) {
    return "You're looking at one of our projects. Here you can learn what it does and the value behind it.";
  }


  if (
    pathname ===
    "/services"
  ) {
    return "Here are AUREXIS's services. Explore AI, cybersecurity, automation and software solutions.";
  }


  if (
    pathname.startsWith(
      "/services/"
    )
  ) {
    return "This page explains one of our services, how it works and where it can create value.";
  }


  if (
    pathname ===
    "/solutions"
  ) {
    return "Here you can explore how AUREXIS combines technologies to solve real business problems.";
  }


  if (
    pathname ===
    "/about"
  ) {
    return "Want to know more about AUREXIS? Here's who we are and what we believe in.";
  }


  if (
    pathname ===
    "/contact"
  ) {
    return "Have an idea or a problem you want to solve? This is the right place to talk to AUREXIS.";
  }


  if (
    pathname ===
      "/login" ||
    pathname ===
      "/register"
  ) {
    return "You can access your AUREXIS account from here. I'll stay around if you need me.";
  }


  if (
    pathname.startsWith(
      "/dashboard"
    )
  ) {
    return "Welcome to your AUREXIS workspace. Your account and project information are available here.";
  }


  if (
    pathname.startsWith(
      "/admin"
    )
  ) {
    return "You're in the AUREXIS administration area. Manage the platform from here.";
  }


  return "I'm AUREXIS, your AI companion. I'll stay here while you explore.";
}


function getIdleMessages(
  pathname: string
) {
  if (
    pathname.startsWith(
      "/projects"
    )
  ) {
    return [
      "See anything interesting? Every project starts with a real requirement.",
      "Open any project if you want to learn more about how it works.",
      "AUREXIS combines practical engineering with intelligent technology.",
    ];
  }


  if (
    pathname.startsWith(
      "/services"
    )
  ) {
    return [
      "Not sure which service fits your needs? Soon you'll be able to ask me directly.",
      "AUREXIS services can be adapted around the real business requirement.",
      "AI, automation, security and software can work together as one solution.",
    ];
  }


  if (
    pathname ===
    "/contact"
  ) {
    return [
      "Tell AUREXIS about the problem you're trying to solve.",
      "A strong solution starts with understanding the problem first.",
    ];
  }


  if (
    pathname === "/"
  ) {
    return [
      "Take your time. I'll be right here 👋",
      "AUREXIS works across AI, cybersecurity, automation and custom software.",
      "Soon you'll be able to click me and chat with me directly.",
    ];
  }


  return [
    "I'm still here 👋",
    "Feel free to explore.",
    "Soon you'll be able to chat with me directly.",
  ];
}


export default function RobotExperience() {
  const pathname =
    usePathname();


  const cursor =
    useRef<CursorPosition>({
      x: 0,
      y: 0,
    });


  const firstLoad =
    useRef(true);


  const idleIndex =
    useRef(0);


  const [
    message,
    setMessage,
  ] = useState(
    "Hi 👋 I'm AUREXIS."
  );


  const [
    bubbleVisible,
    setBubbleVisible,
  ] = useState(false);


  useEffect(() => {
    const handlePointerMove = (
      event: PointerEvent
    ) => {
      cursor.current.x =
        (
          event.clientX /
          window.innerWidth
        ) *
          2 -
        1;


      cursor.current.y =
        -(
          (
            event.clientY /
            window.innerHeight
          ) *
            2 -
          1
        );
    };


    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      }
    );


    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );
    };
  }, []);


  useEffect(() => {
    const timers:
      ReturnType<
        typeof setTimeout
      >[] = [];


    if (
      firstLoad.current
    ) {
      firstLoad.current =
        false;


      setMessage(
        "Hi 👋 I'm AUREXIS. Nice to meet you."
      );


      setBubbleVisible(
        true
      );


      timers.push(
        setTimeout(
          () => {
            setBubbleVisible(
              false
            );
          },
          4000
        )
      );


      timers.push(
        setTimeout(
          () => {
            setMessage(
              getPageMessage(
                pathname
              )
            );


            setBubbleVisible(
              true
            );
          },
          5000
        )
      );


      timers.push(
        setTimeout(
          () => {
            setBubbleVisible(
              false
            );
          },
          9800
        )
      );
    } else {
      setMessage(
        getPageMessage(
          pathname
        )
      );


      setBubbleVisible(
        true
      );


      timers.push(
        setTimeout(
          () => {
            setBubbleVisible(
              false
            );
          },
          5200
        )
      );
    }


    return () => {
      timers.forEach(
        (
          timer
        ) => {
          clearTimeout(
            timer
          );
        }
      );
    };
  }, [
    pathname,
  ]);


  useEffect(() => {
    let hideTimer:
      ReturnType<
        typeof setTimeout
      > | null = null;


    const interval =
      setInterval(
        () => {
          const messages =
            getIdleMessages(
              pathname
            );


          const nextMessage =
            messages[
              idleIndex.current %
                messages.length
            ];


          idleIndex.current +=
            1;


          setMessage(
            nextMessage
          );


          setBubbleVisible(
            true
          );


          if (
            hideTimer
          ) {
            clearTimeout(
              hideTimer
            );
          }


          hideTimer =
            setTimeout(
              () => {
                setBubbleVisible(
                  false
                );
              },
              4600
            );
        },
        26000
      );


    return () => {
      clearInterval(
        interval
      );


      if (
        hideTimer
      ) {
        clearTimeout(
          hideTimer
        );
      }
    };
  }, [
    pathname,
  ]);


  return (
    <aside
      className={
        styles.assistant
      }
      aria-label="AUREXIS AI Assistant"
    >

      <div
        className={
          `${
            styles.bubble
          } ${
            bubbleVisible
              ? styles.bubbleVisible
              : ""
          }`
        }
      >

        <div
          className={
            styles.bubbleHeader
          }
        >
          <span
            className={
              styles.onlineDot
            }
          />

          <span
            className={
              styles.bubbleName
            }
          >
            AUREXIS AI
          </span>
        </div>


        <p
          className={
            styles.bubbleText
          }
        >
          {message}
        </p>

      </div>


      <div
        className={
          styles.robotGlow
        }
      />


      <div
        className={
          styles.canvas
        }
      >
        <Canvas
          camera={{
            position: [
              0,
              -0.16,
              6.2,
            ],

            fov: 30,

            near: 0.1,

            far: 100,
          }}
          dpr={[
            1,
            1.5,
          ]}
          gl={{
            alpha: true,

            antialias: true,

            powerPreference:
              "high-performance",
          }}
        >
          <RobotScene
            cursor={
              cursor
            }
          />
        </Canvas>
      </div>

    </aside>
  );
}