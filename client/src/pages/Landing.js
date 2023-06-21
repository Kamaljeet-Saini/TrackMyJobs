import React from "react";
import main from "../assets/images/main.svg";
import Wrapper from "../assets/wrappers/LandingPage";
import { Logo } from "../components";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <Wrapper>
      <nav>
        <Logo />
      </nav>
      <div className="container page">
        <div className="info">
          <h1>
            Job <span>tracking</span> app
          </h1>
          <p>
            Readymade kickstarter occupy butcher food truck. Migas freegan woke
            marfa. Beard godard church-key cloud bread neutra VHS williamsburg.
            Biodiesel lomo bitters live-edge. Glossier cloud bread tbh
            mumblecore ascot poutine. PBR&B neutral milk hotel master cleanse
            tonx tumblr disrupt la croix butcher.
          </p>
          <Link to="/register" className="btn btn-hero">
            Login/Register
          </Link>
        </div>
        <img src={main} alt="job hunt" className="img main-img" />
      </div>
    </Wrapper>
  );
};

export default Landing;
