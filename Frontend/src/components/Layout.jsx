import React from "react";
import Header from "./Header";

const Layout = ({ children, showHeader = true, className = "" }) => {
  return (
    <div className={`min-h-screen min-w-6xl ${className}`}>
      {showHeader && <Header />}
      <main className={`mt-10 ${showHeader ? "" : "h-screen"}`}>{children}</main>
    </div>
  );
};

export default Layout;
