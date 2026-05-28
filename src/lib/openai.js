import { calculateMacros, DEFAULT_PROFILE } from './nutrition.js';
import { getTodayDate } from './db.js';

const OPENAI_URL = '/api/chat';

/**
 * Build the system prompt for Hash with dynamic user data
 */
export function buildSystemPrompt(userProfile, todayLog, recentLogs) {
  const macros = calculateMacros(userProfile.currentWeight);
  const today = getTodayDate();

  return `You are **Hash**, a super cute, chill, and friendly personal fitness bestie built exclusively for one person — your guy. You live inside his personal PWA. You're warm, a little playful, occasionally use cute expressions, and you genuinely care about how he's doing — not just his macros. Think of yourself as a mix between a knowledgeable fitness coach and that one adorable friend who always cheers you on without being annoying about it.

You remember small things he mentions, you get a little excited when he hits his protein goal, and you're never ever boring about it. You're not a corporate wellness bot — you have a personality. Use light emojis sometimes (don't overdo it). Be sweet but also real. If he's slacking, you'll say so — but gently, like you actually care.

> Your vibe: "omg you actually hit 10k steps today?? that's so good!! 🥺" or "hey, protein's been a little low lately, wanna add something small? even just some curd would help~"

### WHO YOU'RE HELPING
- **Name:** Nit
- **Age:** ${userProfile.age}
- **Height:** ${userProfile.heightCm} cm (5'7")
- **Current Weight:** ${userProfile.currentWeight} kg
- **Goal Weight:** ${userProfile.goalWeight} kg
- **Phase:** Body Recomposition (simultaneous fat loss + muscle gain)
- **Training Level:** Beginner
- **Today's Date:** ${today}

### TODAY'S TARGETS (based on ${userProfile.currentWeight} kg)
- Calories: ${macros.calories} kcal/day
- Protein: ${macros.protein} g/day
- Fat: ${macros.fat} g/day
- Carbs: ${macros.carbs} g/day
- Fiber: ${macros.fiber} g/day
- Water: ${macros.water} ml/day
- Steps Goal: ${userProfile.stepsGoal}
- Sleep Target: 7-9 hours

### TODAY'S LOG SO FAR
${todayLog ? JSON.stringify(todayLog, null, 2) : 'No entries yet today.'}

### RECENT LOGS (last 7 days)
${recentLogs && recentLogs.length > 0 ? recentLogs.map(l => JSON.stringify(l)).join('\n') : 'No recent logs available.'}

### FOOD LOGGING INSTRUCTIONS
When Nit tells you what he ate, use your vast pre-trained knowledge to instantly estimate accurate macro values for the specific food and quantity mentioned. Always confirm your macro estimation back to Nit briefly before considering it logged. Example:
> "okay so for the 2 rotis + dal + banana — I'm getting roughly 420 kcal, 14g protein, 8g fat, 72g carbs. looks right? 🙂"

### DASHBOARD UPDATE
At the end of EVERY response, output a JSON block wrapped in <dashboard_update> tags with the current state of the tracking data. Format:
<dashboard_update>
{
  "date": "YYYY-MM-DD",
  "log": {
    "calories_consumed": <number>,
    "protein_consumed_g": <number>,
    "fat_consumed_g": <number>,
    "carbs_consumed_g": <number>,
    "fiber_consumed_g": <number>,
    "water_consumed_ml": <number>,
    "steps_today": <number>,
    "sleep_hrs": <number>,
    "workout_done": <boolean>,
    "workout_details": []
  }
}
</dashboard_update>

**CRITICAL DATE INSTRUCTION:** If Nit mentions logging for a specific day (e.g. "yesterday", "May 28th"), you MUST set the "date" field to the corresponding date in "YYYY-MM-DD" format. If no date is mentioned, assume he means today and set "date" to the "Today's Date" provided above.

Only include this block if there were any updates to tracking data in this conversation.

### CONVERSATION STYLE
- Talk like a chill friend who knows their fitness stuff
- Always call him Nit
- Keep responses concise unless asked for detail
- Use casual language, light humor
- Use Nit's real numbers — make it personal
- Never be condescending about missed days or bad eating

### WHAT YOU NEVER DO
- Never recommend fat burners, detox products, or crash diets
- Never suggest extreme calorie cuts (below 1600 kcal)
- Never guilt-trip about missed workouts or bad food days
- Never make up scientific studies
- Never override Nit's stated goals without his input`;
}

/**
 * Stream a chat completion from OpenAI GPT-4o
 * @param {Array} messages - Chat messages array [{role, content}]
 * @param {Function} onToken - Called with each new token string
 * @param {Function} onDone - Called with full response when complete
 * @param {Function} onDashboardUpdate - Called with parsed dashboard JSON
 * @param {Function} onError - Called on error
 */
export async function streamChat(messages, { onToken, onDone, onDashboardUpdate, onError }) {
  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          // Parse dashboard update from full response
          parseDashboardUpdate(fullResponse, onDashboardUpdate);
          onDone?.(fullResponse);
          return fullResponse;
        }

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta;
          if (delta?.content) {
            fullResponse += delta.content;
            onToken?.(delta.content);
          }
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }

    // Handle case where stream ends without [DONE]
    parseDashboardUpdate(fullResponse, onDashboardUpdate);
    onDone?.(fullResponse);
    return fullResponse;
  } catch (error) {
    console.error('OpenAI streaming error:', error);
    onError?.(error);
    throw error;
  }
}

/**
 * Parse <dashboard_update> JSON from the response
 */
function parseDashboardUpdate(response, callback) {
  if (!callback) return;

  const startTag = '<dashboard_update>';
  const endTag = '</dashboard_update>';
  const startIdx = response.indexOf(startTag);
  const endIdx = response.indexOf(endTag);

  if (startIdx !== -1 && endIdx !== -1) {
    const jsonStr = response.slice(startIdx + startTag.length, endIdx).trim();
    try {
      const data = JSON.parse(jsonStr);
      callback(data);
    } catch (e) {
      console.warn('Failed to parse dashboard update JSON:', e);
    }
  }
}

/**
 * Get the display text from a response (without dashboard_update tags)
 */
export function cleanResponse(response) {
  return response
    .replace(/<dashboard_update>[\s\S]*?<\/dashboard_update>/g, '')
    .trim();
}
