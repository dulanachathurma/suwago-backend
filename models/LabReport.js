const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportTitle: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true }, // Base64 Data URL or HTTP URL
    category: { type: String, default: 'General' },
    uploadDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabReport', labReportSchema);
