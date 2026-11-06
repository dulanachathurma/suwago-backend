const LabReport = require('../models/LabReport');

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const reports = await LabReport.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ status: 'success', reports });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// POST /api/reports
const uploadReport = async (req, res) => {
  try {
    const { reportTitle, fileUrl, category, notes } = req.body;
    if (!reportTitle || !fileUrl) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'Title and fileUrl are required' });
    }

    const report = await LabReport.create({
      userId: req.user._id,
      reportTitle,
      fileUrl,
      category: category || 'General',
      notes: notes || '',
    });

    res.status(201).json({ status: 'success', report });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await LabReport.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Report not found' });
    }
    res.json({ status: 'success', message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  getReports,
  uploadReport,
  deleteReport,
};
