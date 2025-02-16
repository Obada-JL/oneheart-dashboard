// ...existing code...

<Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
  // ...existing modal header...
  <Modal.Body>
    {/* Campaign Info */}
    <div className="mb-3">
      // ...existing title and description fields...
      {/* Main Campaign Image */}
      <div className="mb-3">
        <label className="form-label">صورة الحملة الرئيسية</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) =>
            setSelectedCampaign({
              ...selectedCampaign,
              image: e.target.files[0],
            })
          }
        />
      </div>
      {/* Gallery Images */}
      <div className="mb-3">
        <label className="form-label">
          صور معرض الحملة (يمكن اختيار عدة صور)
        </label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          multiple
          onChange={(e) =>
            setSelectedCampaign({
              ...selectedCampaign,
              galleryImages: Array.from(e.target.files),
            })
          }
        />
      </div>
    </div>
  </Modal.Body>
  // ...existing modal footer...
</Modal>;
