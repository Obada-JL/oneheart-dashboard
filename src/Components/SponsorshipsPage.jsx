import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Tabs, Tab, Form } from "react-bootstrap";
import Swal from "sweetalert2"; // Add this import

export default function SponsorshipsPage() {
  const [sponsorships, setSponsorships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSponsorship, setSelectedSponsorship] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    category: "",
    categoryAr: "",
    total: "",
    remaining: "",
    sponsorshipImage: "",
    donationLinks: []
  });
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSponsorship, setViewSponsorship] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Helper function to ensure array type
  const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') return [data]; // Convert single object to array
    return [];
  };

  const fetchSponsorships = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "https://oneheart.team/api/sponsorships"
      );

      // Ensure we're setting an array to state
      const sponsorshipsData = response.data;
      if (sponsorshipsData && Array.isArray(sponsorshipsData)) {
        setSponsorships(sponsorshipsData);
      } else {
        console.error("API did not return an array:", sponsorshipsData);
        setSponsorships([]);
        setError("بيانات غير صالحة من الخادم");
      }
    } catch (error) {
      console.error("Error fetching sponsorships:", error);
      setSponsorships([]);
      setError("خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsorships();
  }, []);

  const handleShowModal = (sponsorship = {}, mode = "add") => {
    // Reset validation states
    setValidated(false);
    setErrors({});
    setTouched({});

    if (mode === "edit") {
      // Parse donation links if they exist
      let parsedDonationLinks = [];
      if (sponsorship.donationLinks) {
        if (typeof sponsorship.donationLinks === 'string') {
          try {
            parsedDonationLinks = JSON.parse(sponsorship.donationLinks);
          } catch (error) {
            console.error("Error parsing donation links:", error);
            parsedDonationLinks = [];
          }
        } else if (Array.isArray(sponsorship.donationLinks)) {
          parsedDonationLinks = sponsorship.donationLinks;
        }
      }

      setSelectedSponsorship({
        _id: sponsorship._id,
        title: sponsorship.title || "",
        titleAr: sponsorship.titleAr || "",
        description: sponsorship.description || "",
        descriptionAr: sponsorship.descriptionAr || "",
        category: sponsorship.category || "",
        categoryAr: sponsorship.categoryAr || "",
        total: sponsorship.total || "",
        remaining: sponsorship.remaining || "",
        sponsorshipImage: sponsorship.sponsorshipImage || "",
        donationLinks: parsedDonationLinks
      });
    } else {
      // For add mode, initialize with empty values
      setSelectedSponsorship({
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        category: "",
        categoryAr: "",
        total: "",
        remaining: "",
        sponsorshipImage: "",
        donationLinks: []
      });
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSponsorship({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      category: "",
      categoryAr: "",
      total: "",
      remaining: "",
      sponsorshipImage: "",
      donationLinks: []
    });
    setValidated(false);
    setErrors({});
    setTouched({});
  };

  const handleShowViewModal = (sponsorship) => {
    try {
      // Create a copy of the sponsorship for viewing
      const viewData = { ...sponsorship };

      // Safely parse donation links if they exist
      if (viewData.donationLinks) {
        if (typeof viewData.donationLinks === 'string') {
          try {
            const parsed = JSON.parse(viewData.donationLinks);

            // Clean the donation links to ensure icon is handled properly
            viewData.donationLinks = parsed.map(link => ({
              methodName: link.methodName || '',
              link: link.link || '',
              icon: link.icon && typeof link.icon === 'string' ? link.icon : null
            }));
          } catch (error) {
            console.error("Error parsing donation links:", error);
            viewData.donationLinks = [];
          }
        } else if (Array.isArray(viewData.donationLinks)) {
          // Clean the donation links to ensure icon is handled properly
          viewData.donationLinks = viewData.donationLinks.map(link => ({
            methodName: link.methodName || '',
            link: link.link || '',
            icon: link.icon && typeof link.icon === 'string' && !link.icon.startsWith('blob:') ? link.icon : null
          }));
        } else {
          viewData.donationLinks = [];
        }
      } else {
        viewData.donationLinks = [];
      }

      setViewSponsorship(viewData);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error preparing sponsorship for view:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء عرض تفاصيل الكفالة",
        confirmButtonText: "حسناً",
      });
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewSponsorship(null);
  };

  // Function to add a new donation link
  const addDonationLink = () => {
    setSelectedSponsorship({
      ...selectedSponsorship,
      donationLinks: [
        ...(selectedSponsorship.donationLinks || []),
        { methodName: "", link: "", icon: null }
      ]
    });
  };

  // Function to remove a donation link
  const removeDonationLink = (index) => {
    const updatedLinks = [...(selectedSponsorship.donationLinks || [])];
    updatedLinks.splice(index, 1);
    setSelectedSponsorship({
      ...selectedSponsorship,
      donationLinks: updatedLinks
    });
  };

  // Function to update donation link fields  
  const updateDonationLink = (index, field, value) => {
    const updatedLinks = [...selectedSponsorship.donationLinks];

    if (field === "icon" && value === null) {
      // Handle icon deletion
      if (updatedLinks[index].icon) {
        delete updatedLinks[index].icon;
      }
      if (updatedLinks[index].iconFile) {
        delete updatedLinks[index].iconFile;
      }
    } else if (field === "icon" && value instanceof File) {
      // Handle new icon file upload
      const file = value;
      updatedLinks[index].iconFile = file;

      // Create a local URL for preview
      if (updatedLinks[index].iconUrl) {
        URL.revokeObjectURL(updatedLinks[index].iconUrl);
      }
      updatedLinks[index].icon = URL.createObjectURL(file);
    } else {
      // Handle other field updates
      updatedLinks[index][field] = value;
    }

    setSelectedSponsorship({
      ...selectedSponsorship,
      donationLinks: updatedLinks,
    });
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    // Clear previous error
    delete newErrors[field];

    // Required fields validation
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr', 'total', 'remaining', 'category', 'categoryAr'];
    if (requiredFields.includes(field) && (!value || (typeof value === 'string' && value.trim() === ''))) {
      newErrors[field] = 'هذا الحقل مطلوب';
    }

    // Numeric fields validation
    if ((field === 'total' || field === 'remaining') && isNaN(Number(value))) {
      newErrors[field] = 'يجب أن يكون رقم';
    }

    // File validation for sponsorshipImage
    if (field === 'sponsorshipImage' && modalMode === 'add' && !value) {
      newErrors[field] = 'صورة الكفالة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr', 'total', 'remaining', 'category', 'categoryAr'];

    // Mark all fields as touched
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });

    // Add image field for new sponsorships
    if (modalMode === "add") {
      newTouched.sponsorshipImage = true;
    }

    setTouched(newTouched);

    // Check required fields
    requiredFields.forEach(field => {
      const value = selectedSponsorship[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = 'هذا الحقل مطلوب';
      }
    });

    // Validate numeric fields
    if (isNaN(Number(selectedSponsorship.total))) {
      newErrors.total = 'يجب أن يكون رقم';
    }

    if (isNaN(Number(selectedSponsorship.remaining))) {
      newErrors.remaining = 'يجب أن يكون رقم';
    }

    // Check main image for new sponsorships
    if (modalMode === 'add' && !selectedSponsorship.sponsorshipImage) {
      newErrors.sponsorshipImage = 'صورة الكفالة مطلوبة';
    }

    setErrors(newErrors);
    setValidated(true);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSponsorship = async () => {
    // Validate form before submission
    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى ملء جميع الحقول المطلوبة',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Prepare sponsorship data
      const sponsorshipData = {
        title: selectedSponsorship.title,
        titleAr: selectedSponsorship.titleAr,
        description: selectedSponsorship.description,
        descriptionAr: selectedSponsorship.descriptionAr,
        category: selectedSponsorship.category,
        categoryAr: selectedSponsorship.categoryAr,
        total: selectedSponsorship.total,
        remaining: selectedSponsorship.remaining,
      };

      // Append fields to FormData
      Object.entries(sponsorshipData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append image if new one is selected
      if (selectedSponsorship.sponsorshipImage instanceof File) {
        formData.append('sponsorshipImage', selectedSponsorship.sponsorshipImage);
      }

      // Handle donation links - properly process icon files
      if (selectedSponsorship.donationLinks && selectedSponsorship.donationLinks.length > 0) {
        // Filter out incomplete donation links
        const validLinks = selectedSponsorship.donationLinks.filter(
          link => link.methodName && link.link
        );

        if (validLinks.length > 0) {
          // Process donation links and handle icon files separately
          const processedLinks = validLinks.map((link, index) => {
            // If there's an icon file, append it to formData with a unique name
            if (link.iconFile instanceof File) {
              const iconFieldName = `donationLinkIcon_${index}`;
              formData.append(iconFieldName, link.iconFile);

              // Return cleaned object with just the icon field name reference
              return {
                methodName: link.methodName,
                link: link.link,
                iconField: iconFieldName // Include the field name reference for backend processing
              };
            }

            // If icon is a URL created by URL.createObjectURL, don't include it
            if (link.icon && typeof link.icon === 'string' && link.icon.startsWith('blob:')) {
              return {
                methodName: link.methodName,
                link: link.link,
                icon: null
              };
            }

            // Return the link with a string icon or null
            return {
              methodName: link.methodName,
              link: link.link,
              icon: link.icon && typeof link.icon === 'string' ? link.icon : null
            };
          });

          formData.append("donationLinks", JSON.stringify(processedLinks));
        }
      }

      // Submit the form
      const url = modalMode === 'add'
        ? 'https://oneheart.team/api/sponsorships'
        : `https://oneheart.team/api/sponsorships/${selectedSponsorship._id}`;

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
          icon: 'success',
          title: 'تم بنجاح',
          text: modalMode === 'add' ? 'تمت إضافة الكفالة بنجاح' : 'تم تحديث الكفالة بنجاح',
          confirmButtonText: 'حسناً',
        });

        // Refresh the list and close the modal
        handleCloseModal();
        fetchSponsorships();
      }
    } catch (error) {
      console.error('Error saving sponsorship:', error);

      // Better error logging to debug file upload issues
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);

        // Show more detailed error message
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: `فشل في حفظ الكفالة: ${error.response.data.message || error.message}`,
          confirmButtonText: 'حسناً',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في حفظ الكفالة. يرجى المحاولة مرة أخرى.',
          confirmButtonText: 'حسناً',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSponsorship = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'هل أنت متأكد؟',
        text: 'لن تتمكن من استعادة هذه الكفالة!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'نعم، احذفها!',
        cancelButtonText: 'إلغاء'
      });

      if (result.isConfirmed) {
        setLoading(true);

        const response = await axios.delete(`https://oneheart.team/api/sponsorships/${id}`);

        if (response.status === 200) {
          await Swal.fire({
            icon: 'success',
            title: 'تم الحذف!',
            text: 'تم حذف الكفالة بنجاح.',
            confirmButtonText: 'حسناً'
          });

          // Refresh sponsorships list
          fetchSponsorships();
        }
      }
    } catch (error) {
      console.error("Error deleting sponsorship:", error);

      await Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'حدث خطأ أثناء حذف الكفالة',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle field change with validation
  const handleFieldChange = (field, value) => {
    setTouched({ ...touched, [field]: true });

    setSelectedSponsorship({
      ...selectedSponsorship,
      [field]: value
    });

    // Validate the field
    validateField(field, value);
  };

  const DonationLinkDisplay = ({ donationLinks }) => {
    return (
      <div className="donation-links-container">
        <h5 className="mb-3">روابط التبرع</h5>
        {Array.isArray(donationLinks) && donationLinks.length > 0 ? (
          <div className="row">
            {donationLinks.map((link, index) => (
              <div className="col-md-6 mb-3" key={index}>
                <div className="card">
                  <div className="card-body d-flex align-items-center">
                    {link.icon ? (
                      <div className="icon-container me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={link.icon.startsWith('http') ? link.icon : `https://oneheart.team/uploads/payment-icons/${link.icon}`}
                          alt={link.methodName}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/40x40?text=Icon';
                          }}
                        />
                      </div>
                    ) : (
                      <i className="bi bi-link-45deg me-2" style={{ fontSize: '1.5rem' }}></i>
                    )}
                    <div>
                      <h6 className="mb-0">{link.methodName}</h6>
                      <a href={link.link} target="_blank" rel="noopener noreferrer" className="small text-truncate d-block" style={{ maxWidth: '200px' }}>
                        {link.link}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">لا توجد روابط تبرع</p>
        )}
      </div>
    );
  };

  // Function to prepare sponsorship for viewing (in the view modal)
  const prepareForViewing = (sponsorship) => {
    try {
      // Make a copy to avoid modifying the original
      const viewSponsorship = { ...sponsorship };

      // Parse donation links if they're a string
      if (typeof viewSponsorship.donationLinks === "string") {
        try {
          viewSponsorship.donationLinks = JSON.parse(viewSponsorship.donationLinks);
        } catch (error) {
          console.error("Error parsing donation links:", error);
          viewSponsorship.donationLinks = [];
        }
      }

      // Ensure donationLinks is always an array
      if (!Array.isArray(viewSponsorship.donationLinks)) {
        viewSponsorship.donationLinks = [];
      }

      // Make sure each link has required properties
      viewSponsorship.donationLinks = viewSponsorship.donationLinks.map(link => {
        // Return a new object with defaults for missing properties
        return {
          methodName: link.methodName || "",
          link: link.link || "",
          icon: link.icon || null
        };
      });

      return viewSponsorship;
    } catch (error) {
      console.error("Error preparing sponsorship for viewing:", error);
      // Return a minimal valid object if there was an error
      return { ...sponsorship, donationLinks: [] };
    }
  };

  return (
    <div className="container-fluid p-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>صفحة الكفالات</h2>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة كفالة جديدة
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">جاري التحميل...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : sponsorships.length === 0 ? (
        <div className="alert alert-info">لا توجد كفالات حالياً</div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>العنوان</th>
                <th>التصنيف</th>
                <th>المبلغ الكلي</th>
                <th>المبلغ المتبقي</th>
                <th>روابط التبرع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sponsorships) ? (
                sponsorships.map((sponsorship) => (
                  <tr key={sponsorship._id}>
                    <td>
                      <img
                        src={`https://oneheart.team/uploads/sponsorships/${sponsorship.sponsorshipImage}`}
                        alt={sponsorship.title}
                        style={{ width: "100px", height: "60px", objectFit: "cover" }}
                      />
                    </td>
                    <td>
                      <div>{sponsorship.titleAr}</div>
                      <small className="text-muted">{sponsorship.title}</small>
                    </td>
                    <td>
                      <div>{sponsorship.categoryAr}</div>
                      <small className="text-muted">{sponsorship.category}</small>
                    </td>
                    <td>{sponsorship.total}</td>
                    <td>{sponsorship.remaining}</td>
                    <td>
                      {(() => {
                        try {
                          let donationLinksCount = 0;

                          if (sponsorship.donationLinks) {
                            if (typeof sponsorship.donationLinks === 'string') {
                              const parsed = JSON.parse(sponsorship.donationLinks);
                              donationLinksCount = Array.isArray(parsed) ? parsed.length : 0;
                            } else if (Array.isArray(sponsorship.donationLinks)) {
                              donationLinksCount = sponsorship.donationLinks.length;
                            }
                          }

                          return donationLinksCount > 0 ? (
                            <span className="badge bg-success">{donationLinksCount} رابط متاح</span>
                          ) : (
                            <span className="badge bg-secondary">لا يوجد روابط</span>
                          );
                        } catch (error) {
                          console.error("Error parsing donation links:", error);
                          return <span className="badge bg-danger">خطأ في البيانات</span>;
                        }
                      })()}
                    </td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowViewModal(sponsorship)}
                      >
                        عرض
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(sponsorship, "edit")}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteSponsorship(sponsorship._id)}
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    لا توجد كفالات متاحة أو حدث خطأ في تحميل البيانات.
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
            {modalMode === "add" ? "إضافة كفالة جديدة" : "تعديل الكفالة"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">صورة الكفالة</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  handleFieldChange('sponsorshipImage', e.target.files[0])
                }
                isInvalid={touched.sponsorshipImage && errors.sponsorshipImage}
              />
              <Form.Control.Feedback type="invalid">
                {errors.sponsorshipImage}
              </Form.Control.Feedback>
              {modalMode === "edit" && selectedSponsorship.sponsorshipImage && typeof selectedSponsorship.sponsorshipImage === 'string' && (
                <div className="mt-2">
                  <img
                    src={`https://oneheart.team/uploads/sponsorships/${selectedSponsorship.sponsorshipImage}`}
                    alt="Current main"
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
                    value={selectedSponsorship.titleAr || ""}
                    onChange={(e) => handleFieldChange('titleAr', e.target.value)}
                    isInvalid={touched.titleAr && errors.titleAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.titleAr}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">الوصف</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedSponsorship.descriptionAr || ""}
                    onChange={(e) => handleFieldChange('descriptionAr', e.target.value)}
                    isInvalid={touched.descriptionAr && errors.descriptionAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.descriptionAr}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">التصنيف</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedSponsorship.categoryAr || ""}
                    onChange={(e) => handleFieldChange('categoryAr', e.target.value)}
                    isInvalid={touched.categoryAr && errors.categoryAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.categoryAr}
                  </Form.Control.Feedback>
                </Form.Group>
              </Tab>

              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedSponsorship.title || ""}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    isInvalid={touched.title && errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedSponsorship.description || ""}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    isInvalid={touched.description && errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedSponsorship.category || ""}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    isInvalid={touched.category && errors.category}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
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
                      value={selectedSponsorship.total || ""}
                      onChange={(e) => handleFieldChange('total', e.target.value)}
                      isInvalid={touched.total && errors.total}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.total}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">المبلغ المتبقي / Remaining Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={selectedSponsorship.remaining || ""}
                      onChange={(e) => handleFieldChange('remaining', e.target.value)}
                      isInvalid={touched.remaining && errors.remaining}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.remaining}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>
            </div>

            {/* Donation Links Section */}
            <div className="border rounded p-3 mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">روابط التبرع / Donation Links</h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addDonationLink}
                >
                  إضافة رابط جديد
                </Button>
              </div>

              {selectedSponsorship.donationLinks && selectedSponsorship.donationLinks.length > 0 ? (
                selectedSponsorship.donationLinks.map((link, index) => (
                  <div key={index} className="donation-link-item">
                    {/* Donation Method Name */}
                    <div className="donation-link-field">
                      <label>Method Name</label>
                      <input
                        type="text"
                        value={link.methodName || ""}
                        onChange={(e) =>
                          updateDonationLink(index, "methodName", e.target.value)
                        }
                        placeholder="E.g., PayPal, Bank Transfer"
                      />
                    </div>

                    {/* Donation Link URL */}
                    <div className="donation-link-field">
                      <label>Donation Link</label>
                      <input
                        type="text"
                        value={link.link || ""}
                        onChange={(e) =>
                          updateDonationLink(index, "link", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </div>

                    {/* Donation Method Icon */}
                    <div className="donation-link-field">
                      <label>Method Icon</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateDonationLink(index, "icon", e.target.files[0])
                        }
                      />
                      {link.icon && (
                        <div className="icon-preview">
                          <img
                            src={link.icon}
                            alt={`${link.methodName} icon`}
                            onError={(e) => {
                              e.target.src = "/placeholder-icon.png";
                              e.target.onerror = null;
                            }}
                          />
                          {!link.icon.startsWith("blob:") && (
                            <button
                              type="button"
                              className="delete-icon-btn"
                              onClick={() => updateDonationLink(index, "icon", null)}
                            >
                              Delete Icon
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove Link Button */}
                    <button
                      type="button"
                      className="remove-link-btn"
                      onClick={() => removeDonationLink(index)}
                    >
                      Remove Link
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-muted">
                  لا توجد روابط للتبرع. انقر على "إضافة رابط جديد" لإضافة طرق الدفع.
                </div>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveSponsorship}
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

      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل الكفالة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewSponsorship && (
            <div className="view-sponsorship-details">
              <div className="text-center mb-4">
                <img
                  src={`https://oneheart.team/uploads/sponsorships/${viewSponsorship.sponsorshipImage}`}
                  alt={viewSponsorship.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">معلومات الكفالة</h5>
                    </div>
                    <div className="card-body">
                      <h5>العنوان / Title</h5>
                      <p className="text-muted">{viewSponsorship.titleAr}</p>
                      <p>{viewSponsorship.title}</p>

                      <h5>التصنيف / Category</h5>
                      <p className="text-muted">{viewSponsorship.categoryAr}</p>
                      <p>{viewSponsorship.category}</p>

                      <h5>المبالغ / Amounts</h5>
                      <p>المبلغ الكلي: {viewSponsorship.total}</p>
                      <p>المبلغ المتبقي: {viewSponsorship.remaining}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">الوصف / Description</h5>
                    </div>
                    <div className="card-body">
                      <p className="text-muted">{viewSponsorship.descriptionAr}</p>
                      <p>{viewSponsorship.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donation Links Section */}
              <div className="card mt-3">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">روابط التبرع / Donation Links</h5>
                </div>
                <div className="card-body">
                  <DonationLinkDisplay donationLinks={viewSponsorship.donationLinks} />
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
