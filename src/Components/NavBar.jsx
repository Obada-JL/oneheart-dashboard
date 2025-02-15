import { Link } from "react-router-dom";
import Logo from "../assets/OneHeart team logo  EN PNG.png";
import "./NavBar.css";

export default function NavBar() {
  return (
    <div className="navbar ms-5 me-5 mt-2" dir="rtl">
      <div className="navbar__logo">
        <img src={Logo} alt="شعار" />
      </div>
      <div className="navbar__links d-flex gap-3">
        <Link to="/">الرئيسية</Link>
        <Link to="/projects">المشاريع</Link>
        <Link to="/campagins">الحملات</Link>
        <Link to="/sponsorship">الكفالات</Link>
        <Link to="/photos">الصور</Link>
        <Link to="/videos">الفيديوهات</Link>
        <Link to="/messages">الرسائل</Link>
        <Link to="/others">أخرى</Link>
        <div className="header_controls_btn header_user trans_200">
          <a className="d-flex flex-row align-items-center justify-content-center text-dark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-person"
              viewBox="0 0 16 16"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
