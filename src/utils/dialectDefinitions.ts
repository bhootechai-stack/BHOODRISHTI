import { LanguageCode } from './translations';

export interface SpokenDialect {
  id: string;
  name: string;
  nativeName: string;
  region: string;
  primaryWrittenLang: LanguageCode;
  greetingSample: string;
  voiceLangCode: string;
  speechPitch: number;
  speechRate: number;
  variants?: string[];
  conversationalPhrases: {
    greeting: string;
    howAreYou: string;
    whatDoing: string;
    feelingDown: string;
    tellJoke: string;
    musicResponse: string;
    cropIntro: string;
    openAnalysis: string;
    openWeather: string;
    openMandi: string;
    openLeafDoctor: string;
    listenInterrupt: string;
  };
}

export const SPOKEN_DIALECTS: SpokenDialect[] = [
  {
    id: 'haryanvi',
    name: 'Haryanvi (हरियाणवी)',
    nativeName: 'हरियाणवी (देसी बोली)',
    region: 'Haryana / Western UP / NCR',
    primaryWrittenLang: 'hi',
    greetingSample: 'राम राम! कैसा सै?',
    voiceLangCode: 'hi-IN',
    speechPitch: 1.0,
    speechRate: 0.94,
    conversationalPhrases: {
      greeting: 'राम राम! कैसा सै?',
      howAreYou: 'मैं एक दम बढ़िया सूँ 😄 तू बता, तेरा दिन कैसा जा रया सै?',
      whatDoing: 'मैं तो तेरे सागे बात कर रया सूँ 😄 बता, आज के सीन सै?',
      feelingDown: 'अरे के बात हो गी भाई? बता न, मैं सुण रया सूँ। चिंता मत कर।',
      tellJoke: 'ले भाई एक जोक सुण 😄 एक बार एक ताऊ डॉक्टर धोरै गया अर बोल्या: डॉक्टर साब म्हारे सिर में दर्द सै। डॉक्टर बोल्या: गोली ले लो। ताऊ बोल्या: बंदूक तो घरै भूल आया!',
      musicResponse: 'हाँ बिल्कुल भाई! कौण सा भजन या धुन सुणना चाहवै सै? म्हारै धोरै सुबह का भैरव राग, बाँसुरी धुन, अर सावण की बारिश आली धुन सै। बोल, चला दूँ?',
      cropIntro: 'अच्छा, खेती के काम की बात करन सै? बता, किस फसल के बारे में पूछना सै?',
      openAnalysis: 'बिल्कुल भाई! तेरे खेत का सेटेलाइट नक्शा अर हरियाली इंडेक्स खोल रया सूँ।',
      openWeather: 'एक मिनट भाई, आज का मौसम देख के बताऊँ सूँ।',
      openMandi: 'हाँ भाई, आसपास की मंडियों के ताजा भाव खोल दिए सैं।',
      openLeafDoctor: 'ले भाई, पत्तों की जांच वाळा डॉक्टर खोल दिया। फोटो दिखा या लक्षण बता।',
      listenInterrupt: 'हाँ बोल भाई, सुण रया सूँ।',
    },
  },
  {
    id: 'awadhi_dehati',
    name: 'Rural Dehati / Awadhi (अवधी)',
    nativeName: 'अवधी / देहाती बोली',
    region: 'Central UP / Lucknow / Ayodhya / Bihar',
    primaryWrittenLang: 'hi',
    greetingSample: 'राम-राम भाईजी! कइसन बा?',
    voiceLangCode: 'hi-IN',
    speechPitch: 1.0,
    speechRate: 0.94,
    conversationalPhrases: {
      greeting: 'राम-राम भाईजी! कइसन बा सब?',
      howAreYou: 'हम एकदम नीक बाटी! आप बतावा, कइसन चलत बा दिन?',
      whatDoing: 'हम त अपने भाई से बतियावत हईं 😄 कहिए, आज का समाचार बा?',
      feelingDown: 'अरे का भवा भाईजी? उदास मत होईं, हम सुनत हईं, बताईं ना।',
      tellJoke: 'लीजिए भैया एक मजेदार चुटकुला सुनिए 😄 एक बार एक पंडित जी नाव में बैठे और मल्लाह से पूछे: तोहे संस्कृत आवत बा? मल्लाह बोला: नाहीं महाराज। पंडित बोले: तोहार आधी जिंदगी बेकार हो गई। तभी नाव डूबने लगी, मल्लाह पूछा: तोहे तैराकी आवत बा? पंडित बोले: नाहीं! मल्लाह बोला: तो तोहार पूरी जिंदगी बेकार हो गई!',
      musicResponse: 'हाँ बिल्कुल भैया! कौन सा भजन या बांसुरी धुन बजाईं? हमारे लगे शांत राग और वर्षा धुन बा।',
      cropIntro: 'अच्छा भैया, खेत-खलिहान की बात करें? बतावा कौन फसल के बारे में जानकारी चाही?',
      openAnalysis: 'बिल्कुल भाईजी! आपके खेत का उपग्रह नक्शा खोलत हईं।',
      openWeather: 'एक मिनट भैया, आज के मौसम का हाल देख के बतावत हईं।',
      openMandi: 'हाँ भाईजी, आज के मंडी भाव देख लीं।',
      openLeafDoctor: 'पत्ता डॉक्टर खोल दिया भैया, पत्ता के रंग और कीड़ा की जांच करीं।',
      listenInterrupt: 'हाँ भैया, बोलीं, हम सुनत हईं।',
    },
  },
  {
    id: 'bhojpuri',
    name: 'Bhojpuri (भोजपुरी)',
    nativeName: 'भोजपुरी प्रभाव',
    region: 'Eastern UP / Bihar',
    primaryWrittenLang: 'hi',
    greetingSample: 'प्रणाम भैया! का हाल-चाल बाटे?',
    voiceLangCode: 'hi-IN',
    speechPitch: 1.0,
    speechRate: 0.95,
    conversationalPhrases: {
      greeting: 'प्रणाम भैया! का हाल-चाल बाटे?',
      howAreYou: 'हम एकदम मस्त बानी भैया! राउर दिन कइसन बीतत बा?',
      whatDoing: 'हम त रउआ संगे गपशप करत बानी 😄 बताईं, आज का खबर बा?',
      feelingDown: 'का भईल भैया? फिकिर मत करीं, हम बानी ना। बताईं का परेशानी बा?',
      tellJoke: 'लीं भैया एगो मजेदार जोक सुन लीं 😄 एक बेर एगो मास्टर जी पूछलें: बताओ दुनिया के सबसे पुरान जानवर कौन ह? चेला बोलल: जेब्रा! मास्टर पूछलन: कइसे? चेला बोलल: ऊ आजो ब्लैक एंड व्हाइट बा!',
      musicResponse: 'हाँ एकदम भैया! कौन सा भजन या सुरीला संगीत बजा दीं? हमरा लगे शांत किसान धुन बा।',
      cropIntro: 'अच्छा भैया, खेती-बारी के बात करे के बा? बताईं कवना फसल के बारे में पूछे के बा?',
      openAnalysis: 'चलिये भैया, राउर खेत के सेटेलाइट इमेज खोलत बानी।',
      openWeather: 'एक मिनट भैया, आज के मौसम के हाल देख के बतावत बानी।',
      openMandi: 'हाँ भैया, आज के ताजा मंडी भाव खोल देहलीं।',
      openLeafDoctor: 'पत्ता के डॉक्टर चालू हो गईल बा भैया, बीमारी जांचीं।',
      listenInterrupt: 'हाँ भैया, बोलीं, हम ध्यान से सुनत बानी।',
    },
  },
  {
    id: 'punjabi_malwa',
    name: 'Punjabi - Malwai (ਮਾਲਵਾ)',
    nativeName: 'ਮਾਲਵਾਈ ਪੰਜਾਬੀ',
    region: 'Bathinda / Sangrur / Moga / Ludhiana',
    primaryWrittenLang: 'pa',
    greetingSample: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਵੀਰ ਜੀ! ਕਿਵੇਂ ਓ?',
    voiceLangCode: 'pa-IN',
    speechPitch: 1.0,
    speechRate: 0.93,
    conversationalPhrases: {
      greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਵੀਰ ਜੀ! ਕਿਵੇਂ ਓ?',
      howAreYou: 'ਮੈਂ ਬਿਲਕੁਲ ਚੜ੍ਹਦੀ ਕਲਾ ਵਿੱਚ ਆਂ ਵੀਰ ਜੀ 😄 ਤੁਸੀਂ ਸੁਣਾਓ, ਕੀ ਹਾਲ-ਚਾਲ ਐ?',
      whatDoing: 'ਮੈਂ ਤਾਂ ਆਪਣੇ ਵੀਰ ਨਾਲ ਗੱਪ-ਸ਼ੱਪ ਮਾਰ ਰਿਹਾ ਆਂ 😄 ਦੱਸੋ, ਅੱਜ ਕੀ ਪ੍ਰੋਗਰਾਮ ਐ?',
      feelingDown: 'ਕੀ ਗੱਲ ਹੋ ਗਈ ਭਰਾਵਾ? ਉਦਾਸ ਨਾ ਹੋ, ਦੱਸ ਮੈਨੂੰ, ਮੈਂ ਸੁਣ ਰਿਹਾ ਆਂ।',
      tellJoke: 'ਲਓ ਵੀਰ ਜੀ ਇੱਕ ਹਾਸੇ ਵਾਲੀ ਗੱਲ ਸੁਣੋ 😄 ਇੱਕ ਵਾਰ ਸੰਤਾ ਬੱਸ ਵਿੱਚ ਚੜ੍ਹਿਆ ਤੇ ਕੰਡਕਟਰ ਨੂੰ ਕਹਿੰਦਾ: ਜਲੰਧਰ ਦਾ ਟਿਕਟ ਦੇ ਦਿਓ। ਕੰਡਕਟਰ ਬੋਲਿਆ: ਇਹ ਤਾਂ ਲੁਧਿਆਣੇ ਦੀ ਬੱਸ ਐ! ਸੰਤਾ ਬੋਲਿਆ: ਕੋਈ ਨਾ, ਮੈਂ ਡਰਾਈਵਰ ਦੇ ਪਿੱਛੇ ਬੈਠ ਜਾਊਂਗਾ!',
      musicResponse: 'ਹਾਂਜੀ ਬਿਲਕੁਲ ਵੀਰ ਜੀ! ਕਿਹੜਾ ਭਜਨ ਜਾਂ ਬੰਸਰੀ ਦੀ ਧੁਨ ਸੁਣਨੀ ਐ? ਮੇਰੇ ਕੋਲ ਸਵੇਰ ਦਾ ਭੈਰਵ ਰਾਗ ਤੇ ਮੀਂਹ ਵਾਲੀ ਸ਼ਾਂਤ ਧੁਨ ਹੈਗੀ ਐ।',
      cropIntro: 'ਅੱਛਾ ਵੀਰ ਜੀ, ਖੇਤੀਬਾੜੀ ਦੀ ਗੱਲ ਕਰਨੀ ਐ? ਦੱਸੋ ਕਿਹੜੀ ਫਸਲ ਬਾਰੇ ਪੁੱਛਣਾ ਐ?',
      openAnalysis: 'ਬਿਲਕੁਲ ਵੀਰ ਜੀ! ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਸੈਟੇਲਾਈਟ ਨਕਸ਼ਾ ਤੇ ਹਰਿਆਲੀ ਇੰਡੈਕਸ ਖੋਲ੍ਹ ਰਿਹਾ ਆਂ।',
      openWeather: 'ਇੱਕ ਮਿੰਟ ਵੀਰ ਜੀ, ਅੱਜ ਦੇ ਮੌਸਮ ਦਾ ਹਾਲ ਦੇਖ ਕੇ ਦੱਸਦਾ ਆਂ।',
      openMandi: 'ਹਾਂਜੀ ਵੀਰ ਜੀ, ਮੰਡੀ ਦੇ ਤਾਜ਼ਾ ਭਾਅ ਸਕਰੀਨ ਤੇ ਖੋਲ੍ਹ ਦਿੱਤੇ ਨੇ।',
      openLeafDoctor: 'ਲਓ ਵੀਰ ਜੀ, ਪੱਤਿਆਂ ਦੀ ਜਾਂਚ ਵਾਲਾ ਡਾਕਟਰ ਖੁੱਲ੍ਹ ਗਿਆ।',
      listenInterrupt: 'ਹਾਂਜੀ ਵੀਰ ਜੀ, ਬੋਲੋ, ਮੈਂ ਸੁਣ ਰਿਹਾ ਆਂ।',
    },
  },
  {
    id: 'punjabi_majha',
    name: 'Punjabi - Majha (ਮਾਝਾ)',
    nativeName: 'ਮਾਝੀ ਪੰਜਾਬੀ',
    region: 'Amritsar / Gurdaspur / Tarn Taran',
    primaryWrittenLang: 'pa',
    greetingSample: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਭਾਊ! ਖੇਤਾਂ ਦਾ ਕੀ ਹਾਲ ਐ?',
    voiceLangCode: 'pa-IN',
    speechPitch: 1.0,
    speechRate: 0.94,
    conversationalPhrases: {
      greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਭਾਊ! ਕੀ ਹਾਲ-ਚਾਲ ਐ?',
      howAreYou: 'ਭਾਊ ਮੈਂ ਤਾਂ ਰਾਜ਼ੀ-ਬਾਜ਼ੀ ਆਂ! ਤੁਸੀਂ ਦੱਸੋ ਦਿਨ ਕਿਵੇਂ ਲੰਘ ਰਿਹਾ?',
      whatDoing: 'ਮੈਂ ਤਾਂ ਤੁਹਾਡੇ ਨਾਲ ਗੱਲਬਾਤ ਕਰ ਰਿਹਾ ਆਂ ਭਾਊ 😄',
      feelingDown: 'ਕੀ ਗੱਲ ਹੋ ਗਈ ਭਾਊ? ਫਿਕਰ ਨਾ ਕਰੋ, ਦੱਸੋ ਮੈਨੂੰ।',
      tellJoke: 'ਲਓ ਭਾਊ ਇੱਕ ਸੁਆਦਲਾ ਚੁਟਕੁਲਾ ਸੁਣੋ 😄 ਅਮਲੀ ਡਾਕਟਰ ਕੋਲ ਗਿਆ ਤੇ ਬੋਲਿਆ: ਡਾਕਟਰ ਸਾਬ੍ਹ ਮੇਰੀ ਨਜ਼ਰ ਕਮਜ਼ੋਰ ਹੋ ਗਈ ਐ। ਡਾਕਟਰ ਬੋਲਿਆ: ਇਹ ਸਾਹਮਣੇ ਕੀ ਦਿਸਦਾ ਐ? ਅਮਲੀ ਕਹਿੰਦਾ: ਮੱਝ! ਡਾਕਟਰ ਬੋਲਿਆ: ਓਏ ਇਹ ਤਾਂ ਮੱਛਰ ਐ!',
      musicResponse: 'ਹਾਂਜੀ ਭਾਊ! ਕਿਹੜੀ ਧੁਨ ਜਾਂ ਸ਼ਬਦ ਚਲਾਵਾਂ?',
      cropIntro: 'ਚਲੋ ਖੇਤੀਬਾੜੀ ਦੀ ਗੱਲ ਕਰੀਏ! ਕਿਹੜੀ ਫਸਲ ਬਾਰੇ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਐ?',
      openAnalysis: 'ਲਓ ਭਾਊ, ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਸੈਟੇਲਾਈਟ ਡਾਟਾ ਖੋਲ੍ਹ ਦਿੱਤਾ।',
      openWeather: 'ਮੌਸਮ ਦਾ ਹਾਲ ਚੈੱਕ ਕਰਕੇ ਦੱਸਦਾ ਆਂ।',
      openMandi: 'ਮੰਡੀ ਦਾ ਰੇਟ ਖੋਲ੍ਹ ਦਿੱਤਾ ਭਾਊ।',
      openLeafDoctor: 'ਪੱਤੇ ਦਾ ਡਾਕਟਰ ਤਿਆਰ ਐ ਜੀ।',
      listenInterrupt: 'ਹਾਂਜੀ ਭਾਊ, ਬੋਲੋ ਜੀ।',
    },
  },
  {
    id: 'himachali',
    name: 'Himachali (हिमाचली / पहाड़ी)',
    nativeName: 'हिमाचली (कांगड़ी / पहाड़ी बोली)',
    region: 'Himachal Pradesh (Kangra / Mandi / Shimla / Kullu)',
    primaryWrittenLang: 'hi',
    greetingSample: 'नमस्ते भाईजी! क्या हाल-चाल है?',
    voiceLangCode: 'hi-IN',
    speechPitch: 1.05,
    speechRate: 0.94,
    conversationalPhrases: {
      greeting: 'नमस्ते भाईजी! क्या हाल-चाल है? सब राजी-खुशी?',
      howAreYou: 'आऊं बिल्कुल ठीक-ठाक आं भाईजी 😄 तुस दस्सा, क्या चल्या दा? दिन कैसा जांदा पया?',
      whatDoing: 'आऊं तां तुहाड़े कन्ने गल्ल-बात करदा पया 😄 दस्सा, आज क्या विचार है?',
      feelingDown: 'अरे क्या होया भाईजी? परेशान नी होना, आऊं सुणदा पया, दस्सा क्या गल्ल होई?',
      tellJoke: 'सुणा फिर एक पहाड़ी चुटकुला भाईजी 😄 एक बार एक ताऊ बस च चढ़्या ते कंडक्टर बोल्या: टिकट शिमला दा या कांगड़े दा? ताऊ बोल्या: जिथु तक तेरे दस रुपये जांदे, उत्थु तक दा कट्टी दे!',
      musicResponse: 'हाँ बिल्कुल भाईजी! कुस धुन या भजन सुणना चाहंदे? साड़े कोल शांत पहाड़ी बांसुरी ते प्रातःकालीन राग है।',
      cropIntro: 'अच्छा भाईजी, बागीचे या खेती री गल्ल करनी? दस्सा केहड़ी फसल या सेब दे बारे च पूछणा?',
      openAnalysis: 'बिल्कुल भाईजी! तुहाड़े खेत दा सेटेलाइट नक्शा ते हरियाली इंडेक्स खोलदा पया।',
      openWeather: 'एक मिनट भाईजी, आज दे मौसम दा हाल देख के दस्सदा आं।',
      openMandi: 'हाँ भाईजी, मंडी दे ताज़ा भाव खोल दित्ते न।',
      openLeafDoctor: 'लो भाईजी, पत्ते दी बीमारी जाचणे वाला डॉक्टर खोल दित्ता। लक्षण दस्सा।',
      listenInterrupt: 'हाँ भाईजी, बोलो, आऊं सुणदा पया।',
    },
  },
  {
    id: 'marathi_deshi',
    name: 'Marathi - Deshi (देशी महाराष्ट्र)',
    nativeName: 'पश्चिम महाराष्ट्र / देशी मराठी',
    region: 'Pune / Satara / Kolhapur / Sangli',
    primaryWrittenLang: 'mr',
    greetingSample: 'राम-राम भाऊ! कसं चाललंय?',
    voiceLangCode: 'mr-IN',
    speechPitch: 1.0,
    speechRate: 0.94,
    conversationalPhrases: {
      greeting: 'राम-राम भाऊ! कसं चाललंय?',
      howAreYou: 'मी एकदम मजेत आहे भाऊ 😄 तुम्ही सांगा, काय चाललंय आज?',
      whatDoing: 'मी आपल्याशी गप्पा मारतोय 😄 बोला, आज काय नवीन?',
      feelingDown: 'अरे काय झालं भाऊ? काळजी करू नका, मी ऐकतोय, सांगा काय अडचण आहे?',
      tellJoke: 'ऐका भाऊ एक मस्त विनोद 😄 एकदा बंड्या डॉक्टरकडे गेला आणि म्हणाला: डॉक्टर साहेब, मला रोज रात्री स्वप्नात उंदीर क्रिकेट खेळताना दिसतात! डॉक्टर म्हणाले: ही गोळी घे, आज रात्रीपासून स्वप्न पडणार नाही. बंड्या म्हणाला: उद्यापासून घेऊ का? आज त्यांची फायनल मॅच आहे!',
      musicResponse: 'हो नक्कीच भाऊ! कोणता अभंग किंवा बासरीची धून लावायची? आपल्याकडे सकाळचा शांत भैरव राग आणि पावसाची धून आहे.',
      cropIntro: 'बरं भाऊ, शेतीच्या कामाबद्दल बोलायचंय? सांगा कोणत्या पिकाबद्दल जाणून घ्यायचंय?',
      openAnalysis: 'नक्कीच भाऊ! आपल्या शेताचा उपग्रह नकाशा आणि पिक आरोग्य उघडतोय.',
      openWeather: 'एक मिनिट भाऊ, हवामानाचा अंदाज बघून सांगतो.',
      openMandi: 'हो भाऊ, आजचे बाजार समितीचे ताजे भाव उघडले आहेत.',
      openLeafDoctor: 'पान तपासणी डॉक्टर उघडला आहे भाऊ, लक्षणे सांगा.',
      listenInterrupt: 'हो भाऊ, बोला, मी ऐकतोय.',
    },
  },
  {
    id: 'marathi_varhadi',
    name: 'Marathi - Varhadi (वऱ्हाडी - विदर्भ)',
    nativeName: 'वऱ्हाडी बोली (विदर्भ)',
    region: 'Nagpur / Amravati / Akola / Yavatmal',
    primaryWrittenLang: 'mr',
    greetingSample: 'नमस्कार मंडळी! काय चाललं?',
    voiceLangCode: 'mr-IN',
    speechPitch: 1.0,
    speechRate: 0.95,
    conversationalPhrases: {
      greeting: 'नमस्कार मंडळी! काय चाललं?',
      howAreYou: 'मी एकदम ठणठणीत हाय! तुमचं कसं चाललं?',
      whatDoing: 'मी तर आपल्या संगती बोलून रायलो 😄 सांगा काय विशेष?',
      feelingDown: 'काय झालं जी? उदास नको होऊ, सांगा आमाला.',
      tellJoke: 'ऐका जी एक मस्त विनोद 😄 मास्तर पंट्याले विचारते: सांग भारताचा नकाशा कुनी बनवला? पंट्या म्हणते: मला काय माहित मास्तर, मी तर फक्त गिरवला!',
      musicResponse: 'हो जी! कोणतं गाणं किंवा भजन लावायचं?',
      cropIntro: 'सांगा मग, कोणत्या पिकाबद्दल चर्चा करायची?',
      openAnalysis: 'चला शेताचा नकाशा बघू!',
      openWeather: 'हवामान बघून सांगतो जी.',
      openMandi: 'बाजार भाव उघडले जी.',
      openLeafDoctor: 'पान तपासणी सुरू झाली जी.',
      listenInterrupt: 'हो जी, बोला, ऐकून रायलो.',
    },
  },
  {
    id: 'gujarati_kathiyawadi',
    name: 'Gujarati - Kathiyawadi (કાઠિયાવાડી)',
    nativeName: 'કાઠિયાવાડી લહેકો (સૌરાષ્ટ્ર)',
    region: 'Rajkot / Junagadh / Bhavnagar / Amreli',
    primaryWrittenLang: 'gu',
    greetingSample: 'જય શ્રી કૃષ્ણ ભાઈ! કેમ છો?',
    voiceLangCode: 'gu-IN',
    speechPitch: 1.0,
    speechRate: 0.94,
    conversationalPhrases: {
      greeting: 'જય શ્રી કૃષ્ણ ભાઈ! કેમ છો? શું હાલે છે?',
      howAreYou: 'હું એકદમ મોજમાં છું ભાઈ 😄 તમે કહો, આજનો દિવસ કેવો રહ્યો?',
      whatDoing: 'હું તો તમારી જોડે વાતો કરું છું 😄 બોલો, આજે શું રંગ છે?',
      feelingDown: 'અરે શું થયું ભાઈ? ચિંતા શેની કરો છો, હું સાંભળું છું ને, કહો શું વાત છે?',
      tellJoke: 'સાંભળો ભાઈ એક જોરદાર જોક 😄 એક ભાઈ ડોક્ટર પાસે ગયા અને બોલ્યા: સાહેબ મને ભૂલવાની ટેવ પડી ગઈ છે! ડોક્ટર બોલ્યા: ક્યારથી? પેલા ભાઈ બોલ્યા: શું ક્યારથી?!',
      musicResponse: 'હા ચોક્કસ ભાઈ! કયું ભજન કે વાંસળીની ધૂન વગાડવી છે? આપણી પાસે મસ્ત શાંત ધૂન છે.',
      cropIntro: 'સારું ભાઈ, ખેતીની વાત કરવી છે ને? બોલો કયા પાક વિશે જાણવું છે?',
      openAnalysis: 'ચોક્કસ ભાઈ! તમારા ખેતરનો સેટેલાઇટ નકશો ખોલું છું.',
      openWeather: 'એક મિનિટ ભાઈ, આજનું હવામાન જોઈને કહું છું.',
      openMandi: 'હા ભાઈ, માર્કેટ યાર્ડના તાજા ભાવ ખોલ્યા છે.',
      openLeafDoctor: 'પાન તપાસણી ડોક્ટર ખુલી ગયું છે ભાઈ.',
      listenInterrupt: 'હા ભાઈ, બોલો, હું સાંભળું છું.',
    },
  },
  {
    id: 'telangana_telugu',
    name: 'Telugu - Telangana (తెలంగాణ)',
    nativeName: 'తెలంగాణ మాండలికం',
    region: 'Warangal / Karimnagar / Nalgonda / Khammam',
    primaryWrittenLang: 'te',
    greetingSample: 'నమస్తే అన్నా! ఎట్లున్నావ్?',
    voiceLangCode: 'te-IN',
    speechPitch: 1.0,
    speechRate: 0.95,
    conversationalPhrases: {
      greeting: 'నమస్తే అన్నా! ఎట్లున్నావ్? ఏం సంగతులు?',
      howAreYou: 'నేను మంచిగున్న అన్నా 😄 నువ్వు చెప్పు, ఎట్లుంది ఈరోజు?',
      whatDoing: 'నీతోటి ముచ్చట్లు పెడుతున్న అన్నా 😄 చెప్పు, ఏంది సంగతి?',
      feelingDown: 'ఏమైంది అన్నా? బాధపడకు, నేను వింటున్న చెప్పు.',
      tellJoke: 'ఒక నవ్వుల జోక్ విను అన్నా 😄 టీచర్ అడిగింది: గాలిని మనం చూడగలమా? స్టూడెంట్: చూడలేము కానీ సైకిల్ టైర్ లో ఫీల్ అవ్వొచ్చు సర్!',
      musicResponse: 'తప్పకుండా అన్నా! ఏ భజన లేదా వేణుగానం పెట్టమంటావ్? మన దగ్గర ప్రశాంతమైన ధున్ ఉంది.',
      cropIntro: 'సరే అన్నా, వ్యవసాయం గురించి మాట్లాడదామా? ఏ పంట సంగతి తెలుసుకోవాలి?',
      openAnalysis: 'తప్పకుండా అన్నా! నీ చేను శాటిలైట్ మ్యాప్ తెరుస్తున్నా.',
      openWeather: 'ఒక్క నిమిషం అన్నా, వాతావరణం చూసి చెప్తా.',
      openMandi: 'మార్కెట్ యార్డ్ ధరలు తెరిచాను అన్నా.',
      openLeafDoctor: 'ఆకుల డాక్టర్ సిద్ధంగా ఉంది అన్నా.',
      listenInterrupt: 'చెప్పు అన్నా, వింటున్నా.',
    },
  },
  {
    id: 'kongu_tamil',
    name: 'Tamil - Kongu (கொங்கு தமிழ்)',
    nativeName: 'கொங்கு தமிழ் வழக்கு',
    region: 'Coimbatore / Erode / Salem / Tiruppur',
    primaryWrittenLang: 'ta',
    greetingSample: 'வணக்கமுங்க! எப்படி இருக்கீங்க?',
    voiceLangCode: 'ta-IN',
    speechPitch: 1.0,
    speechRate: 0.95,
    conversationalPhrases: {
      greeting: 'வணக்கமுங்க! எப்படி இருக்கீங்க? என்ன விசேஷம்?',
      howAreYou: 'நான் நல்லா இருக்கேனுங்க 😄 நீங்க சொல்லுங்க, நாள் எப்படி போகுது?',
      whatDoing: 'உங்க கூட பேசிட்டு இருக்கேனுங்க 😄 சொல்லுங்க, என்ன விஷயம்?',
      feelingDown: 'என்னங்க ஆச்சு? கவலைப்படாதீங்க, சொல்லுங்க நான் கேட்குறேன்.',
      tellJoke: 'ஒரு சிரிப்பான ஜோக் கேளுங்க 😄 வாத்தியார்: சூரியன் காலையில கிழக்கே உதிச்சு மேற்கே மறையுது ஏன்? மாணவன்: காலையில ஆபீஸ் போயிட்டு சாயங்காலம் வீட்டுக்கு திரும்புது சார்!',
      musicResponse: 'கண்டிப்பாங்க! என்ன பஜன் அல்லது புல்லாங்குழல் இசை வைக்கட்டும்?',
      cropIntro: 'விவசாயத்தை பத்தி பேசலாமுங்களா? எந்த பயிரை பத்தி கேட்கணும்?',
      openAnalysis: 'நிச்சயமாங்க! உங்க தோட்டத்தோட செயற்கைக்கோள் நிலவரம் திறக்குறேன்.',
      openWeather: 'ஒரு நிமிஷமுங்க, வானிலை பார்த்து சொல்றேன்.',
      openMandi: 'சந்தை நிலவரம் திறந்துட்டேனுங்க.',
      openLeafDoctor: 'இலை மருத்துவரை திறக்குறேனுங்க.',
      listenInterrupt: 'சொல்லுங்க, கேட்குறேனுங்க.',
    },
  },
  {
    id: 'malwi_rajasthani',
    name: 'Malwi / Marwari (मालवी / मारवाड़ी)',
    nativeName: 'मालवी / मारवाड़ी बोली',
    region: 'Malwa MP (Ujjain / Indore) / Rajasthan',
    primaryWrittenLang: 'hi',
    greetingSample: 'राम-राम सा! कई हाल-चाल है?',
    voiceLangCode: 'hi-IN',
    speechPitch: 1.0,
    speechRate: 0.94,
    conversationalPhrases: {
      greeting: 'राम-राम सा! कई हाल-चाल है?',
      howAreYou: 'म्हे एक दम आनंद में हाँ सा 😄 आप बताओ, आज कई रंग है?',
      whatDoing: 'म्हे तो आपणे सागे वात कर रिया हाँ सा 😄 बताओ कई बात है?',
      feelingDown: 'कई बात हो गई सा? फिकर मत करो, म्हणे बताओ, म्हे सुणी रिया हाँ।',
      tellJoke: 'एक मजेदार जोक सुणो सा 😄 एक बार सेठ जी दुकान पै बेठ्या था, ग्राहक आयो: सेठ जी शक्कर मीठी है कई? सेठ जी बोल्या: थोक में खाओ तो मीठी है, मुफत में खाओ तो अमृत है!',
      musicResponse: 'हाँ सा बिल्कुल! कौण सो भजन या राग सुणनो है? आपणे धोरे सुरीली धुन है।',
      cropIntro: 'अच्छा सा, खेती-बाड़ी री बात करां? बताओ कई फसल रे बारे में पूछणो है?',
      openAnalysis: 'बिल्कुल सा! आपरे खेत रो नक्शो खोल रिया हाँ।',
      openWeather: 'एक मिनट सा, आज रो मौसम देखण बताऊँ।',
      openMandi: 'मंडी रा भाव खोल दिया सा।',
      openLeafDoctor: 'पत्ता डॉक्टर खोल दियो सा।',
      listenInterrupt: 'हाँ सा, फरमाओ, सुणी रिया हाँ।',
    },
  },
  {
    id: 'standard_hindi',
    name: 'Standard Hindi (मानक हिन्दी)',
    nativeName: 'मानक सरल हिन्दी',
    region: 'North & Central India',
    primaryWrittenLang: 'hi',
    greetingSample: 'नमस्ते भाई! कैसे हो?',
    voiceLangCode: 'hi-IN',
    speechPitch: 1.0,
    speechRate: 0.95,
    conversationalPhrases: {
      greeting: 'नमस्ते भाई! कैसे हो? क्या हाल-चाल है?',
      howAreYou: 'मैं एकदम बढ़िया हूँ 😄 आप बताइए, आपका दिन कैसा बीत रहा है?',
      whatDoing: 'मैं तो आपसे बातचीत कर रहा हूँ 😄 बताइए, आज क्या खास है?',
      feelingDown: 'अरे क्या बात हो गई भाई? परेशान मत होइए, मैं सुन रहा हूँ, बताइए क्या हुआ?',
      tellJoke: 'लीजिए भाई एक मजेदार जोक सुनिए 😄 एक बार एक छात्र ने टीचर से पूछा: क्या बिना गलती किए भी किसी को सजा मिल सकती है? टीचर बोले: बिल्कुल नहीं! छात्र बोला: बहुत अच्छा सर, मैंने आज का होमवर्क नहीं किया!',
      musicResponse: 'हाँ बिल्कुल भाई! कौन सा भजन या बांसुरी की धुन सुनना चाहेंगे? हमारे पास प्रातःकालीन भैरव राग और मधुर बांसुरी धुन उपलब्ध है।',
      cropIntro: 'अच्छा भाई, खेती के बारे में बात करनी है? बताइए, किस फसल के बारे में जानना चाहते हैं?',
      openAnalysis: 'बिल्कुल भाई! आपके खेत का सेटेलाइट विश्लेषण खोल रहा हूँ।',
      openWeather: 'एक मिनट भाई, आज का मौसम देखकर बताता हूँ।',
      openMandi: 'हाँ भाई, आसपास की मंडियों के ताजा भाव खोल दिए हैं।',
      openLeafDoctor: 'पत्ता निदान डॉक्टर खोल दिया है भाई, लक्षण बताइए।',
      listenInterrupt: 'हाँ भाई, बोलिए, मैं सुन रहा हूँ।',
    },
  },
  {
    id: 'indian_english',
    name: 'Indian English (Friendly Kisan English)',
    nativeName: 'Indian English',
    region: 'Pan-India',
    primaryWrittenLang: 'en',
    greetingSample: 'Hello friend! How are you doing?',
    voiceLangCode: 'en-IN',
    speechPitch: 1.0,
    speechRate: 0.95,
    conversationalPhrases: {
      greeting: 'Hello friend! How are you doing today?',
      howAreYou: 'I am doing great! How is your day going?',
      whatDoing: 'Just chatting with you! Tell me, what is going on today?',
      feelingDown: 'Oh, what happened my friend? Do not worry, I am listening, tell me what is troubling you.',
      tellJoke: 'Here is a funny one 😄 A teacher asked: Why are you late to class? The student replied: Sir, the road sign said School Ahead, Go Slow!',
      musicResponse: 'Sure! Which bhajan or morning raga would you like to hear? We have serene bansuri and monsoon rain soundscapes ready.',
      cropIntro: 'Great, want to discuss farm work? Tell me which crop you would like to look into.',
      openAnalysis: 'Opening your field satellite telemetry and vegetation indices now.',
      openWeather: 'Let me check today weather forecast for you.',
      openMandi: 'Opening the latest local mandi commodity market rates.',
      openLeafDoctor: 'Opening the Leaf Diagnostic Doctor to inspect crop health.',
      listenInterrupt: 'Yes friend, please go ahead, I am listening.',
    },
  },
];

