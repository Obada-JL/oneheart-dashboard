import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

const SettingsComponents = () => {
  const [activeTab, setActiveTab] = useState("sliders");
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Fetch items based on active tab
  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = 
        activeTab === "sliders" ? "image-slider" : 
        activeTab === "counter" ? "counter" : 
        activeTab === "programs" ? "programs" : "about-us";
      
      const response = await axios.get(`http://localhost:3500/api/${endpoint}`);
      
      if (activeTab === "about") {
        const aboutData = Array.isArray(response.data) ? response.data[0] : response.data;
        setItems(aboutData ? [aboutData] : []);
      } else {
        setItems(response.data || []);
      }
      console.log("Fetched items:", response.data); // Debug log
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
    if (mode === "edit" && activeTab === "about") {
      setSelectedItem({
        description: item.aboutUs?.description || {},
        photos: item.aboutUs?.photos || [],
        goal: {
          description: item.goal?.description || {},
          photo: item.goal?.photo || ""
        },
        vision: {
          description: item.vision?.description || {},
          photo: item.vision?.photo || ""
        },
        message: {
          description: item.message?.description || {},
          photo: item.message?.photo || ""
        },
        values: {
          description: item.values?.description || {},
          photo: item.values?.photo || ""
        },
        _id: item._id
      });
    } else {
      setSelectedItem(item);
    }
    setModalMode(mode);
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
          await axios.post(`http://localhost:3500/api/${endpoint}`, formData);
        } else {
          await axios.put(
            `http://localhost:3500/api/${endpoint}/${selectedItem._id}`,
            formData
          );
        }
        fetchItems();
        handleCloseModal();
      } catch (error) {
        console.error("Error saving program:", error);
        alert("حدث خطأ أثناء حفظ البرنامج");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (activeTab === "about") {
      // Create aboutUs data structure matching the schema
      const aboutData = {
        aboutUs: {
          description: {
            en: selectedItem.description?.en || "",
            ar: selectedItem.description?.ar || ""
          },
          photos: []  // Will be handled by formData
        },
        goal: {
          description: {
            en: selectedItem.goal?.description?.en || "",
            ar: selectedItem.goal?.description?.ar || ""
          },
          photo: ""  // Will be handled by formData
        },
        vision: {
          description: {
            en: selectedItem.vision?.description?.en || "",
            ar: selectedItem.vision?.description?.ar || ""
          },
          photo: ""  // Will be handled by formData
        },
        message: {
          description: {
            en: selectedItem.message?.description?.en || "",
            ar: selectedItem.message?.description?.ar || ""
          },
          photo: ""  // Will be handled by formData
        },
        values: {
          description: {
            en: selectedItem.values?.description?.en || "",
            ar: selectedItem.values?.description?.ar || ""
          },
          photo: ""  // Will be handled by formData
        }
      };

      // Append the data as a single JSON object
      formData.append('data', JSON.stringify(aboutData));

      // Append photos
      if (selectedItem.photos?.length > 0) {
        selectedItem.photos.forEach((photo) => {
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

      try {
        if (modalMode === "add") {
          await axios.post(`http://localhost:3500/api/${endpoint}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await axios.put(
            `http://localhost:3500/api/${endpoint}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        }
        fetchItems();
        handleCloseModal();
      } catch (error) {
        console.error("Error saving about section:", error);
        alert("حدث خطأ أثناء حفظ البيانات");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (activeTab === "sliders") {
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
      formData.append("donationsLink", selectedItem.donationsLink || "");
      formData.append("detailsLink", selectedItem.detailsLink || "");
      if (selectedItem.sliderImage instanceof File) {
        formData.append("sliderImage", selectedItem.sliderImage);
      }
    } else {
      formData.append("counterTitleEn", selectedItem.counterTitleEn || "");
      formData.append("counterTitleAr", selectedItem.counterTitleAr || "");
      formData.append("counterNumber", selectedItem.counterNumber || "");
      if (selectedItem.counterImage instanceof File) {
        formData.append("counterImage", selectedItem.counterImage);
      }
    }

    try {
      if (modalMode === "add") {
        await axios.post(`http://localhost:3500/api/${endpoint}`, formData);
      } else {
        await axios.put(
          `http://localhost:3500/api/${endpoint}/${selectedItem._id}`,
          formData
        );
      }
      fetchItems();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      setLoading(true);
      try {
        const endpoint = 
          activeTab === "sliders" ? "image-slider" : 
          activeTab === "counter" ? "counter" : "about-us";
        
        if (activeTab === "about") {
          // For about section, we don't need an ID since there's only one entry
          await axios.delete(`http://localhost:3500/api/${endpoint}`);
        } else {
          await axios.delete(`http://localhost:3500/api/${endpoint}/${id}`);
        }
        
        await fetchItems();
        alert("تم الحذف بنجاح");
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const renderForm = () => {
    if (activeTab === "sliders") {
      return (
        <>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">العنوان (بالعربية)</label>
              <input
                type="text"
                className="form-control"
                value={selectedItem.sliderTitleAr || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    sliderTitleAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Title (English)</label>
              <input
                type="text"
                className="form-control"
                value={selectedItem.sliderTitleEn || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    sliderTitleEn: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">الوصف (بالعربية)</label>
              <textarea
                className="form-control"
                value={selectedItem.sliderDescriptionAr || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    sliderDescriptionAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (English)</label>
              <textarea
                className="form-control"
                value={selectedItem.sliderDescriptionEn || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    sliderDescriptionEn: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">رابط التبرع</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.donationsLink || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  donationsLink: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">رابط التفاصيل</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.detailsLink || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  detailsLink: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الصورة</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  sliderImage: e.target.files[0],
                })
              }
            />
          </div>
        </>
      );
    } else if (activeTab === "counter") {
      return (
        <>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">العنوان (بالعربية)</label>
              <input
                type="text"
                className="form-control"
                value={selectedItem.counterTitleAr || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    counterTitleAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Title (English)</label>
              <input
                type="text"
                className="form-control"
                value={selectedItem.counterTitleEn || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    counterTitleEn: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">العدد</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.counterNumber || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  counterNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الأيقونة</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  counterImage: e.target.files[0],
                })
              }
            />
          </div>
        </>
      );
    } else if (activeTab === "about") {
      return (
        <>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">الوصف العام (بالعربية)</label>
              <textarea
                className="form-control"
                rows="4"
                value={selectedItem.description?.ar || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    description: { ...selectedItem.description, ar: e.target.value },
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">General Description (English)</label>
              <textarea
                className="form-control"
                rows="4"
                value={selectedItem.description?.en || ""}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    description: { ...selectedItem.description, en: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Photos Section */}
          <div className="mb-3">
            <label className="form-label">الصور</label>
            <input
              type="file"
              className="form-control"
              multiple
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  photos: Array.from(e.target.files),
                })
              }
            />
          </div>

          {/* Goal Section */}
          <div className="row mb-3">
            <h4>الهدف</h4>
            <div className="col-md-6">
              <label className="form-label">الوصف (بالعربية)</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (English)</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="col-12 mt-2">
              <label className="form-label">الصورة</label>
              <input
                type="file"
                className="form-control"
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
            </div>
          </div>

          {/* Vision Section */}
          <div className="row mb-3">
            <h4>الرؤية</h4>
            <div className="col-md-6">
              <label className="form-label">الوصف (بالعربية)</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (English)</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="col-12 mt-2">
              <label className="form-label">الصورة</label>
              <input
                type="file"
                className="form-control"
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
            </div>
          </div>

          {/* Message Section */}
          <div className="row mb-3">
            <h4>الرسالة</h4>
            <div className="col-md-6">
              <label className="form-label">الوصف (بالعربية)</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (English)</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="col-12 mt-2">
              <label className="form-label">الصورة</label>
              <input
                type="file"
                className="form-control"
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
            </div>
          </div>

          {/* Values Section */}
          <div className="row mb-3">
            <h4>القيم</h4>
            <div className="col-md-6">
              <label className="form-label">الوصف (بالعربية)</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (English)</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="col-12 mt-2">
              <label className="form-label">الصورة</label>
              <input
                type="file"
                className="form-control"
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
            </div>
          </div>
        </>
      );
    } else if (activeTab === "programs") {
      return (
        <div className="row">
          <div className="col-12 mb-3">
            <label className="form-label">صورة البرنامج</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  image: e.target.files[0],
                })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">العنوان بالعربية</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.titleAr || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  titleAr: e.target.value,
                })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Title in English</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.title || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">الوصف بالعربية</label>
            <textarea
              className="form-control"
              rows="4"
              value={selectedItem.descriptionAr || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  descriptionAr: e.target.value,
                })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Description in English</label>
            <textarea
              className="form-control"
              rows="4"
              value={selectedItem.description || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>
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
                    <td>{item.aboutUs?.description?.ar}</td>
                    <td>{item.aboutUs?.description?.en}</td>
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
                        src={`http://localhost:3500/uploads/${
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
                          src={`http://localhost:3500/uploads/programs/${item.image}`}
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
          <Modal.Title>عرض تفاصيل البرنامج</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewItem && (
            <div>
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:3500/uploads/programs/${viewItem.image}`}
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
