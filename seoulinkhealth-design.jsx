import { useState, useEffect, useRef } from "react";

/* ───────────────────────────────────────────
   SEOULINKHEALTH — K-HEALTH BUSINESS PLATFORM
   Full Website Design (PC + Mobile Responsive)
   2026 Trend · Navy + White · Business Consulting
   ─────────────────────────────────────────── */

// ── Color Palette ──
const C = {
  navy: "#0A1E3D",
  navyLight: "#122B54",
  navyMid: "#1A3A6B",
  navyAccent: "#2B5EA7",
  white: "#FFFFFF",
  offWhite: "#F7F8FB",
  cloud: "#EDF0F5",
  gray100: "#E8EBF0",
  gray300: "#B0B8C9",
  gray500: "#6B7A94",
  gray700: "#3D4E66",
  gold: "#C4A35A",
  goldLight: "#E8D5A0",
};

// ── Shared Styles ──
const font = "'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const fontSerif = "'DM Serif Display', 'Noto Serif KR', Georgia, serif";

// ── Icon Components ──
const IconArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconGlobe = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.navyAccent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconShield = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.navyAccent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconUsers = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.navyAccent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconTarget = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.navyAccent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconMapPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Navigation ──
const NAV_ITEMS = ["Home", "Solutions", "Advisory Group", "Recruit", "Contact"];

function Navbar({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: scrolled ? "rgba(10,30,61,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
          borderBottom: scrolled ? `1px solid rgba(255,255,255,0.08)` : "none",
          fontFamily: font,
        }}
      >
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: scrolled ? 64 : 80, transition: "height 0.3s ease",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setActive("Home")}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.navyAccent}, ${C.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: C.white, fontFamily: font,
              letterSpacing: -1,
            }}>SL</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.white, letterSpacing: 1.5, lineHeight: 1.2 }}>
                SEOULINKHEALTH
              </div>
              <div style={{ fontSize: 9, color: C.gray300, letterSpacing: 2.5, fontWeight: 500, textTransform: "uppercase" }}>
                K-Health Business Platform
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}
            className="desktop-nav"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "8px 18px", borderRadius: 6,
                  fontSize: 13, fontWeight: 500, letterSpacing: 0.5,
                  color: active === item ? C.white : C.gray300,
                  fontFamily: font,
                  position: "relative",
                  transition: "color 0.2s ease",
                }}
              >
                {item}
                {active === item && (
                  <div style={{
                    position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                    width: 20, height: 2, borderRadius: 1,
                    background: C.gold,
                  }} />
                )}
              </button>
            ))}
            <button style={{
              marginLeft: 16, padding: "10px 24px", borderRadius: 6,
              background: "transparent", border: `1px solid ${C.gold}`,
              color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: 1,
              cursor: "pointer", fontFamily: font, textTransform: "uppercase",
              transition: "all 0.2s ease",
            }}>
              Login
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none", background: "none", border: "none",
              color: C.white, cursor: "pointer", padding: 8,
            }}
          >
            {mobileOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
          background: C.navy, paddingTop: 100,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          fontFamily: font,
        }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => { setActive(item); setMobileOpen(false); }}
              style={{
                background: active === item ? "rgba(255,255,255,0.06)" : "none",
                border: "none", cursor: "pointer",
                padding: "16px 40px", borderRadius: 8, width: "80%", maxWidth: 320,
                fontSize: 16, fontWeight: 500, color: active === item ? C.white : C.gray300,
                fontFamily: font, letterSpacing: 0.5,
                transition: "all 0.2s ease",
              }}
            >
              {item}
            </button>
          ))}
          <button style={{
            marginTop: 16, padding: "14px 40px", borderRadius: 8,
            background: "transparent", border: `1px solid ${C.gold}`,
            color: C.gold, fontSize: 14, fontWeight: 600, letterSpacing: 1.5,
            cursor: "pointer", fontFamily: font, textTransform: "uppercase",
            width: "80%", maxWidth: 320,
          }}>
            Login
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}

