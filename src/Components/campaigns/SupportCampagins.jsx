import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

export default function SupportCampaigns() {
  // ...similar state setup as CurrentCampaigns...

  const handleSaveCampaign = async () => {
    setLoading(true);
    const formData = new FormData();

    try {
      const requiredFields = {
        title: "العنوان بالإنجليزية",
        titleAr: "العنوان بالعربية",
        description: "الوصف بالإنجليزية",
        descriptionAr: "الوصف بالعربية",
        category: "التصنيف بالإنجليزية",
        categoryAr: "التصنيف بالعربية",
        donateLink: "رابط التبرع",
        total: "المبلغ المطلوب",
        paid: "المبلغ المدفوع",
      };

      // ... validation and form data handling ...

      const url =
        modalMode === "add"
          ? "http://localhost:3500/api/support-campagins"
          : `http://localhost:3500/api/support-campagins/${selectedCampaign._id}`;

      // ... rest of save logic ...
    } catch (error) {
      // ... error handling ...
    }
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      {/* Similar layout to CurrentCampaigns but with support campaign specific fields */}
      {/* Add fields for donateLink, total, and paid amounts */}
      {/* Show both Arabic and English versions of all text fields */}
    </div>
  );
}
