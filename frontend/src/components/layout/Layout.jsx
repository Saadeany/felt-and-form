import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import VerificationBanner from "../common/VerificationBanner";

const Layout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <VerificationBanner />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
