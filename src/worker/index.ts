import { Hono } from "hono";
import { cors } from 'hono/cors';
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
  getCurrentUser,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import {
  CreateEmergencyContactSchema,
  UpdateEmergencyContactSchema,
  CreateAlertSchema,
  CreateSecurityAlertSchema,
  CreateBikeSchema,
  UpdateBikeSchema,
  CreateTheftReportSchema,
  UpdateProfileSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Auth Routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Profile Routes
app.get('/api/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  const result = await c.env.DB.prepare(
    'SELECT * FROM profiles WHERE id = ?'
  ).bind(user.id).first();

  if (!result) {
    // Create profile if it doesn't exist
    await c.env.DB.prepare(
      'INSERT INTO profiles (id, username, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      user.id,
      user.google_user_data.name?.toLowerCase().replace(/\s+/g, '_') || null,
      user.google_user_data.given_name || null,
      user.google_user_data.family_name || null,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    const newProfile = await c.env.DB.prepare(
      'SELECT * FROM profiles WHERE id = ?'
    ).bind(user.id).first();

    return c.json(newProfile);
  }

  return c.json(result);
});

app.put('/api/profile', authMiddleware, zValidator('json', UpdateProfileSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const updateFields = [];
  const updateValues = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  });

  if (updateFields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  updateFields.push('updated_at = ?');
  updateValues.push(new Date().toISOString());
  updateValues.push(user.id);

  await c.env.DB.prepare(
    `UPDATE profiles SET ${updateFields.join(', ')} WHERE id = ?`
  ).bind(...updateValues).run();

  const updatedProfile = await c.env.DB.prepare(
    'SELECT * FROM profiles WHERE id = ?'
  ).bind(user.id).first();

  return c.json(updatedProfile);
});

// Emergency Contacts Routes
app.get('/api/emergency-contacts', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC'
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/emergency-contacts', authMiddleware, zValidator('json', CreateEmergencyContactSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const now = new Date().toISOString();

  const result = await c.env.DB.prepare(
    'INSERT INTO emergency_contacts (user_id, contact_name, phone_number, email, is_primary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    user.id,
    data.contact_name,
    data.phone_number,
    data.email,
    data.is_primary,
    now,
    now
  ).run();

  const newContact = await c.env.DB.prepare(
    'SELECT * FROM emergency_contacts WHERE id = ?'
  ).bind(result.meta.last_row_id).first();

  return c.json(newContact, 201);
});

app.put('/api/emergency-contacts/:id', authMiddleware, zValidator('json', UpdateEmergencyContactSchema), async (c) => {
  const user = c.get('user');
  const contactId = c.req.param('id');
  const data = c.req.valid('json');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify contact belongs to user
  const contact = await c.env.DB.prepare(
    'SELECT * FROM emergency_contacts WHERE id = ? AND user_id = ?'
  ).bind(contactId, user.id).first();

  if (!contact) {
    return c.json({ error: 'Contact not found' }, 404);
  }

  const updateFields = [];
  const updateValues = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  });

  if (updateFields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  updateFields.push('updated_at = ?');
  updateValues.push(new Date().toISOString());
  updateValues.push(contactId);

  await c.env.DB.prepare(
    `UPDATE emergency_contacts SET ${updateFields.join(', ')} WHERE id = ?`
  ).bind(...updateValues).run();

  const updatedContact = await c.env.DB.prepare(
    'SELECT * FROM emergency_contacts WHERE id = ?'
  ).bind(contactId).first();

  return c.json(updatedContact);
});

app.delete('/api/emergency-contacts/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const contactId = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify contact belongs to user
  const contact = await c.env.DB.prepare(
    'SELECT * FROM emergency_contacts WHERE id = ? AND user_id = ?'
  ).bind(contactId, user.id).first();

  if (!contact) {
    return c.json({ error: 'Contact not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM emergency_contacts WHERE id = ?'
  ).bind(contactId).run();

  return c.json({ success: true });
});

// Alerts Routes
app.get('/api/alerts', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
  ).bind(user.id).all();

  return c.json(results);
});

