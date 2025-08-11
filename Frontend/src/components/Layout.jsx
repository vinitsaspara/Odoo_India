import React from "react";
import Header from "./Header";

const Layout = ({ children, showHeader = true, className = "" }) => {
  return (
    <div className={`min-h-screen ${className}`}>
      {showHeader && <Header />}
      <main className={`${showHeader ? "" : "h-screen"}`}>{children}</main>
    </div>
  );
};

export default Layout;
