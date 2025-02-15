import { Outlet } from "react-router-dom";
// import Logo from "./assets/homelogo.png";
import NavBar from "./Components/NavBar";
export default function PageLayout() {
  return (
    <>
      <div className="bg-light">
        <NavBar />
      </div>
      <div>
        <Outlet />
      </div>
      <div></div>
    </>
  );
}
