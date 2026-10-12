import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/ui/Logo";
import {
  capabilities,
  navigation,
} from "@/lib/content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ax-footer">
      <div className="container">
        <div className="row g-6">
          <div className="col-12 col-lg-5">
            <Link href="/" aria-label="AUREXIS home" className="d-inline-flex">
              <Logo size={30} />
            </Link>
            <p className="ax-footer__statement mt-7">
              <span className="ax-lit">Engineering the</span>{" "}
              <span className="ax-muted-words">next advantage.</span>
            </p>
            <Link href="/contact" className="ax-btn ax-btn--primary mt-6">
              Start a project
              <ArrowUpRight size={17} className="ax-arrow" />
            </Link>
          </div>

          <div className="col-6 col-md-4 col-lg-2 offset-lg-1">
            <p className="ax-footer__heading">Company</p>
            <ul className="ax-footer__list">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <p className="ax-footer__heading">Capabilities</p>
            <ul className="ax-footer__list">
              {capabilities.slice(0, 6).map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-md-4 col-lg-2">
            <p className="ax-footer__heading">Account</p>
            <ul className="ax-footer__list">
              <li><Link href="/login">Sign in</Link></li>
              <li><Link href="/register">Create account</Link></li>
              <li><Link href="/dashboard">Workspace</Link></li>
              <li><Link href="/chat">Aurexis AI workspace</Link></li>
            </ul>
          </div>
        </div>

        <p className="ax-footer__wordmark" aria-hidden="true">AUREXIS</p>

        <div className="ax-footer__bottom">
          <span>© {year} AUREXIS. All rights reserved.</span>
          <span className="ax-mono">Intelligence · Software · Solutions</span>
        </div>
      </div>
      <div className="ax-footer__horizon" aria-hidden="true" />
    </footer>
  );
}
