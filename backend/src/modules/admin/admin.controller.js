const { PrismaClient } = require('@prisma/client');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const auditService = require('../../audits/audit.service');
const emailService = require('../../utils/email');

const prisma = new PrismaClient();

/* =====================================================
   CP APPLICATIONS
===================================================== */

/**
 * Get all CP applications
 */
exports.getCpApplications = async (req, res) => {
  try {
    const apps = await prisma.cp_applications.findMany({
      orderBy: {
        application_id: 'desc'
      }
    });

    res.json(apps);
  } catch (err) {
    console.error('Fetch CP applications error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * APPROVE CP
 */
exports.approveCp = async (req, res) => {
  const { cp_id } = req.params;
  const { aoo } = req.body;

  if (!Array.isArray(aoo) || !aoo.length) {
    return res.status(400).json({
      message: 'AOO is required to approve CP'
    });
  }

  try {
    await prisma.community_partners.update({
      where: { cp_id },
      data: {
        status: 'ACTIVE',
        aoo
      }
    });

    await prisma.cp_applications.updateMany({
      where: { cp_id },
      data: {
        status: 'APPROVED'
      }
    });

    try {
      await auditService.record('CP_APPROVED', { cp_id, aoo, approved_by: req.user?.user_id || null });
    } catch (e) {
      console.error('Audit record failed', e);
    }

    res.json({ message: 'CP approved successfully' });
  } catch (err) {
    console.error('Approve CP error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * REJECT CP
 */
exports.rejectCp = async (req, res) => {
  const { cp_id } = req.params;

  try {
    await prisma.community_partners.update({
      where: { cp_id },
      data: { status: 'REJECTED' }
    });

    await prisma.cp_applications.updateMany({
      where: { cp_id },
      data: { status: 'REJECTED' }
    });

    try {
      await auditService.record('CP_REJECTED', { cp_id, rejected_by: req.user?.user_id || null });
    } catch (e) {
      console.error('Audit record failed', e);
    }

    res.json({ message: 'CP rejected' });
  } catch (err) {
    console.error('Reject CP error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all CP applications
 */
exports.getCpApplications = async (req, res) => {
  try {
    const apps = await prisma.cp_applications.findMany({
      include: {
        cp: {
          select: {
            cp_id: true,
            name: true,
            email: true,
            mobile: true,
            status: true,
            aoo: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(apps);
  } catch (err) {
    console.error('GET CP APPS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

/**
 * Assign Area of Operation (AOO)
 */
exports.assignAoo = async (req, res) => {
  try {
    const { cpId } = req.params;
    const { aoo } = req.body;

    if (!Array.isArray(aoo) || aoo.length === 0) {
      return res.status(400).json({ message: 'AOO must be a non-empty array' });
    }

    await prisma.community_partners.update({
      where: { cp_id: cpId },
      data: { aoo }
    });

    res.json({ message: 'AOO assigned successfully' });
  } catch (err) {
    console.error('ASSIGN AOO ERROR:', err);
    res.status(500).json({ message: 'Failed to assign AOO' });
  }
};

/**
 * Approve CP + Create Login User
 */
exports.approveCpApplication = async (req, res) => {
  try {
    const { cpId } = req.params;
    const adminId = req.user.user_id;

    const cp = await prisma.community_partners.findUnique({
      where: { cp_id: cpId }
    });

    if (!cp) {
      return res.status(404).json({ message: 'CP not found' });
    }

    if (!cp.aoo || cp.aoo.length === 0) {
      return res.status(400).json({ message: 'Assign AOO before approval' });
    }

    // 1️⃣ Activate CP
    await prisma.community_partners.update({
      where: { cp_id: cpId },
      data: { status: 'ACTIVE' }
    });

    // 2️⃣ Approve application
    await prisma.cp_applications.updateMany({
      where: { cp_id: cpId },
      data: {
        status: 'APPROVED',
        reviewed_by: adminId,
        reviewed_at: new Date()
      }
    });

    // 3️⃣ Create login user (CRITICAL FIX)
    const existingUser = await prisma.users.findUnique({
      where: { email: cp.email }
    });

    if (!existingUser) {
      // generate a secure random password and store a hashed version
      const plainPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await prisma.users.create({
        data: {
          user_id: uuid(),
          email: cp.email,
          password: hashedPassword,
          role: 'CP',
          cp_id: cp.cp_id,
          created_at: new Date()
        }
      });

      // send password via email (stub) and record audit
      try {
        await emailService.sendPasswordEmail(cp.email, plainPassword);
      } catch (e) {
        console.error('Failed to send password email', e);
      }

      await auditService.record('CP_USER_CREATED', {
        cp_id: cp.cp_id,
        email: cp.email,
        created_by: adminId
      });
    }

    await auditService.record('CP_APPROVED', { cp_id: cpId, approved_by: adminId });

    res.json({ message: 'CP approved and login created' });
  } catch (err) {
    console.error('APPROVE CP ERROR:', err);
    res.status(500).json({ message: 'Approval failed' });
  }
};

/**
 * Reject CP
 */
exports.rejectCpApplication = async (req, res) => {
  try {
    const { cpId } = req.params;
    const adminId = req.user.user_id;

    await prisma.community_partners.update({
      where: { cp_id: cpId },
      data: { status: 'REJECTED' }
    });

    await prisma.cp_applications.updateMany({
      where: { cp_id: cpId },
      data: {
        status: 'REJECTED',
        reviewed_by: adminId,
        reviewed_at: new Date()
      }
    });

    await auditService.record('CP_REJECTED', { cp_id: cpId, rejected_by: adminId });

    res.json({ message: 'CP rejected' });
  } catch (err) {
    console.error('REJECT CP ERROR:', err);
    res.status(500).json({ message: 'Rejection failed' });
  }
};

/* =====================================================
   INCENTIVES
===================================================== */

/**
 * Get all incentives (Admin)
 */
exports.getIncentives = async (req, res) => {
  try {
    const incentives = await prisma.incentives.findMany({
      orderBy: { incentive_id: 'desc' }
    });

    res.json(incentives);
  } catch (err) {
    console.error('GET INCENTIVES ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch incentives' });
  }
};

/**
 * Approve incentive
 */
exports.approveIncentive = async (req, res) => {
  try {
    const { incentiveId } = req.params;

    await prisma.incentives.update({
      where: { incentive_id: incentiveId },
      data: { status: 'APPROVED' }
    });

    try {
      await auditService.record('INCENTIVE_APPROVED', { incentive_id: incentiveId, approved_by: req.user?.user_id || null });
    } catch (e) {
      console.error('Audit record failed', e);
    }

    res.json({ message: 'Incentive approved' });
  } catch (err) {
    console.error('APPROVE INCENTIVE ERROR:', err);
    res.status(500).json({ message: 'Approval failed' });
  }
};

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalCps,
      pendingApplications,
      activeCps,
      pendingIncentives
    ] = await Promise.all([
      prisma.community_partners.count(),
      prisma.cp_applications.count({ where: { status: 'SUBMITTED' } }),
      prisma.community_partners.count({ where: { status: 'ACTIVE' } }),
      prisma.incentives.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      totalCps,
      pendingApplications,
      activeCps,
      pendingIncentives
    });
  } catch (err) {
    console.error('ADMIN DASHBOARD ERROR:', err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};


/**
 * Get Incentive Config
 */
exports.getIncentiveConfig = async (req, res) => {
  try {
    const config = await prisma.incentive_config.findUnique({
      where: { key: 'LEAD_CLOSED' }
    });

    res.json({
      key: 'LEAD_CLOSED',
      value: config?.value || 0
    });

  } catch (err) {
    console.error('GET INCENTIVE CONFIG ERROR:', err);
    res.status(500).json({ message: 'Failed to load incentive config' });
  }
};

/**
 * Update Incentive Config
 */
exports.updateIncentiveConfig = async (req, res) => {
  try {
    const { value } = req.body;

    if (!value || value < 0) {
      return res.status(400).json({ message: 'Invalid incentive value' });
    }

    await prisma.incentive_config.upsert({
      where: { key: 'LEAD_CLOSED' },
      update: { value },
      create: {
        key: 'LEAD_CLOSED',
        value
      }
    });

    res.json({ message: 'Incentive amount updated successfully' });

  } catch (err) {
    console.error('UPDATE INCENTIVE CONFIG ERROR:', err);
    res.status(500).json({ message: 'Failed to update incentive config' });
  }
};