// ESP32 Alert Endpoint
app.post('/api/alert', zValidator('json', CreateAlertSchema), async (c) => {
  const data = c.req.valid('json');

  // Verify JWT and get user
  const user = await getCurrentUser(data.jwt, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  if (!user) {
    return c.json({ error: 'Invalid JWT token' }, 401);
  }

  const now = new Date().toISOString();

  // Insert alert with sensor data
  const result = await c.env.DB.prepare(`
    INSERT INTO alerts (
      device_id, user_id, alert_type, latitude, longitude,
      gyroscope_x, gyroscope_y, gyroscope_z,
      accelerometer_x, accelerometer_y, accelerometer_z,
      gps_accuracy, resolved, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.device_id,
    user.id,
    data.alert_type,
    data.latitude || null,
    data.longitude || null,
    data.gyroscope_x || null,
    data.gyroscope_y || null,
    data.gyroscope_z || null,
    data.accelerometer_x || null,
    data.accelerometer_y || null,
    data.accelerometer_z || null,
    data.gps_accuracy || null,
    false,
    now,
    now
  ).run();

  // Get emergency contacts for notifications
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM emergency_contacts WHERE user_id = ?'
  ).bind(user.id).all();

  // TODO: Send notifications to emergency contacts
  // This would integrate with SendGrid/Twilio here
  console.log(`Alert created for user ${user.id}, ${results.length} contacts to notify`);

  const newAlert = await c.env.DB.prepare(
    'SELECT * FROM alerts WHERE id = ?'
  ).bind(result.meta.last_row_id).first();

  return c.json(newAlert, 201);
});

app.put('/api/alerts/:id/resolve', authMiddleware, async (c) => {
  const user = c.get('user');
  const alertId = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify alert belongs to user
  const alert = await c.env.DB.prepare(
    'SELECT * FROM alerts WHERE id = ? AND user_id = ?'
  ).bind(alertId, user.id).first();

  if (!alert) {
    return c.json({ error: 'Alert not found' }, 404);
  }

  await c.env.DB.prepare(
    'UPDATE alerts SET resolved = ?, updated_at = ? WHERE id = ?'
  ).bind(true, new Date().toISOString(), alertId).run();

  const updatedAlert = await c.env.DB.prepare(
    'SELECT * FROM alerts WHERE id = ?'
  ).bind(alertId).first();

  return c.json(updatedAlert);
});

// Bikes Routes
app.get('/api/bikes', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC'
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/bikes', authMiddleware, zValidator('json', CreateBikeSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const now = new Date().toISOString();

  const result = await c.env.DB.prepare(
    'INSERT INTO bikes (user_id, bike_name, model, brand, serial_number, license_plate, color, year, estimated_value, bike_photo_url, is_primary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    user.id,
    data.bike_name,
    data.model,
    data.brand || null,
    data.serial_number || null,
    data.license_plate || null,
    data.color || null,
    data.year || null,
    data.estimated_value || null,
    data.bike_photo_url || null,
    data.is_primary,
    now,
    now
  ).run();

  const newBike = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE id = ?'
  ).bind(result.meta.last_row_id).first();

  return c.json(newBike, 201);
});

app.put('/api/bikes/:id', authMiddleware, zValidator('json', UpdateBikeSchema), async (c) => {
  const user = c.get('user');
  const bikeId = c.req.param('id');
  const data = c.req.valid('json');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify bike belongs to user
  const bike = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE id = ? AND user_id = ?'
  ).bind(bikeId, user.id).first();

  if (!bike) {
    return c.json({ error: 'Bike not found' }, 404);
  }

  const updateFields = [];
  const updateValues = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  });

  if (updateFields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  updateFields.push('updated_at = ?');
  updateValues.push(new Date().toISOString());
  updateValues.push(bikeId);

  await c.env.DB.prepare(
    `UPDATE bikes SET ${updateFields.join(', ')} WHERE id = ?`
  ).bind(...updateValues).run();

  const updatedBike = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE id = ?'
  ).bind(bikeId).first();

  return c.json(updatedBike);
});

app.delete('/api/bikes/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const bikeId = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify bike belongs to user
  const bike = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE id = ? AND user_id = ?'
  ).bind(bikeId, user.id).first();

  if (!bike) {
    return c.json({ error: 'Bike not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM bikes WHERE id = ?'
  ).bind(bikeId).run();

  return c.json({ success: true });
});

app.put('/api/bikes/:id/stolen', authMiddleware, async (c) => {
  const user = c.get('user');
  const bikeId = c.req.param('id');
  const { is_stolen } = await c.req.json();

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify bike belongs to user
  const bike = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE id = ? AND user_id = ?'
  ).bind(bikeId, user.id).first();

  if (!bike) {
    return c.json({ error: 'Bike not found' }, 404);
  }

  await c.env.DB.prepare(
    'UPDATE bikes SET is_stolen = ?, updated_at = ? WHERE id = ?'
  ).bind(is_stolen, new Date().toISOString(), bikeId).run();

  const updatedBike = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE id = ?'
  ).bind(bikeId).first();

  return c.json(updatedBike);
});

// Theft Reports Routes
app.get('/api/theft-reports', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM theft_reports WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/theft-reports', authMiddleware, zValidator('json', CreateTheftReportSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify bike belongs to user
  const bike = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE id = ? AND user_id = ?'
  ).bind(data.bike_id, user.id).first();

  if (!bike) {
    return c.json({ error: 'Bike not found' }, 404);
  }

  const now = new Date().toISOString();

  const result = await c.env.DB.prepare(
    'INSERT INTO theft_reports (bike_id, user_id, theft_date, theft_location, theft_latitude, theft_longitude, description, police_report_number, reported_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    data.bike_id,
    user.id,
    data.theft_date,
    data.theft_location,
    data.theft_latitude || null,
    data.theft_longitude || null,
    data.description || null,
    data.police_report_number || null,
    now,
    now,
    now
  ).run();

  const newReport = await c.env.DB.prepare(
    'SELECT * FROM theft_reports WHERE id = ?'
  ).bind(result.meta.last_row_id).first();

  return c.json(newReport, 201);
});

app.put('/api/theft-reports/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const reportId = c.req.param('id');
  const { status } = await c.req.json();

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify report belongs to user
  const report = await c.env.DB.prepare(
    'SELECT * FROM theft_reports WHERE id = ? AND user_id = ?'
  ).bind(reportId, user.id).first();

  if (!report) {
    return c.json({ error: 'Report not found' }, 404);
  }

  const now = new Date().toISOString();
  const recoveredAt = status === 'recovered' ? now : null;

  await c.env.DB.prepare(
    'UPDATE theft_reports SET status = ?, recovered_at = ?, updated_at = ? WHERE id = ?'
  ).bind(status, recoveredAt, now, reportId).run();

  const updatedReport = await c.env.DB.prepare(
    'SELECT * FROM theft_reports WHERE id = ?'
  ).bind(reportId).first();

  return c.json(updatedReport);
});

// Security Alerts Routes
app.get('/api/security-alerts', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM security_alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/security-alert', zValidator('json', CreateSecurityAlertSchema), async (c) => {
  const data = c.req.valid('json');

  // Verify JWT and get user
  const user = await getCurrentUser(data.jwt, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  if (!user) {
    return c.json({ error: 'Invalid JWT token' }, 401);
  }

  const now = new Date().toISOString();

  const result = await c.env.DB.prepare(`
    INSERT INTO security_alerts (
      bike_id, user_id, device_id, alert_type, severity,
      latitude, longitude, sensor_data,
      gyroscope_x, gyroscope_y, gyroscope_z,
      accelerometer_x, accelerometer_y, accelerometer_z,
      gps_accuracy, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.bike_id || null,
    user.id,
    data.device_id,
    data.alert_type,
    data.severity,
    data.latitude || null,
    data.longitude || null,
    data.sensor_data || null,
    data.gyroscope_x || null,
    data.gyroscope_y || null,
    data.gyroscope_z || null,
    data.accelerometer_x || null,
    data.accelerometer_y || null,
    data.accelerometer_z || null,
    data.gps_accuracy || null,
    now,
    now
  ).run();

  const newAlert = await c.env.DB.prepare(
    'SELECT * FROM security_alerts WHERE id = ?'
  ).bind(result.meta.last_row_id).first();

  return c.json(newAlert, 201);
});

app.put('/api/security-alerts/:id/resolve', authMiddleware, async (c) => {
  const user = c.get('user');
  const alertId = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Verify alert belongs to user
  const alert = await c.env.DB.prepare(
    'SELECT * FROM security_alerts WHERE id = ? AND user_id = ?'
  ).bind(alertId, user.id).first();

  if (!alert) {
    return c.json({ error: 'Alert not found' }, 404);
  }

  const now = new Date().toISOString();

  await c.env.DB.prepare(
    'UPDATE security_alerts SET resolved = ?, resolved_by = ?, resolved_at = ?, updated_at = ? WHERE id = ?'
  ).bind(true, user.id, now, now, alertId).run();

  const updatedAlert = await c.env.DB.prepare(
    'SELECT * FROM security_alerts WHERE id = ?'
  ).bind(alertId).first();

  return c.json(updatedAlert);
});

// Dashboard Stats Route
app.get('/api/dashboard-stats', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Get bike count
  const bikeCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM bikes WHERE user_id = ?'
  ).bind(user.id).first();

  // Get active alerts count
  const activeAlerts = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM security_alerts WHERE user_id = ? AND resolved = false'
  ).bind(user.id).first();

  // Get theft reports count
  const theftReports = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM theft_reports WHERE user_id = ?'
  ).bind(user.id).first();

  // Get tracking sessions stats
  const sessionStats = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total_rides,
      COALESCE(SUM(distance_km), 0) as total_distance,
      COALESCE(SUM(duration_minutes), 0) as total_time,
      COALESCE(AVG(max_speed), 0) as avg_speed
    FROM tracking_sessions 
    WHERE user_id = ? AND session_end IS NOT NULL
  `).bind(user.id).first();

  const stats = {
    total_rides: sessionStats?.total_rides || 0,
    total_distance: sessionStats?.total_distance || 0,
    total_time: sessionStats?.total_time || 0,
    avg_speed: sessionStats?.avg_speed || 0,
    bikes_count: bikeCount?.count || 0,
    active_alerts: activeAlerts?.count || 0,
    theft_reports: theftReports?.count || 0,
  };

  return c.json(stats);
});

// Live Data Route (enhanced with bike info and sensor data)
app.get('/api/live-data', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Get primary bike
  const primaryBike = await c.env.DB.prepare(
    'SELECT * FROM bikes WHERE user_id = ? AND is_primary = true LIMIT 1'
  ).bind(user.id).first();

  // Get system settings
  const settings = await c.env.DB.prepare(
    'SELECT * FROM system_settings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(user.id).first();

  // Get latest sensor reading
  const latestReading = await c.env.DB.prepare(
    'SELECT * FROM sensor_readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(user.id).first();

  // Mock enhanced live data with sensor information
  const mockData = {
    speed: latestReading?.speed || Math.floor(Math.random() * 40) + 10,
    latitude: latestReading?.latitude || 40.7128 + (Math.random() - 0.5) * 0.01,
    longitude: latestReading?.longitude || -74.0060 + (Math.random() - 0.5) * 0.01,
    device_status: Math.random() > 0.1 ? 'online' as const : 'offline' as const,
    crash_detection_active: settings?.crash_detection_enabled ?? true,
    blind_spot_active: settings?.blind_spot_enabled ?? true,
    theft_protection_active: settings?.theft_protection_enabled ?? true,
    current_bike_id: primaryBike?.id || null,
    gyroscope_x: latestReading?.gyroscope_x || (Math.random() - 0.5) * 45,
    gyroscope_y: latestReading?.gyroscope_y || (Math.random() - 0.5) * 45,
    gyroscope_z: latestReading?.gyroscope_z || (Math.random() - 0.5) * 180,
    accelerometer_x: latestReading?.accelerometer_x || (Math.random() - 0.5) * 20,
    accelerometer_y: latestReading?.accelerometer_y || (Math.random() - 0.5) * 20,
    accelerometer_z: latestReading?.accelerometer_z || Math.random() * 10 + 8,
    crash_sensitivity: settings?.crash_sensitivity ?? 50,
    blind_spot_sensitivity: settings?.blind_spot_sensitivity ?? 50,
    theft_sensitivity: settings?.theft_sensitivity ?? 50,
    gps_accuracy: latestReading?.gps_accuracy || Math.random() * 5 + 1,
    last_gps_update: latestReading?.created_at || new Date().toISOString(),
  };

  return c.json(mockData);
});

// System Settings Routes
app.get('/api/system-settings', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const settings = await c.env.DB.prepare(
    'SELECT * FROM system_settings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(user.id).first();

  if (!settings) {
    // Create default settings
    const now = new Date().toISOString();
    const result = await c.env.DB.prepare(
      'INSERT INTO system_settings (user_id, created_at, updated_at) VALUES (?, ?, ?)'
    ).bind(user.id, now, now).run();

    const newSettings = await c.env.DB.prepare(
      'SELECT * FROM system_settings WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return c.json(newSettings);
  }

  return c.json(settings);
});

app.put('/api/system-settings', authMiddleware, async (c) => {
  const user = c.get('user');
  const data = await c.req.json();

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Get current settings
  let settings = await c.env.DB.prepare(
    'SELECT * FROM system_settings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(user.id).first();

  const now = new Date().toISOString();

  if (!settings) {
    // Create new settings
    const result = await c.env.DB.prepare(
      'INSERT INTO system_settings (user_id, created_at, updated_at) VALUES (?, ?, ?)'
    ).bind(user.id, now, now).run();
    
    settings = { id: result.meta.last_row_id };
  }

  // Update settings
  const updateFields = [];
  const updateValues = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  });

  if (updateFields.length > 0) {
    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(settings.id);

    await c.env.DB.prepare(
      `UPDATE system_settings SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...updateValues).run();
  }

  const updatedSettings = await c.env.DB.prepare(
    'SELECT * FROM system_settings WHERE id = ?'
  ).bind(settings.id).first();

  return c.json(updatedSettings);
});

