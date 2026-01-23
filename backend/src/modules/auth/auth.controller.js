const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const prisma = new PrismaClient();

// ✅ single source of truth
const LOGIN_SECRET = process.env.LOGIN_SECRET || 'powaha_super_secret_key_2026';

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1️⃣ Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({
        message: 'Email, password and role are required'
      });
    }

    // 2️⃣ Find user
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // 4️⃣ Role validation
    if (user.role !== role) {
      return res.status(403).json({
        message: 'Role mismatch'
      });
    }

    // 5️⃣ CP-specific rule → must be ACTIVE
    let cpId = null;

    if (user.role === 'CP') {
      const cp = await prisma.community_partners.findUnique({
        where: { email: user.email }
      });

      if (!cp) {
        return res.status(403).json({
          message: 'CP profile not found'
        });
      }

      if (cp.status !== 'ACTIVE') {
        return res.status(403).json({
          message: 'Application not approved yet'
        });
      }

      cpId = cp.cp_id;
    }

    // 6️⃣ Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        cp_id: cpId
      },
      LOGIN_SECRET,
      { expiresIn: '7d' }
    );

    // 7️⃣ Success
    res.json({
      token,
      role: user.role
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({
      message: 'Server error'
    });
  }
};


exports.applyCp = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
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
    const applicationId = uuid();

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        user_id: userId,
        email,
        password: hashedPassword,
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
        status: 'APPLIED'
      }
    });

    await prisma.cp_applications.create({
      data: {
        application_id: applicationId,
        cp_id: cpId,
        application_data: {
          name,
          email,
          mobile,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          background: req.body.background,
          experience: req.body.experience,
          preferred_aoo: req.body.preferred_aoo
        },
        status: 'SUBMITTED'
      }
    });

    return res.status(201).json({
      message: 'CP application submitted successfully'
    });

  } catch (err) {
    console.error('CP apply error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


