import { SpokenDialect, getDialectById, detectDialectFromPhrase } from './dialectDefinitions';
import { searchLegalMusic, MusicSearchResult } from '../services/musicProvider';

export type ConversationalIntent =
  | 'CASUAL_GREETING'
  | 'CASUAL_HOW_ARE_YOU'
  | 'CASUAL_I_AM_FINE'
  | 'CASUAL_YOU_TELL'
  | 'CASUAL_WHAT_DOING'
  | 'CASUAL_FEELING_DOWN'
  | 'CASUAL_JOKE'
  | 'CASUAL_THANKS'
  | 'CASUAL_CHAT'
  | 'MUSIC'
  | 'DIALECT_CHANGE'
  | 'APP_NAVIGATION'
  | 'FIELD_ANALYSIS'
  | 'WEATHER'
  | 'MANDI'
  | 'CROP_HEALTH'
  | 'FARMING_QUESTION'
  | 'GENERAL_GK'
  | 'GENERAL_QUESTION';

export type AppActionType =
  | 'OPEN_FIELD_ANALYSIS'
  | 'OPEN_WEATHER'
  | 'OPEN_MANDI'
  | 'OPEN_LEAF_DOCTOR'
  | 'OPEN_UNITS'
  | 'NAVIGATE_DASHBOARD';

export interface AppActionPayload {
  type: AppActionType;
  label: string;
  autoExecute?: boolean;
}

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
  intent?: ConversationalIntent;
}

export interface CompanionReply {
  reply: string;
  audioText: string;
  intent: ConversationalIntent;
  appAction?: AppActionPayload;
  suggestedQuestions: string[];
  actionableTip?: string;
  musicData?: MusicSearchResult;
  targetDialectId?: string;
}

// Multi-joke collection per dialect for fresh, humorous interactions
export const DIALECT_JOKES: Record<string, string[]> = {
  haryanvi: [
    'ले भाई एक जोक सुण 😄 एक बार एक ताऊ डॉक्टर धोरै गया अर बोल्या: डॉक्टर साब म्हारे सिर में घणा तेज दर्द सै। डॉक्टर बोल्या: गोली ले लो। ताऊ बोल्या: बंदूक तो घरै भूल आया!',
    'ताऊ बस स्टैंड पै खड़ा था। छोरा बोल्या: ताऊ, टाइम के होया सै? ताऊ बोल्या: टाइम खराब होया पड़ा सै, घड़ी घरै भूल आया अर तू म्हारै तै पूछण लाग रया सै! 😂',
    'मास्टर जी बोल्या: ताऊ के छोरे, बता अकबर ने कब तक राज करया? छोरा बोल्या: मास्टर जी, जब तक किताब के पन्ने नहीं फटे!',
    'ताऊ बैंक में गया अर मैनेजर तै बोल्या: म्हारे खाते में कितने रुपये सैं? मैनेजर बोल्या: ताऊ शून्य! ताऊ बोल्या: वा रे बैंक! पहले तो एक-एक पाई जोड़ते थे, अब सीधे शून्य कर दिया!',
  ],
  himachali: [
    'सुणा फिर एक पहाड़ी चुटकुला भाईजी 😄 एक बार एक ताऊ बस च चढ़्या ते कंडक्टर बोल्या: टिकट शिमला दा या कांगड़े दा? ताऊ बोल्या: जिथु तक तेरे दस रुपये जांदे, उत्थु तक दा कट्टी दे!',
    'एक बार कांगड़े दा गबरू सेब दे बागीचे च गया ते बोल्या: भाईजी, सेब मीठे न? माली बोल्या: सेब खा के देख, गुड़ भूल जावेगा! गबरू बोल्या: फिर सेब रहने दे, दो किलो गुड़ ही दे दे! 😂',
    'मास्टर जी: ओ चिंटू, बता बादल कित्थु आंदे न? चिंटू: मास्टर जी, जहां बारिश हुंदी उत्थु ही आंदे न, नहीं तां कित्थे जांदे!',
  ],
  punjabi_malwa: [
    'ਲਓ ਵੀਰ ਜੀ ਇੱਕ ਹਾਸੇ ਵਾਲੀ ਗੱਲ ਸੁਣੋ 😄 ਇੱਕ ਵਾਰ ਸੰਤਾ ਬੱਸ ਵਿੱਚ ਚੜ੍ਹਿਆ ਤੇ ਕੰਡਕਟਰ ਨੂੰ ਕਹਿੰਦਾ: ਜਲੰਧਰ ਦਾ ਟਿਕਟ ਦੇ ਦਿਓ। ਕੰਡਕਟਰ ਬੋਲਿਆ: ਇਹ ਤਾਂ ਲੁਧਿਆਣੇ ਦੀ ਬੱਸ ਐ! ਸੰਤਾ ਬੋਲਿਆ: ਕੋਈ ਨਾ, ਮੈਂ ਡਰਾਈਵਰ ਦੇ ਪਿੱਛੇ ਬੈਠ ਜਾਊਂਗਾ!',
    'ਸੰਤਾ ਆਪਣੇ ਦੋਸਤ ਨੂੰ ਕਹਿੰਦਾ: ਯਾਰ ਮੇਰੇ ਫੋਨ ਦੀ ਬੈਟਰੀ 2 ਦਿਨ ਚੱਲਦੀ ਐ। ਦੋਸਤ ਬੋਲਿਆ: ਕਿਵੇਂ? ਸੰਤਾ: ਮੈਂ ਇਹਨੂੰ ਚਲਾਉਂਦਾ ਹੀ ਨੀ! 😂',
    'ਅਧਿਆਪਕ: ਬੰਤੇ, ਦੱਸ ਤੂੰ ਕੱਲ੍ਹ ਸਕੂਲ ਕਿਉਂ ਨਹੀਂ ਆਇਆ ਸੀ? ਬੰਤਾ: ਸਰ, ਮੇਰੇ ਸੁਪਨੇ ਵਿੱਚ ਮੈਂ ਅਮਰੀਕਾ ਚਲਾ ਗਿਆ ਸੀ, ਫਲਾਈਟ ਲੇਟ ਹੋ ਗਈ!',
  ],
  punjabi_majha: [
    'ਲਓ ਭਾਊ ਇੱਕ ਸੁਆਦਲਾ ਚੁਟਕੁਲਾ ਸੁਣੋ 😄 ਅਮਲੀ ਡਾਕਟਰ ਕੋਲ ਗਿਆ ਤੇ ਬੋਲਿਆ: ਡਾਕਟਰ ਸਾਬ੍ਹ ਮੇਰੀ ਨਜ਼ਰ ਕਮਜ਼ੋਰ ਹੋ ਗਈ ਐ। ਡਾਕਟਰ ਬੋਲਿਆ: ਇਹ ਸਾਹਮਣੇ ਕੀ ਦਿਸਦਾ ਐ? ਅਮਲੀ ਕਹਿੰਦਾ: ਮੱਝ! ਡਾਕਟਰ ਬੋਲਿਆ: ਓਏ ਇਹ ਤਾਂ ਮੱਛਰ ਐ!',
    'ਭਾਊ ਇੱਕ ਵਾਰ ਇੱਕ ਬੰਦਾ ਟਰੈਕਟਰ ਲੈ ਕੇ ਹਸਪਤਾਲ ਪਹੁੰਚ ਗਿਆ। ਡਾਕਟਰ ਬੋਲਿਆ: ਇੱਥੇ ਟਰੈਕਟਰ ਕਿਉਂ ਲਿਆਂਦਾ? ਬੰਦਾ ਕਹਿੰਦਾ: ਡਾਕਟਰ ਸਾਬ੍ਹ, ਐਮਰਜੈਂਸੀ ਸੀ ਨਾ!',
  ],
  awadhi_dehati: [
    'लीजिए भैया एक मजेदार चुटकुला सुनिए 😄 एक बार एक पंडित जी नाव में बैठे और मल्लाह से पूछे: तोहे संस्कृत आवत बा? मल्लाह बोला: नाहीं महाराज। पंडित बोले: तोहार आधी जिंदगी बेकार हो गई। तभी नाव डूबने लगी, मल्लाह पूछा: तोहे तैराकी आवत बा? पंडित बोले: नाहीं! मल्लाह बोला: तो तोहार पूरी जिंदगी बेकार हो गई!',
    'एक बार कल्लू कक्का डॉक्टर के पास पहुंचे। डॉक्टर बोला: कक्का जी, रोज एक सेब खाया करो, बीमारी पास नहीं आएगी। कक्का बोले: डॉक्टर साहब, सेब तो महंगा है, आलू से काम नहीं चलेगा का? 😂',
  ],
  bhojpuri: [
    'लीं भैया एगो मजेदार जोक सुन लीं 😄 एक बेर एगो मास्टर जी पूछलें: बताओ दुनिया के सबसे पुरान जानवर कौन ह? चेला बोलल: जेब्रा! मास्टर पूछलन: कइसे? चेला बोलल: ऊ आजो ब्लैक एंड व्हाइट बा!',
    'एक बेर एक आदमी दूकानदार से पूछलस: भैया ई घड़ी पानी में चल जाई? दुकानदार बोलल: पानी में त चल जाई, बाकिर डूबल के बाद रउआ के चलावे के पड़ी! 😂',
  ],
  marathi_deshi: [
    'ऐका भाऊ एक मस्त विनोद 😄 एकदा बंड्या डॉक्टरकडे गेला आणि म्हणाला: डॉक्टर साहेब, मला रोज रात्री स्वप्नात उंदीर क्रिकेट खेळताना दिसतात! डॉक्टर म्हणाले: ही गोळी घे, आज रात्रीपासून स्वप्न पडणार नाही. बंड्या म्हणाला: उद्यापासून घेऊ का? आज त्यांची फायनल मॅच आहे!',
    'गुरुजी: बंड्या, सांग पृथ्वी सूर्याभोवती फिरते की सूर्य पृथ्वीभोवती? बंड्या: सर, ज्याला काम असेल तो फिरतो, आपल्याला काय देणेघेणे! 😂',
  ],
  marathi_varhadi: [
    'ऐका जी एक मस्त विनोद 😄 मास्तर पंट्याले विचारते: सांग भारताचा नकाशा कुनी बनवला? पंट्या म्हणते: मला काय माहित मास्तर, मी तर फक्त गिरवला!',
  ],
  gujarati_kathiyawadi: [
    'સાંભળો ભાઈ એક જોરદાર જોક 😄 એક ભાઈ ડોક્ટર પાસે ગયા અને બોલ્યા: સાહેબ મને ભૂલવાની ટેવ પડી ગઈ છે! ડોક્ટર બોલ્યા: ક્યારથી? પેલા ભાઈ બોલ્યા: શું ક્યારથી?!',
    'કાનજીભાઈએ પૂછ્યું: મગનભાઈ, તમારા ભેંસના દૂધમાં પાણી કેમ આવે છે? મગનભાઈ બોલ્યા: ભાઈ, ભેંસ નદીમાં નહાવા જાય છે ને, એટલે થોડું આવી જતું હશે! 😂',
  ],
  telangana_telugu: [
    'ఒక నవ్వుల జోక్ విను అన్నా 😄 టీచర్ అడిగింది: గాలిని మనం చూడగలమా? స్టూడెంట్: చూడలేము కానీ సైకిల్ టైర్ లో ఫీల్ అవ్వొచ్చు సర్!',
    'ఒకాయన డాక్టర్ దగ్గరికి వెళ్ళి: డాక్టర్ గారు, నాకు నిద్రలో నడిచే అలవాటుంది! డాక్టర్: రాత్రి పూట ఎక్కడ నడుస్తారు? పేషెంట్: రోడ్డు మీదే డాక్టర్, ఇంట్లో స్థలం సరిపోదు! 😂',
  ],
  kongu_tamil: [
    'ஒரு சிரிப்பான ஜோக் கேளுங்க 😄 வாத்தியார்: சூரியன் காலையில கிழக்கே உதிச்சு மேற்கே மறையுது ஏன்? மாணவன்: காலையில ஆபீஸ் போயிட்டு சாயங்காலம் வீட்டுக்கு திரும்புது சார்!',
  ],
  malwi_rajasthani: [
    'एक मजेदार जोक सुणो सा 😄 एक बार सेठ जी दुकान पै बेठ्या था, ग्राहक आयो: सेठ जी शक्कर मीठी है कई? सेठ जी बोल्या: थोक में खाओ तो मीठी है, मुफत में खाओ तो अमृत है!',
  ],
  standard_hindi: [
    'लीजिए भाई एक मजेदार जोक सुनिए 😄 एक बार एक छात्र ने टीचर से पूछा: क्या बिना गलती किए भी किसी को सजा मिल सकती है? टीचर बोले: बिल्कुल नहीं! छात्र बोला: बहुत अच्छा सर, मैंने आज का होमवर्क नहीं किया!',
    'डॉक्टर: आपका वजन बहुत बढ़ गया है, रोजाना 5 किलोमीटर दौड़िए। मरीज: सुबह दौड़ूं या शाम को? डॉक्टर: जब आपको भूख लगे, तब दौड़िए! 😂',
  ],
  indian_english: [
    'Here is a funny one 😄 A teacher asked: Why are you late to class? The student replied: Sir, the road sign said School Ahead, Go Slow!',
    'Doctor: You need to walk 5 km daily to stay fit. Patient: Morning or evening? Doctor: Whenever you feel like eating! 😂',
  ],
};

