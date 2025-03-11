import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from "sweetalert2";

const SettingsComponents = () => {
  const [activeTab, setActiveTab] = useState("sliders");
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');

  // Fetch items based on active tab
  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = 
        activeTab === "sliders" ? "image-slider" : 
        activeTab === "counter" ? "counter" : 
        activeTab === "programs" ? "programs" : "about-us";
      
      const response = await axios.get(`https://oneheart.team.com/api/${endpoint}`);
      console.log(`Raw ${activeTab} data:`, response.data);
      
      if (activeTab === "about") {
        // Handle About Us data - use the exact structure from the database
        const aboutData = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log("About data:", aboutData);
        
        if (aboutData) {
          // Use the data as is, without reformatting
          setItems([aboutData]);
        } else {
          setItems([]);
        }
      } else {
        setItems(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleShowModal = (item = {}, mode = "add") => {
    setModalMode(mode);
    console.log("Modal mode:", mode, "Item:", item);
    
    if (mode === "add") {
      if (activeTab === "about") {
        // Initialize with empty values but correct structure
        const emptyAboutUs = {
          aboutUs: {
            description: { en: "", ar: "" },
            photos: []
          },
          goal: {
            description: { en: "", ar: "" },
            photo: null
          },
          vision: {
            description: { en: "", ar: "" },
            photo: null
          },
          message: {
            description: { en: "", ar: "" },
            photo: null
          },
          values: {
            description: { en: "", ar: "" },
            photo: null
          }
        };
        console.log("Initializing new about us form with:", emptyAboutUs);
        setSelectedItem(emptyAboutUs);
      } else if (activeTab === "sliders") {
        // ... existing code ...
      } else if (activeTab === "counter") {
        // ... existing code ...
      } else if (activeTab === "programs") {
        // ... existing code ...
      }
    } else {
      // For edit mode, use the exact structure from the database
      if (activeTab === "about") {
        console.log("Editing about us item:", item);
        // Ensure the aboutUs object is properly structured
        const formattedItem = {
          ...item,
          aboutUs: {
            description: {
              en: item.aboutUs?.description?.en || "",
              ar: item.aboutUs?.description?.ar || ""
            },
            photos: item.aboutUs?.photos || []
          }
        };
        console.log("Formatted item for editing:", formattedItem);
        setSelectedItem(formattedItem);
      } else {
        setSelectedItem(item);
      }
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem({});
  };

  const handleShowViewModal = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewItem(null);
  };

  const handleSaveItem = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      const endpoint = 
        activeTab === "sliders" ? "image-slider" : 
        activeTab === "counter" ? "counter" : 
        activeTab === "programs" ? "programs" : "about-us";

      if (activeTab === "programs") {
        // Append program fields
        formData.append("title", selectedItem.title || "");
        formData.append("titleAr", selectedItem.titleAr || "");
        formData.append("description", selectedItem.description || "");
        formData.append("descriptionAr", selectedItem.descriptionAr || "");
        
        if (selectedItem.image instanceof File) {
          formData.append("image", selectedItem.image);
        }

        try {
          if (modalMode === "add") {
            await axios.post(`https://oneheart.team.com/api/${endpoint}`, formData);
          } else {
            await axios.put(
              `https://oneheart.team.com/api/${endpoint}/${selectedItem._id}`,
              formData
            );
          }
          fetchItems();
          handleCloseModal();
        } catch (error) {
          console.error("Error saving program:", error);
          alert("حدث خطأ أثناء حفظ البرنامج");
        }
        return;
      } else if (activeTab === "about") {
        // Validate required fields
        const requiredFields = [
          { path: 'aboutUs.description.en', label: 'About Us (English)' },
          { path: 'aboutUs.description.ar', label: 'About Us (Arabic)' },
          { path: 'goal.description.en', label: 'Goal (English)' },
          { path: 'goal.description.ar', label: 'Goal (Arabic)' },
          { path: 'vision.description.en', label: 'Vision (English)' },
          { path: 'vision.description.ar', label: 'Vision (Arabic)' },
          { path: 'message.description.en', label: 'Message (English)' },
          { path: 'message.description.ar', label: 'Message (Arabic)' },
          { path: 'values.description.en', label: 'Values (English)' },
          { path: 'values.description.ar', label: 'Values (Arabic)' }
        ];
        
        const missingFields = [];
        
        requiredFields.forEach(field => {
          // Get the value using the path
          const value = field.path.split('.').reduce((obj, key) => obj && obj[key], selectedItem);
          if (!value || value.trim() === '') {
            missingFields.push(field.label);
          }
        });
        
        // Check for required photos in add mode
        if (modalMode === "add") {
          if (!selectedItem.aboutUs?.photos || selectedItem.aboutUs.photos.length === 0) {
            missingFields.push('About Us Photos');
          }
          if (!selectedItem.goal?.photo) {
            missingFields.push('Goal Photo');
          }
          if (!selectedItem.vision?.photo) {
            missingFields.push('Vision Photo');
          }
          if (!selectedItem.message?.photo) {
            missingFields.push('Message Photo');
          }
          if (!selectedItem.values?.photo) {
            missingFields.push('Values Photo');
          }
        }
        
        if (missingFields.length > 0) {
          Swal.fire({
            title: "حقول مطلوبة",
            html: `الرجاء ملء الحقول التالية:<br>${missingFields.join('<br>')}`,
            icon: "warning"
          });
          setLoading(false);
          return;
        }
        
        // Create aboutUs data structure matching the schema
        const aboutData = {
          aboutUs: {
            description: {
              en: selectedItem.aboutUs?.description?.en || "",
              ar: selectedItem.aboutUs?.description?.ar || ""
            },
            photos: []  // Will be handled by formData
          },
          goal: {
            description: {
              en: selectedItem.goal?.description?.en || "",
              ar: selectedItem.goal?.description?.ar || ""
            }
            // photo will be handled by formData
          },
          vision: {
            description: {
              en: selectedItem.vision?.description?.en || "",
              ar: selectedItem.vision?.description?.ar || ""
            }
            // photo will be handled by formData
          },
          message: {
            description: {
              en: selectedItem.message?.description?.en || "",
              ar: selectedItem.message?.description?.ar || ""
            }
            // photo will be handled by formData
          },
          values: {
            description: {
              en: selectedItem.values?.description?.en || "",
              ar: selectedItem.values?.description?.ar || ""
            }
            // photo will be handled by formData
          }
        };

        console.log("About to send data:", aboutData);
        console.log("About Us description EN:", selectedItem.aboutUs?.description?.en);
        console.log("About Us description AR:", selectedItem.aboutUs?.description?.ar);
        console.log("Raw selectedItem:", selectedItem);
        console.log("Raw aboutUs from selectedItem:", selectedItem.aboutUs);

        // Append the data as a single JSON object
        formData.append('data', JSON.stringify(aboutData));

        // Append photos
        if (selectedItem.aboutUs?.photos?.length > 0) {
          Array.from(selectedItem.aboutUs.photos).forEach((photo) => {
            formData.append('aboutUsPhotos', photo);
          });
        }

        // Append section photos
        if (selectedItem.goal?.photo instanceof File) {
          formData.append('goalPhoto', selectedItem.goal.photo);
        }
        if (selectedItem.vision?.photo instanceof File) {
          formData.append('visionPhoto', selectedItem.vision.photo);
        }
        if (selectedItem.message?.photo instanceof File) {
          formData.append('messagePhoto', selectedItem.message.photo);
        }
        if (selectedItem.values?.photo instanceof File) {
          formData.append('valuesPhoto', selectedItem.values.photo);
        }

        // Log form data for debugging
        console.log("Form data entries:");
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }

        try {
          if (modalMode === "add") {
            console.log("Creating new about us entry");
            const response = await axios.post(`https://oneheart.team.com/api/${endpoint}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("Create response:", response.data);
          } else {
            console.log("Updating about us entry");
            const response = await axios.put(
              `https://oneheart.team.com/api/${endpoint}/${selectedItem._id}`,
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' }
              }
            );
            console.log("Update response:", response.data);
          }
          
          Swal.fire("تم بنجاح!", "تم حفظ البيانات بنجاح", "success");
          fetchItems();
          handleCloseModal();
        } catch (error) {
          console.error("Error saving about us:", error);
          console.error("Error response:", error.response?.data);
          Swal.fire("خطأ!", "حدث خطأ أثناء حفظ البيانات", "error");
        }
      } else if (activeTab === "sliders") {
        formData.append("sliderTitleEn", selectedItem.sliderTitleEn || "");
        formData.append("sliderTitleAr", selectedItem.sliderTitleAr || "");
        formData.append(
          "sliderDescriptionEn",
          selectedItem.sliderDescriptionEn || ""
        );
        formData.append(
          "sliderDescriptionAr",
          selectedItem.sliderDescriptionAr || ""
        );
        formData.append("detailsLink", selectedItem.detailsLink || "");
        if (selectedItem.sliderImage instanceof File) {
          formData.append("sliderImage", selectedItem.sliderImage);
        }
      } else if (activeTab === "counter") {
        formData.append("counterTitleEn", selectedItem.counterTitleEn || "");
        formData.append("counterTitleAr", selectedItem.counterTitleAr || "");
        formData.append("counterNumber", selectedItem.counterNumber || "");
        if (selectedItem.counterImage instanceof File) {
          formData.append("counterImage", selectedItem.counterImage);
        }
      }
    } catch (error) {
      console.error("Error in handleSaveItem:", error);
      Swal.fire("خطأ!", "حدث خطأ أثناء حفظ البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = 
          activeTab === "sliders" ? "image-slider" : 
          activeTab === "counter" ? "counter" : 
          activeTab === "programs" ? "programs" : "about-us";
        
        // For about-us, we don't need the ID as there's only one entry
        const url = activeTab === "about" 
          ? `https://oneheart.team.com/api/${endpoint}`
          : `https://oneheart.team.com/api/${endpoint}/${id}`;
        
        console.log("Deleting item at URL:", url);
        await axios.delete(url);
        
        Swal.fire("تم الحذف!", "تم حذف العنصر بنجاح.", "success");
        fetchItems();
      } catch (error) {
        console.error("Error deleting item:", error);
        Swal.fire("خطأ!", "حدث خطأ أثناء الحذف.", "error");
      }
    }
  };

  // Function to render existing images
  const renderExistingImages = (section, sectionName) => {
    if (!section || !section.photo) return null;
    
    return (
      <div className="mb-2">
        <p className="mb-1">Current Image:</p>
        <img 
          src={`https://oneheart.team.com/uploads/aboutUs/${section.photo}`} 
          alt={`${sectionName} Image`}
          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          className="border"
        />
      </div>
    );
  };

  // Function to render existing aboutUs photos
  const renderExistingAboutUsPhotos = () => {
    if (!selectedItem.aboutUs?.photos || !selectedItem.aboutUs.photos.length) return null;
    
    return (
      <div className="mb-2">
        <p className="mb-1">Current Images:</p>
        <div className="d-flex gap-2">
          {selectedItem.aboutUs.photos.map((photo, index) => (
            <img 
              key={index}
              src={`https://oneheart.team.com/uploads/aboutUs/${photo}`} 
              alt={`About Us Photo ${index + 1}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              className="border"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderForm = () => {
    if (activeTab === "sliders") {
      return (
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">صورة السلايدر</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  sliderImage: e.target.files[0],
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
                  value={selectedItem.sliderTitleAr || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      sliderTitleAr: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">الوصف</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={selectedItem.sliderDescriptionAr || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      sliderDescriptionAr: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Tab>

            <Tab eventKey="en" title="English">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Title</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedItem.sliderTitleEn || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      sliderTitleEn: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={selectedItem.sliderDescriptionEn || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      sliderDescriptionEn: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Tab>
          </Tabs>

          <div className="border rounded p-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">رابط التفاصيل / Details Link</Form.Label>
              <Form.Control
                type="text"
                value={selectedItem.detailsLink || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    detailsLink: e.target.value,
                  })
                }
              />
            </Form.Group>
          </div>
        </Form>
      );
    } else if (activeTab === "counter") {
      return (
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">الأيقونة</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  counterImage: e.target.files[0],
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
                  value={selectedItem.counterTitleAr || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      counterTitleAr: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Tab>

            <Tab eventKey="en" title="English">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Title</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedItem.counterTitleEn || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      counterTitleEn: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Tab>
          </Tabs>

          <div className="border rounded p-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">العدد / Number</Form.Label>
              <Form.Control
                type="text"
                value={selectedItem.counterNumber || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    counterNumber: e.target.value,
                  })
                }
              />
            </Form.Group>
          </div>
        </Form>
      );
    } else if (activeTab === "about") {
      return (
        <Form>

          <Tabs
            activeKey={activeLanguage}
            onSelect={(k) => setActiveLanguage(k)}
            className="mb-4"
          >
            <Tab eventKey="ar" title="العربية">
            <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">من نحن
                </h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedItem.aboutUs?.description?.ar || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        aboutUs: {
                          ...selectedItem.aboutUs,
                          description: {
                            ...selectedItem.aboutUs?.description,
                            ar: e.target.value
                          }
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">الهدف</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedItem.goal?.description?.ar || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        goal: {
                          ...selectedItem.goal,
                          description: {
                            ...selectedItem.goal?.description,
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>

              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">الرؤية</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedItem.vision?.description?.ar || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        vision: {
                          ...selectedItem.vision,
                          description: {
                            ...selectedItem.vision?.description,
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>

              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">الرسالة</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedItem.message?.description?.ar || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        message: {
                          ...selectedItem.message,
                          description: {
                            ...selectedItem.message?.description,
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>

              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">القيم</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedItem.values?.description?.ar || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        values: {
                          ...selectedItem.values,
                          description: {
                            ...selectedItem.values?.description,
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
            </Tab>

            <Tab eventKey="en" title="English">
            <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">About Us</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedItem.aboutUs?.description?.en || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        aboutUs: {
                          ...selectedItem.aboutUs,
                          description: {
                            ...selectedItem.aboutUs?.description,
                            en: e.target.value
                          }
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
              
              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">Goal</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedItem.goal?.description?.en || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        goal: {
                          ...selectedItem.goal,
                          description: {
                            ...selectedItem.goal?.description,
                            en: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>

              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">Vision</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedItem.vision?.description?.en || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        vision: {
                          ...selectedItem.vision,
                          description: {
                            ...selectedItem.vision?.description,
                            en: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>

              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">Message</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedItem.message?.description?.en || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        message: {
                          ...selectedItem.message,
                          description: {
                            ...selectedItem.message?.description,
                            en: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>

              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">Values</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedItem.values?.description?.en || ""}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        values: {
                          ...selectedItem.values,
                          description: {
                            ...selectedItem.values?.description,
                            en: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
            </Tab>
          </Tabs>

          {/* Section Images */}
          <div className="border rounded p-3">
            <h6 className="mb-3">صور الأقسام / Section Images</h6>
            <div className="row">
            <Form.Group className="mb-4">
            <Form.Label className="fw-bold">صور القسم الرئيسي / Main Section Images</Form.Label>
            {modalMode === "edit" && renderExistingAboutUsPhotos()}
            <Form.Control
              type="file"
              multiple
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  aboutUs: {
                    ...selectedItem.aboutUs,
                    photos: Array.from(e.target.files),
                  },
                })
              }
            />
            <Form.Text className="text-muted">
              يمكنك اختيار صورتين كحد أقصى / You can select up to 2 images
            </Form.Text>
          </Form.Group>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">صورة الهدف / Goal Image</Form.Label>
                  {modalMode === "edit" && renderExistingImages(selectedItem.goal, "Goal")}
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        goal: {
                          ...selectedItem.goal,
                          photo: e.target.files[0],
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">صورة الرؤية / Vision Image</Form.Label>
                  {modalMode === "edit" && renderExistingImages(selectedItem.vision, "Vision")}
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        vision: {
                          ...selectedItem.vision,
                          photo: e.target.files[0],
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">صورة الرسالة / Message Image</Form.Label>
                  {modalMode === "edit" && renderExistingImages(selectedItem.message, "Message")}
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        message: {
                          ...selectedItem.message,
                          photo: e.target.files[0],
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">صورة القيم / Values Image</Form.Label>
                  {modalMode === "edit" && renderExistingImages(selectedItem.values, "Values")}
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        values: {
                          ...selectedItem.values,
                          photo: e.target.files[0],
                        },
                      })
                    }
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </Form>
      );
    } else if (activeTab === "programs") {
      return (
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">صورة البرنامج</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  image: e.target.files[0],
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
                  value={selectedItem.titleAr || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      titleAr: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">الوصف</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={selectedItem.descriptionAr || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      descriptionAr: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Tab>

            <Tab eventKey="en" title="English">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Title</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedItem.title || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      title: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={selectedItem.description || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Tab>
          </Tabs>
        </Form>
      );
    }
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="btn-group" dir="rtl">
          <Button
            variant={activeTab === "sliders" ? "primary" : "outline-primary"}
            onClick={() => setActiveTab("sliders")}
            className="me-2"
          >
            السلايدر
          </Button>
          <Button
            variant={activeTab === "counter" ? "primary" : "outline-primary"}
            onClick={() => setActiveTab("counter")}
            className="me-2"
          >
            العدادات
          </Button>
          <Button
            variant={activeTab === "programs" ? "primary" : "outline-primary"}
            onClick={() => setActiveTab("programs")}
          >
            البرامج
          </Button>
          <Button
            variant={activeTab === "about" ? "primary" : "outline-primary"}
            onClick={() => setActiveTab("about")}
          >
            قسم عن الفريق
          </Button>
        </div>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة {activeTab === "sliders" ? "سلايد" : activeTab === "counters" ? "عداد" : activeTab === "programs" ? "برنامج" : "قسم"} جديد
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {activeTab === "about" ? (
            // About section table
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>الوصف (بالعربية)</th>
                  <th>Description (English)</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id || 'single-about'}>
                    <td>{item.aboutUs?.description?.ar || ""}</td>
                    <td>{item.aboutUs?.description?.en || ""}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleShowViewModal(item)}
                        >
                          عرض
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowModal(item, "edit")}
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            // Sliders and Counters table
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>العنوان (بالعربية)</th>
                  <th>Title (English)</th>
                  {activeTab === "counter" && <th>العدد</th>}
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <img
                        src={`https://oneheart.team.com/uploads/${
                          activeTab === "sliders" ? "sliderImages" : "counterImages"
                        }/${
                          activeTab === "sliders"
                            ? item.sliderImage
                            : item.counterImage
                        }`}
                        alt=""
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>
                      {activeTab === "sliders"
                        ? item.sliderTitleAr
                        : item.counterTitleAr}
                    </td>
                    <td>
                      {activeTab === "sliders"
                        ? item.sliderTitle
                        : item.counterTitleEn}
                    </td>
                    {activeTab === "counter" && <td>{item.counterNumber}</td>}
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowModal(item, "edit")}
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {activeTab === "programs" && (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>العنوان بالعربية</th>
                    <th>Title in English</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td style={{ width: "100px" }}>
                        <img
                          src={`https://oneheart.team.com/uploads/programs/${item.image}`}
                          alt={item.titleAr}
                          className="img-fluid"
                          style={{ maxWidth: "100px", height: "60px", objectFit: "cover" }}
                        />
                      </td>
                      <td>{item.titleAr}</td>
                      <td>{item.title}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleShowViewModal(item)}
                          >
                            عرض
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(item, "edit")}
                          >
                            تعديل
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteItem(item._id)}
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
        </>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة" : "تعديل"} {activeTab === "sliders" ? "سلايد" : activeTab === "counters" ? "عداد" : activeTab === "programs" ? "برنامج" : "قسم"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handleSaveItem}>
            {modalMode === "add" ? "إضافة" : "حفظ التغييرات"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {activeTab === "about" ? "عرض تفاصيل من نحن" : "عرض تفاصيل البرنامج"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewItem && activeTab === "about" ? (
            <div>
              <Tabs defaultActiveKey="ar" id="view-about-us-tabs">
                <Tab eventKey="ar" title="العربية">
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">من نحن</h6>
                    <p className="text-muted">{viewItem.aboutUs?.description?.ar || "لا يوجد وصف"}</p>
                    
                    {viewItem.aboutUs?.photos && viewItem.aboutUs.photos.length > 0 && (
                      <div className="mt-3">
                        <h6 className="mb-2">الصور</h6>
                        <div className="d-flex flex-wrap">
                          {viewItem.aboutUs.photos.map((photo, index) => (
                            <div key={index} className="me-2 mb-2">
                              <img
                                src={`https://oneheart.team.com/uploads/aboutUs/${photo}`}
                                alt={`صورة ${index + 1}`}
                                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">الهدف</h6>
                    <p className="text-muted">{viewItem.goal?.description?.ar || "لا يوجد وصف"}</p>
                    
                    {viewItem.goal?.photo && (
                      <div className="mt-3">
                        <h6 className="mb-2">الصورة</h6>
                        <img
                          src={`https://oneheart.team.com/uploads/aboutUs/${viewItem.goal.photo}`}
                          alt="صورة الهدف"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">الرؤية</h6>
                    <p className="text-muted">{viewItem.vision?.description?.ar || "لا يوجد وصف"}</p>
                    
                    {viewItem.vision?.photo && (
                      <div className="mt-3">
                        <h6 className="mb-2">الصورة</h6>
                        <img
                          src={`https://oneheart.team.com/uploads/aboutUs/${viewItem.vision.photo}`}
                          alt="صورة الرؤية"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">الرسالة</h6>
                    <p className="text-muted">{viewItem.message?.description?.ar || "لا يوجد وصف"}</p>
                    
                    {viewItem.message?.photo && (
                      <div className="mt-3">
                        <h6 className="mb-2">الصورة</h6>
                        <img
                          src={`https://oneheart.team.com/uploads/aboutUs/${viewItem.message.photo}`}
                          alt="صورة الرسالة"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">القيم</h6>
                    <p className="text-muted">{viewItem.values?.description?.ar || "لا يوجد وصف"}</p>
                    
                    {viewItem.values?.photo && (
                      <div className="mt-3">
                        <h6 className="mb-2">الصورة</h6>
                        <img
                          src={`https://oneheart.team.com/uploads/aboutUs/${viewItem.values.photo}`}
                          alt="صورة القيم"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                </Tab>
                
                <Tab eventKey="en" title="English">
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">About Us</h6>
                    <p className="text-muted">{viewItem.aboutUs?.description?.en || "No description available"}</p>
                    
                    {viewItem.aboutUs?.photos && viewItem.aboutUs.photos.length > 0 && (
                      <div className="mt-3">
                        <h6 className="mb-2">Photos</h6>
                        <div className="d-flex flex-wrap">
                          {viewItem.aboutUs.photos.map((photo, index) => (
                            <div key={index} className="me-2 mb-2">
                              <img
                                src={`https://oneheart.team.com/uploads/aboutUs/${photo}`}
                                alt={`Photo ${index + 1}`}
                                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">Goal</h6>
                    <p className="text-muted">{viewItem.goal?.description?.en || "No description available"}</p>
                    
                    {viewItem.goal?.photo && (
                      <div className="mt-3">
                        <h6 className="mb-2">Photo</h6>
                        <img
                          src={`https://oneheart.team.com/uploads/aboutUs/${viewItem.goal.photo}`}
                          alt="Goal photo"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">Vision</h6>
                    <p className="text-muted">{viewItem.vision?.description?.en || "No description available"}</p>
                    
                    {viewItem.vision?.photo && (
                      <div className="mt-3">
                        <h6 className="mb-2">Photo</h6>
                        <img
                          src={`https://oneheart.team.com/uploads/aboutUs/${viewItem.vision.photo}`}
                          alt="Vision photo"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">Message</h6>
                    <p className="text-muted">{viewItem.message?.description?.en || "No description available"}</p>
                    
                    {viewItem.message?.photo && (
                      <div className="mt-3">
                        <h6 className="mb-2">Photo</h6>
                        <img
                          src={`https://oneheart.team.com/uploads/aboutUs/${viewItem.message.photo}`}
                          alt="Message photo"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded p-3 mb-3">
                    <h6 className="mb-3">Values</h6>
                    <p className="text-muted">{viewItem.values?.description?.en || "No description available"}</p>
                    
                    {viewItem.values?.photo && (
                      <div className="mt-3">
                        <h6 className="mb-2">Photo</h6>
                        <img
                          src={`https://oneheart.team.com/uploads/aboutUs/${viewItem.values.photo}`}
                          alt="Values photo"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
          ) : viewItem && (
            <div>
              <div className="text-center mb-4">
                <img
                  src={`https://oneheart.team.com/uploads/programs/${viewItem.image}`}
                  alt={viewItem.titleAr}
                  style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h5>العنوان بالعربية</h5>
                  <p className="text-muted">{viewItem.titleAr}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h5>Title in English</h5>
                  <p className="text-muted">{viewItem.title}</p>
                </div>
                <div className="col-md-6">
                  <h5>الوصف بالعربية</h5>
                  <p className="text-muted">{viewItem.descriptionAr}</p>
                </div>
                <div className="col-md-6">
                  <h5>Description in English</h5>
                  <p className="text-muted">{viewItem.description}</p>
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
};

export default SettingsComponents;
