import { addHomework, addCourse, getAllCourses, getAllHomework } from './db.js';
import { processAIChat } from './aiHandler.js';
import { format } from 'date-fns';

/**
 * Handle quick capture from iOS Shortcut, Share Sheet, or Siri
 * @param {Object} input - { text, image, file, mimeType, provider, model, apiKey }
 */
export async function handleQuickCapture(input = {}) {
  const {
    text = '',
    image = null,
    provider = 'gemini',
    model = null,
    apiKey = null
  } = input;

  if (!text && !image) {
    throw new Error('Quick capture requires either text or an image payload.');
  }

  // If image is provided, use multimodal AI to analyze and extract
  if (image) {
    const prompt = `Extract all class schedules, lectures, assignments, or homework tasks from this image. Add them directly into the calendar using the available tools. Summary what you added. Today is ${format(new Date(), 'yyyy-MM-dd')}.`;

    const messages = [
      {
        role: 'user',
        content: text ? `${text}\n\n${prompt}` : prompt,
        images: [image]
      }
    ];

    try {
      const aiResponse = await processAIChat({
        messages,
        provider,
        model,
        apiKey
      });

      return {
        success: true,
        method: 'multimodal_ai',
        message: aiResponse.reply || 'Schedule details extracted and saved to calendar.',
        courses: getAllCourses(),
        homework: getAllHomework()
      };
    } catch (aiErr) {
      console.error('[QuickCapture AI Error]', aiErr.message);
      throw new Error(`AI processing failed: ${aiErr.message}`);
    }
  }

  // If text is provided:
  // First attempt smart heuristic regex for fast instant response (e.g. "Math 101 HW 3 due Friday at 5pm")
  const heuristicResult = tryHeuristicParse(text);
  if (heuristicResult) {
    const item = heuristicResult.type === 'homework' 
      ? addHomework(heuristicResult.data) 
      : addCourse(heuristicResult.data);
    return {
      success: true,
      method: 'heuristic_fast_path',
      parsedType: heuristicResult.type,
      item,
      message: `Quick-captured ${heuristicResult.type}: "${heuristicResult.data.title || heuristicResult.data.name}"`
    };
  }

  // Otherwise, use AI for natural language parsing
  try {
    const prompt = `Extract any homework, assignment, or class from the following text and add it to the user's schedule using the tools. Text: "${text}". Today is ${format(new Date(), 'yyyy-MM-dd')}.`;
    const aiResponse = await processAIChat({
      messages: [{ role: 'user', content: prompt }],
      provider,
      model,
      apiKey
    });

    return {
      success: true,
      method: 'text_ai',
      message: aiResponse.reply || 'Item added to schedule.',
      courses: getAllCourses(),
      homework: getAllHomework()
    };
  } catch (err) {
    // If AI fails (e.g. no API key configured), fallback to creating a generic homework task
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const fallbackHw = addHomework({
      title: text.slice(0, 80),
      description: text,
      dueDate: todayStr,
      dueTime: '23:59',
      priority: 'medium'
    });

    return {
      success: true,
      method: 'fallback_quick_task',
      parsedType: 'homework',
      item: fallbackHw,
      message: `Created quick task: "${fallbackHw.title}"`
    };
  }
}

/**
 * Fast regex heuristic parser for common student quick captures
 */
function tryHeuristicParse(text) {
  const trimmed = text.trim();
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');

  // Pattern: [Course] [Title] due [Day/Date] [Time]
  // e.g. "CS 101 Project 2 due tomorrow at 11:59pm"
  const dueMatch = trimmed.match(/(?:due\s+(?:on\s+)?|by\s+)(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2})/i);
  
  if (dueMatch || trimmed.toLowerCase().includes('hw') || trimmed.toLowerCase().includes('homework') || trimmed.toLowerCase().includes('project')) {
    let title = trimmed;
    let dueDate = todayStr;
    let dueTime = '23:59';

    if (dueMatch) {
      const dueWord = dueMatch[1].toLowerCase();
      if (dueWord === 'tomorrow') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDate = format(tomorrow, 'yyyy-MM-dd');
      } else if (dueWord.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dueDate = dueWord;
      }
      title = trimmed.slice(0, dueMatch.index).trim() || trimmed;
    }

    // Try extract time like "5pm", "11:59pm", "17:00"
    const timeMatch = trimmed.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch && timeMatch[3]) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const isPm = timeMatch[3].toLowerCase() === 'pm';
      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;
      dueTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    return {
      type: 'homework',
      data: {
        title: title || 'New Task',
        description: `Captured via iOS Shortcut / Share Sheet: "${trimmed}"`,
        dueDate,
        dueTime,
        priority: 'medium'
      }
    };
  }

  return null;
}
