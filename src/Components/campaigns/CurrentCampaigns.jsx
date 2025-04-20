import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from 'sweetalert2';
import { useSafeApi, ensureArray, safeMap } from "../../utils/apiUtils";

export default function CurrentCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    imagePreview: null,
    isVisible: true,
    donationLinks: [],
  });
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize the API utility
  const api = useSafeApi(setCampaigns, setLoading, "خطأ في جلب الحملات الحالية");

  const fetchCampaigns = async () => {
    await api.safeGet('current-campaigns');
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleShowModal = (campaign = {}, mode = "add") => {
    // Reset validation states
    setValidated(false);
    setFormErrors({});
    setTouched({});

    if (mode === "edit") {
      setSelectedCampaign({
        ...campaign,
        title: campaign.title || "",
        titleAr: campaign.titleAr || "",
        description: campaign.description || "",
        descriptionAr: campaign.descriptionAr || "",
        category: campaign.category || "",
        categoryAr: campaign.categoryAr || "",
        image: campaign.image || null,
        donationLinks: campaign.donationLinks || []
      });
    } else {
      // For add mode, initialize with empty values
      setSelectedCampaign({
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
    setSelectedCampaign({
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

  const handleFieldChange = (field, value, isDetailsField = false) => {
    if (!isDetailsField) {
      setSelectedCampaign({
        ...selectedCampaign,
        [field]: value
      });

      // Mark field as touched
      setTouched({
        ...touched,
        [field]: true
      });

      // Validate the field
      validateField(field, value, false);
    }
  };

  const validateField = (field, value, isDetailsField = false) => {
    const newErrors = { ...formErrors };
    const fieldPath = field;

    // Clear previous error
    delete newErrors[fieldPath];

    // Required fields validation
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr', 'category', 'categoryAr'];

    if (requiredFields.includes(field) && (!value || (typeof value === 'string' && value.trim() === ''))) {
      newErrors[fieldPath] = 'This field is required';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr', 'category', 'categoryAr'];

    // Validate main fields
    requiredFields.forEach(field => {
      const value = selectedCampaign[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = 'This field is required';
      }
    });

    // Check if image is provided for new campaigns
    if (modalMode === 'add' && !selectedCampaign.image) {
      newErrors.image = 'Campaign image is required';
    }

    setFormErrors(newErrors);
    setValidated(true);

    // Mark all fields as touched
    const newTouched = {};
    [...requiredFields, 'image'].forEach(field => {
      newTouched[field] = true;
    });

    setTouched(newTouched);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();

    // Check if form is valid
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'الرجاء ملء جميع الحقول المطلوبة',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Append all basic fields
    formData.append("title", selectedCampaign.title || "");
    formData.append("description", selectedCampaign.description || "");
    formData.append("category", selectedCampaign.category || "");
    formData.append("isVisible", selectedCampaign.isVisible || false);

    // Add image if it's a file
    if (selectedCampaign.image instanceof File) {
      formData.append("image", selectedCampaign.image);
    }

    // Handle donation links
    if (selectedCampaign.donationLinks && selectedCampaign.donationLinks.length > 0) {
      // Filter out incomplete links
      const validLinks = selectedCampaign.donationLinks.filter(
        link => link.methodName && link.link
      );

      if (validLinks.length > 0) {
        formData.append("donationLinks", JSON.stringify(validLinks));
      }
    }

    try {
      const config = {
        headers: { "Content-Type": "multipart/form-data" }
      };

      let response;
      if (modalMode === "add") {
        response = await api.safePost('current-campaigns', formData, config);
      } else {
        response = await api.safePut('current-campaigns', selectedCampaign._id, formData, config);
      }

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح!',
          text: modalMode === "add" ? "تمت إضافة الحملة بنجاح" : "تم تحديث الحملة بنجاح",
          confirmButtonText: 'حسناً'
        });
        fetchCampaigns();
        handleCloseModal();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ!',
          text: response.error || "حدث خطأ أثناء حفظ الحملة",
          confirmButtonText: 'حسناً'
        });
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ!',
        text: "حدث خطأ أثناء حفظ الحملة",
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'هل أنت متأكد؟',
        text: 'لن تتمكن من استعادة هذه الحملة!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'نعم، احذفها!',
        cancelButtonText: 'إلغاء'
      });

      if (result.isConfirmed) {
        const response = await api.safeDelete('current-campaigns', id);

        if (response.success) {
          await Swal.fire({
            icon: 'success',
            title: 'تم الحذف!',
            text: 'تم حذف الحملة بنجاح.',
            confirmButtonText: 'حسناً'
          });
          fetchCampaigns();
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'خطأ!',
            text: response.error || 'حدث خطأ أثناء حذف الحملة',
            confirmButtonText: 'حسناً'
          });
        }
      }
    } catch (error) {
      console.error("Error in delete flow:", error);
      await Swal.fire({
        icon: 'error',
        title: 'خطأ!',
        text: 'حدث خطأ غير متوقع',
        confirmButtonText: 'حسناً'
      });
    }
  };

  const handleShowViewModal = (campaign) => {
    setViewCampaign(campaign);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewCampaign(null);
  };

  // Function to add a new donation link
  const addDonationLink = () => {
    setSelectedCampaign({
      ...selectedCampaign,
      donationLinks: [
        ...(selectedCampaign.donationLinks || []),
        { methodName: "", link: "", icon: null }
      ]
    });
  };

  // Function to remove a donation link
  const removeDonationLink = (index) => {
    const updatedLinks = [...(selectedCampaign.donationLinks || [])];
    updatedLinks.splice(index, 1);
    setSelectedCampaign({
      ...selectedCampaign,
      donationLinks: updatedLinks
    });
  };

  // Function to update a donation link
  const updateDonationLink = (index, field, value) => {
    const updatedLinks = [...(selectedCampaign.donationLinks || [])];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    setSelectedCampaign({
      ...selectedCampaign,
      donationLinks: updatedLinks
    });
  };

  // Clear the form state
  const clearForm = () => {
    setSelectedCampaign({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      category: "",
      categoryAr: "",
      image: null,
      imagePreview: null,
      isVisible: true,
      donationLinks: [],
    });
  };

  // Edit campaign
  const handleEditCampaign = (campaign) => {
    // Check if donationLinks is a string and parse it
    let parsedDonationLinks = [];
    if (campaign.donationLinks) {
      if (typeof campaign.donationLinks === 'string') {
        try {
          parsedDonationLinks = JSON.parse(campaign.donationLinks);
        } catch (error) {
          console.error("Error parsing donation links:", error);
        }
      } else if (Array.isArray(campaign.donationLinks)) {
        parsedDonationLinks = campaign.donationLinks;
      }
    }

    setSelectedCampaign({
      ...campaign,
      donationLinks: parsedDonationLinks,
      imagePreview: campaign.image
        ? `https://oneheart.team/uploads/campaigns/${campaign.image}`
        : null,
    });
    setModalMode("update");
    setShowModal(true);
  };

  // Add campaign
  const handleAddCampaign = () => {
    clearForm();
    setModalMode("add");
    setShowModal(true);
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">الحملات الحالية</h1>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة حملة جديدة
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
                <th>التصنيف</th>
                <th>الحالة</th>
                <th>روابط التبرع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {safeMap(
                campaigns,
                (campaign) => (
                  <tr key={campaign._id}>
                    <td>
                      <img
                        src={`https://oneheart.team/uploads/current-campaigns/${campaign.image}`}
                        alt={campaign.title}
                        style={{ width: "100px", height: "60px", objectFit: "cover" }}
                      />
                    </td>
                    <td>{campaign.title}</td>
                    <td>{campaign.category}</td>
                    <td>
                      {campaign.isVisible ? (
                        <span className="badge bg-success">مرئي</span>
                      ) : (
                        <span className="badge bg-danger">مخفي</span>
                      )}
                    </td>
                    <td>
                      {campaign.donationLinks ? (
                        (() => {
                          let links;
                          try {
                            links = typeof campaign.donationLinks === 'string'
                              ? JSON.parse(campaign.donationLinks)
                              : campaign.donationLinks;

                            return Array.isArray(links) && links.length > 0 ? (
                              <span className="badge bg-success">
                                {links.length} روابط متاحة
                              </span>
                            ) : (
                              <span className="badge bg-secondary">لا توجد روابط</span>
                            );
                          } catch (e) {
                            console.error("Error parsing donation links:", e);
                            return <span className="badge bg-danger">خطأ في القراءة</span>;
                          }
                        })()
                      ) : (
                        <span className="badge bg-secondary">لا توجد روابط</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowViewModal(campaign)}
                      >
                        عرض
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(campaign, "edit")}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign._id)}
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                ),
                <tr>
                  <td colSpan="6" className="text-center">
                    لا توجد حملات متاحة أو حدث خطأ في تحميل البيانات.
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
            {modalMode === "add" ? "إضافة حملة جديدة" : "تعديل الحملة"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            {/* Common Fields */}
            <div className="border rounded p-3">
              <h6 className="mb-3">تفاصيل أساسية / Basic Info</h6>
              <div className="row">
                <div className="col-12">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">صورة الحملة / Campaign Image</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setSelectedCampaign({
                        ...selectedCampaign,
                        image: e.target.files[0]
                      })}
                      isInvalid={touched.image && formErrors.image}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.image}
                    </Form.Control.Feedback>
                    {selectedCampaign.image && !(selectedCampaign.image instanceof File) && (
                      <div className="mt-2">
                        <img
                          src={`https://oneheart.team/uploads/campaigns/${selectedCampaign.image}`}
                          alt="Current main"
                          style={{ width: "100px", height: "60px", objectFit: "cover" }}
                        />
                        <small className="d-block mt-1">الصورة الحالية / Current image</small>
                      </div>
                    )}
                  </Form.Group>
                </div>
              </div>
            </div>

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
                    value={selectedCampaign.titleAr || ""}
                    onChange={(e) => handleFieldChange('titleAr', e.target.value)}
                    isInvalid={touched.titleAr && formErrors.titleAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.titleAr}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">الوصف</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedCampaign.descriptionAr || ""}
                    onChange={(e) => handleFieldChange('descriptionAr', e.target.value)}
                    isInvalid={touched.descriptionAr && formErrors.descriptionAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.descriptionAr}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">التصنيف</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCampaign.categoryAr || ""}
                    onChange={(e) => handleFieldChange('categoryAr', e.target.value)}
                    isInvalid={touched.categoryAr && formErrors.categoryAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.categoryAr}
                  </Form.Control.Feedback>
                </Form.Group>
              </Tab>

              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCampaign.title || ""}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    isInvalid={touched.title && formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedCampaign.description || ""}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    isInvalid={touched.description && formErrors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCampaign.category || ""}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    isInvalid={touched.category && formErrors.category}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.category}
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

              {selectedCampaign.donationLinks && selectedCampaign.donationLinks.length > 0 ? (
                selectedCampaign.donationLinks.map((link, index) => (
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
          <Button variant="primary" onClick={handleSaveCampaign} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                جاري الحفظ...
              </>
            ) : (
              modalMode === "add" ? "إضافة" : "حفظ التغييرات"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل الحملة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewCampaign && (
            <div className="view-campaign-details">
              <div className="text-center mb-4">
                <img
                  src={`https://oneheart.team/uploads/campaigns/${viewCampaign.image}`}
                  alt={viewCampaign.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>
              <h4>العنوان</h4>
              <p className="text-muted">{viewCampaign.titleAr}</p>
              <p>{viewCampaign.title}</p>

              <h4>الوصف</h4>
              <p className="text-muted">{viewCampaign.descriptionAr}</p>
              <p>{viewCampaign.description}</p>

              <h4>التصنيف</h4>
              <p className="text-muted">{viewCampaign.categoryAr}</p>
              <p>{viewCampaign.category}</p>
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
