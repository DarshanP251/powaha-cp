const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth.middleware');
const cpController = require('./cp.controller');

/* =========================
   CP DASHBOARD
========================= */
router.get(
  '/dashboard',
  auth(['CP']),
  cpController.getDashboard
);

/* =========================
   LEADS
========================= */
router.post(
  '/leads',
  auth(['CP']),
  cpController.createLead
);

router.get(
  '/leads',
  auth(['CP']),
  cpController.getMyLeads
);

router.patch(
  '/leads/:leadId/stage',
  auth(['CP']),
  cpController.updateLeadStage
);

/* =========================
   INCENTIVES
========================= */
router.get(
  '/incentives',
  auth(['CP']),
  cpController.getMyIncentives
);

/* =========================
   PROFILE
========================= */
router.get(
  '/profile',
  auth(['CP']),
  cpController.getMyProfile
);

module.exports = router;
