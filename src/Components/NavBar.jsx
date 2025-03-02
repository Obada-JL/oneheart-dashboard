import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/OneHeart team logo  EN PNG.png";
import "./NavBar.css";
import Swal from "sweetalert2";
import { useState } from "react";
import { Navbar, Nav, Container } from 'react-bootstrap';

export default function NavBar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.location.href = "/login";
      }
    });
  };

  return (
    <Navbar expanded={expanded} expand="lg" className="navbar ms-lg-5 me-lg-5 mt-2" dir="rtl">
      <Container fluid>
        <Navbar.Brand href="/">
          <img src={Logo} alt="شعار" className="navbar__logo" style={{ maxHeight: '50px' }} />
        </Navbar.Brand>
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(!expanded)}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>الرئيسية</Nav.Link>
            <Nav.Link as={Link} to="/projects" onClick={() => setExpanded(false)}>المشاريع</Nav.Link>
            <Nav.Link as={Link} to="/campagins" onClick={() => setExpanded(false)}>الحملات</Nav.Link>
            <Nav.Link as={Link} to="/sponsorship" onClick={() => setExpanded(false)}>الكفالات</Nav.Link>
            <Nav.Link as={Link} to="/documentations" onClick={() => setExpanded(false)}>التوثيقات</Nav.Link>
            <Nav.Link as={Link} to="/messages" onClick={() => setExpanded(false)}>الرسائل</Nav.Link>
            <Nav.Link as={Link} to="/others" onClick={() => setExpanded(false)}>أخرى</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center me-3">
            <button 
              className="btn btn-link text-dark p-0" 
              onClick={handleLogout}
              style={{ textDecoration: 'none' }}
            >
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
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
