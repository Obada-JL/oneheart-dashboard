import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/OneHeart team logo  EN PNG.png";
import "./NavBar.css";
import "./UserDropdown.css";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import axios from "axios";

export default function NavBar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user info from localStorage
    const getUserInfo = () => {
      try {
        // First try to get from stored user object
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.username) {
            setCurrentUser({
              id: parsedUser.id,
              username: parsedUser.username,
              role: parsedUser.role
            });
            return;
          }
        }
        
        // If that fails, try individual fields
        const username = localStorage.getItem("username");
        const userId = localStorage.getItem("userId");
        const role = localStorage.getItem("role") || "user";
        if (username) {
          setCurrentUser({ 
            id: userId || "",
            username: username,
            role: role
          });
          return;
        }
        
        // If all else fails, set a default
        setCurrentUser({ username: "المستخدم", role: "user" });
      } catch (error) {
        console.error("Error getting user info:", error);
        setCurrentUser({ username: "المستخدم", role: "user" });
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم تسجيل خروجك من النظام!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، تسجيل الخروج!",
      cancelButtonText: "إلغاء",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.location.href = "/login";
      }
    });
  };

  // Get first letter of username for avatar
  const getInitial = () => {
    if (currentUser?.username) {
      return currentUser.username.charAt(0).toUpperCase();
    }
    return "م";
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
            {currentUser?.role === "admin" && (
              <Nav.Link as={Link} to="/users" onClick={() => setExpanded(false)}>المستخدمين</Nav.Link>
            )}
            <Nav.Link as={Link} to="/others" onClick={() => setExpanded(false)}>أخرى</Nav.Link>
          </Nav>
          
          <NavDropdown 
            title={
              <div className="user-dropdown-toggle">
                <div className="avatar">{getInitial()}</div>
                <span className="username">{currentUser?.username || "المستخدم"}</span>
                {currentUser?.role && (
                  <span className={`role-badge ${currentUser.role === "admin" ? "admin-badge" : "user-badge"}`}>
                    {currentUser.role === "admin" ? "مدير" : "مستخدم"}
                  </span>
                )}
              </div>
            } 
            id="user-dropdown"
            align="end"
            className="no-arrow dropdown"
          >
            <NavDropdown.Header>
              <div className="d-flex align-items-center">
                <div className="avatar ms-2 me-2" style={{ 
                  backgroundColor: "#47a896", 
                  color: "white",
                  width: "35px",
                  height: "35px",
                  fontSize: "18px",
                  border: "none",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%",
                  marginLeft: "10px"
                }}>{getInitial()}</div>
                <div className="text-end">
                  <div className="fw-bold">{currentUser?.username || "المستخدم"}</div>
                  <div className="text-muted small">
                    {currentUser?.role === "admin" ? "مدير النظام" : "مستخدم عادي"}
                  </div>
                </div>
              </div>
            </NavDropdown.Header>
            <NavDropdown.Item 
              as={Link} 
              to="/profile" 
              onClick={() => setExpanded(false)}
              className="profile-item"
            >
              <div className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#47a896" className="dropdown-item-icon" viewBox="0 0 16 16">
                  <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1zm3.63-4.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
                </svg>
                <span className="dropdown-item-text">الملف الشخصي</span>
              </div>
            </NavDropdown.Item>
            {currentUser?.role === "admin" && (
              <NavDropdown.Item 
                as={Link} 
                to="/users" 
                onClick={() => setExpanded(false)}
                className="profile-item"
              >
                <div className="d-flex align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#47a896" className="dropdown-item-icon" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                  </svg>
                  <span className="dropdown-item-text">إدارة المستخدمين</span>
                </div>
              </NavDropdown.Item>
            )}
            <NavDropdown.Divider />
            {/* <NavDropdown.Item 
              as={Link}
              to="/others"
              onClick={() => setExpanded(false)}
              className="profile-item"
            >
              <div className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#47a896" className="dropdown-item-icon" viewBox="0 0 16 16">
                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
                <span className="dropdown-item-text">الإعدادات</span>
              </div>
            </NavDropdown.Item> */}
            <NavDropdown.Divider />
            <NavDropdown.Item 
              onClick={handleLogout}
              className="logout-item"
            >
              <div className="d-flex align-items-center text-danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="dropdown-item-icon" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
                <span className="dropdown-item-text">تسجيل الخروج</span>
              </div>
            </NavDropdown.Item>
          </NavDropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
