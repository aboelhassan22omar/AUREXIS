"use client";

import {
  ArrowRight,
  Bot,
  CalendarDays,
  CircleUserRound,
  FolderKanban,
  LoaderCircle,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useEffect,
} from "react";

import Navbar from "@/components/layout/Navbar";

import {
  useAuth,
} from "@/hooks/useAuth";


export default function DashboardPage() {
  const router =
    useRouter();

  const {
    user,
    loading,
    authenticated,
    logout,
  } = useAuth();


  useEffect(() => {
    if (
      !loading &&
      !authenticated
    ) {
      router.replace(
        "/login"
      );
    }
  }, [
    authenticated,
    loading,
    router,
  ]);


  async function handleLogout() {
    await logout();

    router.push("/");
    router.refresh();
  }


  if (loading) {
    return (
      <>
        <Navbar />

        <main
          style={{
            minHeight: "100vh",

            display: "grid",
            placeItems: "center",

            background:
              "radial-gradient(circle at 50% 15%, rgba(108,51,255,.09), transparent 35%)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",

              alignItems: "center",

              gap: 15,

              color: "#8e8997",
            }}
          >
            <LoaderCircle
              size={30}
              className="dashboard-loader"
            />

            <span
              style={{
                fontSize: 13,
              }}
            >
              Loading AXION...
            </span>
          </div>


          <style jsx>{`
            .dashboard-loader {
              animation:
                axion-spin
                0.8s
                linear
                infinite;
            }

            @keyframes axion-spin {
              to {
                transform:
                  rotate(360deg);
              }
            }
          `}</style>
        </main>
      </>
    );
  }


  if (
    !authenticated ||
    !user
  ) {
    return null;
  }


  const firstName =
    user.full_name
      .trim()
      .split(" ")[0];

  const createdDate =
    new Date(
      user.created_at
    ).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );


  return (
    <>
      <Navbar />


      <main
        className="dashboard-shell"
        style={{
          minHeight: "100vh",

          background:
            "radial-gradient(circle at 50% 5%, rgba(108,51,255,.08), transparent 32%)",
        }}
      >

        <div
          className="axion-container dashboard-content"
          style={{
            paddingTop: 120,
            paddingBottom: 100,
          }}
        >

          {/* =========================
              HEADING
          ========================== */}

          <section
            style={{
              display: "flex",

              alignItems: "flex-end",
              justifyContent:
                "space-between",

              gap: 30,

              flexWrap: "wrap",
            }}
          >

            <div
              className="dashboard-heading"
            >

              <span className="section-label">
                AXION Workspace
              </span>


              <h1>
                Welcome,{" "}

                <span className="gradient-text">
                  {firstName}
                </span>
                .
              </h1>


              <p>
                Your AXION account,
                services and project
                requests in one secure
                workspace.
              </p>


              <div
                style={{
                  marginTop: 20,

                  display:
                    "inline-flex",

                  alignItems:
                    "center",

                  gap: 8,

                  padding:
                    "8px 13px",

                  borderRadius:
                    999,

                  background:
                    user.is_active
                      ? "rgba(70, 190, 120, 0.07)"
                      : "rgba(255, 80, 100, 0.07)",

                  border:
                    user.is_active
                      ? "1px solid rgba(112,226,156,.16)"
                      : "1px solid rgba(255,90,110,.16)",

                  color:
                    user.is_active
                      ? "#70e29c"
                      : "#ff8190",

                  fontSize: 11,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,

                    borderRadius:
                      "50%",

                    background:
                      user.is_active
                        ? "#70e29c"
                        : "#ff8190",

                    boxShadow:
                      user.is_active
                        ? "0 0 12px rgba(112,226,156,.7)"
                        : "0 0 12px rgba(255,129,144,.7)",
                  }}
                />

                {user.is_active
                  ? "Account active"
                  : "Account disabled"}
              </div>

            </div>


            <button
              type="button"
              onClick={
                handleLogout
              }
              style={{
                minHeight: 44,

                padding:
                  "0 16px",

                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap: 8,

                borderRadius:
                  12,

                color:
                  "#c6c1cc",

                background:
                  "rgba(255,255,255,.025)",

                border:
                  "1px solid rgba(255,255,255,.07)",

                cursor:
                  "pointer",

                fontSize:
                  12,
              }}
            >
              <LogOut
                size={16}
              />

              Sign Out
            </button>

          </section>


          {/* =========================
              ACCOUNT INFORMATION
          ========================== */}

          <section
            style={{
              marginTop: 50,

              display: "grid",

              gridTemplateColumns:
                "minmax(0, 1.4fr) minmax(280px, .6fr)",

              gap: 15,
            }}
            className="dashboard-account-layout"
          >

            <article
              className="glass-card"
              style={{
                padding: 28,

                borderRadius:
                  25,
              }}
            >

              <div
                style={{
                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",

                  gap: 20,

                  flexWrap:
                    "wrap",
                }}
              >

                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 16,
                  }}
                >

                  <div
                    style={{
                      width: 58,
                      height: 58,

                      display:
                        "grid",

                      placeItems:
                        "center",

                      borderRadius:
                        18,

                      color:
                        "#c8b3ff",

                      background:
                        "linear-gradient(135deg, rgba(108,51,255,.18), rgba(153,95,255,.08))",

                      border:
                        "1px solid rgba(139,92,246,.18)",
                    }}
                  >
                    <UserRound
                      size={26}
                    />
                  </div>


                  <div>

                    <span
                      style={{
                        color:
                          "#696471",

                        fontSize:
                          10,

                        textTransform:
                          "uppercase",

                        letterSpacing:
                          ".12em",
                      }}
                    >
                      Account
                    </span>


                    <h2
                      style={{
                        marginTop:
                          5,

                        fontSize:
                          23,

                        letterSpacing:
                          "-.035em",
                      }}
                    >
                      {
                        user.full_name
                      }
                    </h2>


                    <p
                      style={{
                        marginTop:
                          4,

                        color:
                          "#817c89",

                        fontSize:
                          12,
                      }}
                    >
                      {user.email}
                    </p>

                  </div>

                </div>


                <div
                  style={{
                    padding:
                      "7px 10px",

                    display:
                      "inline-flex",

                    alignItems:
                      "center",

                    gap: 6,

                    borderRadius:
                      999,

                    color:
                      user.is_admin
                        ? "#c5afff"
                        : "#9c97a3",

                    background:
                      user.is_admin
                        ? "rgba(108,51,255,.08)"
                        : "rgba(255,255,255,.025)",

                    border:
                      user.is_admin
                        ? "1px solid rgba(139,92,246,.15)"
                        : "1px solid rgba(255,255,255,.05)",

                    fontSize:
                      10,

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      ".08em",
                  }}
                >
                  {user.is_admin ? (
                    <ShieldCheck
                      size={13}
                    />
                  ) : (
                    <CircleUserRound
                      size={13}
                    />
                  )}

                  {user.is_admin
                    ? "Administrator"
                    : "Member"}
                </div>

              </div>


              <div
                style={{
                  marginTop: 30,

                  display: "grid",

                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",

                  gap: 10,
                }}
                className="dashboard-profile-grid"
              >

                <div
                  style={{
                    padding: 16,

                    borderRadius:
                      15,

                    background:
                      "rgba(255,255,255,.02)",

                    border:
                      "1px solid rgba(255,255,255,.05)",
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",

                      color:
                        "#65606d",

                      fontSize:
                        9,

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        ".1em",
                    }}
                  >
                    User ID
                  </span>

                  <strong
                    style={{
                      display:
                        "block",

                      marginTop:
                        7,

                      fontSize:
                        14,
                    }}
                  >
                    #{user.id}
                  </strong>
                </div>


                <div
                  style={{
                    padding: 16,

                    borderRadius:
                      15,

                    background:
                      "rgba(255,255,255,.02)",

                    border:
                      "1px solid rgba(255,255,255,.05)",
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",

                      color:
                        "#65606d",

                      fontSize:
                        9,

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        ".1em",
                    }}
                  >
                    Status
                  </span>

                  <strong
                    style={{
                      display:
                        "block",

                      marginTop:
                        7,

                      color:
                        user.is_active
                          ? "#70e29c"
                          : "#ff8190",

                      fontSize:
                        14,
                    }}
                  >
                    {user.is_active
                      ? "Active"
                      : "Disabled"}
                  </strong>
                </div>


                <div
                  style={{
                    padding: 16,

                    borderRadius:
                      15,

                    background:
                      "rgba(255,255,255,.02)",

                    border:
                      "1px solid rgba(255,255,255,.05)",
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",

                      color:
                        "#65606d",

                      fontSize:
                        9,

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        ".1em",
                    }}
                  >
                    Role
                  </span>

                  <strong
                    style={{
                      display:
                        "block",

                      marginTop:
                        7,

                      fontSize:
                        14,
                    }}
                  >
                    {user.is_admin
                      ? "Admin"
                      : "User"}
                  </strong>
                </div>

              </div>

            </article>


            <article
              className="glass-card"
              style={{
                padding: 25,

                borderRadius:
                  25,

                display:
                  "flex",

                flexDirection:
                  "column",

                justifyContent:
                  "space-between",

                minHeight:
                  230,
              }}
            >

              <div>

                <div
                  style={{
                    width: 42,
                    height: 42,

                    display:
                      "grid",

                    placeItems:
                      "center",

                    borderRadius:
                      13,

                    color:
                      "#a986ff",

                    background:
                      "rgba(108,51,255,.09)",
                  }}
                >
                  <CalendarDays
                    size={20}
                  />
                </div>


                <span
                  style={{
                    display:
                      "block",

                    marginTop:
                      25,

                    color:
                      "#66616e",

                    fontSize:
                      10,

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      ".11em",
                  }}
                >
                  Member since
                </span>


                <strong
                  style={{
                    display:
                      "block",

                    marginTop:
                      7,

                    fontSize:
                      17,

                    letterSpacing:
                      "-.02em",
                  }}
                >
                  {createdDate}
                </strong>

              </div>


              <span
                style={{
                  color:
                    "#5e5965",

                  fontSize:
                    10,
                }}
              >
                AXION Account #{user.id}
              </span>

            </article>

          </section>


          {/* =========================
              QUICK ACTIONS
          ========================== */}

          <section
            style={{
              marginTop: 55,
            }}
          >

            <span className="section-label">
              Quick Actions
            </span>


            <h2
              style={{
                marginTop: 10,

                fontSize:
                  "clamp(2rem, 4vw, 3.5rem)",

                letterSpacing:
                  "-.055em",
              }}
            >
              Continue with{" "}

              <span className="gradient-text">
                AXION.
              </span>
            </h2>


            <div
              className="dashboard-grid"
              style={{
                marginTop: 30,
              }}
            >

              <Link
                href="/services"
                className="dashboard-card glass-card"
                style={{
                  display:
                    "block",
                }}
              >

                <div className="dashboard-card-icon">
                  <Bot
                    size={21}
                  />
                </div>

                <h3>
                  Explore Services
                </h3>

                <p>
                  Explore AXION AI,
                  cybersecurity,
                  automation and
                  software services.
                </p>

                <div
                  style={{
                    marginTop:
                      20,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 6,

                    color:
                      "#a98cff",

                    fontSize:
                      11,
                  }}
                >
                  Explore

                  <ArrowRight
                    size={14}
                  />
                </div>

              </Link>


              <Link
                href="/projects"
                className="dashboard-card glass-card"
                style={{
                  display:
                    "block",
                }}
              >

                <div className="dashboard-card-icon">
                  <FolderKanban
                    size={21}
                  />
                </div>

                <h3>
                  View Projects
                </h3>

                <p>
                  See AXION systems,
                  platforms and
                  intelligent solutions.
                </p>

                <div
                  style={{
                    marginTop:
                      20,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 6,

                    color:
                      "#a98cff",

                    fontSize:
                      11,
                  }}
                >
                  View Projects

                  <ArrowRight
                    size={14}
                  />
                </div>

              </Link>


              <Link
                href="/contact"
                className="dashboard-card glass-card"
                style={{
                  display:
                    "block",
                }}
              >

                <div className="dashboard-card-icon">
                  <Sparkles
                    size={21}
                  />
                </div>

                <h3>
                  Start a Project
                </h3>

                <p>
                  Tell AXION what
                  you want to build
                  and start a new
                  conversation.
                </p>

                <div
                  style={{
                    marginTop:
                      20,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 6,

                    color:
                      "#a98cff",

                    fontSize:
                      11,
                  }}
                >
                  Start Request

                  <ArrowRight
                    size={14}
                  />
                </div>

              </Link>


              <Link
                href="/contact"
                className="dashboard-card glass-card"
                style={{
                  display:
                    "block",
                }}
              >

                <div className="dashboard-card-icon">
                  <Mail
                    size={21}
                  />
                </div>

                <h3>
                  Contact AXION
                </h3>

                <p>
                  Contact the AXION
                  team about your
                  account, project
                  or new idea.
                </p>

                <div
                  style={{
                    marginTop:
                      20,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 6,

                    color:
                      "#a98cff",

                    fontSize:
                      11,
                  }}
                >
                  Contact Team

                  <ArrowRight
                    size={14}
                  />
                </div>

              </Link>


              {user.is_admin && (
                <Link
                  href="/admin"
                  className="dashboard-card glass-card"
                  style={{
                    display:
                      "block",

                    border:
                      "1px solid rgba(139,92,246,.14)",
                  }}
                >

                  <div className="dashboard-card-icon">
                    <ShieldCheck
                      size={21}
                    />
                  </div>

                  <h3>
                    Admin Control Center
                  </h3>

                  <p>
                    Manage users,
                    leads, services,
                    projects and AXION
                    platform content.
                  </p>

                  <div
                    style={{
                      marginTop:
                        20,

                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: 6,

                      color:
                        "#b99aff",

                      fontSize:
                        11,
                    }}
                  >
                    Open Admin

                    <ArrowRight
                      size={14}
                    />
                  </div>

                </Link>
              )}

            </div>

          </section>


          {/* =========================
              WORKSPACE STATUS
          ========================== */}

          <section
            className="glass-card"
            style={{
              marginTop: 45,

              padding: 27,

              borderRadius:
                25,

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap: 25,

              flexWrap:
                "wrap",
            }}
          >

            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap: 15,
              }}
            >

              <div
                style={{
                  width: 45,
                  height: 45,

                  display:
                    "grid",

                  placeItems:
                    "center",

                  borderRadius:
                    14,

                  color:
                    "#a985ff",

                  background:
                    "rgba(108,51,255,.09)",
                }}
              >
                <ShieldCheck
                  size={21}
                />
              </div>


              <div>

                <h3
                  style={{
                    fontSize:
                      15,
                  }}
                >
                  Secure AXION Workspace
                </h3>

                <p
                  style={{
                    marginTop:
                      5,

                    color:
                      "#77727f",

                    fontSize:
                      11,

                    lineHeight:
                      1.6,
                  }}
                >
                  Your session is authenticated
                  and connected to your AXION
                  account.
                </p>

              </div>

            </div>


            <div
              style={{
                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap: 7,

                color:
                  "#70e29c",

                fontSize:
                  10,

                textTransform:
                  "uppercase",

                letterSpacing:
                  ".08em",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,

                  borderRadius:
                    "50%",

                  background:
                    "#70e29c",

                  boxShadow:
                    "0 0 10px rgba(112,226,156,.7)",
                }}
              />

              Connected
            </div>

          </section>

        </div>


        <style jsx>{`
          @media (max-width: 900px) {
            .dashboard-account-layout {
              grid-template-columns:
                1fr !important;
            }
          }

          @media (max-width: 650px) {
            .dashboard-profile-grid {
              grid-template-columns:
                1fr !important;
            }
          }
        `}</style>

      </main>
    </>
  );
}