// ── Hero Section ──
function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 200); }, []);

  return (
    <section style={{
      position: "relative", minHeight: "100vh", display: "flex", alignItems: "center",
      background: `linear-gradient(165deg, ${C.navy} 0%, ${C.navyLight} 45%, ${C.navyMid} 100%)`,
      overflow: "hidden", fontFamily: font,
    }}>
      {/* Abstract Background Pattern */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
        <div style={{
          position: "absolute", top: "10%", right: "-5%", width: 600, height: 600,
          borderRadius: "50%", border: `1px solid ${C.white}`,
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "10%", width: 400, height: 400,
          borderRadius: "50%", border: `1px solid ${C.white}`,
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "-5%", width: 500, height: 500,
          borderRadius: "50%", border: `1px solid ${C.white}`,
        }} />
      </div>

      {/* Gradient Accent Orb */}
      <div style={{
        position: "absolute", top: "20%", right: "15%",
        width: 320, height: 320, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(43,94,167,0.2) 0%, transparent 70%)`,
        filter: "blur(40px)",
      }} />

      {/* Gold accent line */}
      <div style={{
        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
        width: 4, height: 120, background: `linear-gradient(to bottom, transparent, ${C.gold}, transparent)`,
        borderRadius: 2,
      }} />

      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "140px 40px 80px",
        width: "100%", position: "relative", zIndex: 1,
      }}>
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(.22,1,.36,1)",
        }}>
          {/* Tag */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 20,
            background: "rgba(196,163,90,0.12)", border: `1px solid rgba(196,163,90,0.25)`,
            marginBottom: 32,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: 2, textTransform: "uppercase" }}>
              Global Health Consulting
            </span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 72px)", fontWeight: 300,
            color: C.white, lineHeight: 1.08, margin: 0,
            fontFamily: fontSerif, letterSpacing: -1,
            maxWidth: 800,
          }}>
            Your Strategic
            <br />
            Gateway to{" "}
            <span style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontWeight: 400,
            }}>
              K-Health
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(15px, 1.6vw, 18px)", color: C.gray300, lineHeight: 1.7,
            maxWidth: 540, margin: "28px 0 0", fontWeight: 400,
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.2s",
          }}>
            Expert-driven consulting across K-Healthcare, K-Bio, K-Health Industry,
            and K-Health Food — connecting global opportunities with Korea's
            world-class healthcare capabilities.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: "flex", gap: 16, marginTop: 48, flexWrap: "wrap",
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.4s",
          }}>
            <button style={{
              padding: "16px 36px", borderRadius: 8,
              background: C.gold, border: "none",
              color: C.navy, fontSize: 13, fontWeight: 700, letterSpacing: 1.2,
              cursor: "pointer", fontFamily: font, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 10,
              transition: "transform 0.2s ease",
            }}>
              Explore Solutions <IconArrowRight />
            </button>
            <button style={{
              padding: "16px 36px", borderRadius: 8,
              background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.15)`,
              color: C.white, fontSize: 13, fontWeight: 600, letterSpacing: 1.2,
              cursor: "pointer", fontFamily: font, textTransform: "uppercase",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s ease",
            }}>
              Contact Us
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 1, marginTop: 80,
          background: "rgba(255,255,255,0.06)", borderRadius: 12,
          overflow: "hidden", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: visible ? 1 : 0,
          transition: "opacity 1s ease 0.6s",
        }}>
          {[
            { num: "4", label: "Core Sectors" },
            { num: "20+", label: "Years Experience" },
            { num: "Global", label: "Network Reach" },
            { num: "Expert", label: "Advisory Panel" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "28px 24px", textAlign: "center",
              background: "rgba(255,255,255,0.02)",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, fontFamily: fontSerif }}>{s.num}</div>
              <div style={{ fontSize: 11, color: C.gray300, letterSpacing: 1.5, marginTop: 4, textTransform: "uppercase", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <div style={{ fontSize: 10, color: C.gray500, letterSpacing: 2, textTransform: "uppercase" }}>Scroll</div>
        <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${C.gray500}, transparent)` }} />
      </div>
    </section>
  );
}

// ── About / Greeting Section ──
function AboutSection() {
  return (
    <section style={{
      background: C.white, fontFamily: font,
      padding: "clamp(60px, 10vw, 120px) 40px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Section Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div style={{ width: 40, height: 1, background: C.gold }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
            About Us
          </span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start",
        }}
          className="about-grid"
        >
          {/* Left: CEO Greeting */}
          <div>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 300,
              color: C.navy, lineHeight: 1.15, margin: 0,
              fontFamily: fontSerif,
            }}>
              Welcome to
              <br />
              <span style={{ fontWeight: 400 }}>SEOULINKHEALTH</span>
            </h2>
            <p style={{
              fontSize: 15, color: C.gray700, lineHeight: 1.85, marginTop: 28,
            }}>
              As global interest in Korea's advanced healthcare ecosystem continues to grow,
              many organizations and professionals seek reliable pathways to engage with Korea's
              healthcare services, medical industry, bio-pharmaceutical sector, and health food innovations.
            </p>
            <p style={{
              fontSize: 15, color: C.gray700, lineHeight: 1.85, marginTop: 16,
            }}>
              Our platform was established to serve as a strategic gateway for international partners
              who wish to enter the Korean market or adopt Korea's proven healthcare systems globally.
            </p>
            <p style={{
              fontSize: 15, color: C.gray500, lineHeight: 1.85, marginTop: 16, fontStyle: "italic",
            }}>
              "Our mission is simple: to connect global opportunities with Korea's world-class
              healthcare capabilities."
            </p>

            {/* CEO Signature */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${C.gray100}` }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: C.navy, fontFamily: fontSerif }}>
                J S Kim, Ph.D.
              </div>
              <div style={{ fontSize: 12, color: C.gray500, marginTop: 4, letterSpacing: 0.5 }}>
                Founder & CEO
              </div>
            </div>
          </div>

          {/* Right: Career & Education */}
          <div>
            {/* Career */}
            <div style={{
              background: C.offWhite, borderRadius: 16, padding: 36,
              border: `1px solid ${C.gray100}`,
            }}>
              <h3 style={{
                fontSize: 11, fontWeight: 700, color: C.navyAccent, letterSpacing: 2.5,
                textTransform: "uppercase", margin: "0 0 24px",
              }}>
                Career Highlights
              </h3>
              {[
                "Secretary for Health and Welfare, Office for 18th President Administration",
                "Member, 18th Presidential Transition Committee for Health and Welfare",
                "Senior Research Fellow, Korea Institute for Health and Social Affairs",
                "Director of Research Coordination, National Health Insurance Corporation",
                "Research Fellow, Health Insurance Review & Assessment Service",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: i < 4 ? `1px solid ${C.gray100}` : "none",
                }}>
                  <div style={{
                    minWidth: 6, height: 6, borderRadius: "50%",
                    background: C.gold, marginTop: 7,
                  }} />
                  <span style={{ fontSize: 13, color: C.gray700, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Education */}
            <div style={{
              marginTop: 20, background: C.navy, borderRadius: 16, padding: 36,
            }}>
              <h3 style={{
                fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2.5,
                textTransform: "uppercase", margin: "0 0 24px",
              }}>
                Education
              </h3>
              {[
                { degree: "Ph.D.", field: "Economics", school: "University of Houston" },
                { degree: "M.A.", field: "Economics", school: "North Carolina State University" },
                { degree: "B.A.", field: "Economics", school: "Long Island University" },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "14px 0",
                  borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.08)` : "none",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{item.degree}, {item.field}</div>
                  <div style={{ fontSize: 12, color: C.gray300, marginTop: 4 }}>{item.school}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

// ── Value Propositions ──
function ValueProps() {
  return (
    <section style={{
      background: C.offWhite, fontFamily: font,
      padding: "clamp(60px, 10vw, 100px) 40px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 60px" }}>
          <h2 style={{
            fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 300,
            color: C.navy, margin: 0, fontFamily: fontSerif,
          }}>
            Why <span style={{ fontWeight: 400 }}>SEOULINKHEALTH</span>
          </h2>
          <p style={{ fontSize: 15, color: C.gray500, lineHeight: 1.7, marginTop: 16 }}>
            Trusted expertise connecting global partners to Korea's healthcare ecosystem.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}>
          {[
            { icon: <IconGlobe />, title: "Global Network", desc: "Connecting international partners with Korea's advanced healthcare market through established channels and deep local expertise." },
            { icon: <IconShield />, title: "Trusted Advisory", desc: "Backed by senior government officials, academic researchers, and industry leaders with decades of policy and healthcare experience." },
            { icon: <IconUsers />, title: "Expert Panel", desc: "Access to a curated network of domain specialists across healthcare, bio-pharma, medical devices, and health food industries." },
            { icon: <IconTarget />, title: "Tailored Solutions", desc: "Customized consulting strategies designed to address your specific market entry, regulatory, and business development needs." },
          ].map((item, i) => (
            <div key={i} style={{
              background: C.white, borderRadius: 16, padding: 36,
              border: `1px solid ${C.gray100}`,
              transition: "all 0.3s ease",
              cursor: "default",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: `linear-gradient(135deg, rgba(43,94,167,0.06), rgba(43,94,167,0.12))`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.icon}
              </div>
              <h3 style={{
                fontSize: 17, fontWeight: 600, color: C.navy,
                margin: "24px 0 12px", letterSpacing: -0.3,
              }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.7, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Solutions Section ──
function SolutionsSection() {
  const [activeSolution, setActiveSolution] = useState(0);

  const solutions = [
    {
      tag: "01", title: "K-Health Care",
      desc: "Comprehensive consulting on Korea's healthcare delivery systems, hospital management, telemedicine, and digital health infrastructure. We help international partners understand and leverage Korea's advanced clinical ecosystem.",
      features: ["Hospital System Consulting", "Digital Health Integration", "Clinical Pathway Advisory"],
    },
    {
      tag: "02", title: "K-Health Industry",
      desc: "Strategic guidance on medical device regulations, pharmaceutical market entry, health technology assessment, and industry partnerships within Korea's rapidly evolving health industry landscape.",
      features: ["Market Entry Strategy", "Regulatory Navigation", "Industry Partnerships"],
    },
    {
      tag: "03", title: "K-Bio",
      desc: "Expert advisory on Korea's bio-pharmaceutical sector, including drug development pipelines, clinical trial coordination, biosimilar strategies, and cross-border licensing opportunities.",
      features: ["Drug Import/Export Advisory", "Clinical Trial Support", "Licensing Strategy"],
    },
    {
      tag: "04", title: "K-Health Food",
      desc: "Navigating Korea's health food and functional food market — from product registration and safety assessment to distribution channels and consumer market analysis.",
      features: ["Product Registration", "Safety Assessment", "Market Analysis"],
    },
  ];

  return (
    <section style={{
      background: C.navy, fontFamily: font,
      padding: "clamp(60px, 10vw, 120px) 40px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 40, height: 1, background: C.gold }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
            Our Solutions
          </span>
        </div>
        <h2 style={{
          fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 300,
          color: C.white, margin: "0 0 16px", fontFamily: fontSerif,
          maxWidth: 600,
        }}>
          Expert-Driven Solutions for
          <br />
          <span style={{ color: C.gold, fontWeight: 400 }}>K-Health Business</span>
        </h2>
        <p style={{ fontSize: 15, color: C.gray300, maxWidth: 560, lineHeight: 1.7, marginBottom: 60 }}>
          Our top-tier experts guide you through innovative ideas to the center of the K-Health Business ecosystem.
        </p>

        {/* Solutions Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "280px 1fr", gap: 40, alignItems: "start",
        }}
          className="solutions-grid"
        >
          {/* Left: Tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {solutions.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSolution(i)}
                style={{
                  background: activeSolution === i ? "rgba(255,255,255,0.06)" : "transparent",
                  border: activeSolution === i ? `1px solid rgba(255,255,255,0.1)` : "1px solid transparent",
                  borderRadius: 12, padding: "20px 24px",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontSize: 10, color: C.gold, fontWeight: 600, letterSpacing: 2, fontFamily: font }}>
                  {s.tag}
                </div>
                <div style={{
                  fontSize: 16, fontWeight: activeSolution === i ? 600 : 400,
                  color: activeSolution === i ? C.white : C.gray300,
                  marginTop: 6, fontFamily: font,
                  transition: "all 0.2s ease",
                }}>
                  {s.title}
                </div>
              </button>
            ))}
          </div>

          {/* Right: Content */}
          <div style={{
            background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "48px 44px",
            border: "1px solid rgba(255,255,255,0.06)",
            minHeight: 320,
          }}>
            <h3 style={{
              fontSize: 28, fontWeight: 400, color: C.white,
              margin: 0, fontFamily: fontSerif,
            }}>
              {solutions[activeSolution].title}
            </h3>
            <p style={{ fontSize: 15, color: C.gray300, lineHeight: 1.8, marginTop: 20 }}>
              {solutions[activeSolution].desc}
            </p>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32,
            }}>
              {solutions[activeSolution].features.map((f, i) => (
                <span key={i} style={{
                  padding: "8px 18px", borderRadius: 20,
                  background: "rgba(196,163,90,0.1)", border: `1px solid rgba(196,163,90,0.2)`,
                  fontSize: 12, color: C.gold, fontWeight: 500,
                }}>
                  {f}
                </span>
              ))}
            </div>
            <button style={{
              marginTop: 36, padding: "14px 32px", borderRadius: 8,
              background: C.gold, border: "none",
              color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: 1,
              cursor: "pointer", fontFamily: font, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              Learn More <IconArrowRight />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .solutions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── Process Workflow ──
function ProcessSection() {
  const steps = [
    { num: "01", title: "Receiving Requests", desc: "Confirmation of the client's submitted request" },
    { num: "02", title: "In-Depth Communication", desc: "Detailed discussion to clarify scope and objectives" },
    { num: "03", title: "Expert Consultation", desc: "Review and analysis by relevant domain experts" },
    { num: "04", title: "Specialist Meeting", desc: "Practical evaluation by industry specialists" },
    { num: "05", title: "Client Discussion", desc: "Strategic consultation to confirm the suggested solution" },
    { num: "06", title: "Review & Refine", desc: "Further review and refinement of the solution" },
    { num: "07", title: "Final Report", desc: "Comprehensive solution report delivery" },
  ];

  return (
    <section style={{
      background: C.white, fontFamily: font,
      padding: "clamp(60px, 10vw, 120px) 40px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 64px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20,
          }}>
            <div style={{ width: 40, height: 1, background: C.gold }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
              How We Work
            </span>
            <div style={{ width: 40, height: 1, background: C.gold }} />
          </div>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 300,
            color: C.navy, margin: 0, fontFamily: fontSerif,
          }}>
            Smart Support System for
            <br />
            <span style={{ fontWeight: 400 }}>Innovative Problem Solving</span>
          </h2>
        </div>

        {/* Steps */}
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
          {/* Vertical Line */}
          <div style={{
            position: "absolute", left: 28, top: 20, bottom: 20,
            width: 1, background: C.gray100,
          }}
            className="process-line"
          />

          {steps.map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: 32, alignItems: "flex-start",
              marginBottom: i < steps.length - 1 ? 36 : 0,
              position: "relative",
            }}
              className="process-step"
            >
              {/* Number Circle */}
              <div style={{
                minWidth: 56, height: 56, borderRadius: "50%",
                background: i === 0 ? C.navy : C.white,
                border: `2px solid ${i === 0 ? C.navy : C.gray100}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700,
                color: i === 0 ? C.gold : C.gray500,
                position: "relative", zIndex: 1,
                fontFamily: font,
              }}>
                {step.num}
              </div>
              {/* Content */}
              <div style={{ paddingTop: 8 }}>
                <h4 style={{
                  fontSize: 16, fontWeight: 600, color: C.navy,
                  margin: 0, letterSpacing: -0.2,
                }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: 14, color: C.gray500, margin: "6px 0 0", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .process-line { left: 20px !important; }
          .process-step > div:first-child { min-width: 42px !important; height: 42px !important; font-size: 12px !important; }
        }
      `}</style>
    </section>
  );
}

// ── Advisory / Recruit Section ──
function JoinSection() {
  return (
    <section style={{
      background: C.offWhite, fontFamily: font,
      padding: "clamp(60px, 10vw, 100px) 40px",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32,
      }}
        className="join-grid"
      >
        {/* Advisory Group Card */}
        <div style={{
          background: C.white, borderRadius: 20, padding: "48px 40px",
          border: `1px solid ${C.gray100}`,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `linear-gradient(135deg, ${C.navyAccent}, ${C.navyMid})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 28,
          }}>
            <IconUsers />
          </div>
          <h3 style={{
            fontSize: 24, fontWeight: 400, color: C.navy,
            margin: 0, fontFamily: fontSerif,
          }}>
            Advisory Group
          </h3>
          <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.8, marginTop: 16, flex: 1 }}>
            We sincerely appreciate your interest in our organization. If you are interested in joining
            our Advisory Group as a professional expert, please reach out to us. We will promptly provide
            the necessary application documents and further information.
          </p>
          <button style={{
            marginTop: 28, padding: "14px 28px", borderRadius: 8,
            background: C.navy, border: "none",
            color: C.white, fontSize: 12, fontWeight: 600, letterSpacing: 1,
            cursor: "pointer", fontFamily: font, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
          }}>
            Join as Advisor <IconArrowRight />
          </button>
        </div>

        {/* Recruit Card */}
        <div style={{
          background: C.navy, borderRadius: 20, padding: "48px 40px",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "rgba(196,163,90,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 28,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h3 style={{
            fontSize: 24, fontWeight: 400, color: C.white,
            margin: 0, fontFamily: fontSerif,
          }}>
            Join Our Team
          </h3>
          <p style={{ fontSize: 14, color: C.gray300, lineHeight: 1.8, marginTop: 16, flex: 1 }}>
            We sincerely appreciate your interest in our company and hope that you may become a valued
            member of our team. If you are interested in career opportunities with us, please send an email
            and we will provide you with the necessary application documents.
          </p>
          <button style={{
            marginTop: 28, padding: "14px 28px", borderRadius: 8,
            background: C.gold, border: "none",
            color: C.navy, fontSize: 12, fontWeight: 600, letterSpacing: 1,
            cursor: "pointer", fontFamily: font, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
          }}>
            View Opportunities <IconArrowRight />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .join-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── Contact Section ──
