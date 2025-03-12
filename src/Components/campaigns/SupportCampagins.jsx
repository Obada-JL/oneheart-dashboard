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
        "https://oneheart.team/api/support-campaigns"
      );
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
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
      const details = campaign.details || {};
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
        details: {
          title: details.title || "",
          titleAr: details.titleAr || "",
          description1: details.description1 || "",
          description1Ar: details.description1Ar || "",
          description2: details.description2 || "",
          description2Ar: details.description2Ar || "",
        }
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
    setSelectedCampaign({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      category: "",
      categoryAr: "",
      total: 0,
      paid: 0,
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
    if (!validateForm()) {
      await Swal.fire({
        title: 'تحقق من البيانات',
        text: 'يرجى التأكد من إدخال جميع الحقول المطلوبة بشكل صحيح',
        icon: 'warning',
        confirmButtonText: 'حسناً'
      });
      return;
    }
    
    setLoading(true);
    const formData = new FormData();

    try {
      // Append main fields
      formData.append('title', selectedCampaign.title);
      formData.append('titleAr', selectedCampaign.titleAr);
      formData.append('description', selectedCampaign.description);
      formData.append('descriptionAr', selectedCampaign.descriptionAr);
      formData.append('category', selectedCampaign.category);
      formData.append('categoryAr', selectedCampaign.categoryAr);
      formData.append('total', selectedCampaign.total);
      formData.append('paid', selectedCampaign.paid);

      // Debug image files
      console.log("Main image:", selectedCampaign.image);
      console.log("Details image:", selectedCampaign.details?.image);
      
      // Append image if new one is selected
      if (selectedCampaign.image instanceof File) {
        formData.append("image", selectedCampaign.image);
        console.log("Appended main image to formData");
      } else if (modalMode === "add") {
        await Swal.fire({
          title: 'صورة مطلوبة',
          text: 'يرجى اختيار صورة للحملة',
          icon: 'warning',
          confirmButtonText: 'حسناً'
        });
        setLoading(false);
        return;
      }

      // Append details image if selected
      if (selectedCampaign.details?.image instanceof File) {
        formData.append("detailsImage", selectedCampaign.details.image);
        console.log("Appended details image to formData");
      }

      // Append details as JSON
      const detailsData = {
        title: selectedCampaign.details?.title || '',
        titleAr: selectedCampaign.details?.titleAr || '',
        description1: selectedCampaign.details?.description1 || '',
        description1Ar: selectedCampaign.details?.description1Ar || '',
        description2: selectedCampaign.details?.description2 || '',
        description2Ar: selectedCampaign.details?.description2Ar || ''
      };
      
      formData.append('details', JSON.stringify(detailsData));
      console.log("Details data:", detailsData);

      // Log all form data entries
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const url = modalMode === "add"
          ? "https://oneheart.team/api/support-campaigns"
          : `https://oneheart.team/api/support-campaigns/${selectedCampaign._id}`;

      console.log("Sending request to:", url);
      console.log("Request method:", modalMode === "add" ? "post" : "put");
      
      const response = await axios({
        method: modalMode === "add" ? "post" : "put",
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Server response:", response.data);

      await Swal.fire({
        title: 'تم بنجاح',
        text: modalMode === "add" ? 'تمت إضافة الحملة بنجاح' : 'تم تحديث الحملة بنجاح',
        icon: 'success',
        confirmButtonText: 'حسناً'
      });

      fetchCampaigns();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving campaign:", error);
      console.error("Error response:", error.response?.data);
      
      await Swal.fire({
        title: 'خطأ',
        text: error.response?.data?.message || 'حدث خطأ أثناء حفظ الحملة',
        icon: 'error',
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
        await axios.delete(`https://oneheart.team/api/support-campaigns/${id}`);
        
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

  return (
    <div className="container-fluid p-4"dir="rtl">
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
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td>
                    <img
                      src={`https://oneheart.team/uploads/support-campaigns/${campaign.image}`}
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

                {/* Arabic Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">تفاصيل إضافية</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>عنوان التفاصيل</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.details?.titleAr || ""}
                      onChange={(e) => handleFieldChange('titleAr', e.target.value, true)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>الوصف الأول</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedCampaign.details?.description1Ar || ""}
                      onChange={(e) => handleFieldChange('description1Ar', e.target.value, true)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>الوصف الثاني</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedCampaign.details?.description2Ar || ""}
                      onChange={(e) => handleFieldChange('description2Ar', e.target.value, true)}
                    />
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

                {/* English Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">Additional Details</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>Details Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedCampaign.details?.title || ""}
                      onChange={(e) => handleFieldChange('title', e.target.value, true)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>First Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedCampaign.details?.description1 || ""}
                      onChange={(e) => handleFieldChange('description1', e.target.value, true)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Second Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedCampaign.details?.description2 || ""}
                      onChange={(e) => handleFieldChange('description2', e.target.value, true)}
                    />
                  </Form.Group>
                </div>
              </Tab>
            </Tabs>

            {/* Details Image */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">صورة التفاصيل / Details Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  details: {
                    ...selectedCampaign.details,
                    image: e.target.files[0]
                  }
                })}
              />
            </Form.Group>

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
                  src={`https://oneheart.team/uploads/support-campaigns/${viewCampaign.image}`}
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

              {viewCampaign.details && (
                <div className="mt-4">
                  <h4>تفاصيل إضافية</h4>
                  
                  {viewCampaign.details.image && (
                    <div className="text-center mb-3">
                      <img
                        src={`https://oneheart.team/uploads/support-campaigns/${viewCampaign.details.image}`}
                        alt="Details"
                        className="img-fluid"
                        style={{ maxHeight: "200px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                  
                  <h5>عنوان التفاصيل</h5>
                  <p className="text-muted">{viewCampaign.details.titleAr}</p>
                  <p>{viewCampaign.details.title}</p>
                  
                  <h5>الوصف الأول</h5>
                  <p className="text-muted">{viewCampaign.details.description1Ar}</p>
                  <p>{viewCampaign.details.description1}</p>
                  
                  <h5>الوصف الثاني</h5>
                  <p className="text-muted">{viewCampaign.details.description2Ar}</p>
                  <p>{viewCampaign.details.description2}</p>
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
