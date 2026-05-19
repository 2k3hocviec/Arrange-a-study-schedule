import React, { useState } from "react";

export const useMobileMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu };
};

export const MobileMenuButton = ({ onClick, isOpen }) => (
  <button className={`hamburger ${isOpen ? "active" : ""}`} onClick={onClick}>
    <span></span>
    <span></span>
    <span></span>
  </button>
);

export const MobileMenuOverlay = ({ isOpen, onClick }) => (
  <div
    className={`sidebar-overlay ${isOpen ? "active" : ""}`}
    onClick={onClick}
  />
);

export const getResponsiveStyle = (baseStyle, mobileStyle) => {
  return baseStyle;
};

export const getCSSMediaQuery = (maxWidth) => {
  return `@media (max-width: ${maxWidth}px)`;
};