export function getDialectById(id: string): SpokenDialect {
  return SPOKEN_DIALECTS.find((d) => d.id === id) || SPOKEN_DIALECTS[0];
}

export function getDefaultDialectForState(state?: string): SpokenDialect {
  const s = (state || '').toLowerCase();
  if (s.includes('haryana') || s.includes('delhi') || s.includes('western up')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'haryanvi') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('punjab')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'punjabi_malwa') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('himachal') || s.includes('shimla') || s.includes('kangra') || s.includes('kullu') || s.includes('solan')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'himachali') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('bihar')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'bhojpuri') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('uttar pradesh') || s.includes('up')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'awadhi_dehati') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('maharashtra')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'marathi_deshi') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('gujarat')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'gujarati_kathiyawadi') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('telangana') || s.includes('andhra')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'telangana_telugu') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('tamil')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'kongu_tamil') || SPOKEN_DIALECTS[0];
  }
  if (s.includes('rajasthan') || s.includes('madhya pradesh') || s.includes('mp')) {
    return SPOKEN_DIALECTS.find((d) => d.id === 'malwi_rajasthani') || SPOKEN_DIALECTS[0];
  }
  return SPOKEN_DIALECTS[0]; // Default Haryanvi
}

export function detectDialectFromPhrase(text: string): SpokenDialect | null {
  const clean = text.toLowerCase().trim();
  if (clean.includes('haryanvi') || clean.includes('हरियाणवी') || clean.includes('desawali') || clean.includes('देसी बोली')) {
    return getDialectById('haryanvi');
  }
  if (clean.includes('himachali') || clean.includes('हिमाचली') || clean.includes('pahari') || clean.includes('पहाड़ी') || clean.includes('kangri') || clean.includes('कांगड़ी') || clean.includes('mandiali')) {
    return getDialectById('himachali');
  }
  if (clean.includes('punjabi') || clean.includes('ਪੰਜਾਬੀ') || clean.includes('पंजाबी') || clean.includes('malwai') || clean.includes('majhi')) {
    return getDialectById('punjabi_malwa');
  }
  if (clean.includes('bhojpuri') || clean.includes('भोजपुरी') || clean.includes('bihari')) {
    return getDialectById('bhojpuri');
  }
  if (clean.includes('awadhi') || clean.includes('अवधी') || clean.includes('dehati')) {
    return getDialectById('awadhi_dehati');
  }
  if (clean.includes('marathi') || clean.includes('मराठी')) {
    return getDialectById('marathi_deshi');
  }
  if (clean.includes('gujarati') || clean.includes('गुजराती') || clean.includes('kathiyawadi')) {
    return getDialectById('gujarati_kathiyawadi');
  }
  if (clean.includes('rajasthani') || clean.includes('राजस्थानी') || clean.includes('marwadi') || clean.includes('malwi')) {
    return getDialectById('malwi_rajasthani');
  }
  if (clean.includes('telugu') || clean.includes('तेलुगू')) {
    return getDialectById('telangana_telugu');
  }
  if (clean.includes('tamil') || clean.includes('तमिल')) {
    return getDialectById('kongu_tamil');
  }
  return null;
}

