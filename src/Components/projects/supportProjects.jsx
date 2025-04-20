import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from 'sweetalert2';

export default function SupportProjects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    category: "",
    categoryAr: "",
    image: null,
    donationLinks: []
  });
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

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
    // Reset validation states
    setValidated(false);
    setFormErrors({});
    setTouched({});

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
        description: project.description || "",
        descriptionAr: project.descriptionAr || "",
        category: project.category || "",
        categoryAr: project.categoryAr || "",
        donationLinks: parsedDonationLinks,
      });
    } else {
      setSelectedProject({
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        category: "",
        categoryAr: "",
        donationLinks: []
      });
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setValidated(false);
    setFormErrors({});
    setTouched({});
  };

  // Field change handler with validation
  const handleFieldChange = (field, value, isDetailsField = false) => {
    let updatedProject;

    if (isDetailsField) {
      updatedProject = {
        ...selectedProject,
        details: {
          ...selectedProject.details,
          [field]: value
        }
      };
    } else {
      updatedProject = {
        ...selectedProject,
        [field]: value
      };
    }

    setSelectedProject(updatedProject);

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [isDetailsField ? `details.${field}` : field]: true
    }));

    // Validate the field
    validateField(field, value, isDetailsField);
  };

  // Validate a single field
  const validateField = (field, value, isDetailsField = false) => {
    const errors = { ...formErrors };
    const fieldPath = isDetailsField ? `details.${field}` : field;

    // Clear previous error
    delete errors[fieldPath];

    // Required fields validation
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr',];
    if (requiredFields.includes(field) && (!value || value.trim() === '')) {
      errors[fieldPath] = 'This field is required';
    }

    // Numeric fields validation

    setFormErrors(errors);
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr'];

    // Check required fields
    requiredFields.forEach(field => {
      if (selectedProject[field] === undefined || selectedProject[field] === null ||
        (typeof selectedProject[field] === 'string' && selectedProject[field].trim() === '')) {
        errors[field] = 'This field is required';
      }
    });

    // Check image in add mode only
    if (modalMode === 'add' && !selectedProject.image) {
      errors['image'] = 'Main image is required';
    }

    setFormErrors(errors);
    setTouched(requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    return Object.keys(errors).length === 0;
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    try {
      // Validate all required fields
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

      // Handle donation links
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
          ? "http://localhost:3500/api/support-projects"
          : `http://localhost:3500/api/support-projects/${selectedProject._id}`;

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
        await axios.delete(`http://localhost:3500/api/support-projects/${id}`);
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
    console.log(project);
    setViewProject(project);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewProject(null);
  };

  // Function to add a new donation link
  const addDonationLink = () => {
    setSelectedProject({
      ...selectedProject,
      donationLinks: [
        ...(selectedProject.donationLinks || []),
        { methodName: "", link: "", icon: null }
      ]
    });
  };

  // Function to remove a donation link
  const removeDonationLink = (index) => {
    const updatedLinks = [...(selectedProject.donationLinks || [])];
    updatedLinks.splice(index, 1);
    setSelectedProject({
      ...selectedProject,
      donationLinks: updatedLinks
    });
  };

  // Function to update a donation link
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
                      src={`http://localhost:3500/uploads/support-projects/${project.image}`}
                      alt={project.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>
                    <div>
                      <div>{project.titleAr}</div>
                      <div className="text-muted small">{project.title}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{project.descriptionAr?.substring(0, 100)}{project.descriptionAr?.length > 100 ? "..." : ""}</div>
                      <div className="text-muted small">{project.description?.substring(0, 100)}{project.description?.length > 100 ? "..." : ""}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{project.categoryAr}</div>
                      <div className="text-muted small">{project.category}</div>
                    </div>
                  </td>
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "Add Support Project" : "Edit Project"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Form.Group className="mb-4">
              <Form.Label>
                Project Image <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  handleFieldChange('image', e.target.files[0])
                }
                isInvalid={validated && formErrors.image}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.image}
              </Form.Control.Feedback>
              {selectedProject.image && !(selectedProject.image instanceof File) && (
                <div className="mt-2">
                  <img
                    src={`http://localhost:3500/uploads/support-projects/${selectedProject.image}`}
                    alt="Current"
                    style={{ height: "100px", objectFit: "contain" }}
                  />
                  <p className="text-muted small">Current image</p>
                </div>
              )}
              {selectedProject.image instanceof File && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(selectedProject.image)}
                    alt="Preview"
                    style={{ height: "100px", objectFit: "contain" }}
                  />
                  <p className="text-muted small">New image preview</p>
                </div>
              )}
            </Form.Group>

            <Tabs
              activeKey={activeLanguage}
              onSelect={(k) => setActiveLanguage(k)}
              className="mb-4"
            >
              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.title || ""}
                    onChange={(e) =>
                      handleFieldChange('title', e.target.value)
                    }
                    isInvalid={validated && formErrors.title}
                    isValid={touched.title && !formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.category || ""}
                    onChange={(e) =>
                      handleFieldChange('category', e.target.value)
                    }
                    isValid={touched.category && !formErrors.category}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedProject.description || ""}
                    onChange={(e) =>
                      handleFieldChange('description', e.target.value)
                    }
                    isInvalid={validated && formErrors.description}
                    isValid={touched.description && !formErrors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Tab>

              <Tab eventKey="ar" title="Arabic">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Title (Arabic) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.titleAr || ""}
                    onChange={(e) =>
                      handleFieldChange('titleAr', e.target.value)
                    }
                    isInvalid={validated && formErrors.titleAr}
                    isValid={touched.titleAr && !formErrors.titleAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.titleAr}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category (Arabic)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.categoryAr || ""}
                    onChange={(e) =>
                      handleFieldChange('categoryAr', e.target.value)
                    }
                    isValid={touched.categoryAr && !formErrors.categoryAr}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Description (Arabic) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedProject.descriptionAr || ""}
                    onChange={(e) =>
                      handleFieldChange('descriptionAr', e.target.value)
                    }
                    isInvalid={validated && formErrors.descriptionAr}
                    isValid={touched.descriptionAr && !formErrors.descriptionAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.descriptionAr}
                  </Form.Control.Feedback>
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
                                src={`http://localhost:3500/uploads/payment-icons/${link.icon}`}
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
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveProject} disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : modalMode === "add" ? (
              "Add"
            ) : (
              "Save Changes"
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
                  src={`http://localhost:3500/uploads/support-projects/${viewProject.image}`}
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
                <h5 className="border-bottom pb-2">التصنيف</h5>
                <p className="text-muted mb-1">بالعربية: {viewProject.categoryAr}</p>
                <p>بالإنجليزية: {viewProject.category}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">الوصف</h5>
                <p className="text-muted mb-1">بالعربية: {viewProject.descriptionAr}</p>
                <p>بالإنجليزية: {viewProject.description}</p>
              </div>

              <h5>التصنيف / Category</h5>
              <p className="text-muted">{viewProject.categoryAr}</p>
              <p>{viewProject.category}</p>

              {/* Donation Links Section */}
              <h5>روابط التبرع / Donation Links</h5>
              {viewProject.donationLinks ? (
                typeof viewProject.donationLinks === 'string' ? (
                  JSON.parse(viewProject.donationLinks).length > 0 ? (
                    <div className="row">
                      {JSON.parse(viewProject.donationLinks).map((link, index) => (
                        <div key={index} className="col-md-4 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              {link.icon && (
                                <div className="text-center mb-2">
                                  <img
                                    src={`http://localhost:3500/uploads/payment-icons/${link.icon}`}
                                    alt={link.methodName}
                                    style={{ height: "30px", objectFit: "contain" }}
                                  />
                                </div>
                              )}
                              <h6 className="card-title">{link.methodName}</h6>
                              <a
                                href={link.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                فتح الرابط / Open Link
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">لا توجد روابط للتبرع / No donation links available</p>
                  )
                ) : Array.isArray(viewProject.donationLinks) && viewProject.donationLinks.length > 0 ? (
                  <div className="row">
                    {viewProject.donationLinks.map((link, index) => (
                      <div key={index} className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            {link.icon && (
                              <div className="text-center mb-2">
                                <img
                                  src={`http://localhost:3500/uploads/payment-icons/${link.icon}`}
                                  alt={link.methodName}
                                  style={{ height: "30px", objectFit: "contain" }}
                                />
                              </div>
                            )}
                            <h6 className="card-title">{link.methodName}</h6>
                            <a
                              href={link.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                            >
                              فتح الرابط / Open Link
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">لا توجد روابط للتبرع / No donation links available</p>
                )
              ) : (
                <p className="text-muted">لا توجد روابط للتبرع / No donation links available</p>
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
