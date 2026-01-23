const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth.middleware');
const adminController = require('./admin.controller');

/* =========================
   CP APPLICATIONS
========================= */
router.get(
  '/cp-applications',
  auth(['ADMIN']),
  adminController.getCpApplications
);

router.post(
  '/cp/:cp_id/approve',
  auth(['ADMIN']),
  adminController.approveCp
);

router.post(
  '/cp/:cp_id/reject',
  auth(['ADMIN']),
  adminController.rejectCp
);

/* =========================
   INCENTIVES
========================= */
router.get(
  '/incentives',
  auth(['ADMIN']),
  adminController.getIncentives
);

router.post(
  '/incentives/:incentiveId/approve',
  auth(['ADMIN']),
  adminController.approveIncentive
);

/* =========================
   INCENTIVE CONFIG
========================= */
router.get(
  '/incentive-config',
  auth(['ADMIN']),
  adminController.getIncentiveConfig
);

router.post(
  '/incentive-config',
  auth(['ADMIN']),
  adminController.updateIncentiveConfig
);

/* =========================
   DASHBOARD
========================= */
router.get(
  '/dashboard',
  auth(['ADMIN']),
  adminController.getDashboard
);

module.exports = router;
