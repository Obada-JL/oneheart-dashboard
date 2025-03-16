import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from 'sweetalert2';

export default function CompletedCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://oneheart.team/api/completed-campaigns"
      );
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
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
    
    if (requiredFields.includes(field) && !value) {
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
    setTouched(newTouched);
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!selectedCampaign[field]) {
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
      console.log("Saving campaign with data:", selectedCampaign);
      
      // Append main fields
      formData.append('title', selectedCampaign.title || '');
      formData.append('titleAr', selectedCampaign.titleAr || '');
      formData.append('category', selectedCampaign.category || '');
      formData.append('categoryAr', selectedCampaign.categoryAr || '');

      // Append image if new one is selected
      if (selectedCampaign.image instanceof File) {
        formData.append("image", selectedCampaign.image);
        console.log("Appending image file:", selectedCampaign.image.name);
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
      console.log("Appending details:", JSON.stringify([details]));

      const url = modalMode === "add"
        ? "https://oneheart.team/api/completed-campaigns"
        : `https://oneheart.team/api/completed-campaigns/${selectedCampaign._id}`;

      console.log("Sending request to:", url, "Method:", modalMode === "add" ? "post" : "put");
      
      const response = await axios({
        method: modalMode === "add" ? "post" : "put",
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response:", response.data);
      
      Swal.fire({
        icon: 'success',
        title: 'تم بنجاح',
        text: modalMode === "add" ? 'تمت إضافة الحملة بنجاح' : 'تم تحديث الحملة بنجاح',
      });

      fetchCampaigns();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving campaign:", error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || "حدث خطأ أثناء الحفظ",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (id) => {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من التراجع عن هذا!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، احذفها!',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await axios.delete(`https://oneheart.team/api/completed-campaigns/${id}`);
          fetchCampaigns();
          Swal.fire(
            'تم الحذف!',
            'تم حذف الحملة بنجاح.',
            'success'
          );
        } catch (error) {
          console.error("Error deleting campaign:", error);
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: 'خطأ في حذف الحملة',
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // View modal handlers
  const handleShowViewModal = (campaign) => {
    setViewCampaign(campaign);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewCampaign(null);
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">الحملات المكتملة</h1>
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
              {campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td>
                    <img
                      src={`https://oneheart.team/uploads/completed-campaigns/${campaign.image}`}
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
                    {campaign.details.map((detail, index) => (
                      <div key={index} className="mb-2">
                        <div>المستفيدون: {detail.BeneficiaryAr}</div>
                        <div>الموقع: {detail.locationAr}</div>
                        <div>المدة: {detail.durationAr}</div>
                      </div>
                    ))}
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
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة حملة منتهية" : "تعديل الحملة"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">صورة الحملة</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleFieldChange('image', e.target.files[0])}
                isInvalid={touched.image && !!errors.image}
              />
              <Form.Control.Feedback type="invalid">
                {errors.image}
              </Form.Control.Feedback>
              {modalMode === "edit" && selectedCampaign.image && typeof selectedCampaign.image === 'string' && (
                <div className="mt-2">
                  <img
                    src={`https://oneheart.team/uploads/completed-campaigns/${selectedCampaign.image}`}
                    alt="Current"
                    style={{ width: "100px", height: "60px", objectFit: "cover" }}
                  />
                  <small className="d-block mt-1">الصورة الحالية</small>
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
                    isInvalid={touched.titleAr && !!errors.titleAr}
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
                    isInvalid={touched.categoryAr && !!errors.categoryAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.categoryAr}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Arabic Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">تفاصيل إضافية</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>التمويل</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.fundAr || ""}
                      onChange={(e) => handleFieldChange('fundAr', e.target.value)}
                      isInvalid={touched.fundAr && !!errors.fundAr}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fundAr}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>الموقع</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.locationAr || ""}
                      onChange={(e) => handleFieldChange('locationAr', e.target.value)}
                      isInvalid={touched.locationAr && !!errors.locationAr}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.locationAr}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>المدة</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.durationAr || ""}
                      onChange={(e) => handleFieldChange('durationAr', e.target.value)}
                      isInvalid={touched.durationAr && !!errors.durationAr}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.durationAr}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>المستفيدون</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.BeneficiaryAr || ""}
                      onChange={(e) => handleFieldChange('BeneficiaryAr', e.target.value)}
                      isInvalid={touched.BeneficiaryAr && !!errors.BeneficiaryAr}
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
                    isInvalid={touched.title && !!errors.title}
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
                    isInvalid={touched.category && !!errors.category}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* English Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">Additional Details</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>Fund</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.fund || ""}
                      onChange={(e) => handleFieldChange('fund', e.target.value)}
                      isInvalid={touched.fund && !!errors.fund}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fund}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.location || ""}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      isInvalid={touched.location && !!errors.location}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Duration</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.duration || ""}
                      onChange={(e) => handleFieldChange('duration', e.target.value)}
                      isInvalid={touched.duration && !!errors.duration}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.duration}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Beneficiaries</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.Beneficiary || ""}
                      onChange={(e) => handleFieldChange('Beneficiary', e.target.value)}
                      isInvalid={touched.Beneficiary && !!errors.Beneficiary}
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
            إغلاق
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
              modalMode === "add" ? "إضافة" : "حفظ التغييرات"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل الحملة المنتهية</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewCampaign && (
            <div className="view-campaign-details">
              <div className="text-center mb-4">
                <img
                  src={`https://oneheart.team/uploads/completed-campaigns/${viewCampaign.image}`}
                  alt={viewCampaign.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">العنوان</h5>
                <p className="text-muted mb-1">بالعربية: {viewCampaign.titleAr}</p>
                <p>بالإنجليزية: {viewCampaign.title}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">التصنيف</h5>
                <p className="text-muted mb-1">بالعربية: {viewCampaign.categoryAr}</p>
                <p>بالإنجليزية: {viewCampaign.category}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">تفاصيل إضافية</h5>
                <div className="mb-3">
                  <h6>التمويل</h6>
                  <p className="text-muted mb-1">بالعربية: {viewCampaign.details?.[0]?.fundAr}</p>
                  <p>بالإنجليزية: {viewCampaign.details?.[0]?.fund}</p>
                </div>

                <div className="mb-3">
                  <h6>الموقع</h6>
                  <p className="text-muted mb-1">بالعربية: {viewCampaign.details?.[0]?.locationAr}</p>
                  <p>بالإنجليزية: {viewCampaign.details?.[0]?.location}</p>
                </div>

                <div className="mb-3">
                  <h6>المدة</h6>
                  <p className="text-muted mb-1">بالعربية: {viewCampaign.details?.[0]?.durationAr}</p>
                  <p>بالإنجليزية: {viewCampaign.details?.[0]?.duration}</p>
                </div>

                <div className="mb-3">
                  <h6>المستفيدون</h6>
                  <p className="text-muted mb-1">بالعربية: {viewCampaign.details?.[0]?.BeneficiaryAr}</p>
                  <p>بالإنجليزية: {viewCampaign.details?.[0]?.Beneficiary}</p>
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
