import {
  ArrowLeft,
  Home,
  SearchX,
} from "lucide-react";

import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";


export default function NotFound() {
  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "82vh",

          display: "grid",
          placeItems: "center",

          padding:
            "140px 20px 80px",

          background:
            "radial-gradient(circle at 50% 30%, var(--color-accent-soft), transparent 32%)",
        }}
      >
        <div
          style={{
            maxWidth: 750,

            textAlign: "center",
          }}
        >

          <div
            style={{
              width: 65,
              height: 65,

              margin:
                "0 auto 25px",

              display: "grid",
              placeItems: "center",

              borderRadius: 20,

              color: "var(--color-accent)",

              background:
                "var(--color-accent-soft)",

              border:
                "1px solid var(--color-accent-soft)",

              boxShadow:
                "0 20px 60px var(--color-accent-soft)",
            }}
          >
            <SearchX
              size={28}
            />
          </div>


          <span className="section-label">
            Error 404
          </span>


          <h1
            style={{
              marginTop: 15,

              fontSize:
                "clamp(3.5rem,9vw,8rem)",

              lineHeight: .9,

              letterSpacing:
                "-.07em",
            }}
          >
            Lost in the
            <br />

            <span className="gradient-text">
              system.
            </span>
          </h1>


          <p
            style={{
              maxWidth: 520,

              margin:
                "25px auto 0",

              color: "var(--color-text-muted)",

              fontSize: 14,

              lineHeight: 1.8,
            }}
          >
            The page you&apos;re looking for
            doesn&apos;t exist, has moved or
            is no longer available.
          </p>


          <div
            style={{
              marginTop: 32,

              display: "flex",

              justifyContent:
                "center",

              flexWrap: "wrap",

              gap: 10,
            }}
          >

            <Link
              href="/"
              className="primary-button"
            >
              <Home size={16} />

              Back Home
            </Link>


            <Link
              href="/services"
              className="secondary-button"
            >
              <ArrowLeft size={16} />

              Explore AUREXIS
            </Link>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}