// Sensor Data Endpoint (for ESP32)
app.post('/api/sensor-data', zValidator('json', z.object({
  device_id: z.string(),
  jwt: z.string(),
  bike_id: z.number().optional(),
  speed: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  gyroscope_x: z.number().optional(),
  gyroscope_y: z.number().optional(),
  gyroscope_z: z.number().optional(),
  accelerometer_x: z.number().optional(),
  accelerometer_y: z.number().optional(),
  accelerometer_z: z.number().optional(),
  gps_accuracy: z.number().optional(),
  signal_strength: z.number().optional(),
  battery_level: z.number().optional(),
})), async (c) => {
  const data = c.req.valid('json');

  // Verify JWT and get user
  const user = await getCurrentUser(data.jwt, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  if (!user) {
    return c.json({ error: 'Invalid JWT token' }, 401);
  }

  const now = new Date().toISOString();

  const result = await c.env.DB.prepare(`
    INSERT INTO sensor_readings (
      device_id, user_id, bike_id, speed, latitude, longitude,
      gyroscope_x, gyroscope_y, gyroscope_z,
      accelerometer_x, accelerometer_y, accelerometer_z,
      gps_accuracy, signal_strength, battery_level, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.device_id,
    user.id,
    data.bike_id || null,
    data.speed || null,
    data.latitude || null,
    data.longitude || null,
    data.gyroscope_x || null,
    data.gyroscope_y || null,
    data.gyroscope_z || null,
    data.accelerometer_x || null,
    data.accelerometer_y || null,
    data.accelerometer_z || null,
    data.gps_accuracy || null,
    data.signal_strength || null,
    data.battery_level || null,
    now
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id }, 201);
});

export default app;
