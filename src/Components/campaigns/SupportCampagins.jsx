import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from 'sweetalert2';

export default function SupportCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3500/api/support-campaigns"
      );

      // Ensure campaigns is always an array
      if (response.data && Array.isArray(response.data)) {
        setCampaigns(response.data);
      } else {
        console.error("API did not return an array:", response.data);
        setCampaigns([]);
        Swal.fire({
          icon: 'warning',
          title: 'تنبيه',
          text: 'تم استلام بيانات غير صالحة من الخادم',
        });
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'خطأ في جلب البيانات',
      });
    } finally {
      setLoading(false);
    }
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
      // Parse donation links if they exist
      let parsedDonationLinks = [];
      if (campaign.donationLinks) {
        try {
          parsedDonationLinks = typeof campaign.donationLinks === 'string'
            ? JSON.parse(campaign.donationLinks)
            : campaign.donationLinks;
        } catch (error) {
          console.error("Error parsing donation links:", error);
          parsedDonationLinks = [];
        }
      }

      setSelectedCampaign({
        ...campaign,
        title: campaign.title || "",
        titleAr: campaign.titleAr || "",
        description: campaign.description || "",
        descriptionAr: campaign.descriptionAr || "",
        category: campaign.category || "",
        categoryAr: campaign.categoryAr || "",
        total: campaign.total || 0,
        paid: campaign.paid || 0,
        donationLinks: parsedDonationLinks
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
        total: 0,
        paid: 0,
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
      total: 0,
      paid: 0,
      donationLinks: []
    });
  };

  const handleFieldChange = (field, value, isDetailsField = false) => {
    if (isDetailsField) {
      setSelectedCampaign({
        ...selectedCampaign,
        details: {
          ...selectedCampaign.details,
          [field]: value
        }
      });
    } else {
      setSelectedCampaign({
        ...selectedCampaign,
        [field]: value
      });
    }

    // Mark field as touched
    setTouched({
      ...touched,
      [isDetailsField ? `details.${field}` : field]: true
    });

    // Validate the field
    validateField(field, value, isDetailsField);
  };

  const validateField = (field, value, isDetailsField = false) => {
    const newErrors = { ...formErrors };
    const fieldPath = isDetailsField ? `details.${field}` : field;

    // Clear previous error
    delete newErrors[fieldPath];

    // Required fields validation
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr', 'total', 'paid'];
    if (requiredFields.includes(field) && (!value || value.trim() === '')) {
      newErrors[fieldPath] = 'This field is required';
    }

    // Numeric fields validation
    if ((field === 'total' || field === 'paid') && isNaN(Number(value))) {
      newErrors[fieldPath] = 'Must be a number';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr', 'total', 'paid'];

    // Validate main fields
    requiredFields.forEach(field => {
      const value = selectedCampaign[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate numeric fields
    if (isNaN(Number(selectedCampaign.total))) {
      newErrors.total = 'Must be a number';
    }

    if (isNaN(Number(selectedCampaign.paid))) {
      newErrors.paid = 'Must be a number';
    }

    // Check if image is provided for new campaigns
    if (modalMode === 'add' && !selectedCampaign.image) {
      newErrors.image = 'Campaign image is required';
    }

    setFormErrors(newErrors);
    setValidated(true);

    // Mark all fields as touched
    const newTouched = {};
    [...requiredFields, 'image', 'category', 'categoryAr'].forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCampaign = async () => {
    // Form validation
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = new FormData();

      // Prepare campaign data
      const campaignData = {
        title: selectedCampaign.title,
        titleAr: selectedCampaign.titleAr,
        description: selectedCampaign.description,
        descriptionAr: selectedCampaign.descriptionAr,
        category: selectedCampaign.category,
        categoryAr: selectedCampaign.categoryAr,
        total: selectedCampaign.total,
        paid: selectedCampaign.paid
      };

      // Append fields to FormData
      Object.entries(campaignData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append image if new one is selected
      if (selectedCampaign.image instanceof File) {
        formData.append('image', selectedCampaign.image);
      }

      // Handle donation links if they exist
      if (selectedCampaign.donationLinks && selectedCampaign.donationLinks.length > 0) {
        // Filter out incomplete donation links
        const validLinks = selectedCampaign.donationLinks.filter(
          link => link.methodName && link.link
        );

        if (validLinks.length > 0) {
          formData.append("donationLinks", JSON.stringify(validLinks));
          console.log("Appending donation links:", validLinks);
        }
      }

      // Submit the form
      const url = modalMode === 'add'
        ? 'http://localhost:3500/api/support-campaigns'
        : `http://localhost:3500/api/support-campaigns/${selectedCampaign._id}`;

      const response = await axios({
        method: modalMode === 'add' ? 'post' : 'put',
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201 || response.status === 200) {
        Swal.fire({
          title: 'Success',
          text: modalMode === 'add' ? 'Campaign added successfully' : 'Campaign updated successfully',
          icon: 'success'
        });
        fetchCampaigns();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save campaign. Please try again.',
        icon: 'error'
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
        await axios.delete(`http://localhost:3500/api/support-campaigns/${id}`);

        await Swal.fire({
          title: 'تم الحذف!',
          text: 'تم حذف الحملة بنجاح.',
          icon: 'success',
          confirmButtonText: 'حسناً'
        });

        fetchCampaigns();
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      await Swal.fire({
        title: 'خطأ',
        text: 'حدث خطأ أثناء حذف الحملة',
        icon: 'error',
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

  // Donation links management
  const addDonationLink = () => {
    setSelectedCampaign(prev => ({
      ...prev,
      donationLinks: [...(prev.donationLinks || []), { methodName: "", link: "" }]
    }));
  };

  const updateDonationLink = (index, field, value) => {
    setSelectedCampaign(prev => {
      const newLinks = [...(prev.donationLinks || [])];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, donationLinks: newLinks };
    });
  };

  const removeDonationLink = (index) => {
    setSelectedCampaign(prev => {
      const newLinks = [...(prev.donationLinks || [])];
      newLinks.splice(index, 1);
      return { ...prev, donationLinks: newLinks };
    });
  };

  return (
    <div className="container-fluid p-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>حملات الدعم</h2>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة حملة جديدة
        </Button>
      </div>

      {loading && !showModal ? (
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
                <th>المبلغ المطلوب</th>
                <th>المبلغ المدفوع</th>
                <th>روابط التبرع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(campaigns) ? (
                campaigns.map((campaign) => (
                  <tr key={campaign._id}>
                    <td>
                      <img
                        src={`http://localhost:3500/uploads/support-campaigns/${campaign.image}`}
                        alt={campaign.title}
                        style={{ width: "100px", height: "60px", objectFit: "cover" }}
                      />
                    </td>
                    <td>
                      <div>{campaign.titleAr}</div>
                      <small className="text-muted">{campaign.title}</small>
                    </td>
                    <td>
                      <div>{campaign.categoryAr}</div>
                      <small className="text-muted">{campaign.category}</small>
                    </td>
                    <td>{campaign.total}</td>
                    <td>{campaign.paid}</td>
                    <td>
                      {campaign.donationLinks ? (
                        (() => {
                          let links;
                          try {
                            links = typeof campaign.donationLinks === 'string'
                              ? JSON.parse(campaign.donationLinks)
                              : campaign.donationLinks;

                            return links && links.length > 0 ? (
                              <span className="badge bg-success">
                                {links.length} رابط متاح
                              </span>
                            ) : (
                              <span className="badge bg-secondary">لا يوجد روابط</span>
                            );
                          } catch (e) {
                            console.error("Error parsing donation links:", e);
                            return <span className="badge bg-danger">خطأ في القراءة</span>;
                          }
                        })()
                      ) : (
                        <span className="badge bg-secondary">لا يوجد روابط</span>
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
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
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
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">صورة الحملة</Form.Label>
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

            {/* Common Fields */}
            <div className="border rounded p-3">
              <h6 className="mb-3">المبالغ / Amounts</h6>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">المبلغ المطلوب / Required Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={selectedCampaign.total || ""}
                      onChange={(e) => handleFieldChange('total', e.target.value)}
                      isInvalid={touched.total && formErrors.total}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.total}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">المبلغ المدفوع / Paid Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={selectedCampaign.paid || ""}
                      onChange={(e) => handleFieldChange('paid', e.target.value)}
                      isInvalid={touched.paid && formErrors.paid}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.paid}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>
            </div>

            {/* Donation Links Section */}
            <div className="border rounded p-3 mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">روابط التبرع / Donation Links</h6>
                <Button variant="success" size="sm" onClick={addDonationLink}>
                  إضافة رابط جديد / Add New Link
                </Button>
              </div>

              {selectedCampaign.donationLinks && selectedCampaign.donationLinks.length > 0 ? (
                selectedCampaign.donationLinks.map((link, index) => (
                  <div key={index} className="border rounded p-2 mb-2">
                    <div className="row mb-2">
                      <div className="col-md-6">
                        <Form.Group>
                          <Form.Label className="fw-bold">طريقة الدفع / Payment Method</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="PayPal, Bank Transfer, etc."
                            value={link.methodName || ""}
                            onChange={(e) => updateDonationLink(index, 'methodName', e.target.value)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <Form.Group>
                          <Form.Label className="fw-bold">رابط الدفع / Payment Link</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="https://..."
                            value={link.link || ""}
                            onChange={(e) => updateDonationLink(index, 'link', e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeDonationLink(index)}
                      >
                        حذف / Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center my-3">
                  لا توجد روابط تبرع. انقر على "إضافة رابط جديد" لإضافة روابط.
                  <br />
                  No donation links. Click "Add New Link" to add links.
                </p>
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
                  src={`http://localhost:3500/uploads/support-campaigns/${viewCampaign.image}`}
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

              <h4>المبلغ المطلوب</h4>
              <p>{viewCampaign.total}</p>

              <h4>المبلغ المدفوع</h4>
              <p>{viewCampaign.paid}</p>

              <h4>روابط التبرع / Donation Links</h4>
              <div className="border rounded p-3">
                {viewCampaign.donationLinks ? (
                  (() => {
                    let links;
                    try {
                      links = typeof viewCampaign.donationLinks === 'string'
                        ? JSON.parse(viewCampaign.donationLinks)
                        : viewCampaign.donationLinks;

                      if (links && links.length > 0) {
                        return (
                          <div className="row row-cols-1 row-cols-md-2 g-3">
                            {links.map((link, index) => (
                              <div key={index} className="col">
                                <div className="card h-100">
                                  <div className="card-body">
                                    <h5 className="card-title">{link.methodName}</h5>
                                    <p className="card-text text-truncate">{link.link}</p>
                                    <a
                                      href={link.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-primary"
                                    >
                                      فتح الرابط / Open Link
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        return <p className="text-muted">لا توجد روابط تبرع متاحة</p>;
                      }
                    } catch (e) {
                      console.error("Error parsing donation links:", e);
                      return <p className="text-danger">خطأ في قراءة روابط التبرع</p>;
                    }
                  })()
                ) : (
                  <p className="text-muted">لا توجد روابط تبرع متاحة</p>
                )}
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
