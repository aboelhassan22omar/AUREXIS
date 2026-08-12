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
            "radial-gradient(circle at 50% 30%, rgba(108,51,255,.11), transparent 32%)",
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

              color: "#b99aff",

              background:
                "rgba(108,51,255,.10)",

              border:
                "1px solid rgba(139,92,246,.17)",

              boxShadow:
                "0 20px 60px rgba(70,25,180,.12)",
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

              color: "#8b8692",

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

              Explore AXION
            </Link>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}