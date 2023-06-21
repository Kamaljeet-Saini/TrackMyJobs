import { Link } from "react-router-dom";
import img from "../assets/images/not-found1.svg";
import Wrapper from "../assets/wrappers/ErrorPage";

const Error = () => {
  return (
    <Wrapper className="full-page">
      <div>
        <img src={img} alt="Not found" />
        <h3>Ohh! Page Not Found</h3>
        <p>We cann't seem to find the page you are looking for!</p>
        <Link to="/">Back home</Link>
      </div>
    </Wrapper>
  );
};

export default Error;
