import {
  ArrowUpRight,
  Code2,
  Globe2,
  Mail,
} from "lucide-react";

import Link from "next/link";

import Logo from "@/components/ui/Logo";

const navigation = [
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const capabilities = [
  "AI Agents",
  "Chatbots",
  "SIS for Schools",
  "AI Security",
  "Smart Surveillance",
  "Custom Software",
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="aurexis-container footer-shell">
        <div className="aurexis-footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo-link" aria-label="AUREXIS home">
              <Logo size={36} />
            </Link>

            <p className="footer-description">
              Intelligent systems, cybersecurity, automation and software
              engineered around real-world business problems.
            </p>

            <Link href="/contact" className="footer-project-link">
              Start a project
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="footer-group footer-explore">
            <span className="footer-heading">Explore</span>
            <div className="footer-links">
              {navigation.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer-group footer-capabilities-group">
            <span className="footer-heading">Capabilities</span>
            <div className="footer-capabilities">
              {capabilities.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="footer-group footer-connect-group">
            <span className="footer-heading">Connect</span>
            <div className="footer-connect">
              <Link href="/contact">
                <Mail size={14} />
                Contact Aurexis
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
          <p>© {currentYear} AUREXIS. All rights reserved.</p>

          <div className="footer-bottom-tags" aria-label="AUREXIS capabilities">
            <span>Intelligence</span>
            <span>Software</span>
            <span>Solutions</span>
          </div>
        </div>
      </div>

      <style>{`
        .site-footer {
          position: relative;
          overflow: hidden;
          border-top: 1px solid var(--color-border);
          background:
            radial-gradient(
              circle at 16% 0%,
              var(--color-accent-soft),
              transparent 30%
            ),
            var(--color-background-secondary);
        }

        .footer-shell {
          padding-top: 42px;
          padding-bottom: max(18px, calc(env(safe-area-inset-bottom, 0px) + 12px));
        }

        .aurexis-footer-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-areas:
            "brand brand"
            "explore connect"
            "capabilities capabilities";
          gap: 28px 18px;
        }

        .footer-brand {
          grid-area: brand;
          max-width: 390px;
        }

        .footer-explore {
          grid-area: explore;
        }

        .footer-capabilities-group {
          grid-area: capabilities;
        }

        .footer-connect-group {
          grid-area: connect;
        }

        .footer-logo-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--color-text-primary);
          text-decoration: none;
        }

        .footer-description {
          max-width: 36ch;
          margin: 15px 0 0;
          color: var(--color-text-muted);
          font-size: 11.5px;
          line-height: 1.7;
        }

        .footer-project-link {
          min-height: 42px;
          margin-top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--color-accent);
          font-size: 11px;
          font-weight: 650;
          text-decoration: none;
        }

        .footer-heading {
          display: block;
          margin-bottom: 12px;
          color: var(--color-accent);
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .footer-links,
        .footer-connect {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
        }

        .footer-links a,
        .footer-connect a {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--color-text-muted);
          font-size: 11px;
          line-height: 1.25;
          text-decoration: none;
          transition:
            color 180ms var(--theme-ease),
            transform 180ms var(--theme-ease);
        }

        .footer-links a:hover,
        .footer-connect a:hover {
          color: var(--color-accent);
          transform: translateX(2px);
        }

        .footer-capabilities {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .footer-capabilities span {
          min-height: 30px;
          padding: 7px 9px;
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--color-border);
          border-radius: 999px;
          color: var(--color-text-muted);
          background: var(--color-surface);
          font-size: 10px;
          line-height: 1;
        }

        .footer-bottom {
          margin-top: 28px;
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          border-top: 1px solid var(--color-border);
        }

        .footer-bottom p {
          margin: 0;
          color: var(--color-text-muted);
          font-size: 9.5px;
          line-height: 1.5;
        }

        .footer-bottom-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 13px;
        }

        .footer-bottom-tags span {
          color: var(--color-text-muted);
          font-size: 8.5px;
          letter-spacing: 0.05em;
        }

        @media (min-width: 700px) {
          .footer-shell {
            padding-top: 54px;
            padding-bottom: 24px;
          }

          .aurexis-footer-grid {
            grid-template-columns: minmax(240px, 1.25fr) repeat(2, minmax(150px, 0.75fr));
            grid-template-areas:
              "brand explore connect"
              "brand capabilities capabilities";
            gap: 36px 38px;
          }

          .footer-bottom {
            margin-top: 40px;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        @media (min-width: 1024px) {
          .footer-shell {
            padding-top: 66px;
            padding-bottom: 28px;
          }

          .aurexis-footer-grid {
            grid-template-columns:
              minmax(250px, 1.5fr)
              minmax(120px, 0.65fr)
              minmax(190px, 0.9fr)
              minmax(150px, 0.7fr);
            grid-template-areas: "brand explore capabilities connect";
            gap: 54px;
          }

          .footer-description {
            margin-top: 19px;
            font-size: 12px;
          }

          .footer-project-link {
            margin-top: 18px;
          }

          .footer-heading {
            margin-bottom: 18px;
          }

          .footer-links,
          .footer-connect {
            gap: 7px;
          }

          .footer-capabilities {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 9px;
          }

          .footer-capabilities span {
            min-height: 0;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: transparent;
            font-size: 11px;
            line-height: 1.5;
          }

          .footer-bottom {
            margin-top: 58px;
            padding-top: 21px;
          }
        }
      `}</style>
    </footer>
  );
}
