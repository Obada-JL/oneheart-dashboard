import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from 'sweetalert2';
import { useSafeApi, ensureArray, safeMap } from "../../utils/apiUtils";
import { FiTrash2, FiEye, FiEdit } from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import "./CurrentCampaigns.css";

export default function CompletedCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize the API utility
  const api = useSafeApi(setCampaigns, setLoading, "خطأ في جلب الحملات المكتملة");

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    const response = await api.safeGet('completed-campaigns');

    if (response.success) {
      setCampaigns(ensureArray(response.data));
    } else {
      console.error("Failed to fetch campaigns:", response.error);
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "حدث خطأ أثناء تحميل الحملات المكتملة",
        confirmButtonText: "حسناً",
      });
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle modal display
  const handleShowModal = (campaign = {}, mode = "add") => {
    setValidated(false);
    setErrors({});
    setTouched({});

    if (mode === "edit") {
      const details = campaign.details?.[0] || {};
      setSelectedCampaign({
        _id: campaign._id,
        title: campaign.title || '',
        titleAr: campaign.titleAr || '',
        category: campaign.category || '',
        categoryAr: campaign.categoryAr || '',
        image: campaign.image || '',
        fund: details.fund || '',
        fundAr: details.fundAr || '',
        location: details.location || '',
        locationAr: details.locationAr || '',
        duration: details.duration || '',
        durationAr: details.durationAr || '',
        Beneficiary: details.Beneficiary || '',
        BeneficiaryAr: details.BeneficiaryAr || '',
      });
    } else {
      setSelectedCampaign({
        title: '',
        titleAr: '',
        category: '',
        categoryAr: '',
        image: '',
        fund: '',
        fundAr: '',
        location: '',
        locationAr: '',
        duration: '',
        durationAr: '',
        Beneficiary: '',
        BeneficiaryAr: '',
      });
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCampaign({});
    setValidated(false);
    setErrors({});
    setTouched({});
  };

  // Field change handler with validation
  const handleFieldChange = (field, value) => {
    setTouched({ ...touched, [field]: true });

    const newSelectedCampaign = { ...selectedCampaign, [field]: value };
    setSelectedCampaign(newSelectedCampaign);

    // Validate the field
    validateField(field, value);
  };

  // Validate a single field
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    // Required fields validation
    const requiredFields = [
      'title', 'titleAr', 'category', 'categoryAr', 'fund', 'fundAr',
      'location', 'locationAr', 'duration', 'durationAr',
      'Beneficiary', 'BeneficiaryAr'
    ];

    if (requiredFields.includes(field) && (!value || (typeof value === 'string' && value.trim() === ''))) {
      newErrors[field] = 'هذا الحقل مطلوب';
    } else {
      delete newErrors[field];
    }

    // Image validation for new campaigns
    if (field === 'image' && modalMode === 'add') {
      if (!value && !selectedCampaign.image) {
        newErrors.image = 'الصورة مطلوبة';
      } else {
        delete newErrors.image;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'title', 'titleAr', 'category', 'categoryAr', 'fund', 'fundAr',
      'location', 'locationAr', 'duration', 'durationAr',
      'Beneficiary', 'BeneficiaryAr'
    ];

    // Mark all fields as touched
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });

    // Add image field for new campaigns
    if (modalMode === "add") {
      newTouched.image = true;
    }

    setTouched(newTouched);

    // Check required fields
    requiredFields.forEach(field => {
      const value = selectedCampaign[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = 'هذا الحقل مطلوب';
      }
    });

    // Check image for new campaigns
    if (modalMode === 'add' && !selectedCampaign.image) {
      newErrors.image = 'الصورة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save campaign (create/update)
  const handleSaveCampaign = async () => {
    // Validate all fields
    const isValid = validateForm();
    setValidated(true);

    if (!isValid) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'يرجى ملء جميع الحقول المطلوبة',
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();

    try {
      // Append main fields
      formData.append('title', selectedCampaign.title || '');
      formData.append('titleAr', selectedCampaign.titleAr || '');
      formData.append('category', selectedCampaign.category || '');
      formData.append('categoryAr', selectedCampaign.categoryAr || '');

      // Append image if new one is selected
      if (selectedCampaign.image instanceof File) {
        formData.append("image", selectedCampaign.image);
      }

      // Create details object
      const details = {
        fund: selectedCampaign.fund || '',
        fundAr: selectedCampaign.fundAr || '',
        location: selectedCampaign.location || '',
        locationAr: selectedCampaign.locationAr || '',
        duration: selectedCampaign.duration || '',
        durationAr: selectedCampaign.durationAr || '',
        Beneficiary: selectedCampaign.Beneficiary || '',
        BeneficiaryAr: selectedCampaign.BeneficiaryAr || '',
      };

      // Append details as JSON string
      formData.append("details", JSON.stringify([details]));

      const url = modalMode === "add"
        ? "http://localhost:3500/api/completed-campaigns"
        : `http://localhost:3500/api/completed-campaigns/${selectedCampaign._id}`;

      const response = await axios({
        method: modalMode === "add" ? "post" : "put",
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح',
          text: modalMode === "add" ? 'تمت إضافة الحملة المكتملة بنجاح' : 'تم تحديث الحملة المكتملة بنجاح',
        });

        fetchCampaigns();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving campaign:", error);

      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || "حدث خطأ أثناء حفظ الحملة المكتملة",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'هل أنت متأكد؟',
        text: 'لن تتمكن من استعادة هذه الحملة المكتملة!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'نعم، احذفها!',
        cancelButtonText: 'إلغاء'
      });

      if (result.isConfirmed) {
        setLoading(true);

        const response = await axios.delete(`http://localhost:3500/api/completed-campaigns/${id}`);

        if (response.status === 200) {
          Swal.fire({
            title: 'تم الحذف!',
            text: 'تم حذف الحملة المكتملة بنجاح.',
            icon: 'success',
            confirmButtonText: 'حسناً'
          });

          fetchCampaigns();
        }
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);

      Swal.fire({
        title: 'خطأ',
        text: 'حدث خطأ أثناء حذف الحملة المكتملة',
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="container-fluid p-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>الحملات المكتملة</h2>
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
                <th>التفاصيل</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <tr key={campaign._id}>
                    <td>
                      <img
                        src={`http://localhost:3500/uploads/completed-campaigns/${campaign.image}`}
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
                    <td>
                      {campaign.details && campaign.details.length > 0 ? (
                        <span className="badge bg-success">
                          تفاصيل متاحة
                        </span>
                      ) : (
                        <span className="badge bg-secondary">لا توجد تفاصيل</span>
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
                  <td colSpan="5" className="text-center">
                    لا توجد حملات مكتملة متاحة.
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
            {modalMode === "add" ? "إضافة حملة مكتملة جديدة" : "تعديل الحملة المكتملة"}
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
                isInvalid={touched.image && errors.image}
              />
              <Form.Control.Feedback type="invalid">
                {errors.image}
              </Form.Control.Feedback>
              {modalMode === "edit" && selectedCampaign.image && typeof selectedCampaign.image === 'string' && (
                <div className="mt-2">
                  <small className="text-muted">الصورة الحالية:</small>
                  <img
                    src={`http://localhost:3500/uploads/completed-campaigns/${selectedCampaign.image}`}
                    alt="Current"
                    style={{ width: "100px", height: "60px", objectFit: "cover", display: "block", marginTop: "8px" }}
                  />
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
                    value={selectedCampaign.titleAr || ""}
                    onChange={(e) => handleFieldChange('titleAr', e.target.value)}
                    isInvalid={touched.titleAr && errors.titleAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.titleAr}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">التصنيف</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCampaign.categoryAr || ""}
                    onChange={(e) => handleFieldChange('categoryAr', e.target.value)}
                    isInvalid={touched.categoryAr && errors.categoryAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.categoryAr}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Detail fields in Arabic */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">تفاصيل الحملة</h6>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">التمويل</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.fundAr || ""}
                      onChange={(e) => handleFieldChange('fundAr', e.target.value)}
                      isInvalid={touched.fundAr && errors.fundAr}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fundAr}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">الموقع</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.locationAr || ""}
                      onChange={(e) => handleFieldChange('locationAr', e.target.value)}
                      isInvalid={touched.locationAr && errors.locationAr}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.locationAr}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">المدة</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.durationAr || ""}
                      onChange={(e) => handleFieldChange('durationAr', e.target.value)}
                      isInvalid={touched.durationAr && errors.durationAr}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.durationAr}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">المستفيد</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.BeneficiaryAr || ""}
                      onChange={(e) => handleFieldChange('BeneficiaryAr', e.target.value)}
                      isInvalid={touched.BeneficiaryAr && errors.BeneficiaryAr}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.BeneficiaryAr}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </Tab>

              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCampaign.title || ""}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    isInvalid={touched.title && errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCampaign.category || ""}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    isInvalid={touched.category && errors.category}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Detail fields in English */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">Campaign Details</h6>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Fund</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.fund || ""}
                      onChange={(e) => handleFieldChange('fund', e.target.value)}
                      isInvalid={touched.fund && errors.fund}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fund}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.location || ""}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      isInvalid={touched.location && errors.location}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Duration</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.duration || ""}
                      onChange={(e) => handleFieldChange('duration', e.target.value)}
                      isInvalid={touched.duration && errors.duration}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.duration}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Beneficiary</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.Beneficiary || ""}
                      onChange={(e) => handleFieldChange('Beneficiary', e.target.value)}
                      isInvalid={touched.Beneficiary && errors.Beneficiary}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.Beneficiary}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </Tab>
            </Tabs>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveCampaign}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                جاري الحفظ...
              </>
            ) : (
              modalMode === "add" ? "إضافة الحملة" : "تحديث الحملة"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل الحملة المكتملة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewCampaign && (
            <div className="view-campaign-details">
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:3500/uploads/completed-campaigns/${viewCampaign.image}`}
                  alt={viewCampaign.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">معلومات الحملة / Campaign Info</h5>
                    </div>
                    <div className="card-body">
                      <h5>العنوان / Title</h5>
                      <p className="text-muted">{viewCampaign.titleAr}</p>
                      <p>{viewCampaign.title}</p>

                      <h5>التصنيف / Category</h5>
                      <p className="text-muted">{viewCampaign.categoryAr}</p>
                      <p>{viewCampaign.category}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">تفاصيل المشروع / Project Details</h5>
                    </div>
                    <div className="card-body">
                      {viewCampaign.details && viewCampaign.details.length > 0 ? (
                        <>
                          <div className="mb-3">
                            <h5>التمويل / Fund</h5>
                            <p className="text-muted">{viewCampaign.details[0]?.fundAr}</p>
                            <p>{viewCampaign.details[0]?.fund}</p>
                          </div>

                          <div className="mb-3">
                            <h5>الموقع / Location</h5>
                            <p className="text-muted">{viewCampaign.details[0]?.locationAr}</p>
                            <p>{viewCampaign.details[0]?.location}</p>
                          </div>

                          <div className="mb-3">
                            <h5>المدة / Duration</h5>
                            <p className="text-muted">{viewCampaign.details[0]?.durationAr}</p>
                            <p>{viewCampaign.details[0]?.duration}</p>
                          </div>

                          <div className="mb-3">
                            <h5>المستفيد / Beneficiary</h5>
                            <p className="text-muted">{viewCampaign.details[0]?.BeneficiaryAr}</p>
                            <p>{viewCampaign.details[0]?.Beneficiary}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-center">لا توجد تفاصيل متاحة / No details available</p>
                      )}
                    </div>
                  </div>
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
