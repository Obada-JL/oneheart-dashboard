import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from 'sweetalert2';

export default function CurrentProjects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');

  // Fetch Projects from API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://oneheart.team/api/current-projects"
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
        category: project.category || "",
        categoryAr: project.categoryAr || "",
        description: project.description || "",
        descriptionAr: project.descriptionAr || "",
      });
    } else {
      // For add mode, initialize with empty details object
      setSelectedProject({
        ...project,
        details: {
          title: "",
          titleAr: "",
          description1: "",
          description1Ar: "",
          description2: "",
          description2Ar: "",
        }
      });
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      category: "",
      categoryAr: "",
      details: {
        title: "",
        titleAr: "",
        description1: "",
        description1Ar: "",
        description2: "",
        description2Ar: "",
      }
    });
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
        category: "التصنيف بالإنجليزية",
        categoryAr: "التصنيف بالعربية",
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

      if (modalMode === "add" && (!selectedProject.details || !selectedProject.details.image)) {
        missingFields.push("صورة التفاصيل");
      }

      if (missingFields.length > 0) {
        await Swal.fire({
          title: 'حقول مطلوبة',
          html: `الرجاء إكمال الحقول التالية:<br>${missingFields.join("<br>")}`,
          icon: 'warning',
          confirmButtonText: 'حسناً'
        });
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

      // Create details object
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
          ? "https://oneheart.team/api/current-projects"
          : `https://oneheart.team/api/current-projects/${selectedProject._id}`;

      const method = modalMode === "add" ? "post" : "put";

      await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        title: 'تم بنجاح',
        text: modalMode === "add" ? 'تم إضافة المشروع بنجاح' : 'تم تحديث المشروع بنجاح',
        icon: 'success',
        confirmButtonText: 'حسناً'
      });

      fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving project:", error);
      await Swal.fire({
        title: 'خطأ',
        text: error.response?.data?.message || "حدث خطأ أثناء حفظ المشروع",
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لا يمكن التراجع عن هذا الإجراء!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف!',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`https://oneheart.team/api/current-projects/${id}`);
        await Swal.fire({
          title: 'تم الحذف!',
          text: 'تم حذف المشروع بنجاح.',
          icon: 'success',
          confirmButtonText: 'حسناً'
        });
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        await Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء حذف المشروع',
          icon: 'error',
          confirmButtonText: 'حسناً'
        });
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
        <h1 className="fw-bold">المشاريع الحالية</h1>
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
                <th>التصنيف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>
                    <img
                      src={`https://oneheart.team/uploads/current-projects/${project.image}`}
                      alt={project.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>{project.title}</td>
                  <td>{project.description && project.description.substring(0, 50)}...</td>
                  <td>{project.category}</td>
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

      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة مشروع جديد" : "تعديل المشروع"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">صورة المشروع</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setSelectedProject({
                    ...selectedProject,
                    image: e.target.files[0],
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">صورة التفاصيل</Form.Label>
              <Form.Control
                type="file"
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
            </Form.Group>

            <Tabs
              activeKey={activeLanguage}
              onSelect={(k) => setActiveLanguage(k)}
              className="mb-4"
            >
              <Tab eventKey="ar" title="العربية">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">العنوان</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.titleAr || ""}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        titleAr: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">الوصف</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedProject.descriptionAr || ""}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        descriptionAr: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">التصنيف</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.categoryAr || ""}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        categoryAr: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* Arabic Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">تفاصيل إضافية</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>عنوان التفاصيل</Form.Label>
                    <Form.Control
                      type="text"
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
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>الوصف الأول</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
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
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>الوصف الثاني</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
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
                  </Form.Group>
                </div>
              </Tab>

              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.title || ""}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        title: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedProject.description || ""}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        description: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.category || ""}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        category: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* English Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">Additional Details</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>Details Title</Form.Label>
                    <Form.Control
                      type="text"
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
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>First Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
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
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Second Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
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
                  </Form.Group>
                </div>
              </Tab>
            </Tabs>
          </Form>
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
                  src={`https://oneheart.team/uploads/current-projects/${viewProject.image}`}
                  alt={viewProject.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">العنوان</h5>
                <p className="text-muted mb-1">بالعربية: {viewProject.titleAr}</p>
                <p>بالإنجليزية: {viewProject.title}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">الوصف</h5>
                <p className="text-muted mb-1">بالعربية: {viewProject.descriptionAr}</p>
                <p>بالإنجليزية: {viewProject.description}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">التصنيف</h5>
                <p className="text-muted mb-1">بالعربية: {viewProject.categoryAr}</p>
                <p>بالإنجليزية: {viewProject.category}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">تفاصيل إضافية</h5>
                <div className="mb-3">
                  <h6>العنوان</h6>
                  <p className="text-muted mb-1">بالعربية: {viewProject.details?.titleAr}</p>
                  <p>بالإنجليزية: {viewProject.details?.title}</p>
                </div>

                <div className="mb-3">
                  <h6>الوصف الأول</h6>
                  <p className="text-muted mb-1">بالعربية: {viewProject.details?.description1Ar}</p>
                  <p>بالإنجليزية: {viewProject.details?.description1}</p>
                </div>

                <div className="mb-3">
                  <h6>الوصف الثاني</h6>
                  <p className="text-muted mb-1">بالعربية: {viewProject.details?.description2Ar}</p>
                  <p>بالإنجليزية: {viewProject.details?.description2}</p>
                </div>
              </div>
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