function ContactSection() {
  return (
    <section style={{
      background: C.white, fontFamily: font,
      padding: "clamp(60px, 10vw, 100px) 40px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div style={{ width: 40, height: 1, background: C.gold }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
            Contact
          </span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60,
        }}
          className="contact-grid"
        >
          {/* Left: Info */}
          <div>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 300,
              color: C.navy, margin: 0, fontFamily: fontSerif,
            }}>
              Get in <span style={{ fontWeight: 400 }}>Touch</span>
            </h2>
            <p style={{ fontSize: 15, color: C.gray500, lineHeight: 1.7, marginTop: 20, maxWidth: 420 }}>
              Ready to explore opportunities in the K-Health sector?
              We'd love to hear from you.
            </p>

            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { icon: <IconMapPin />, label: "Address", value: "#101, 19 Gwanpyeong-ro 313 Beon-gil,\nDongan-gu, Anyang-si, Gyeonggi-do,\nSouth Korea 13936" },
                { icon: <IconMail />, label: "Email", value: "contact@seoulinkhealth.com" },
                { icon: <IconPhone />, label: "Phone", value: "Available upon request" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    minWidth: 44, height: 44, borderRadius: 10,
                    background: C.offWhite, border: `1px solid ${C.gray100}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: C.navyAccent,
                  }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.gray500, letterSpacing: 1.5, textTransform: "uppercase" }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: 14, color: C.navy, marginTop: 4, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                      {c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div style={{
            background: C.offWhite, borderRadius: 20, padding: 40,
            border: `1px solid ${C.gray100}`,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: C.navy, margin: "0 0 28px" }}>
              Send us a message
            </h3>
            {[
              { label: "Full Name", type: "text", placeholder: "Your name" },
              { label: "Email", type: "email", placeholder: "your@email.com" },
              { label: "Organization", type: "text", placeholder: "Company name" },
            ].map((field, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 600,
                  color: C.gray500, letterSpacing: 1, textTransform: "uppercase",
                  marginBottom: 8,
                }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 8,
                    border: `1px solid ${C.gray100}`, background: C.white,
                    fontSize: 14, color: C.navy, fontFamily: font,
                    outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 600,
                color: C.gray500, letterSpacing: 1, textTransform: "uppercase",
                marginBottom: 8,
              }}>
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your project..."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 8,
                  border: `1px solid ${C.gray100}`, background: C.white,
                  fontSize: 14, color: C.navy, fontFamily: font,
                  outline: "none", resize: "vertical", boxSizing: "border-box",
                }}
              />
            </div>
            <button style={{
              width: "100%", padding: "16px", borderRadius: 8,
              background: C.navy, border: "none",
              color: C.white, fontSize: 13, fontWeight: 600, letterSpacing: 1,
              cursor: "pointer", fontFamily: font, textTransform: "uppercase",
            }}>
              Send Message
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

// ── Footer ──
function Footer() {
  return (
    <footer style={{
      background: C.navy, fontFamily: font,
      borderTop: `1px solid rgba(255,255,255,0.06)`,
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "60px 40px 40px",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40,
        }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 7,
                background: `linear-gradient(135deg, ${C.navyAccent}, ${C.gold})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: C.white,
              }}>SL</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.white, letterSpacing: 1.5 }}>
                SEOULINKHEALTH
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.7, maxWidth: 280 }}>
              Your strategic gateway to Korea's world-class healthcare capabilities.
              Expert-driven consulting for global health business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 600, color: C.gray300, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 20px" }}>
              Navigation
            </h4>
            {NAV_ITEMS.map((item, i) => (
              <div key={i} style={{
                fontSize: 13, color: C.gray500, padding: "6px 0", cursor: "pointer",
              }}>
                {item}
              </div>
            ))}
          </div>

          {/* Solutions */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 600, color: C.gray300, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 20px" }}>
              Solutions
            </h4>
            {["K-Health Care", "K-Health Industry", "K-Bio", "K-Health Food"].map((item, i) => (
              <div key={i} style={{
                fontSize: 13, color: C.gray500, padding: "6px 0", cursor: "pointer",
              }}>
                {item}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 600, color: C.gray300, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 20px" }}>
              Contact
            </h4>
            <div style={{ fontSize: 13, color: C.gray500, lineHeight: 1.7 }}>
              Anyang-si, Gyeonggi-do
              <br />South Korea
            </div>
            <div style={{ fontSize: 13, color: C.gold, marginTop: 12 }}>
              contact@seoulinkhealth.com
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          marginTop: 48, paddingTop: 24,
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ fontSize: 12, color: C.gray500 }}>
            &copy; 2026 SEOULINKHEALTH. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service"].map((item, i) => (
              <span key={i} style={{ fontSize: 12, color: C.gray500, cursor: "pointer" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

// ══════════════════════════════════════════
// ── MAIN APP COMPONENT ──
// ══════════════════════════════════════════
export default function SeoulinkHealthDesign() {
  const [activeSection, setActiveSection] = useState("Home");

  return (
    <div style={{ background: C.white, minHeight: "100vh" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }

        /* Smooth transitions for interactive elements */
        button:hover { opacity: 0.9; }
        input:focus, textarea:focus { border-color: ${C.navyAccent} !important; }

        /* Responsive padding */
        @media (max-width: 768px) {
          section > div { padding-left: 20px !important; padding-right: 20px !important; }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.offWhite}; }
        ::-webkit-scrollbar-thumb { background: ${C.gray300}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.gray500}; }

        /* Mobile menu button visibility */
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>

      <Navbar active={activeSection} setActive={setActiveSection} />
      <Hero />
      <AboutSection />
      <ValueProps />
      <SolutionsSection />
      <ProcessSection />
      <JoinSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
