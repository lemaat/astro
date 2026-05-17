export const STORY_PROMPTS = {
  easy: [
    { id: 'e1', icon: '🐲🌸', text: { 
        fr: "Un petit dragon qui veut faire pousser des fleurs au lieu de cracher du feu — que fait-il ?",
        ar: "تنين صغير يريد زراعة الزهور بدلاً من نفث النار - ماذا يفعل؟" 
    }, limit: 45 },
    { id: 'e2', icon: '🚀🐙', text: { 
        fr: "Un astronaute rencontre une pieuvre spatiale amicale. Que se passe-t-il ?",
        ar: "رائد فضاء يلتقي بأخطبوط فضائي ودود. ماذا يحدث؟" 
    }, limit: 45 },
    { id: 'e3', icon: '🦄☁️', text: { 
        fr: "Une licorne découvre que les nuages sont faits de barbe à papa...",
        ar: "وحيد قرن يكتشف أن الغيوم مصنوعة من غزل البنات..." 
    }, limit: 45 },
  ],
  medium: [
    { id: 'm1', icon: '🏰👻', text: { 
        fr: "Un ancien château sur Mars cache un secret. Une nuit, un enfant astronaute entend un bruit...",
        ar: "قلعة قديمة على المريخ تخفي سراً. في إحدى الليالي، يسمع رائد فضاء صغير صوتاً..." 
    }, limit: 60 },
    { id: 'm2', icon: '🌟🤖', text: { 
        fr: "Un robot d'une galaxie lointaine atterrit dans un petit village. Personne n'a jamais vu de robot...",
        ar: "روبوت من مجرة بعيدة يهبط في قرية صغيرة. لم يسبق لأحد أن رأى روبوتاً..." 
    }, limit: 60 },
  ],
  hard: [
    { id: 'h1', icon: '🪐⚔️', text: { 
        fr: "Deux civilisations sur des planètes voisines sont rivales depuis des siècles. Un jeune diplomate est envoyé en mission...",
        ar: "حضارتان على كوكبين متجاورين تتنافسان منذ قرون. يتم إرسال دبلوماسي شاب في مهمة..." 
    }, limit: 90 },
    { id: 'h2', icon: '📜🔮', text: { 
        fr: "Dans une vieille bibliothèque, un enfant trouve un livre qui s'écrit tout seul — mais seulement quand personne ne regarde...",
        ar: "في مكتبة قديمة، يجد طفل كتاباً يكتب نفسه بنفسه - ولكن فقط عندما لا ينظر إليه أحد..." 
    }, limit: 90 },
  ]
};

export const UI_STRINGS = {
  fr: {
    title: "Le Monde des Histoires",
    pickPrompt: "Choisis une histoire à raconter !",
    startRecording: "Appuie pour raconter",
    stopRecording: "J'ai fini !",
    processing: "J'écoute ton incroyable histoire...",
    resultTitle: "Quelle aventure !",
    backToHub: "Retour à la planète",
    tryAgain: "Recommencer",
    error: "Oups ! Je n'ai pas bien entendu, mais ton histoire était sûrement géniale !"
  },
  ar: {
    title: "عالم القصص",
    pickPrompt: "اختر قصة لترويها!",
    startRecording: "اضغط لتبدأ الحكاية",
    stopRecording: "انتهيت!",
    processing: "أنا أستمع لقصتك الرائعة...",
    resultTitle: "يا لها من مغامرة!",
    backToHub: "العودة إلى الكوكب",
    tryAgain: "حاول مرة أخرى",
    error: "عذراً! لم أسمعك جيداً، لكنني متأكد أن قصتك كانت رائعة!"
  }
};