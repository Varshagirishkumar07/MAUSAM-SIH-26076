/**
 * MAUSAM Backend - Health Controller
 * Module 3.1: Node.js + Express Backend Foundation
 */

export function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'mausam-backend',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  });
}
