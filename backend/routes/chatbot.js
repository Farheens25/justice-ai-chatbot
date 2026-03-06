import express from 'express';
import axios from 'axios';

const router = express.Router();

const LEGAL_CATEGORIES = ['Cyber Fraud', 'Harassment', 'Domestic Violence', 'Theft', 'General Complaint'];

const detectCategory = (text = '') => {
  const input = text.toLowerCase().trim();

  const cyberKeywords = ['scam', 'fraud', 'online', 'phishing', 'malware', 'cyber', 'hacking', 'bitcoin', 'cryptocurrency'];
  if (cyberKeywords.some((k) => input.includes(k))) return 'Cyber Fraud';

  const harassmentKeywords = ['harassment', 'abusive', 'threatening', 'stalking', 'bullying', 'threatening messages', 'unwanted contact'];
  if (harassmentKeywords.some((k) => input.includes(k))) return 'Harassment';

  const dvKeywords = ['domestic', 'violence', 'abuse', 'beating', 'spouse', 'family', 'home abuse'];
  if (dvKeywords.some((k) => input.includes(k))) return 'Domestic Violence';

  const theftKeywords = ['theft', 'stolen', 'robbery', 'burglary', 'stealing', 'missing', 'robbed', 'stole', 'thief'];
  if (theftKeywords.some((k) => input.includes(k))) return 'Theft';

  return 'General Complaint';
};

const legalGuidanceByCategory = {
  'Cyber Fraud': {
    section: 'IT Act 66C, IPC 420',
    advice: 'File complaint at nearest Cyber Cell immediately. Preserve screenshots, chats, links, and transaction records.',
    escalation: 'If FIR is not registered within 7 days, escalate to SP.',
    helpline: '1930 (Cyber Crime Helpline)',
  },
  Harassment: {
    section: 'IPC 354, 354A, 354D',
    advice: 'File FIR at nearest police station and keep date-wise incident records.',
    escalation: "If ignored, escalate to senior officers or Women's Commission.",
    helpline: '1091 (Women Helpline)',
  },
  'Domestic Violence': {
    section: 'Protection of Women from Domestic Violence Act, IPC 498A',
    advice: 'Contact Women Helpline and file petition under DV Act. Keep medical and incident evidence.',
    escalation: 'Approach Magistrate if no action is taken.',
    helpline: '1091 (Women Helpline)',
  },
  Theft: {
    section: 'IPC 378, 379',
    advice: 'File theft complaint immediately with item details, value, and available evidence.',
    escalation: 'Escalate to SP if FIR is delayed.',
    helpline: '100 (Police Emergency)',
  },
  'General Complaint': {
    section: 'To be determined',
    advice: 'Consult nearest police station or legal advisor for exact legal classification.',
    escalation: 'Seek legal advice if no response within 30 days.',
    helpline: '100 (Police Emergency)',
  },
};

const mockChatReply = (text = '') => {
  const input = text.toLowerCase();

  const asksWebsiteComplaintSteps =
    (input.includes('justice ai') || input.includes('your website') || input.includes('through website') || input.includes('website')) &&
    (input.includes('step') || input.includes('how') || input.includes('complaint') || input.includes('file'));

  if (asksWebsiteComplaintSteps) {
    return `Steps to file a complaint through Justice AI website:

1. Open the Justice AI home page and click "File Complaint".
2. Select the correct case category (Cyber Crime, Harassment, Theft, etc.).
3. Fill personal details (name, phone, email).
4. Fill incident details (date, time, place, accused info if known).
5. Enter full incident description in chronological order.
6. Add witness details and extra supporting context.
7. Upload available evidence (minimum one proof image/document where required).
8. Add pincode to auto-map nearest police station.
9. If needed, enable Protected Case mode to hide your identity from police view.
10. Submit complaint and save your generated Tracking ID (and Protected ID if shown).
11. Use "Track Case" on homepage to monitor FIR number and progress updates.
12. If action is delayed, use escalation draft and contact helplines (1930/100/1091 as applicable).

Required documents/evidence:
- Screenshots, chats, emails, call logs, transaction proof
- ID proof and contact details
- Dates, timeline, and witness contacts
- Any prior complaint reference number (if already reported).`;
  }

  if (['how are you', "how're you", 'how you doing'].some((p) => input.includes(p))) {
    return "I'm doing well. I can help with legal guidance under Indian law.";
  }
  if (['what is your name', 'who are you', 'introduce yourself'].some((p) => input.includes(p))) {
    return "I'm Justice AI chatbot. I provide legal guidance for complaints and rights under Indian law.";
  }
  if (['hello', 'hi', 'hey', 'good morning', 'good evening'].some((p) => input.includes(p))) {
    return 'Hello. Share your legal issue and I will provide guidance and next steps.';
  }
  if (['file case', 'file complaint', 'file fir', 'how to file'].some((p) => input.includes(p))) {
    return 'Use the File Case form, submit full details and evidence, then track with your Tracking ID. For urgent crimes, file FIR at nearest police station immediately.';
  }
  if (['rights', 'legal rights', 'citizen rights'].some((p) => input.includes(p))) {
    return 'You can file FIR, seek legal aid, and request case status updates. For refusal or delay, escalate to senior officers or magistrate.';
  }
  if (['domestic', 'violence', 'abuse'].some((p) => input.includes(p))) {
    return 'Domestic violence is serious. Contact 1091 or 181, file FIR, and seek protection order through Magistrate.';
  }
  if (['fraud', 'scam', 'cyber'].some((p) => input.includes(p))) {
    return 'For cyber fraud, report at nearest cyber cell and on cybercrime.gov.in, and call 1930 immediately.';
  }

  return 'I can help with complaint guidance, FIR steps, escalation paths, and case tracking advice. Share your issue details.';
};

const tryGroqChat = async (messages) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) return null;

  const sanitized = Array.isArray(messages)
    ? messages
        .filter((m) => typeof m?.content === 'string' && (m.role === 'system' || m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  const systemPrompt = {
    role: 'system',
    content:
      'You are Justice AI, an Indian legal guidance assistant. Give structured, practical steps. When user asks for website complaint flow, provide detailed numbered steps and required documents. Always mention this is informational and not a substitute for a lawyer.',
  };

  const finalMessages = sanitized.some((m) => m.role === 'system')
    ? sanitized
    : [systemPrompt, ...sanitized];

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: finalMessages,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content?.trim();
    return reply || null;
  } catch {
    return null;
  }
};

router.get('/categories', (req, res) => {
  res.json({ success: true, categories: LEGAL_CATEGORIES });
});

router.post('/process', (req, res) => {
  try {
    const complaint = (req.body?.complaint || '').trim();
    if (!complaint) {
      return res.status(400).json({ success: false, error: 'Please describe your issue clearly.' });
    }

    const category = detectCategory(complaint);
    const response = legalGuidanceByCategory[category] || legalGuidanceByCategory['General Complaint'];

    return res.json({
      success: true,
      category,
      response,
      disclaimer: 'This guidance is informational and not a substitute for a qualified lawyer.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const lastUserMessage = [...messages].reverse().find((m) => m?.role === 'user')?.content || '';
    if (!lastUserMessage.trim()) {
      return res.status(400).json({ success: false, error: 'No user message provided.' });
    }

    const groqReply = await tryGroqChat(messages);
    const baseReply = groqReply || mockChatReply(lastUserMessage);
    const reply = `${baseReply}\n\nNote: This is informational legal guidance, not legal representation.`;
    return res.json({ success: true, reply });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
