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
      // Parse donation links if they exist
      let parsedDonationLinks = [];
      if (project.donationLinks) {
        if (typeof project.donationLinks === 'string') {
          try {
            parsedDonationLinks = JSON.parse(project.donationLinks);
          } catch (error) {
            console.error("Error parsing donation links:", error);
          }
        } else if (Array.isArray(project.donationLinks)) {
          parsedDonationLinks = project.donationLinks;
        }
      }

      setSelectedProject({
        ...project,
        title: project.title || "",
        titleAr: project.titleAr || "",
        category: project.category || "",
        categoryAr: project.categoryAr || "",
        description: project.description || "",
        descriptionAr: project.descriptionAr || "",
        donationLinks: parsedDonationLinks
      });
    } else {
      // For add mode, initialize with empty values
      setSelectedProject({
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        category: "",
        categoryAr: "",
        image: null,
        donationLinks: []
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
      image: null,
      donationLinks: []
    });
  };

  // Add new donation link
  const addDonationLink = () => {
    setSelectedProject({
      ...selectedProject,
      donationLinks: [
        ...(selectedProject.donationLinks || []),
        { methodName: "", link: "", icon: null }
      ]
    });
  };

  // Update donation link field
  const updateDonationLink = (index, field, value) => {
    const updatedLinks = [...(selectedProject.donationLinks || [])];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };

    setSelectedProject({
      ...selectedProject,
      donationLinks: updatedLinks
    });
  };

  // Remove donation link
  const removeDonationLink = (index) => {
    const updatedLinks = [...(selectedProject.donationLinks || [])];
    updatedLinks.splice(index, 1);

    setSelectedProject({
      ...selectedProject,
      donationLinks: updatedLinks
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

      // Append main image
      if (selectedProject.image instanceof File) {
        formData.append("image", selectedProject.image);
      }

      // Append donation links
      if (selectedProject.donationLinks && selectedProject.donationLinks.length > 0) {
        // Filter out incomplete donation links
        const validLinks = selectedProject.donationLinks.filter(
          link => link.methodName && link.link
        );

        if (validLinks.length > 0) {
          // Create a clean version of the links for JSON (without File objects)
          const cleanLinks = validLinks.map((link, index) => {
            // If the icon is a File object, we'll upload it separately
            if (link.icon instanceof File) {
              // Append the file to formData with a unique name
              formData.append(`donationIcon_${index}`, link.icon);

              // Return link without icon (backend will connect them)
              return {
                methodName: link.methodName,
                link: link.link,
                iconIndex: index // Add index to associate with the uploaded file
              };
            } else {
              // Keep the existing icon string
              return {
                methodName: link.methodName,
                link: link.link,
                icon: link.icon
              };
            }
          });

          // Add the sanitized links to formData
          formData.append("donationLinks", JSON.stringify(cleanLinks));
        }
      }

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
                <th>روابط التبرع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(projects) ? projects.map((project) => (
                <tr key={project._id}>
                  <td>
                    <img
                      src={`https://oneheart.team/uploads/current-projects/${project.image}`}
                      alt={project.title}
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  </td>
                  <td>{project.title}</td>
                  <td>
                    {project.description && project.description.length > 50
                      ? `${project.description.substring(0, 50)}...`
                      : project.description}
                  </td>
                  <td>{project.category}</td>
                  <td>
                    {project.donationLinks ? (
                      typeof project.donationLinks === 'string' ? (
                        JSON.parse(project.donationLinks).length > 0 ? (
                          <span className="badge bg-success">{JSON.parse(project.donationLinks).length} روابط</span>
                        ) : (
                          <span className="badge bg-secondary">لا توجد روابط</span>
                        )
                      ) : Array.isArray(project.donationLinks) && project.donationLinks.length > 0 ? (
                        <span className="badge bg-success">{project.donationLinks.length} روابط</span>
                      ) : (
                        <span className="badge bg-secondary">لا توجد روابط</span>
                      )
                    ) : (
                      <span className="badge bg-secondary">لا توجد روابط</span>
                    )}
                  </td>
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
              )) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No projects found.
                  </td>
                </tr>
              )}
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
              {selectedProject.image && typeof selectedProject.image === "string" && (
                <div className="mt-2">
                  <img
                    src={`https://oneheart.team/uploads/current-projects/${selectedProject.image}`}
                    alt="Current main"
                    style={{ height: "100px", objectFit: "contain" }}
                  />
                  <p className="text-muted small">الصورة الحالية</p>
                </div>
              )}
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
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">الوصف</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedProject.descriptionAr || ""}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        descriptionAr: e.target.value,
                      })
                    }
                    required
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
                    required
                  />
                </Form.Group>
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
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedProject.description || ""}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        description: e.target.value,
                      })
                    }
                    required
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
                    required
                  />
                </Form.Group>
              </Tab>
            </Tabs>

            {/* Donation Links Section */}
            <div className="border rounded p-3 mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">روابط التبرع / Donation Links</h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addDonationLink}
                >
                  إضافة رابط جديد / Add New Link
                </Button>
              </div>

              {selectedProject.donationLinks && selectedProject.donationLinks.length > 0 ? (
                selectedProject.donationLinks.map((link, index) => (
                  <div key={index} className="card mb-3 p-3">
                    <div className="d-flex justify-content-end mb-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeDonationLink(index)}
                      >
                        حذف / Remove
                      </Button>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label>أيقونة طريقة الدفع / Payment Method Icon</Form.Label>
                          <Form.Control
                            type="file"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                updateDonationLink(index, "icon", e.target.files[0]);
                              }
                            }}
                          />
                          {link.icon && typeof link.icon === "string" && (
                            <div className="mt-2">
                              <img
                                src={`https://oneheart.team/uploads/payment-icons/${link.icon}`}
                                alt="Payment icon"
                                style={{ height: "30px", objectFit: "contain" }}
                              />
                            </div>
                          )}
                        </Form.Group>
                      </div>
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label>اسم طريقة الدفع / Method Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={link.methodName || ""}
                            onChange={(e) => updateDonationLink(index, "methodName", e.target.value)}
                            placeholder="e.g., PayPal, Bank Transfer"
                            required
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label>رابط الدفع / Payment Link</Form.Label>
                          <Form.Control
                            type="text"
                            value={link.link || ""}
                            onChange={(e) => updateDonationLink(index, "link", e.target.value)}
                            placeholder="https://..."
                            required
                          />
                        </Form.Group>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-muted">
                  لا توجد روابط للتبرع. انقر على "إضافة رابط جديد" لإضافة طرق الدفع.
                  <br />
                  No donation links. Click "Add New Link" to add payment methods.
                </div>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إغلاق
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveProject}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : modalMode === "add" ? (
              "إضافة"
            ) : (
              "حفظ التغييرات"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
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

              {viewProject.donationLinks && viewProject.donationLinks.length > 0 && (
                <div className="mb-4">
                  <h5 className="border-bottom pb-2">روابط التبرع</h5>
                  <div className="row">
                    {viewProject.donationLinks.map((link, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="card h-100 p-3">
                          <div className="d-flex align-items-center mb-2">
                            {link.icon && (
                              <img
                                src={`https://oneheart.team/uploads/payment-icons/${link.icon}`}
                                alt={link.methodName}
                                className="me-2"
                                style={{ height: "30px", width: "auto" }}
                              />
                            )}
                            <strong>{link.methodName}</strong>
                          </div>
                          <a href={link.link} target="_blank" rel="noopener noreferrer">
                            {link.link}
                          </a>
                        </div>
                      </div>
                    ))}
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
