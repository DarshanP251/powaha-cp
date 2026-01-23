const { PrismaClient } = require('@prisma/client');
const { v4: uuid } = require('uuid');

const auditService = require('../../audits/audit.service');

const prisma = new PrismaClient();

/* =========================
   APPLY CP
========================= */
exports.applyCP = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const userId = uuid();
    const cpId = uuid();

    await prisma.users.create({
      data: {
        user_id: userId,
        email,
        password,
        role: 'CP',
        cp_id: cpId
      }
    });

    await prisma.community_partners.create({
      data: {
        cp_id: cpId,
        name,
        email,
        mobile,
        status: 'APPLIED',
        aoo: []
      }
    });

    await prisma.cp_applications.create({
      data: {
        application_id: uuid(),
        cp_id: cpId,
        application_data: { name, email, mobile },
        status: 'SUBMITTED'
      }
    });

    res.status(201).json({ message: 'CP application submitted' });

  } catch (err) {
    console.error('APPLY CP ERROR:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* =========================
   CP DASHBOARD
========================= */
exports.getDashboard = async (req, res) => {
  try {
    const cpId = req.user.cp_id;

    const cp = await prisma.community_partners.findUnique({
      where: { cp_id: cpId }
    });

    if (!cp) {
      return res.status(404).json({ message: 'CP not found' });
    }

    // Get total leads count
    const totalLeads = await prisma.cp_leads.count({
      where: { cp_id: cpId }
    });

    // Get leads by stage
    const leadsByStage = await prisma.cp_leads.groupBy({
      by: ['stage'],
      where: { cp_id: cpId },
      _count: true
    });

    const by_stage = {};
    leadsByStage.forEach(item => {
      by_stage[item.stage] = item._count;
    });

    // Get incentives counts
    const pendingIncentives = await prisma.incentives.count({
      where: { cp_id: cpId, status: 'PENDING' }
    });

    const approvedIncentives = await prisma.incentives.count({
      where: { cp_id: cpId, status: 'APPROVED' }
    });

    res.json({
      cp: {
        name: cp.name,
        status: cp.status
      },
      aoo: cp.aoo || [],
      leads: {
        total: totalLeads,
        by_stage
      },
      incentives: {
        pending: pendingIncentives,
        approved: approvedIncentives
      }
    });

  } catch (err) {
    console.error('DASHBOARD ERROR:', err);
    res.status(500).json({ message: 'Dashboard error' });
  }
};

/* =========================
   CREATE LEAD
========================= */
exports.createLead = async (req, res) => {
  try {
    const cpId = req.user.cp_id;
    const { church_name, location, contact_person, contact_mobile } = req.body;

    if (!church_name || !location || !contact_mobile) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const cp = await prisma.community_partners.findUnique({
      where: { cp_id: cpId }
    });

    if (!cp || cp.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'CP not active' });
    }

    const allowedAOO = (cp.aoo || []).map(a => a.toLowerCase());
    if (!allowedAOO.includes(location.toLowerCase())) {
      return res.status(403).json({ message: 'Location outside AOO' });
    }

    await prisma.cp_leads.create({
      data: {
        lead_id: uuid(),
        cp_id: cpId,
        church_name,
        location,
        stage: 'NEW',
        notes: `Contact: ${contact_person || '-'} (${contact_mobile})`,
        last_updated: new Date()
      }
    });

    await auditService.record('LEAD_CREATED', {
      cp_id: cpId,
      church_name,
      location,
      contact_person,
      contact_mobile
    });

    res.status(201).json({ message: 'Lead created' });

  } catch (err) {
    console.error('CREATE LEAD ERROR:', err);
    res.status(500).json({ message: 'Lead creation failed' });
  }
};

/* =========================
   GET MY LEADS
========================= */
exports.getMyLeads = async (req, res) => {
  try {
    const cpId = req.user.cp_id;

    const leads = await prisma.cp_leads.findMany({
      where: { cp_id: cpId },
      orderBy: { last_updated: 'desc' }
    });

    res.json(leads);

  } catch (err) {
    console.error('GET LEADS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

/* =========================
   UPDATE LEAD STAGE + DYNAMIC INCENTIVE
========================= */
exports.updateLeadStage = async (req, res) => {
  try {
    const cpId = req.user.cp_id;
    const { leadId } = req.params;
    const { stage } = req.body;

    const STAGES = ['NEW', 'CONTACTED', 'DEMO', 'CLOSED'];

    if (!STAGES.includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage' });
    }

    const lead = await prisma.cp_leads.findUnique({
      where: { lead_id: leadId }
    });

    if (!lead || lead.cp_id !== cpId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const currentIndex = STAGES.indexOf(lead.stage);
    const nextIndex = STAGES.indexOf(stage);

    if (nextIndex !== currentIndex + 1) {
      return res.status(400).json({ message: 'Invalid stage transition' });
    }

    await prisma.cp_leads.update({
      where: { lead_id: leadId },
      data: {
        stage,
        last_updated: new Date()
      }
    });

    if (stage === 'CLOSED') {
      const existing = await prisma.incentives.findUnique({
        where: { lead_id: leadId }
      });

      if (!existing) {
        const config = await prisma.incentive_config.findUnique({
          where: { key: 'LEAD_CLOSED' }
        });

        const amount = config?.value || 0;

        await prisma.incentives.create({
          data: {
            incentive_id: uuid(),
            cp_id: cpId,
            lead_id: leadId,
            amount,
            status: 'PENDING'
          }
        });
        await auditService.record('INCENTIVE_CREATED', {
          cp_id: cpId,
          lead_id: leadId,
          amount
        });
      }
    }

    await auditService.record('LEAD_STAGE_UPDATED', {
      lead_id: leadId,
      cp_id: cpId,
      new_stage: stage,
      updated_by: req.user.user_id || null
    });

    res.json({ message: 'Lead updated' });

  } catch (err) {
    console.error('UPDATE LEAD ERROR:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* =========================
   CP INCENTIVES (FOR CP)
========================= */
exports.getMyIncentives = async (req, res) => {
  try {
    const cpId = req.user.cp_id;

    // Get incentives with lead details via raw query
    const incentives = await prisma.$queryRaw`
      SELECT 
        i.incentive_id,
        i.cp_id,
        i.lead_id,
        i.amount,
        i.status,
        l.church_name,
        l.location
      FROM incentives i
      LEFT JOIN cp_leads l ON i.lead_id = l.lead_id
      WHERE i.cp_id = ${cpId}
      ORDER BY i.incentive_id DESC
    `;

    res.json(incentives);

  } catch (err) {
    console.error('GET CP INCENTIVES ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch incentives' });
  }
};

/* =========================
   CP PROFILE
========================= */
exports.getMyProfile = async (req, res) => {
  try {
    const cp = await prisma.community_partners.findUnique({
      where: { cp_id: req.user.cp_id },
      select: { name: true, aoo: true }
    });

    res.json(cp);

  } catch (err) {
    res.status(500).json({ message: 'Failed to load profile' });
  }
};