let jokeCounter = 0;
export function getNextJoke(dialectId: string): string {
  const list = DIALECT_JOKES[dialectId] || DIALECT_JOKES['haryanvi'] || DIALECT_JOKES['standard_hindi'];
  const joke = list[jokeCounter % list.length];
  jokeCounter++;
  return joke;
}

// Multi-greeting collection per dialect
export const DIALECT_GREETINGS: Record<string, string[]> = {
  haryanvi: [
    'राम राम भाई! कैसा सै? बता, आज के बात करन का मन सै?',
    'राम राम मेरे भाई! सब राजी-खुशी? बता आज के विचार सै?',
    'राम राम भाई! दिन बढ़िया चाल रया सै न? बोल, के सेवा करूँ तेरी?',
  ],
  himachali: [
    'नमस्ते भाईजी! क्या हाल-चाल है? सब राजी-खुशी पहाड़ां च?',
    'नमस्ते भाईजी! तुस दस्सा, क्या चल्या दा? दिन कैसा जांदा पया?',
    'राम-राम भाईजी! बताओ आज क्या विचार है, कोई गल्ल-बात या बागीचे दा हाल?',
  ],
  punjabi_malwa: [
    'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਵੀਰ ਜੀ! ਕਿਵੇਂ ਓ? ਦੱਸੋ, ਅੱਜ ਕੀ ਹਾਲ-ਚਾਲ ਹੈ?',
    'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਭਰਾਵਾ! ਸਭ ਰਾਜ਼ੀ-ਬਾਜ਼ੀ? ਦੱਸੋ ਅੱਜ ਕੀ ਪ੍ਰੋਗਰਾਮ ਐ?',
    'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਵੀਰ ਜੀ! ਚੜ੍ਹਦੀ ਕਲਾ ਵਿੱਚ ਓ ਨਾ? ਦੱਸੋ ਕੀ ਗੱਲਬਾਤ ਕਰਨੀ ਐ?',
  ],
  punjabi_majha: [
    'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਭਾਊ! ਖੇਤਾਂ ਦਾ ਕੀ ਹਾਲ ਐ? ਸਭ ਠੀਕ-ਠਾਕ?',
    'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਭਾਊ! ਕੀ ਹਾਲ-ਚਾਲ ਐ? ਦੱਸੋ ਅੱਜ ਕੀ ਸੇਵਾ ਕਰਾਂ?',
  ],
  awadhi_dehati: [
    'राम-राम भैया! कइसन बा सब? बताईं आज का समाचार बा?',
    'प्रणाम भैया! सब कुशल-मंगल? बताईं आज का विचार बा?',
  ],
  bhojpuri: [
    'प्रणाम भैया! का हाल-चाल बाटे? सब ठीक-ठाक बा ना?',
    'राम-राम भैया! राउर दिन कइसन बीतत बा? बताईं आज का खबर बा?',
  ],
  marathi_deshi: [
    'राम-राम भाऊ! कसं चाललंय? सांगा आज काय नवीन?',
    'नमस्कार भाऊ! तब्येत-पाणी कसं आहे? सांगा काय गप्पा मारायच्या?',
  ],
  marathi_varhadi: [
    'नमस्कार मंडळी! काय चाललं? सांगा काय विशेष?',
  ],
  gujarati_kathiyawadi: [
    'જય શ્રી કૃષ્ણ ભાઈ! કેમ છો? શું હાલે છે આજે?',
    'રામ રામ ભાઈ! મોજમાં છો ને? બોલો આજે શું સેવા કરીએ?',
  ],
  telangana_telugu: [
    'నమస్తే అన్నా! ఎట్లున్నావ్? ఏం సంగతులు ఈరోజు?',
    'నమస్తే అన్నా! బాగున్నావా? చెప్పు, ఏం ముచ్చట్లు మాట్లాడదాం?',
  ],
  kongu_tamil: [
    'வணக்கமுங்க! எப்படி இருக்கீங்க? என்ன விசேஷம் இன்னைக்கு?',
  ],
  malwi_rajasthani: [
    'राम-राम सा! कई हाल-चाल है? सब आनंद में?',
  ],
  standard_hindi: [
    'नमस्ते भाई! कैसे हो? बताओ, आज क्या हाल-चाल है?',
    'राम-राम भाई! सब कुशल-मंगल? बताइए आज क्या बात करने का मन है?',
  ],
  indian_english: [
    'Hello friend! How are you doing today?',
    'Hey friend! Hope your day is going well. What is on your mind today?',
  ],
};

