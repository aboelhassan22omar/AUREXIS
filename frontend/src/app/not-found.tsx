import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Unit from "@/components/stage/Unit";

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main id="main" className="ax-404">
        <div className="d-grid gap-5" style={{ justifyItems: "center" }}>
          <div className="ax-404__stage">
            <p className="ax-404__code" aria-hidden="true">404</p>
            <Unit className="ax-404__unit" />
          </div>
          <span className="ax-eyebrow ax-eyebrow--center">Page not found</span>
          <h1 className="ax-h2">
            <span className="ax-lit">This route </span>
            <span className="ax-muted-words">doesn&apos;t exist.</span>
          </h1>
          <p className="ax-lead">
            The page may have moved, or the link may be incorrect.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link href="/" className="ax-btn ax-btn--primary">
              <ArrowLeft size={17} />
              Back home
            </Link>
            <Link href="/services" className="ax-btn ax-btn--glass">
              Explore services
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
