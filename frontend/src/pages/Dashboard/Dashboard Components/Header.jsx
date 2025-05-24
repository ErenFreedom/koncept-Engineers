import React from 'react';
import { FiBell, FiUser } from 'react-icons/fi';

const Header = () => {
  return (
    <header className="header">
      {/* Left Side: Logo */}
      <div className="header-left">
        <img src="/logo.png" alt="Logo" />
      </div>

      {/* Right Side: Search bar + icons */}
      <div className="header-right">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />
        <div className="header-icons">
          <div className="icon notification">
            <FiBell />
          </div>
          <div className="icon">
            <FiUser />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;