let greetingCounter = 0;
export function getNextGreeting(dialectId: string): string {
  const list = DIALECT_GREETINGS[dialectId] || DIALECT_GREETINGS['haryanvi'] || DIALECT_GREETINGS['standard_hindi'];
  const greeting = list[greetingCounter % list.length];
  greetingCounter++;
  return greeting;
}

/**
 * Classifies the farmer's input into conversational intent, taking previous conversation turns into account.
 */
export function classifyIntent(
  message: string,
  history: ConversationTurn[] = []
): { intent: ConversationalIntent; contextResolvedQuery: string } {
  const clean = message.toLowerCase().trim();

  // Find last intent and last topic from recent history
  const lastBotTurn = [...history].reverse().find((h) => h.role === 'model');
  const lastUserTurn = [...history].reverse().find((h) => h.role === 'user');

  // 0. Dialect or Spoken Voice Language Change Request
  if (
    (clean.includes('baat kar') || clean.includes('bolo') || clean.includes('me baat') || clean.includes('ch baat') || clean.includes('ch bol') || clean.includes('mein baat') || clean.includes('speak in') || clean.includes('change language') || clean.includes('boli badlo') || clean.includes('में बोल') || clean.includes('च बोल') || clean.includes('में बात') || clean.includes('बोलो') || clean.includes('बोली')) &&
    (clean.includes('haryanvi') || clean.includes('हरियाणवी') || clean.includes('himachali') || clean.includes('हिमाचली') || clean.includes('pahari') || clean.includes('punjabi') || clean.includes('ਪੰਜਾਬੀ') || clean.includes('पंजाबी') || clean.includes('bhojpuri') || clean.includes('भोजपुरी') || clean.includes('awadhi') || clean.includes('अवधी') || clean.includes('marathi') || clean.includes('मराठी') || clean.includes('gujarati') || clean.includes('गुजराती') || clean.includes('hindi') || clean.includes('हिंदी') || clean.includes('english') || clean.includes('अंग्रेजी'))
  ) {
    return { intent: 'DIALECT_CHANGE', contextResolvedQuery: clean };
  }

  // Short follow-up multi-turn context resolution
  const isShortQuestion = clean.length <= 35;
  const isDiseaseFollowUp =
    clean.includes('din se') ||
    clean.includes('दिन से') ||
    clean.includes('ab kya karu') ||
    clean.includes('अब क्या') ||
    clean.includes('kya kare') ||
    clean.includes('kya spray') ||
    clean.includes('kaise theek') ||
    clean.includes('kyu ho raha') ||
    clean.includes('dawa') ||
    clean.includes('दवा') ||
    clean === '3 din se' ||
    clean === '3 दिन से' ||
    clean === 'teen din se' ||
    clean === 'तीन दिन से';

  const isRainFollowUp =
    clean.includes('kitni') ||
    clean.includes('kitna') ||
    clean.includes('kab tak') ||
    clean.includes('baarish') ||
    clean.includes('बारिश') ||
    clean.includes('hogi kya') ||
    clean.includes('hawa');
  const isMandiFollowUp =
    clean.includes('badha') ||
    clean.includes('बढ़ा') ||
    clean.includes('kam hua') ||
    clean.includes('कम') ||
    clean.includes('kal se') ||
    clean.includes('rate') ||
    clean.includes('रेट') ||
    clean.includes('fayda') ||
    clean.includes('bhaav') ||
    clean.includes('भाव');
  const isCropFollowUp =
    clean.includes('gehun') ||
    clean.includes('गेहूं') ||
    clean.includes('sarson') ||
    clean.includes('सरसों') ||
    clean.includes('dhan') ||
    clean.includes('धान') ||
    clean.includes('kapas') ||
    clean.includes('कपास') ||
    clean.includes('ganna') ||
    clean.includes('गन्ना') ||
    clean.includes('acre') ||
    clean.includes('एकड़') ||
    clean.includes('bigha') ||
    clean.includes('बीघा') ||
    clean.includes('khet') ||
    clean.includes('खेत');

  if (isShortQuestion) {
    // Multi-turn check for crop disease (e.g. Turn 1: "meri fasal peeli ho rahi hai" -> Turn 2: "3 दिन से" -> Turn 3: "ab kya karu")
    const hadRecentDiseaseDiscussion =
      (lastBotTurn && (lastBotTurn.text.includes('पत्ता') || lastBotTurn.text.includes('पीला') || lastBotTurn.text.includes('डॉक्टर') || lastBotTurn.text.includes('रोग') || lastBotTurn.text.includes('leaf') || (lastBotTurn as any).intent === 'CROP_HEALTH')) ||
      (lastUserTurn && (lastUserTurn.text.includes('peeli') || lastUserTurn.text.includes('पीली') || lastUserTurn.text.includes('patte') || lastUserTurn.text.includes('पत्ते') || lastUserTurn.text.includes('keeda') || lastUserTurn.text.includes('कीड़ा') || lastUserTurn.text.includes('bimari') || (lastUserTurn as any).intent === 'CROP_HEALTH'));

    if (hadRecentDiseaseDiscussion && (isDiseaseFollowUp || clean.includes('din') || clean.includes('दिन') || clean.includes('spray') || clean.includes('kya'))) {
      return { intent: 'CROP_HEALTH', contextResolvedQuery: `crop disease follow up: ${clean}` };
    }

    if (
      lastBotTurn &&
      (lastBotTurn.text.includes('मौसम') ||
        lastBotTurn.text.includes('बारिश') ||
        lastBotTurn.text.includes('धूप') ||
        lastBotTurn.text.includes('weather'))
    ) {
      if (isRainFollowUp || clean.includes('kya') || clean.includes('kab')) {
        return { intent: 'WEATHER', contextResolvedQuery: `kitni baarish hogi: ${clean}` };
      }
    }
    if (
      lastBotTurn &&
      (lastBotTurn.text.includes('भाव') ||
        lastBotTurn.text.includes('मंडी') ||
        lastBotTurn.text.includes('rate') ||
        lastBotTurn.text.includes('mandi'))
    ) {
      if (isMandiFollowUp || clean.includes('badha') || clean.includes('kal')) {
        return { intent: 'MANDI', contextResolvedQuery: `mandi bhav badha hai: ${clean}` };
      }
    }
    if (
      lastBotTurn &&
      (lastBotTurn.text.includes('फसल') ||
        lastBotTurn.text.includes('crop') ||
        lastBotTurn.text.includes('सिंचाई'))
    ) {
      if (isCropFollowUp) {
        return { intent: 'FARMING_QUESTION', contextResolvedQuery: `fasal jankari: ${clean}` };
      }
    }
  }

  // 1. Music / Bhajan Requests
  if (
    clean.includes('gaana') ||
    clean.includes('gana') ||
    clean.includes('गाना') ||
    clean.includes('गाने') ||
    clean.includes('गीत') ||
    clean.includes('bhajan') ||
    clean.includes('भजन') ||
    clean.includes('ragni') ||
    clean.includes('रागनी') ||
    clean.includes('music') ||
    clean.includes('संगीत') ||
    clean.includes('bansuri') ||
    clean.includes('बांसुरी') ||
    clean.includes('बाँसुरी') ||
    clean.includes('raga') ||
    clean.includes('राग') ||
    clean.includes('dhun') ||
    clean.includes('धुन') ||
    clean.includes('song') ||
    clean.includes('baja de') ||
    clean.includes('बजा दे') ||
    clean.includes('बजा') ||
    clean.includes('chala de') ||
    clean.includes('चला दे') ||
    clean.includes('चला') ||
    clean.includes('sunao geet') ||
    clean.includes('geet')
  ) {
    return { intent: 'MUSIC', contextResolvedQuery: clean };
  }

  // 2. Jokes Intent
  if (
    clean.includes('joke') ||
    clean.includes('जोक') ||
    clean.includes('chutkula') ||
    clean.includes('चुटकुला') ||
    clean.includes('hansa') ||
    clean.includes('हँसा') ||
    clean.includes('हंसा') ||
    clean.includes('majak') ||
    clean.includes('मजाक') ||
    clean.includes('kuch funny') ||
    clean.includes('mazedaar') ||
    clean.includes('मजेदार') ||
    clean.includes('मज़ेदार') ||
    clean.includes('ek aur suna') ||
    clean.includes('koi joke')
  ) {
    return { intent: 'CASUAL_JOKE', contextResolvedQuery: clean };
  }

  // 3. User saying they are fine / doing well ("Main badhiya su", "Mast hu", "Sab theek hai")
  if (
    clean.includes('badhiya') ||
    clean.includes('बढ़िया') ||
    clean.includes('badiya') ||
    clean.includes('mast') ||
    clean.includes('मस्त') ||
    clean.includes('theek hu') ||
    clean.includes('thik hu') ||
    clean.includes('ठीक हूँ') ||
    clean.includes('theek thak') ||
    clean.includes('raazi') ||
    clean.includes('राजी') ||
    clean.includes('anand') ||
    clean.includes('आनंद') ||
    clean.includes('sab theek') ||
    clean.includes('सब ठीक') ||
    clean.includes('sab shanti') ||
    clean.includes('chardi kala') ||
    clean.includes('fine') ||
    clean.includes('good')
  ) {
    return { intent: 'CASUAL_I_AM_FINE', contextResolvedQuery: clean };
  }

  // 4. User asking AI to tell ("Tu bata", "Tu sunao", "Aur bata", "Aur sunao")
  if (
    clean.includes('tu bata') ||
    clean.includes('तू बता') ||
    clean.includes('tu suna') ||
    clean.includes('तू सुना') ||
    clean.includes('tum batao') ||
    clean.includes('तुम बताओ') ||
    clean.includes('aap batao') ||
    clean.includes('आप बताओ') ||
    clean.includes('aur bata') ||
    clean.includes('और बता') ||
    clean.includes('aur sunao') ||
    clean.includes('और सुना') ||
    clean.includes('aur suno') ||
    clean.includes('hor sunao') ||
    clean.includes('tussi sunao')
  ) {
    return { intent: 'CASUAL_YOU_TELL', contextResolvedQuery: clean };
  }

  // 5. Thanks / Gratitude
  if (
    clean.includes('dhanyawad') ||
    clean.includes('धन्यवाद') ||
    clean.includes('shukriya') ||
    clean.includes('शुक्रिया') ||
    clean.includes('thanks') ||
    clean.includes('thank you') ||
    clean.includes('meharbani') ||
    clean.includes('mehrbani') ||
    clean.includes('मेहरबानी')
  ) {
    return { intent: 'CASUAL_THANKS', contextResolvedQuery: clean };
  }

  // 6. Feeling down / Emotional companion intent
  if (
    clean.includes('mann nahi lag') ||
    clean.includes('man nahi lag') ||
    clean.includes('मन नहीं') ||
    clean.includes('mood kharab') ||
    clean.includes('मूड खराब') ||
    clean.includes('pareshan') ||
    clean.includes('परेशान') ||
    clean.includes('udas') ||
    clean.includes('उदास') ||
    clean.includes('bore') ||
    clean.includes('बोर') ||
    clean.includes('thak gaya') ||
    clean.includes('थक गया') ||
    clean.includes('tension') ||
    clean.includes('टेंशन') ||
    clean.includes('chinta') ||
    clean.includes('चिंता')
  ) {
    return { intent: 'CASUAL_FEELING_DOWN', contextResolvedQuery: clean };
  }

  // 7. "What are you doing" Intent
  if (
    !clean.includes('bhav') &&
    !clean.includes('bhaav') &&
    !clean.includes('भाव') &&
    !clean.includes('rate') &&
    !clean.includes('रेट') &&
    !clean.includes('mandi') &&
    !clean.includes('मंडी') &&
    (clean.includes('kya kar raha') ||
      clean.includes('kya kar rya') ||
      clean.includes('ke kar rya') ||
      clean.includes('ke kar reha') ||
      clean.includes('क्या कर रहा') ||
      clean.includes('के कर रया') ||
      clean === 'क्या चल रहा है' ||
      clean === 'क्या चल रहा है?' ||
      clean === 'kya chal raha hai' ||
      clean === 'aur kya chal raha hai' ||
      clean.includes('what are you doing') ||
      clean.includes('aaj kya scene') ||
      clean.includes('kya scene hai'))
  ) {
    return { intent: 'CASUAL_WHAT_DOING', contextResolvedQuery: clean };
  }

  // 8. "How are you" Intent
  if (
    clean.includes('kaisa hai') ||
    clean.includes('कैसा है') ||
    clean.includes('कैसा सै') ||
    clean.includes('kaisa se') ||
    clean.includes('kaisa ho') ||
    clean.includes('kaise ho') ||
    clean.includes('कैसे हो') ||
    clean.includes('kiven ho') ||
    clean.includes('ਕਿਵੇਂ ਓ') ||
    clean.includes('tu kaisa') ||
    clean.includes('तू कैसा') ||
    clean.includes('aap kaise') ||
    clean.includes('आप कैसे') ||
    clean.includes('how are you') ||
    clean.includes('ke haal') ||
    clean.includes('के हाल') ||
    clean.includes('ka haal') ||
    clean.includes('का हाल') ||
    clean.includes('हाल-चाल') ||
    clean.includes('हाल चाल') ||
    clean.includes('kasa ahes') ||
    clean.includes('kem cho') ||
    clean.includes('etlunnav')
  ) {
    return { intent: 'CASUAL_HOW_ARE_YOU', contextResolvedQuery: clean };
  }

  // 9. Casual Greeting Intent (strictly conversational, NO farming prompt!)
  if (
    clean === 'hello' ||
    clean === 'hi' ||
    clean === 'hey' ||
    clean === 'ram ram' ||
    clean === 'ram-ram' ||
    clean === 'राम राम' ||
    clean === 'राम-राम' ||
    clean === 'राम राम भाई' ||
    clean === 'राम-राम भाई' ||
    clean === 'namaste' ||
    clean === 'नमस्ते' ||
    clean === 'namaskar' ||
    clean === 'नमस्कार' ||
    clean === 'sat sri akal' ||
    clean === 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ' ||
    clean === 'सत श्री अकाल' ||
    clean === 'pranam' ||
    clean === 'प्रणाम' ||
    clean === 'jai shree krishna' ||
    clean === 'जय श्री कृष्णा' ||
    clean === 'good morning' ||
    clean === 'kisan bhai' ||
    clean === 'bhai' ||
    clean.startsWith('hello') ||
    clean.startsWith('hi ') ||
    clean.startsWith('ram ram') ||
    clean.startsWith('राम राम') ||
    clean.startsWith('namaste') ||
    clean.startsWith('नमस्ते')
  ) {
    return { intent: 'CASUAL_GREETING', contextResolvedQuery: clean };
  }

  // 10. General Knowledge / Facts (Capital, Cricket, Prime Minister, Sun, Earth, Dates)
  if (
    clean.includes('capital') ||
    clean.includes('rajdhani') ||
    clean.includes('राजधानी') ||
    clean.includes('cricket') ||
    clean.includes('क्रिकेट') ||
    clean.includes('pradhan mantri') ||
    clean.includes('प्रधानमंत्री') ||
    clean.includes('prime minister') ||
    clean.includes('rashtrapati') ||
    clean.includes('राष्ट्रपति') ||
    clean.includes('president') ||
    clean.includes('suraj') ||
    clean.includes('सूरज') ||
    clean.includes('disha') ||
    clean.includes('दिशा') ||
    clean.includes('kisan divas') ||
    clean.includes('kisan diwas') ||
    clean.includes('किसान दिवस') ||
    clean.includes('bharat ka') ||
    clean.includes('भारत का') ||
    clean.includes('india ka') ||
    clean.includes('taj mahal') ||
    clean.includes('tajmahal') ||
    clean.includes('ताजमहल') ||
    clean.includes('ताज महल') ||
    clean.includes('kahan hai') ||
    clean.includes('कहाँ है') ||
    clean.includes('कहा है') ||
    clean.includes('कहां है') ||
    clean.includes('kaun hai') ||
    clean.includes('कौन है') ||
    clean.includes('kya hota hai') ||
    clean.includes('क्या होता है')
  ) {
    return { intent: 'GENERAL_GK', contextResolvedQuery: clean };
  }

  // 11. Direct App Navigation requests
  if (
    clean.includes('dashboard khol') ||
    clean.includes('overview khol') ||
    clean.includes('open dashboard')
  ) {
    return { intent: 'APP_NAVIGATION', contextResolvedQuery: clean };
  }

  // 12. Field Analysis / Satellite Requests
  if (
    clean.includes('khet ka haal') ||
    clean.includes('khet ka analysis') ||
    clean.includes('khet dikha') ||
    clean.includes('field analysis') ||
    clean.includes('satellite analysis') ||
    clean.includes('ndvi') ||
    clean.includes('meri zameen') ||
    clean.includes('mera khet') ||
    clean.includes('meri fasal') ||
    clean.includes('मेरी फसल') ||
    clean.includes('खेत का हाल') ||
    clean.includes('खेत दिखा') ||
    clean.includes('फसल कैसी है') ||
    clean.includes('मेरा खेत')
  ) {
    return { intent: 'FIELD_ANALYSIS', contextResolvedQuery: clean };
  }

  // 13. Weather Requests
  if (
    clean.includes('baarish') ||
    clean.includes('barish') ||
    clean.includes('बारिश') ||
    clean.includes('बरसात') ||
    clean.includes('mausam') ||
    clean.includes('मौसम') ||
    clean.includes('weather') ||
    clean.includes('rain') ||
    clean.includes('dhoop') ||
    clean.includes('धूप') ||
    clean.includes('hawa') ||
    clean.includes('हवा') ||
    clean.includes('aandhi') ||
    clean.includes('आंधी') ||
    clean.includes('बादल')
  ) {
    return { intent: 'WEATHER', contextResolvedQuery: clean };
  }

  // 14. Mandi Price Requests
  if (
    clean.includes('mandi') ||
    clean.includes('मंडी') ||
    clean.includes('bhav') ||
    clean.includes('bhaav') ||
    clean.includes('भाव') ||
    clean.includes('rate') ||
    clean.includes('रेट') ||
    clean.includes('kimat') ||
    clean.includes('keemat') ||
    clean.includes('कीमत') ||
    clean.includes('दाम') ||
    clean.includes('price') ||
    clean.includes('msp') ||
    clean.includes('एमएसपी')
  ) {
    return { intent: 'MANDI', contextResolvedQuery: clean };
  }

  // 15. Leaf / Pest Diagnostic
  if (
    clean.includes('leaf') ||
    clean.includes('patte') ||
    clean.includes('patta') ||
    clean.includes('पत्ता') ||
    clean.includes('पत्ते') ||
    clean.includes('peela') ||
    clean.includes('peeli') ||
    clean.includes('पीला') ||
    clean.includes('पीले') ||
    clean.includes('पीली') ||
    clean.includes('keeda') ||
    clean.includes('kide') ||
    clean.includes('कीड़ा') ||
    clean.includes('कीड़े') ||
    clean.includes('fungus') ||
    clean.includes('फफूंद') ||
    clean.includes('rog') ||
    clean.includes('रोग') ||
    clean.includes('bimari') ||
    clean.includes('बीमारी') ||
    clean.includes('doctor') ||
    clean.includes('डॉक्टर')
  ) {
    return { intent: 'CROP_HEALTH', contextResolvedQuery: clean };
  }

  // 16. Farming / Agronomy Question
  if (
    clean.includes('pani') ||
    clean.includes('paani') ||
    clean.includes('पानी') ||
    clean.includes('sinchai') ||
    clean.includes('सिंचाई') ||
    clean.includes('urea') ||
    clean.includes('यूरिया') ||
    clean.includes('dap') ||
    clean.includes('डीएपी') ||
    clean.includes('khad') ||
    clean.includes('खाद') ||
    clean.includes('spray') ||
    clean.includes('स्प्रे') ||
    clean.includes('fasal') ||
    clean.includes('फसल') ||
    clean.includes('bijai') ||
    clean.includes('buwai') ||
    clean.includes('बुवाई') ||
    clean.includes('बिजाई')
  ) {
    return { intent: 'FARMING_QUESTION', contextResolvedQuery: clean };
  }

  // 17. Casual affirmative or brief conversation
  if (
    clean === 'theek hai' ||
    clean === 'ok' ||
    clean === 'okay' ||
    clean === 'haan' ||
    clean === 'nahi' ||
    clean === 'achha' ||
    clean === 'accha' ||
    clean === 'sahi hai'
  ) {
    return { intent: 'CASUAL_CHAT', contextResolvedQuery: clean };
  }

  return { intent: 'GENERAL_QUESTION', contextResolvedQuery: clean };
}

