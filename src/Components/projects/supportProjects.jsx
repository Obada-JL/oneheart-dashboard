import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

export default function SupportProjects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3500/api/support-projects"
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleShowModal = (project = {}, mode = "add") => {
    if (mode === "edit") {
      setSelectedProject({
        ...project,
        details: {
          ...project.details,
          title: project.details?.title || "",
          titleAr: project.details?.titleAr || "",
          description1: project.details?.description1 || "",
          description1Ar: project.details?.description1Ar || "",
          description2: project.details?.description2 || "",
          description2Ar: project.details?.description2Ar || "",
        },
      });
    } else {
      setSelectedProject(project);
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject({});
  };

  const handleSaveProject = async () => {
    setLoading(true);
    const formData = new FormData();

    try {
      // Validate required fields
      const requiredFields = {
        title: "العنوان بالإنجليزية",
        titleAr: "العنوان بالعربية",
        description: "الوصف بالإنجليزية",
        descriptionAr: "الوصف بالعربية",
        buttonLink: "رابط الزر",
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!selectedProject[field]) {
          missingFields.push(label);
        }
      });

      if (modalMode === "add" && !selectedProject.image) {
        missingFields.push("الصورة الرئيسية");
      }

      if (missingFields.length > 0) {
        alert(`الرجاء إكمال الحقول التالية:\n${missingFields.join("\n")}`);
        setLoading(false);
        return;
      }

      // Append main fields
      Object.entries(requiredFields).forEach(([field]) => {
        formData.append(field, selectedProject[field] || "");
      });

      // Append images
      if (selectedProject.image instanceof File) {
        formData.append("image", selectedProject.image);
      }
      if (selectedProject.details?.image instanceof File) {
        formData.append("detailsImage", selectedProject.details.image);
      }

      // Create and append details object
      const details = {
        title: selectedProject.details?.title || "",
        titleAr: selectedProject.details?.titleAr || "",
        description1: selectedProject.details?.description1 || "",
        description1Ar: selectedProject.details?.description1Ar || "",
        description2: selectedProject.details?.description2 || "",
        description2Ar: selectedProject.details?.description2Ar || "",
      };

      formData.append("details", JSON.stringify(details));

      const url =
        modalMode === "add"
          ? "http://localhost:3500/api/support-projects"
          : `http://localhost:3500/api/support-projects/${selectedProject._id}`;

      const method = modalMode === "add" ? "post" : "put";

      await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving project:", error);
      alert(error.response?.data?.message || "حدث خطأ أثناء حفظ المشروع");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3500/api/support-projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShowViewModal = (project) => {
    setViewProject(project);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewProject(null);
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">مشاريع الدعم</h1>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة مشروع جديد
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">جاري التحميل...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>العنوان</th>
                <th>الوصف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>
                    <img
                      src={`http://localhost:3500/uploads/support-projects/${project.image}`}
                      alt={project.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>{project.title}</td>
                  <td>{project.description.substring(0, 100)}...</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleShowViewModal(project)}
                      >
                        عرض
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleShowModal(project, "edit")}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProject(project._id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة مشروع جديد" : "تعديل المشروع"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">صورة المشروع الرئيسية</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  image: e.target.files[0],
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">العنوان</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.title || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">العنوان بالعربية</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.titleAr || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  titleAr: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف</label>
            <textarea
              className="form-control"
              value={selectedProject.description || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف بالعربية</label>
            <textarea
              className="form-control"
              value={selectedProject.descriptionAr || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  descriptionAr: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">رابط الزر</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.buttonLink || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  buttonLink: e.target.value,
                })
              }
            />
          </div>

          {/* Details Section */}
          <h5 className="mt-4 mb-3">تفاصيل المشروع</h5>
          <div className="mb-3">
            <label className="form-label">صورة التفاصيل</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    image: e.target.files[0],
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">عنوان التفاصيل</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.details?.title || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">عنوان التفاصيل بالعربية</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.details?.titleAr || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    titleAr: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الأول</label>
            <textarea
              className="form-control"
              value={selectedProject.details?.description1 || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    description1: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الأول بالعربية</label>
            <textarea
              className="form-control"
              value={selectedProject.details?.description1Ar || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    description1Ar: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الثاني</label>
            <textarea
              className="form-control"
              value={selectedProject.details?.description2 || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    description2: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الثاني بالعربية</label>
            <textarea
              className="form-control"
              value={selectedProject.details?.description2Ar || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    description2Ar: e.target.value,
                  },
                })
              }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handleSaveProject}>
            {modalMode === "add" ? "إضافة" : "حفظ التغييرات"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={handleCloseViewModal}
        size="lg"
        dir="rtl"
      >
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل المشروع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewProject && (
            <div className="view-project-details">
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:3500/uploads/support-projects/${viewProject.image}`}
                  alt={viewProject.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">معلومات المشروع</h5>
                <div className="row">
                  <div className="col-12">
                    <p>
                      <strong>العنوان:</strong> {viewProject.title}
                    </p>
                    <p>
                      <strong>الوصف:</strong>
                    </p>
                    <p className="text-muted">{viewProject.description}</p>
                    <p>
                      <strong>رابط الزر:</strong> {viewProject.buttonLink}
                    </p>
                  </div>
                </div>
              </div>

              {viewProject.details && (
                <div className="project-details mt-4">
                  <h5 className="border-bottom pb-2">التفاصيل الإضافية</h5>
                  <div className="text-center my-3">
                    <img
                      src={`http://localhost:3500/uploads/support-projects/${viewProject.details.image}`}
                      alt="تفاصيل"
                      className="img-fluid"
                      style={{ maxHeight: "200px", objectFit: "contain" }}
                    />
                  </div>
                  <p>
                    <strong>عنوان التفاصيل:</strong> {viewProject.details.title}
                  </p>
                  <div className="mt-3">
                    <p>
                      <strong>الوصف الأول:</strong>
                    </p>
                    <p className="text-muted">
                      {viewProject.details.description1}
                    </p>
                  </div>
                  <div className="mt-3">
                    <p>
                      <strong>الوصف الثاني:</strong>
                    </p>
                    <p className="text-muted">
                      {viewProject.details.description2}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
