import {
  ArrowUpRight,
  Code2,
  Globe2,
  Mail,
} from "lucide-react";

import Link from "next/link";


const navigation = [
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "Solutions",
    href: "/solutions",
  },
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];


const capabilities = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Business Automation",
  "Custom Software",
  "AI Integration",
];


export default function Footer() {
  const currentYear =
    new Date().getFullYear();


  return (
    <footer
      style={{
        position: "relative",
        overflow: "hidden",

        borderTop:
          "1px solid rgba(255,255,255,.055)",

        background:
          "radial-gradient(circle at 20% 10%, rgba(108,51,255,.07), transparent 28%)",
      }}
    >
      <div
        className="axion-container"
        style={{
          paddingTop: 70,
          paddingBottom: 28,
        }}
      >
        <div className="axion-footer-grid">

          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 11,

                color: "#f5f2fa",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 35,
                  height: 35,

                  display: "grid",
                  placeItems: "center",

                  borderRadius: 10,

                  background:
                    "linear-gradient(135deg, #6c33ff, #a56cff)",

                  boxShadow:
                    "0 10px 30px rgba(108,51,255,.22)",

                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                A
              </div>


              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: ".17em",
                }}
              >
                AXION
              </span>
            </Link>


            <p
              style={{
                maxWidth: 340,

                marginTop: 20,

                color: "#77717e",

                fontSize: 12,
                lineHeight: 1.8,
              }}
            >
              Intelligent systems,
              cybersecurity, automation and
              software engineered around
              real-world business problems.
            </p>


            <Link
              href="/contact"
              style={{
                marginTop: 23,

                display: "inline-flex",
                alignItems: "center",
                gap: 7,

                color: "#a98cff",

                fontSize: 11,
                fontWeight: 600,

                textDecoration: "none",
              }}
            >
              Start a project

              <ArrowUpRight size={15} />
            </Link>
          </div>


          <div>
            <span className="footer-heading">
              Explore
            </span>


            <div className="footer-links">
              {navigation.map(
                (item) => (
                  <Link
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>


          <div>
            <span className="footer-heading">
              Capabilities
            </span>


            <div className="footer-capabilities">
              {capabilities.map(
                (item) => (
                  <span key={item}>
                    {item}
                  </span>
                )
              )}
            </div>
          </div>


          <div>
            <span className="footer-heading">
              Connect
            </span>


            <div className="footer-connect">

              <Link href="/contact">
                <Mail size={14} />
                Contact AXION
              </Link>


              <Link href="/">
                <Globe2 size={14} />
                Website
              </Link>


              <Link href="/projects">
                <Code2 size={14} />
                Projects
              </Link>

            </div>
          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © {currentYear} AXION.
            All rights reserved.
          </p>


          <div>
            <span>
              AI
            </span>

            <span>
              Security
            </span>

            <span>
              Automation
            </span>

            <span>
              Software
            </span>
          </div>

        </div>
      </div>


      <style>{`
        .axion-footer-grid {
          display: grid;
          grid-template-columns:
            minmax(250px, 1.5fr)
            minmax(120px, .65fr)
            minmax(160px, .85fr)
            minmax(150px, .7fr);
          gap: 55px;
        }

        .footer-heading {
          display: block;
          margin-bottom: 20px;

          color: #a98cff;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .footer-links,
        .footer-capabilities,
        .footer-connect {
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          gap: 12px;
        }

        .footer-links a,
        .footer-connect a {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          color: #817b88;

          font-size: 11px;

          text-decoration: none;

          transition:
            color .2s ease,
            transform .2s ease;
        }

        .footer-links a:hover,
        .footer-connect a:hover {
          color: #c4aaff;

          transform:
            translateX(2px);
        }

        .footer-capabilities span {
          color: #6f6975;

          font-size: 11px;
          line-height: 1.5;
        }

        .footer-bottom {
          margin-top: 65px;
          padding-top: 23px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          border-top:
            1px solid rgba(255,255,255,.05);
        }

        .footer-bottom p {
          margin: 0;

          color: #55505b;

          font-size: 10px;
        }

        .footer-bottom > div {
          display: flex;
          flex-wrap: wrap;

          gap: 17px;
        }

        .footer-bottom span {
          color: #55505b;

          font-size: 9px;

          letter-spacing: .05em;
        }

        @media (max-width: 950px) {
          .axion-footer-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 45px;
          }
        }

        @media (max-width: 600px) {
          .axion-footer-grid {
            grid-template-columns: 1fr;

            gap: 38px;
          }

          .footer-bottom {
            margin-top: 45px;

            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </footer>
  );
}