let fallbackCounter = 0;

/**
 * Builds a natural, context-aware reply in the chosen spoken dialect.
 * If Gemini API is available, this acts as prompt context or instant offline fallback.
 */
export function buildConversationalReply(
  message: string,
  dialectId: string,
  history: ConversationTurn[] = [],
  contextData: {
    crop?: string;
    state?: string;
    healthyPct?: number;
    stressPct?: number;
    areaAcres?: number;
  } = {},
  writtenLangId: string = 'hi'
): CompanionReply {
  const dialect = getDialectById(dialectId);
  const { intent } = classifyIntent(message, history);
  const phrases = dialect.conversationalPhrases;

  const crop = contextData.crop || 'Wheat';
  const state = contextData.state || 'Punjab';
  const healthyPct = contextData.healthyPct ?? 76;
  const cleanMsg = message.toLowerCase().trim();

  switch (intent) {
    case 'DIALECT_CHANGE': {
      const targetDialect = detectDialectFromPhrase(message) || getDialectById('haryanvi');
      let replyText = `हाँ भाई, अब हम ${targetDialect.name} में बात करेंगे! ${targetDialect.greetingSample}`;
      let audioText = targetDialect.conversationalPhrases.greeting;
      if (targetDialect.id === 'haryanvi') {
        replyText = 'हाँ भाई, अब हरियाणवी में बात करांगे! राम राम भाई, कैसा सै? बोल के बात पूछणी सै?';
        audioText = 'हाँ भाई, अब हरियाणवी में बात करांगे! राम राम भाई, कैसा सै? बोल के बात पूछणी सै?';
      } else if (targetDialect.id === 'himachali') {
        replyText = 'हाँ भाईजी, हुण हिमाचली च गल्ल-बात करांगे! नमस्ते भाईजी, क्या हाल-चाल है?';
        audioText = 'हाँ भाईजी, हुण हिमाचली च गल्ल-बात करांगे! नमस्ते भाईजी, क्या हाल-चाल है?';
      } else if (targetDialect.id === 'punjabi_malwa' || targetDialect.id === 'punjabi_majha') {
        replyText = 'ਹਾਂਜੀ ਵੀਰ ਜੀ, ਹੁਣ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗੇ! ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਵੀਰ ਜੀ, ਕੀ ਹਾਲ-ਚਾਲ ਐ?';
        audioText = 'ਹਾਂਜੀ ਵੀਰ ਜੀ, ਹੁਣ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗੇ! ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਵੀਰ ਜੀ, ਕੀ ਹਾਲ-ਚਾਲ ਐ?';
      }

      if (writtenLangId === 'en') {
        replyText = `Understood! Switched spoken dialect to ${targetDialect.name}. How can I help you today?`;
      }

      return {
        reply: replyText,
        audioText: audioText,
        intent,
        targetDialectId: targetDialect.id,
        suggestedQuestions: [
          'तू कैसा है भाई?',
          'आज क्या कर रहा है?',
          'एक जोक सुना दे 😄',
          'आज मौसम कैसा रहेगा?',
        ],
      };
    }

    case 'CASUAL_GREETING': {
      const greetingText = getNextGreeting(dialect.id);
      let reply = greetingText;
      if (writtenLangId === 'en') {
        reply = `Hello brother! How are you doing today? Let me know if you want to chat, hear a joke, or check your farm telemetry.`;
      }
      return {
        reply,
        audioText: greetingText,
        intent,
        suggestedQuestions: [
          'तू कैसा है?',
          'आज क्या कर रहा है?',
          'एक जोक सुना दे 😄',
          'आज मौसम कैसा रहेगा?',
        ],
      };
    }

    case 'CASUAL_HOW_ARE_YOU': {
      let reply = phrases.howAreYou;
      if (writtenLangId === 'en') {
        reply = `I am doing great brother! Always ready to help you with farm insights, weather, mandi rates, or just a friendly chat. How is your day going?`;
      }
      return {
        reply,
        audioText: phrases.howAreYou,
        intent,
        suggestedQuestions: [
          'बढ़िया! आज क्या कर रहा है?',
          'एक मजेदार जोक सुना दे',
          'एक शांत भजन या धुन सुनाओ',
          'मेरे खेत का हाल दिखा',
        ],
      };
    }

    case 'CASUAL_I_AM_FINE': {
      let reply = 'वाह भाई! यह सुनकर बहुत अच्छा लगा 😄 सेहत और मिज़ाज बढ़िया रहना ही सबसे जरूरी है। और बताओ, आज दिन में क्या-क्या काम निपटाए?';
      if (dialect.id === 'haryanvi') {
        reply = 'घणा बढ़िया भाई! सुण के जी खुश हो गया 😄 राजी-खुशी रहो बस! और बता, आज खेत में चक्कर लाग्या था के घरै ही था?';
      } else if (dialect.id === 'himachali') {
        reply = 'सुण के बड़ी खुशी होई भाईजी! सब राजी-खुशी रहण चाहिदे 😄 तुस दस्सा, आज क्या विचार है?';
      } else if (dialect.id === 'punjabi_malwa' || dialect.id === 'punjabi_majha') {
        reply = 'ਬਹੁਤ ਵਧੀਆ ਵੀਰ ਜੀ! ਸੁਣ ਕੇ ਚੜ੍ਹਦੀ ਕਲਾ ਹੋ ਗਈ 😄 ਹੋਰ ਦੱਸੋ, ਅੱਜ ਖੇਤਾਂ ਵੱਲ ਗੇੜਾ ਮਾਰਿਆ ਜਾਂ ਘਰੇ ਹੀ ਸੀ?';
      } else if (dialect.id === 'awadhi_dehati' || dialect.id === 'bhojpuri') {
        reply = 'सुन के मन खुश हो गईल भैया! राजी-खुशी रहे के चाहीं 😄 बताईं आज दिन कइसन रहल?';
      }
      return {
        reply,
        audioText: reply,
        intent,
        suggestedQuestions: [
          'तू बता, कैसा चल रहा है?',
          'एक जोक सुना दे 😄',
          'आज बारिश का क्या अनुमान है?',
          'मंडी में क्या भाव है?',
        ],
      };
    }

    case 'CASUAL_YOU_TELL': {
      let reply = 'मैं तो एकदम मस्त हूँ भाई! दिन भर आप सब किसान भाइयों से गपशप और खेती-बाड़ी की बातें चलती रहती हैं। आप बताओ, आपके वहाँ आज का क्या माहौल है?';
      if (dialect.id === 'haryanvi') {
        reply = 'मैं तो घणा राजी सूँ भाई! दिन भर भाईयों गेल गपशप अर खेत-खलिहान की चर्चा चालदी रहवै। तू बता, तेरे धोरै आज के सीन सै?';
      } else if (dialect.id === 'himachali') {
        reply = 'आऊं तां बिल्कुल ठीक आं भाईजी! किसान भाईयों कन्ने गल्ल-बात करदे दिन लंग्घ जांदा। तुस दस्सा, मौसम कैसा है आज?';
      } else if (dialect.id === 'punjabi_malwa' || dialect.id === 'punjabi_majha') {
        reply = 'ਮੈਂ ਤਾਂ ਬਿਲਕੁਲ ਰਾਜ਼ੀ-ਬਾਜ਼ੀ ਆਂ ਵੀਰ ਜੀ! ਸਾਰਾ ਦਿਨ ਕਿਸਾਨ ਵੀਰਾਂ ਨਾਲ ਵਿਚਾਰ-ਵਟਾਂਦਰਾ ਹੁੰਦਾ ਰਹਿੰਦਾ। ਤੁਸੀਂ ਸੁਣਾਓ ਅੱਜ ਦਾ ਕੀ ਮਾਹੌਲ ਐ?';
      }
      return {
        reply,
        audioText: reply,
        intent,
        suggestedQuestions: [
          'एक मजेदार जोक सुना',
          'मौसम का हाल दिखाओ',
          'मंडी में गेहूं का भाव क्या है?',
          'खेत का विश्लेषण दिखा',
        ],
      };
    }

    case 'CASUAL_WHAT_DOING': {
      return {
        reply: phrases.whatDoing,
        audioText: phrases.whatDoing,
        intent,
        suggestedQuestions: [
          'आज का दिन कैसा रहेगा?',
          'एक बढ़िया जोक सुना दे',
          'एक शांत धुन या भजन चलाओ',
          'आज मंडी में क्या भाव है?',
        ],
      };
    }

    case 'CASUAL_FEELING_DOWN': {
      return {
        reply: phrases.feelingDown,
        audioText: phrases.feelingDown,
        intent,
        suggestedQuestions: [
          'एक हंसी का जोक सुना दे 😄',
          'एक शांत भजन या धुन सुनाओ 🪈',
          'बस थोड़ा थक गया था भाई',
        ],
      };
    }

    case 'CASUAL_JOKE': {
      const joke = getNextJoke(dialect.id);
      return {
        reply: joke,
        audioText: joke,
        intent,
        suggestedQuestions: [
          'हाहाहा बहुत बढ़िया! एक और सुना 😄',
          'तू बता, और क्या चल रहा है?',
          'एक शांत बांसुरी धुन बजाओ',
        ],
      };
    }

    case 'CASUAL_THANKS': {
      let reply = 'अरे भाई, धन्यवाद की क्या बात है! हम तो अपने भाई जैसे हैं 😄 जब भी मन करे, याद कर लेना!';
      if (dialect.id === 'haryanvi') {
        reply = 'अरे भाई, धन्यवाद की के बात सै! आपणे भाई बरगे सां 😄 जब भी जी करे, आवाज मार लिए!';
      } else if (dialect.id === 'himachali') {
        reply = 'अरे भाईजी, धन्यवाद क्युं बोलदे! आपणे भाई सां 😄 कदी भी याद करी लेआ!';
      } else if (dialect.id === 'punjabi_malwa' || dialect.id === 'punjabi_majha') {
        reply = 'ਅਰੇ ਵੀਰ ਜੀ, ਧੰਨਵਾਦ ਕਾਹਦਾ! ਆਪਾਂ ਤਾਂ ਭਰਾਵਾਂ ਵਰਗੇ ਆਂ 😄 ਜਦੋਂ ਵੀ ਮਨ ਕਰੇ ਗੱਲ ਕਰ ਲਿਆ ਕਰੋ!';
      }
      return {
        reply,
        audioText: reply,
        intent,
        suggestedQuestions: [
          'एक जोक सुना दे',
          'आज का मौसम दिखाओ',
          'मेरे खेत का हाल दिखा',
        ],
      };
    }

    case 'CASUAL_CHAT': {
      let reply = 'बढ़िया भाई! और बताओ, आज क्या विचार है, कोई बातचीत करनी है या खेत-खलिहान का कुछ देखना है?';
      if (dialect.id === 'haryanvi') {
        reply = 'घणा बढ़िया भाई! और बता, आज के विचार सै, गपशप मारण का मन सै या खेत का हाल देखणा सै?';
      } else if (dialect.id === 'himachali') {
        reply = 'बढ़िया भाईजी! होर दस्सा, आज क्या गल्ल-बात करनी या बागीचे-खेत दा हाल देखणा?';
      } else if (dialect.id === 'punjabi_malwa' || dialect.id === 'punjabi_majha') {
        reply = 'ਬਹੁਤ ਵਧੀਆ ਵੀਰ ਜੀ! ਹੋਰ ਸੁਣਾਓ, ਅੱਜ ਕੀ ਵਿਚਾਰ ਹੈ, ਕੋਈ ਗੱਲਬਾਤ ਕਰਨੀ ਐ ਜਾਂ ਖੇਤਾਂ ਦਾ ਹਾਲ ਦੇਖਣਾ ਐ?';
      }
      return {
        reply,
        audioText: reply,
        intent,
        suggestedQuestions: [
          'एक जोक सुना दे 😄',
          'एक शांत धुन चला दो',
          'आज बारिश होगी क्या?',
          'मेरे खेत का विश्लेषण दिखा',
        ],
      };
    }

    case 'MUSIC': {
      const musicData = searchLegalMusic(message, dialect.id);
      let reply = `हाँ बिल्कुल भाई! आपके लिए आधिकारिक संगीत ट्रैक निकाला है: "${musicData.track.title}" (${musicData.track.artist} - ${musicData.track.provider})। नीचे दिए गए बटन से तुरंत सुन सकते हैं!`;
      if (dialect.id === 'haryanvi') {
        reply = `हाँ बिल्कुल भाई! थारे खातर आधिकारिक गीत निकाल दिया सै: "${musicData.track.title}" (${musicData.track.provider})। नीचे तै सीधा बजा सको सो!`;
      } else if (dialect.id === 'himachali') {
        reply = `हाँ बिल्कुल भाईजी! तुहाड़े वास्ते गीत कड्डी दित्ता: "${musicData.track.title}" (${musicData.track.provider})। थल्ले दित्ते बटन कन्ने सुण सकदे ओ!`;
      } else if (dialect.id === 'punjabi_malwa' || dialect.id === 'punjabi_majha') {
        reply = `ਹਾਂਜੀ ਬਿਲਕੁਲ ਵੀਰ ਜੀ! ਤੁਹਾਡੇ ਲਈ ਗੀਤ ਕੱਢ ਦਿੱਤਾ: "${musicData.track.title}" (${musicData.track.provider})। ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ ਨਾਲ ਸੁਣ ਸਕਦੇ ਹੋ!`;
      }

      let audioText = dialect.conversationalPhrases.musicResponse || 'हाँ बिल्कुल भाई! आपके लिए मनपसंद धुन लगा दी है, आराम से सुनिए!';
      if (writtenLangId === 'en') {
        reply = `Here is official music for you brother: "${musicData.track.title}" (${musicData.track.artist} on ${musicData.track.provider}). Tap below to listen legally.`;
      }

      return {
        reply,
        audioText,
        intent,
        musicData,
        appAction: {
          type: 'OPEN_FIELD_ANALYSIS' as any,
          label: `▶️ चलाएं (${musicData.track.provider})`,
        },
        suggestedQuestions: [
          'एक और गाना सुनाओ',
          'सुबह का भैरव राग',
          'एक मजेदार जोक सुना दे 😄',
          'आज का मौसम दिखाओ',
        ],
      };
    }

    case 'GENERAL_GK': {
      let reply = '';
      if (cleanMsg.includes('capital') || cleanMsg.includes('rajdhani')) {
        reply = writtenLangId === 'en' ? 'The capital of India is New Delhi, officially designated in 1911.' : 'भारत की राजधानी नई दिल्ली है भाई! इसकी घोषणा 1911 में की गई थी।';
      } else if (cleanMsg.includes('cricket')) {
        reply = writtenLangId === 'en' ? 'Cricket is a bat-and-ball game played between two teams of eleven players, widely celebrated like a festival across India.' : 'क्रिकेट 11-11 खिलाड़ियों की दो टीमों के बीच खेला जाने वाला बहुत लोकप्रिय खेल है भाई! भारत में क्रिकेट को त्योहार की तरह माना जाता है।';
      } else if (cleanMsg.includes('pradhan mantri') || cleanMsg.includes('prime minister')) {
        reply = writtenLangId === 'en' ? 'The current Prime Minister of India is Shri Narendra Modi.' : 'भारत के वर्तमान प्रधानमंत्री श्री नरेंद्र मोदी हैं।';
      } else if (cleanMsg.includes('rashtrapati') || cleanMsg.includes('president')) {
        reply = writtenLangId === 'en' ? 'The current President of India is Smt. Droupadi Murmu.' : 'भारत की वर्तमान राष्ट्रपति श्रीमती द्रौपदी मुर्मु हैं।';
      } else if (cleanMsg.includes('suraj') && cleanMsg.includes('disha')) {
        reply = writtenLangId === 'en' ? 'The Sun rises in the East and sets in the West.' : 'सूरज हमेशा पूर्व (East) दिशा से उगता है और पश्चिम (West) में अस्त होता है।';
      } else if (cleanMsg.includes('kisan divas') || cleanMsg.includes('kisan diwas')) {
        reply = writtenLangId === 'en' ? 'National Farmers Day (Kisan Diwas) in India is celebrated every year on December 23rd in honor of former Prime Minister Chaudhary Charan Singh.' : 'भारत में राष्ट्रीय किसान दिवस हर साल 23 दिसंबर को पूर्व प्रधानमंत्री चौधरी चरण सिंह जी के जन्मदिवस पर मनाया जाता है!';
      } else {
        reply = writtenLangId === 'en' ? 'That is a great question brother! Feel free to ask more details.' : 'हाँ भाई, यह सामान्य जानकारी का बहुत अच्छा सवाल है! बताइए, इस बारे में और क्या जानना चाहते हैं?';
      }
      return {
        reply,
        audioText: reply,
        intent,
        suggestedQuestions: [
          'भारत के प्रधानमंत्री कौन हैं?',
          'किसान दिवस कब मनाया जाता है?',
          'सूरज किस दिशा से उगता है?',
          'मौसम कैसा रहेगा?',
        ],
      };
    }

    case 'FIELD_ANALYSIS': {
      let text = `${phrases.openAnalysis}\n\nवर्तमान उपग्रह सूचकांक के अनुसार आपका लगभग ${healthyPct}% खेत बिल्कुल हरा-भरा और स्वस्थ है।`;
      let audioText = text;
      if (dialect.id === 'haryanvi') {
        audioText = `बिल्कुल भाई! तेरे खेत का सेटेलाइट नक्शा अर हरियाली इंडेक्स (NDVI) खोल रया सूँ। देख ले, लगभग ${healthyPct}% खेत एक दम लहलहा रया सै!`;
        text = audioText;
      } else if (dialect.id === 'himachali') {
        audioText = `बिल्कुल भाईजी! तुहाड़े खेत दा सेटेलाइट नक्शा खोलदा पया। लगभग ${healthyPct}% रकबा पूरी तरह हरा-भरा ते स्वस्थ है!`;
        text = audioText;
      } else if (dialect.id === 'punjabi_malwa' || dialect.id === 'punjabi_majha') {
        audioText = `ਬਿਲਕੁਲ ਵੀਰ ਜੀ! ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਸੈਟੇਲਾਈਟ ਨਕਸ਼ਾ ਖੋਲ੍ਹ ਰਿਹਾ ਆਂ। ਲਗਭਗ ${healthyPct}% ਖੇਤ ਬਿਲਕੁਲ ਹਰਿਆ-ਭਰਿਆ ਤੇ ਤੰਦਰੁਸਤ ਐ!`;
        text = audioText;
      }

      if (writtenLangId === 'en') {
        text = `Opening your satellite field analysis and vegetation health (NDVI) view. Approximately ${healthyPct}% of your farm canopy is currently healthy and green.`;
      }

      return {
        reply: text,
        audioText,
        intent,
        appAction: {
          type: 'OPEN_FIELD_ANALYSIS',
          label: '🗺️ खेत सेटेलाइट विश्लेषण खोलें',
        },
        suggestedQuestions: [
          'पीले पत्तों का क्या कारण हो सकता है?',
          'अगली सिंचाई कब करनी चाहिए?',
          'आज मंडी में गेहूं का क्या भाव है?',
        ],
        actionableTip: 'सुबह के समय खेत में नमी की स्थिति जांचकर ही हल्की सिंचाई करें।',
      };
    }

    case 'WEATHER': {
      let text = `${phrases.openWeather}\n\nआज आपके क्षेत्र (${state}) में मुख्य रूप से धूप खिली रहेगी। बारिश की संभावना 10% से कम है और तापमान लगभग 24°C रहेगा।`;
      let audioText = text;
      if (dialect.id === 'haryanvi') {
        audioText = `एक मिनट भाई, आज का मौसम देख के बताऊँ सूँ। आज धूप खिली रहवैगी अर बारिश के 10% तै कम आसार सैं। आराम तै खेत का काम कर सकै सै!`;
        text = audioText;
      } else if (dialect.id === 'himachali') {
        audioText = `एक मिनट भाईजी, मौसम दा हाल दस्सदा आं। आज हल्की धूप खिली रहणी ते बारिश दे 10% ही आसार न।`;
        text = audioText;
      }

      if (writtenLangId === 'en') {
        text = `Fetching weather forecast for ${state}. Today will be mostly clear and sunny with less than 10% rain chance. Safe conditions for field spray and harvesting.`;
      }

      return {
        reply: text,
        audioText,
        intent,
        appAction: {
          type: 'OPEN_WEATHER',
          label: '🌦️ 7-दिवसीय मौसम पूर्वानुमान देखें',
        },
        suggestedQuestions: [
          'क्या अगले 3 दिनों में बारिश होगी?',
          'हवा की गति कितनी रहेगी?',
          'क्या आज खाद या स्प्रे करना सुरक्षित है?',
        ],
        actionableTip: 'हल्की धूप के समय स्प्रे करना सबसे ज्यादा असरदार रहता है।',
      };
    }

    case 'MANDI': {
      let text = `${phrases.openMandi}\n\nआज की स्थानीय मंडियों में ${crop} का औसत भाव ₹2,275 से ₹2,350 प्रति क्विंटल के बीच दर्ज किया गया है।`;
      let audioText = text;
      if (dialect.id === 'haryanvi') {
        audioText = `हाँ भाई, मंडियों के ताजा भाव खोल दिए सैं। ${crop} का भाव आज लगभग ₹2,275 तै ₹2,350 प्रति क्विंटल पै चल रया सै। पूरा भाव देखना सै तो बता!`;
        text = audioText;
      } else if (dialect.id === 'himachali') {
        audioText = `हाँ भाईजी, मंडी दे ताज़ा भाव खोल दित्ते न। ${crop} दा भाव लगभग ₹2,275 तै ₹2,350 प्रति क्विंटल चल्या दा।`;
        text = audioText;
      }

      if (writtenLangId === 'en') {
        text = `Opening latest mandi market rates. In nearby markets, ${crop} is trading at approximately ₹2,275 - ₹2,350 per quintal.`;
      }

      return {
        reply: text,
        audioText,
        intent,
        appAction: {
          type: 'OPEN_MANDI',
          label: '🌾 मंडी भाव तालिका खोलें',
        },
        suggestedQuestions: [
          'क्या कल से भाव बढ़ा है?',
          'सरसों का आज क्या भाव है?',
          'नजदीकी मंडी का भाव दिखाओ',
        ],
        actionableTip: 'सूखी और साफ फसल को मंडी ले जाने पर अधिकतम बोली मिलती है।',
      };
    }

    case 'CROP_HEALTH': {
      const isPersistent = cleanMsg.includes('3 din') || cleanMsg.includes('teen din') || cleanMsg.includes('ab kya') || cleanMsg.includes('spray');
      let text = `${phrases.openLeafDoctor}\n\nफसल में पत्तों का पीलापन आमतौर पर नाइट्रोजन की कमी या अतिरिक्त पानी के ठहराव से होता है। आप लीफ डॉक्टर से कैमरे द्वारा पत्ता स्कैन कर सकते हैं।`;
      let audioText = text;

      if (isPersistent) {
        text = `गेहूं में 3 दिन से पीलापन दिखने के दो मुख्य कारण होते हैं भाई:\n1. खेत में पानी जमा रहना (जड़ में हवा न मिलना)।\n2. नाइट्रोजन या जिंक की कमी।\n\nतत्काल उपाय: नाली खोलकर फालतू पानी निकालें और 19:19:19 (1 किग्रा/एकड़) या 0.5% जिंक सल्फेट का छिड़काव करें। साथ ही लीफ डॉक्टर से कैमरे से स्कैन करें।`;
        if (dialect.id === 'haryanvi') {
          audioText = `गेहूं में 3 दिन तै पीलापन सै तो दो बात हो सकैं भाई: या तो खेत में पाणी घणा भर रया सै, या फेर नाइट्रोजन अर जिंक की कमी सै। नाली खोल के फालतू पाणी काढ़ दे अर 19:19:19 का स्प्रे कर ले!`;
        } else if (dialect.id === 'himachali') {
          audioText = `कनक च 3 दिनां तै पीलापन है तां दो गल्लां हो सकदियां भाईजी: खेत च पाणी खड़ोता है या नाइट्रोजन दी कमी। फालतू पाणी कड्डी लो ते 19:19:19 दा स्प्रे करो!`;
        } else if (dialect.id === 'punjabi_malwa' || dialect.id === 'punjabi_majha') {
          audioText = `ਕਣਕ ਵਿੱਚ 3 ਦਿਨਾਂ ਤੋਂ ਪੀਲਾਪਣ ਹੈ ਤਾਂ ਦੋ ਕਾਰਨ ਹੋ ਸਕਦੇ ਨੇ ਵੀਰ ਜੀ: ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਖੜ੍ਹ ਗਿਆ ਹੈ ਜਾਂ ਨਾਈਟ੍ਰੋਜਨ ਦੀ ਕਮੀ ਹੈ। ਵਾਧੂ ਪਾਣੀ ਕੱਢੋ ਤੇ 19:19:19 ਦਾ ਸਪਰੇਅ ਕਰੋ!`;
        }
      }

      if (writtenLangId === 'en') {
        text = isPersistent
          ? `Yellowing of wheat leaves persisting for 3 days typically indicates water stagnation (root asphyxiation) or nitrogen/zinc deficiency. Immediate action: clear drainage furrows to release standing water and spray water-soluble NPK 19:19:19 (1 kg/acre) or Zinc Sulphate. Use Leaf Doctor to scan diseased leaves.`
          : `Yellowing in crop leaves is usually caused by nitrogen shortage or excessive standing moisture. You can use Leaf Doctor to take a photo of the affected leaf for instant AI diagnosis.`;
      }

      return {
        reply: text,
        audioText,
        intent,
        appAction: {
          type: 'OPEN_LEAF_DOCTOR',
          label: '🍃 पत्ता रोग निदान (Leaf Doctor)',
        },
        suggestedQuestions: [
          'पीले पत्तों पर कौन सा स्प्रे करें?',
          'कीड़े रोकने का देशी उपाय क्या है?',
          'सिंचाई कितने दिन बाद करनी चाहिए?',
        ],
        actionableTip: 'सुबह 8 बजे से पहले 19:19:19 या जिंक सल्फेट का हल्का घोल स्प्रे करें।',
      };
    }

    case 'APP_NAVIGATION': {
      return {
        reply: 'हाँ भाई, आपके लिए यह सेक्शन खोल दिया है।',
        audioText: 'हाँ भाई, आपके लिए यह सेक्शन खोल दिया है।',
        intent,
        appAction: {
          type: 'NAVIGATE_DASHBOARD',
          label: '🚀 डैशबोर्ड पर जाएं',
        },
        suggestedQuestions: ['मौसम दिखाओ', 'खेत का विश्लेषण दिखाओ', 'मंडी भाव दिखाओ'],
      };
    }

    case 'FARMING_QUESTION': {
      let reply = `हाँ भाई, ${crop} की खेती के संबंध में पूछ रहे हैं। सही समय पर संतुलित खाद (जैसे यूरिया और डीएपी) और जरूरत के अनुसार सिंचाई देने से पैदावार 15-20% तक बढ़ जाती है।`;
      if (dialect.id === 'haryanvi') {
        reply = `हाँ भाई, ${crop} के बारे में पूछ रया सै। सही बखत पै हल्की सिंचाई अर जरूरत मुजब खाद देवेगा तो पैदावार घणी चोखी निकड़ेगी!`;
      }
      return {
        reply,
        audioText: reply,
        intent,
        suggestedQuestions: [
          'यूरिया कब डालना चाहिए?',
          'पहली सिंचाई कितने दिन बाद करें?',
          'पीले पत्तों का क्या इलाज है?',
        ],
        actionableTip: 'फसल में फूल आने या बाली निकलने की नाजुक अवस्था में पानी की कमी न होने दें।',
      };
    }

    default: {
      const fallbackOptions = [
        'हाँ भाई, मैं सुन रहा हूँ! आप मुझसे खेत, मौसम, मंडी भाव या बस आम गपशप कुछ भी कर सकते हैं। बताइए क्या बात करनी है?',
        'अरे भाई, कोई बात मन में हो तो बेझिझक बताओ। खेती-बाड़ी का कोई सवाल हो या बस हाल-चाल, मैं हमेशा हाजिर हूँ!',
        'हाँ भाई! बताइए क्या विचार है, कोई चुटकुला सुनना है, मौसम देखना है या फसल की सलाह चाहिए?',
      ];
      const selected = fallbackOptions[fallbackCounter % fallbackOptions.length];
      fallbackCounter++;

      return {
        reply: selected,
        audioText: selected,
        intent: 'GENERAL_QUESTION',
        suggestedQuestions: [
          'राम राम!',
          'तू कैसा है?',
          'एक जोक सुना दे 😄',
          'आज का मौसम कैसा रहेगा?',
        ],
      };
    }
  }
}
