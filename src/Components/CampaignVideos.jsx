import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Spinner, Form } from "react-bootstrap";
import Swal from "sweetalert2";

export default function CampaignVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoTitleAr, setVideoTitleAr] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);

  const fetchCampaignVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://oneheart.team/api/campaign-videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching campaign videos:", error);
      Swal.fire("خطأ!", "حدث خطأ أثناء تحميل الفيديوهات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignVideos();
  }, []);

  const handleVideoUpload = async (event) => {
    event.preventDefault();
    
    if (!selectedVideo) {
      Swal.fire("خطأ!", "الرجاء اختيار فيديو", "error");
      return;
    }
    
    if (!selectedThumbnail) {
      Swal.fire("خطأ!", "الرجاء اختيار صورة مصغرة للفيديو", "error");
      return;
    }
    
    if (!videoTitle || !videoTitleAr) {
      Swal.fire("خطأ!", "الرجاء إدخال عنوان الفيديو بكلا اللغتين", "error");
      return;
    }

    const formData = new FormData();
    formData.append("video", selectedVideo);
    formData.append("thumbnail", selectedThumbnail);
    formData.append("title", videoTitle);
    formData.append("titleAr", videoTitleAr);

    try {
      setUploadingVideo(true);
      await axios.post("https://oneheart.team/api/campaign-videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("تم!", "تم رفع الفيديو بنجاح", "success");
      fetchCampaignVideos();
      setVideoTitle("");
      setVideoTitleAr("");
      setSelectedVideo(null);
      setSelectedThumbnail(null);
      // Reset the file inputs
      document.getElementById("campaign-video-upload").value = "";
      document.getElementById("campaign-thumbnail-upload").value = "";
    } catch (error) {
      console.error("Error uploading video:", error);
      Swal.fire("خطأ!", "حدث خطأ أثناء رفع الفيديو", "error");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await axios.delete(`https://oneheart.team/api/campaign-videos/${id}`);
          Swal.fire("تم الحذف!", "تم حذف الفيديو بنجاح.", "success");
          fetchCampaignVideos();
        } catch (error) {
          console.error("Error deleting video:", error);
          Swal.fire("خطأ!", "حدث خطأ أثناء حذف الفيديو", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="mb-4">
        <h2 className="mb-4 border-bottom pb-3">فيديوهات الحملات الأخيرة</h2>
        
        <Form onSubmit={handleVideoUpload} className="border p-4 rounded mb-4 shadow-sm bg-white">
          <h5 className="mb-3 border-bottom pb-2">إضافة فيديو جديد</h5>
          
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>عنوان الفيديو (بالعربية)</Form.Label>
                <Form.Control
                  type="text"
                  value={videoTitleAr}
                  onChange={(e) => setVideoTitleAr(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
            
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>عنوان الفيديو (بالإنجليزية)</Form.Label>
                <Form.Control
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>الفيديو</Form.Label>
                <Form.Control
                  type="file"
                  accept="video/*"
                  id="campaign-video-upload"
                  onChange={(e) => setSelectedVideo(e.target.files[0])}
                  required
                />
                <Form.Text className="text-muted">
                  يفضل أن يكون الفيديو بصيغة MP4 وبحجم مناسب.
                </Form.Text>
              </Form.Group>
            </div>
            
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>الصورة المصغرة للفيديو</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  id="campaign-thumbnail-upload"
                  onChange={(e) => setSelectedThumbnail(e.target.files[0])}
                  required
                />
                <Form.Text className="text-muted">
                  الرجاء اختيار صورة مصغرة تمثل محتوى الفيديو (JPG, PNG, GIF).
                </Form.Text>
              </Form.Group>
            </div>
          </div>
          
          <div className="text-end mt-3">
            <Button 
              type="submit" 
              variant="primary"
              disabled={uploadingVideo}
            >
              {uploadingVideo ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  جاري الرفع...
                </>
              ) : (
                <><i className="fas fa-upload me-2"></i>رفع الفيديو</>
              )}
            </Button>
          </div>
        </Form>
        
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">جاري التحميل...</p>
          </div>
        ) : (
          <div className="row">
            {videos && videos.length > 0 ? (
              videos.map((video) => (
                <div key={video._id} className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="position-relative">
                      <video
                        controls
                        className="card-img-top"
                        style={{ height: "300px", objectFit: "cover" }}
                        poster={`https://oneheart.team/uploads/campaign-thumbnails/${video.thumbnail}`}
                      >
                        <source
                          src={`https://oneheart.team/uploads/campaign-videos/${video.video}`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-primary mb-2">{video.titleAr}</h5>
                      <p className="card-text text-muted">{video.title}</p>
                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {video.createdAt && formatDate(video.createdAt)}
                        </small>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteVideo(video._id)}
                        >
                          <i className="fas fa-trash-alt me-1"></i> حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p>لا توجد فيديوهات متاحة</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 