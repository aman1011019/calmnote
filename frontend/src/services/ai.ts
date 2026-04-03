const sadResponses = [
  "I hear you. It's okay to feel this way. Would you like to tell me more about what happened?",
  "That sounds really tough. Remember, it's brave to acknowledge your feelings.",
  "I'm here for you. Sometimes just talking about it can help lighten the load.",
  "Your feelings are valid. Take your time — there's no rush.",
  "It's okay to not be okay. I'm listening, whenever you're ready.",
  "Some days are harder than others, and that's completely normal. What's weighing on you?",
  "You don't have to face this alone. I'm right here with you.",
  "Let it out. Sometimes the heart needs to speak before the mind can think.",
];

const happyResponses = [
  "That's wonderful to hear! 🌟 What's making your day great?",
  "I love seeing you happy! Keep riding that wave of joy! 🎉",
  "Your happiness is contagious! Tell me something that made you smile today.",
  "What a beautiful mood! Cherish these moments — you deserve them.",
  "It's great to see you in good spirits! What's something you're grateful for today?",
  "You're glowing! Keep spreading that positive energy! ✨",
];

const neutralResponses = [
  "How's your day going so far? I'd love to hear about it.",
  "Sometimes a calm day is a good day. What are you up to?",
  "Hey there! Anything on your mind today?",
  "Take a moment to appreciate the peace of an ordinary day.",
  "Even quiet moments have their beauty. What's something small that made you smile?",
];

const angryResponses = [
  "I can sense you're feeling frustrated. Want to talk about what's bothering you?",
  "Anger is a powerful emotion. Let's channel it — what triggered this feeling?",
  "It's okay to feel angry. Take a deep breath with me... in... out...",
  "Your feelings matter. Sometimes acknowledging anger is the first step to peace.",
];

const tiredResponses = [
  "Rest is important. Have you been taking care of yourself?",
  "It's okay to slow down. You don't always have to be productive.",
  "Your body is telling you something. Maybe it's time for a little break?",
  "Even the strongest people need rest. Be gentle with yourself today.",
];

const lovedResponses = [
  "Love is such a beautiful feeling! Who or what is filling your heart today? 💕",
  "That warm feeling is precious. Hold onto it!",
  "You deserve all the love in the world! 🥰",
  "Being loved and loving others — that's what life is all about!",
];

const followUps: Record<string, string[]> = {
  sad: [
    "Would you like to try a quick breathing exercise? It might help you feel better.",
    "Remember: tough times don't last, but tough people do. You're stronger than you think.",
    "Have you tried writing about your feelings? Your diary is a safe space.",
    "One day at a time. You're doing better than you think.",
  ],
  happy: [
    "Maybe you could write about this moment in your diary to remember it! 📝",
    "Spread the joy — is there someone you'd like to share your happiness with?",
    "What's one thing you could do to make tomorrow even better?",
  ],
  neutral: [
    "Would you like some ideas to brighten your day?",
    "Sometimes a small act of kindness — even to yourself — can shift the mood.",
    "How about setting a tiny goal for today? Something just for you.",
  ],
  angry: [
    "Try this: close your eyes, take 5 deep breaths, and imagine a peaceful place.",
    "Sometimes writing about what upset you can help process those feelings.",
    "Remember, it's okay to walk away from what drains you.",
  ],
  tired: [
    "Have you had enough water today? Hydration helps more than you'd think!",
    "A short 10-minute walk might help recharge you.",
    "Give yourself permission to rest without guilt.",
  ],
  loved: [
    "Tell someone you love them today — it'll make both of you feel amazing!",
    "Capture this feeling in your diary so you can revisit it anytime.",
    "Love multiplies when shared. 💛",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const responseMap: Record<string, string[]> = {
  sad: sadResponses,
  happy: happyResponses,
  neutral: neutralResponses,
  angry: angryResponses,
  tired: tiredResponses,
  loved: lovedResponses,
};

export function getAIGreeting(mood: string): string {
  if (mood === 'sad') return "Hey… how was your day? I'm here if you want to talk. 💙";
  if (mood === 'angry') return "I can see you're feeling intense right now. Let's talk it through.";
  if (mood === 'tired') return "You look like you could use some rest. How are you holding up?";
  return pick(responseMap[mood] || neutralResponses);
}

export function getAIResponse(userMessage: string, mood: string, messageCount: number): string {
  const lower = userMessage.toLowerCase();

  // Keyword detection
  if (lower.includes('sad') || lower.includes('cry') || lower.includes('depressed') || lower.includes('alone'))
    return pick(sadResponses);
  if (lower.includes('happy') || lower.includes('great') || lower.includes('amazing') || lower.includes('wonderful'))
    return pick(happyResponses);
  if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated') || lower.includes('annoyed'))
    return pick(angryResponses);
  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleepy'))
    return pick(tiredResponses);
  if (lower.includes('love') || lower.includes('loved') || lower.includes('grateful'))
    return pick(lovedResponses);

  // Follow up based on message count and mood
  if (messageCount > 2 && messageCount % 3 === 0) {
    return pick(followUps[mood] || followUps.neutral);
  }

  return pick(responseMap[mood] || neutralResponses);
}

export function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}
