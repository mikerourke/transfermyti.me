import React from "react";
import { Navbar } from "rsuite";
import StepSelector from "../stepSelector/StepSelector";

const Header: React.FC = () => (
  <header>
    <Navbar appearance="inverse">
      <Navbar.Header>
        <span
          css={{
            display: "inline-block",
            fontSize: 16,
            padding: "1rem 2rem",
            textTransform: "uppercase",
          }}
        >
          Transfer My Time
        </span>
      </Navbar.Header>
    </Navbar>
    <StepSelector />
  </header>
);

export default Header;
