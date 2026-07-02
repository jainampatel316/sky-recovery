import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-mvp';

// Inline validation helpers to prevent SQL injection and ensure data integrity
const isValidEmail = (email: any) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password: any) => typeof password === 'string' && password.length >= 6 && password.length <= 100;
const isValidToken = (token: any) => typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token);

// Login Endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!isValidEmail(email) || !isValidPassword(password)) {
    res.status(400).json({ error: 'Invalid email or password format' });
    return;
  }

  try {
    const passenger = await prisma.passenger.findUnique({
      where: { email },
      include: {
        bookings: {
          include: {
            flight: {
              include: { disruptions: true }
            }
          }
        }
      }
    });

    if (!passenger) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, passenger.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: passenger.id }, JWT_SECRET, { expiresIn: '1d' });
    
    // Remove password hash from response
    const { passwordHash, resetToken, resetTokenExpiry, ...safePassenger } = passenger;
    
    res.json({ token, passenger: safePassenger });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  try {
    const passenger = await prisma.passenger.findUnique({ where: { email } });
    if (!passenger) {
      // Return success anyway to prevent email enumeration
      res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passenger.update({
      where: { id: passenger.id },
      data: { resetToken, resetTokenExpiry }
    });

    // MOCK EMAIL SENDING
    console.log(`\n\n========================================`);
    console.log(`MOCK EMAIL SENT TO: ${email}`);
    console.log(`Subject: Reset Your SkyRecover Password`);
    console.log(`Link: http://localhost:5173/reset-password?token=${resetToken}`);
    console.log(`========================================\n\n`);

    res.json({ success: true, message: 'Reset link sent successfully (Check server console).' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password Endpoint
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!isValidToken(token) || !isValidPassword(newPassword)) {
    res.status(400).json({ error: 'Invalid token or password format' });
    return;
  }

  try {
    const passenger = await prisma.passenger.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!passenger) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.passenger.update({
      where: { id: passenger.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
