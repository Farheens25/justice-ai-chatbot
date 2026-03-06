import express from 'express';
import { supabase } from '../server.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

const PINCODE_STATION_MAP = {
  '400001': 'Azad Maidan Police Station, Mumbai',
  '400050': 'Bandra Police Station, Mumbai',
  '400053': 'Andheri Police Station, Mumbai',
  '110001': 'Connaught Place Police Station, New Delhi',
  '110092': 'Preet Vihar Police Station, Delhi',
  '560001': 'Cubbon Park Police Station, Bengaluru',
  '560034': 'Koramangala Police Station, Bengaluru',
  '500001': 'Abids Police Station, Hyderabad',
  '600001': 'Flower Bazaar Police Station, Chennai',
  '700001': 'Hare Street Police Station, Kolkata',
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const calculateCaseStrength = ({ description = '', evidence = '', proofCount = 0 }) => {
  const descriptionScore = clamp(Math.floor(description.trim().length / 12), 0, 55);
  const evidenceScore = evidence.trim().length > 0 ? clamp(Math.floor(evidence.trim().length / 20), 0, 25) : 0;
  const proofScore = clamp(proofCount * 8, 0, 20);
  return clamp(descriptionScore + evidenceScore + proofScore, 5, 95);
};

const buildComplaintSummary = ({
  caseType,
  description = '',
  location = '',
  incidentDate = '',
  incidentTime = '',
  accusedName = '',
}) => {
  const shortDescription = description.trim().replace(/\s+/g, ' ').slice(0, 220);
  const parts = [
    `Complaint type: ${caseType || 'General'}.`,
    location ? `Location: ${location}.` : '',
    incidentDate ? `Date: ${incidentDate}.` : '',
    incidentTime ? `Time: ${incidentTime}.` : '',
    accusedName ? `Accused: ${accusedName}.` : '',
    shortDescription ? `Summary: ${shortDescription}${description.length > 220 ? '...' : ''}` : '',
  ].filter(Boolean);
  return parts.join(' ');
};

const generateCaseAnalysis = ({ description = '', evidence = '', proofCount = 0, witnessDetails = '' }) => {
  const detailScore = clamp(Math.floor(description.trim().length / 10), 0, 45);
  const evidenceScore = evidence.trim() ? clamp(Math.floor(evidence.trim().length / 20), 0, 20) : 0;
  const witnessScore = witnessDetails.trim() ? 15 : 0;
  const proofScore = clamp((Number(proofCount) || 0) * 5, 0, 20);
  const completenessScore = clamp(detailScore + evidenceScore + witnessScore + proofScore, 5, 100);

  let riskLevel = 'High';
  if (completenessScore >= 70) riskLevel = 'Low';
  else if (completenessScore >= 40) riskLevel = 'Medium';

  const likelyOutcome =
    completenessScore >= 70
      ? 'Strong filing quality. Good chance of quick FIR and investigation progress.'
      : completenessScore >= 40
      ? 'Moderate filing quality. Add more evidence/witness details for stronger progression.'
      : 'Low filing quality. More concrete details and proof are recommended before escalation.';

  return {
    completenessScore,
    riskLevel,
    likelyOutcome,
    recommendations: [
      'Keep original evidence safe and untouched.',
      'Add timeline with exact dates/time if possible.',
      'Attach witness names/contact details.',
      'Record every police update for follow-up.',
    ],
  };
};

const generateEscalationDraft = ({
  name = '',
  phone = '',
  email = '',
  trackingId = '',
  caseType = '',
  location = '',
  summary = '',
}) => {
  return [
    'Subject: Request for Case Escalation and Priority Review',
    '',
    'To,',
    'The Concerned Senior Officer,',
    '',
    `I, ${name || '[Your Name]'}, request escalation of my complaint for priority review.`,
    `Tracking ID: ${trackingId || '[Tracking ID]'}`,
    `Case Type: ${caseType || '[Case Type]'}`,
    location ? `Incident Location: ${location}` : '',
    '',
    `Complaint Summary: ${summary || '[Summary]'}`,
    '',
    'Reason for escalation:',
    '- Matter is serious and requires timely action.',
    '- I request status update, FIR/investigation progress, and next procedural steps.',
    '',
    `Contact: ${phone || '[Phone]'} | ${email || '[Email]'}`,
    '',
    'Kindly acknowledge and take necessary action at the earliest.',
    '',
    'Regards,',
    `${name || '[Your Name]'}`,
  ]
    .filter(Boolean)
    .join('\n');
};

const buildCaseNumber = () => {
  const year = new Date().getFullYear();
  const seed = `${Date.now()}`.slice(-6);
  return `CASE-${year}-${seed}`;
};

const buildTrackingId = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TRK-${year}-${random}`;
};

const buildProtectedId = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `PID-${year}-${random}`;
};

const getNearestPoliceStation = (pincode) => {
  if (!pincode) return 'Nearest police station to be assigned';
  return PINCODE_STATION_MAP[pincode] || 'Nearest police station to be assigned';
};

const sanitizeProtectedCaseForPolice = (caseData) => {
  if (!caseData?.is_protected_case) return caseData;
  return {
    ...caseData,
    complainant_name: 'Protected Identity',
    complainant_email: null,
    complainant_phone: null,
    complaint_form_json: null,
  };
};

const canAccessCase = (caseData, user) => {
  if (!caseData || !user) return false;
  if (user.userType === 'admin') return true;
  if (user.userType === 'police') {
    // Police can view assigned cases and unassigned incoming complaints.
    return !caseData.assigned_police_id || caseData.assigned_police_id === user.id || caseData.created_by === user.id;
  }
  if (user.userType === 'lawyer') {
    return caseData.assigned_lawyer_id === user.id;
  }
  return false;
};

const getCaseById = async (caseId) => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .maybeSingle();

  return { data, error };
};

const logCaseActivity = async (caseId, userId, activityType, description) => {
  const { error } = await supabase
    .from('case_activities')
    .insert({
      case_id: caseId,
      user_id: userId,
      activity_type: activityType,
      description,
    });

  if (error) {
    console.error('Case activity log error:', error);
  }
};

// Public: nearest police station by pincode
router.get('/public/police-station/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: 'Invalid pincode' });
    }
    const station = getNearestPoliceStation(pincode);
    res.json({ pincode, nearestPoliceStation: station });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public: track complaint by tracking ID
router.get('/public/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;

    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*')
      .eq('tracking_id', trackingId)
      .maybeSingle();

    if (error) throw error;
    if (!caseData) return res.status(404).json({ error: 'Tracking ID not found' });

    const { data: activities, error: activityError } = await supabase
      .from('case_activities')
      .select('activity_type, description, created_at')
      .eq('case_id', caseData.id)
      .order('created_at', { ascending: false });

    if (activityError) throw activityError;

    res.json({
      tracking: {
        trackingId: caseData.tracking_id,
        caseNumber: caseData.case_number,
        title: caseData.title,
        caseType: caseData.case_type,
        status: caseData.status,
        progressPercent: caseData.progress_percent || 0,
        progressNotes: caseData.progress_notes || null,
        firNumber: caseData.fir_number || null,
        firRegisteredAt: caseData.fir_registered_at || null,
        caseStrength: caseData.case_strength || 0,
        complaintSummary: caseData.complaint_summary || null,
        caseAnalysis: caseData.case_analysis || null,
        escalationDraft: caseData.escalation_draft || null,
        isProtectedCase: !!caseData.is_protected_case,
        protectedId: caseData.protected_reference_id || null,
        pincode: caseData.complainant_pincode || null,
        nearestPoliceStation: caseData.nearest_police_station || null,
        createdAt: caseData.created_at,
        updatedAt: caseData.updated_at,
      },
      activities: activities || [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public: file complaint (creates case in Supabase)
router.post('/public/complaints', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      caseType,
      description,
      evidence = '',
      proofCount = 0,
      incidentDate = null,
      incidentTime = null,
      accusedName = null,
      witnessDetails = null,
      urgencyLevel = null,
      preferredLanguage = null,
      pincode = null,
      isProtectedCase = false,
    } = req.body;

    if (!name || !email || !phone || !location || !caseType || !description || !pincode) {
      return res.status(400).json({ error: 'Missing required complaint fields' });
    }
    if (!/^\d{6}$/.test(String(pincode))) {
      return res.status(400).json({ error: 'Pincode must be 6 digits' });
    }

    const caseNumber = buildCaseNumber();
    const trackingId = buildTrackingId();
    const protectedReferenceId = isProtectedCase ? buildProtectedId() : null;
    const nearestPoliceStation = getNearestPoliceStation(String(pincode));
    const caseStrength = calculateCaseStrength({ description, evidence, proofCount: Number(proofCount) || 0 });
    const complaintSummary = buildComplaintSummary({
      caseType,
      description,
      location,
      incidentDate,
      incidentTime,
      accusedName,
    });
    const caseAnalysis = generateCaseAnalysis({ description, evidence, proofCount, witnessDetails });
    const escalationDraft = generateEscalationDraft({
      name,
      phone,
      email,
      trackingId,
      caseType,
      location,
      summary: complaintSummary,
    });
    const complaintFormSnapshot = {
      name,
      email,
      phone,
      location,
      caseType,
      description,
      evidence,
      proofCount: Number(proofCount) || 0,
      incidentDate,
      incidentTime,
      accusedName,
      witnessDetails,
      urgencyLevel,
      preferredLanguage,
      pincode,
      isProtectedCase,
      protectedReferenceId,
      nearestPoliceStation,
      submittedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('cases')
      .insert({
        case_number: caseNumber,
        tracking_id: trackingId,
        title: `${caseType} complaint`,
        description,
        case_type: caseType,
        status: 'open',
        created_by: null,
        assigned_lawyer_id: null,
        assigned_police_id: null,
        complainant_name: name,
        complainant_email: email,
        complainant_phone: phone,
        complainant_location: location,
        complainant_pincode: String(pincode),
        nearest_police_station: nearestPoliceStation,
        evidence_text: evidence || null,
        proof_count: Number(proofCount) || 0,
        case_strength: caseStrength,
        complaint_summary: complaintSummary,
        complaint_form_json: complaintFormSnapshot,
        case_analysis: caseAnalysis,
        escalation_draft: escalationDraft,
        incident_date: incidentDate,
        incident_time: incidentTime,
        accused_name: accusedName,
        witness_details: witnessDetails,
        urgency_level: urgencyLevel,
        preferred_language: preferredLanguage,
        is_protected_case: Boolean(isProtectedCase),
        protected_reference_id: protectedReferenceId,
        progress_percent: 10,
        progress_notes: `Complaint submitted successfully. Waiting for police review at ${nearestPoliceStation}.`,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Complaint filed successfully',
      complaint: {
        id: data.id,
        caseNumber,
        trackingId,
        caseStrength,
        complaintSummary,
        caseAnalysis,
        escalationDraft,
        fullFormSaved: true,
        protectedId: protectedReferenceId,
        nearestPoliceStation,
        status: data.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Police inbox: unassigned complaints + police's assigned cases
router.get('/police/inbox', authenticateToken, requireRoles('admin', 'police'), async (req, res) => {
  try {
    let query = supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (req.user.userType === 'police') {
      query = query.or(
        `assigned_police_id.eq.${req.user.id},and(assigned_police_id.is.null,status.in.(open,pending))`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    const sanitized = (data || []).map((caseItem) =>
      req.user.userType === 'police' ? sanitizeProtectedCaseForPolice(caseItem) : caseItem
    );

    res.json({ cases: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FIR + progress update (Admin/Police)
router.put('/:id/fir', authenticateToken, requireRoles('admin', 'police'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firNumber, progressPercent, progressNotes, status } = req.body;

    const { data: caseData, error: findError } = await getCaseById(id);
    if (findError) throw findError;
    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    if (
      req.user.userType === 'police' &&
      caseData.assigned_police_id &&
      caseData.assigned_police_id !== req.user.id
    ) {
      return res.status(403).json({ error: 'Case assigned to another police officer' });
    }

    const nextProgress = typeof progressPercent === 'number'
      ? clamp(progressPercent, 0, 100)
      : clamp(caseData.progress_percent || 0, 0, 100);

    const nextStatus = status || (nextProgress >= 100 ? 'resolved' : 'pending');

    const payload = {
      assigned_police_id:
        req.user.userType === 'police'
          ? caseData.assigned_police_id || req.user.id
          : caseData.assigned_police_id,
      fir_number: firNumber || caseData.fir_number || null,
      fir_registered_at: firNumber ? new Date().toISOString() : caseData.fir_registered_at,
      progress_percent: nextProgress,
      progress_notes: progressNotes || caseData.progress_notes || null,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('cases')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logCaseActivity(
      id,
      req.user.id,
      'fir_progress_updated',
      `FIR/Progress updated${firNumber ? ` (FIR: ${firNumber})` : ''}; progress ${nextProgress}%`
    );

    const responseCase = req.user.userType === 'police' ? sanitizeProtectedCaseForPolice(data) : data;
    res.json({ message: 'FIR/progress updated', case: responseCase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new case (Police/Admin authenticated flow)
router.post('/', authenticateToken, requireRoles('admin', 'police'), async (req, res) => {
  try {
    const {
      title,
      description,
      caseType,
      status = 'open',
      assignedLawyerId = null,
      assignedPoliceId = null,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const caseNumber = buildCaseNumber();
    const trackingId = buildTrackingId();

    const { data, error } = await supabase
      .from('cases')
      .insert({
        case_number: caseNumber,
        tracking_id: trackingId,
        title,
        description: description || null,
        case_type: caseType || null,
        status,
        created_by: req.user.id,
        assigned_lawyer_id: assignedLawyerId,
        assigned_police_id: assignedPoliceId || (req.user.userType === 'police' ? req.user.id : null),
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    await logCaseActivity(data.id, req.user.id, 'case_created', `Case ${caseNumber} created`);

    res.status(201).json({
      message: 'Case created successfully',
      case: data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cases for current user
router.get('/', authenticateToken, requireRoles('admin', 'police', 'lawyer'), async (req, res) => {
  try {
    const { status, caseType, search } = req.query;
    let query = supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (req.user.userType === 'police') {
      query = query.or(`assigned_police_id.eq.${req.user.id},created_by.eq.${req.user.id}`);
    } else if (req.user.userType === 'lawyer') {
      query = query.eq('assigned_lawyer_id', req.user.id);
    }

    if (status) query = query.eq('status', status);
    if (caseType) query = query.eq('case_type', caseType);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ cases: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one case with access control
router.get('/:id', authenticateToken, requireRoles('admin', 'police', 'lawyer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { data: caseData, error } = await getCaseById(id);

    if (error) throw error;
    if (!caseData) return res.status(404).json({ error: 'Case not found' });
    if (!canAccessCase(caseData, req.user)) return res.status(403).json({ error: 'Unauthorized' });

    const responseCase = req.user.userType === 'police' ? sanitizeProtectedCaseForPolice(caseData) : caseData;
    res.json({ case: responseCase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign case members (Admin only)
router.put('/:id/assign', authenticateToken, requireRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedLawyerId = null, assignedPoliceId = null } = req.body;

    const { data: existingCase, error: findError } = await getCaseById(id);
    if (findError) throw findError;
    if (!existingCase) return res.status(404).json({ error: 'Case not found' });

    const { data, error } = await supabase
      .from('cases')
      .update({
        assigned_lawyer_id: assignedLawyerId,
        assigned_police_id: assignedPoliceId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logCaseActivity(id, req.user.id, 'case_assigned', 'Case assignment updated');

    res.json({ message: 'Case assignment updated', case: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update case status (Admin/Assigned Police/Assigned Lawyer)
router.put('/:id/status', authenticateToken, requireRoles('admin', 'police', 'lawyer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progressPercent, progressNotes } = req.body;

    const allowedStatuses = ['open', 'closed', 'pending', 'resolved'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: caseData, error: findError } = await getCaseById(id);
    if (findError) throw findError;
    if (!caseData) return res.status(404).json({ error: 'Case not found' });
    if (!canAccessCase(caseData, req.user)) return res.status(403).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('cases')
      .update({
        status,
        progress_percent: typeof progressPercent === 'number' ? clamp(progressPercent, 0, 100) : caseData.progress_percent,
        progress_notes: progressNotes || caseData.progress_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logCaseActivity(id, req.user.id, 'status_updated', `Case status changed to ${status}`);

    res.json({ message: 'Case status updated', case: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add case document metadata (Admin/Assigned Police/Assigned Lawyer)
router.post('/:id/documents', authenticateToken, requireRoles('admin', 'police', 'lawyer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, fileUrl, documentType } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    const { data: caseData, error: findError } = await getCaseById(id);
    if (findError) throw findError;
    if (!caseData) return res.status(404).json({ error: 'Case not found' });
    if (!canAccessCase(caseData, req.user)) return res.status(403).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('case_documents')
      .insert({
        case_id: id,
        file_name: fileName,
        file_url: fileUrl || null,
        document_type: documentType || 'general',
        uploaded_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    await logCaseActivity(id, req.user.id, 'document_uploaded', `Document uploaded: ${fileName}`);

    res.status(201).json({ message: 'Document added', document: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get case documents
router.get('/:id/documents', authenticateToken, requireRoles('admin', 'police', 'lawyer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { data: caseData, error: findError } = await getCaseById(id);
    if (findError) throw findError;
    if (!caseData) return res.status(404).json({ error: 'Case not found' });
    if (!canAccessCase(caseData, req.user)) return res.status(403).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('case_documents')
      .select('*')
      .eq('case_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ documents: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get case activities
router.get('/:id/activities', authenticateToken, requireRoles('admin', 'police', 'lawyer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { data: caseData, error: findError } = await getCaseById(id);
    if (findError) throw findError;
    if (!caseData) return res.status(404).json({ error: 'Case not found' });
    if (!canAccessCase(caseData, req.user)) return res.status(403).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('case_activities')
      .select('*')
      .eq('case_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ activities: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
