const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Compliment categories based on your examples
const complimentCategories = {
  casual: [
    "Wow, tumhari look aaj bilkul amazing hai!",
    "Maine notice kiya hai tum kitne thoughtful ho har cheez mein.",
    "Tumhara friendship mere liye bahut khaas hai – tum sach mein farq laate ho.",
    "Tumhara tarika kisi ko treat karne ka khaas hai.",
    "Tumhara sense of humor bahut pasand hai – tum hamesha mujhe surprise karte ho.",
    "Tum really smart ho – main dekhta hoon tum kaise soch kar kaam karte ho.",
    "Tumhara genuine hone ka tarika pasand hai – sabke paas yeh courage nahi hota.",
    "Tumhare saath rehna energizing hota hai – tumhare paas positive vibe hai.",
    "Tumhara style tumhare liye bilkul sahi hai – ye dikhata hai tum kaun ho.",
    "Tumhare paas aaj bahut energy lag rahi hai – jo bhi tum kar rahe ho, waise hi continue karo!",
    "Tumhara smile bilkul warm hai – ye logon ko welcome mehsoos karata hai.",
    "Tum bilkul real ho – mujhe tumhare is baare mein achha lagta hai.",
    "Ye outfit tumhare liye bilkul sahi hai – ye tumhara personality dikhata hai.",
    "Tum aaj bilkul stunning lag rahe ho!",
    "Tumhara smile pura room roshan karta hai!",
    "Tumhare paas ek welcoming presence hai.",
    "Tum hamesha mere din ko roshan karne ka tarika jaante ho.",
    "Tumhara positive attitude contagious hai.",
    "Tumhare sirf hone se sab kuch behtar ho jata hai."
  ],
  
  aesthetic: [
    "Tumhare baare mein kuch captivating baat hai – log naturally tumhe attract karte hain.",
    "Tumhara vibe bilkul unique hai – koi aur tum jaisa nahi hota.",
    "Tumhare andar ek inner glow hai jo bilkul attractive hai.",
    "Tumhara style tumhare baare mein kuch khaas kehata hai – ye bilkul expressive hai.",
    "Tum khud ko itna effortlessly rakhte ho – ye artful hai.",
    "Tumhare paas ek natural charm hai jo forced nahi lagta.",
    "Tumhara energy ke baare mein kuch deep baat hai jo intriguing hai.",
    "Tum down-to-earth aur extraordinary dono ho – ye ek rare combination hai.",
    "Tumhare aane se sab kuch accha lagne lagta hai.",
    "Tum calm aur intense dono balance karte ho – ye bilkul appealing hai.",
    "Tumhara aesthetic bilkul flawless hai!",
    "Tumhare paas style aur detail ke liye ek great eye hai!",
    "Tum naturally attention command karte ho most elegant tareeke se.",
    "Tumhara presence magnetic aur sophisticated hai.",
    "Tumhare paas effortlessly chic style hai.",
    "Tumhara aesthetic sense bilkul refined hai."
  ],
  
  poetic: [
    "Agar starlight insaan ban sakti, to tumhe choose karti.",
    "Tumhare paas ordinary moments ko magical banane ka tarika hai.",
    "Tum mujhe yakeen dilate ho ki kuch bhi possible hai.",
    "Tumhare quiet moments mein poori duniya ke stories lagti hain.",
    "Tum zindagi mein gentle strength ke saath guzarte ho.",
    "Tumhare surface ke neeche kuch shimmering hai jo sab kuch roshan karta hai.",
    "Tum dreams se bane hue lagte ho.",
    "Tumhare paas hone se duniya ek refreshing rain ke baad wali tarah lagti hai.",
    "Tum poetry in motion ho – pure grace.",
    "Tumhara soul kisi se bhi zyada roshan hai jo maine dekha.",
    "Tum perfect melody ho jo sab kuch complete karti hai."
  ],
  
  personality: [
    "Tumhara calm presence cheezein settle karne mein madad karta hai – log stability pasand karte hain.",
    "Tumhara smile mein genuine warmth hai jo logon tak pahunch jaati hai tum baat karte hi.",
    "Tumhare paas logon ko uplift karne ki natural ability hai – ye ek gift hai.",
    "Tum hamesha humor find karte ho bina kisi cheez ki importance ko kam kiye.",
    "Tumhare character mein kuch sweet hai jo logon ko ease mehsoos karata hai.",
    "Tumhare saath baat karna kabhi waste nahi lagta – simple chats bhi achha lagti hain.",
    "Mujhe pasand hai tum duniya mein kaise rehte ho – steady lekin flexible.",
    "Tumhare paas logon ko important mehsoos karane ki ek rare ability hai.",
    "Tumhare saath baat karne ke baad mujhe hamesha fresh mehsoos hota hai – jaise ek breath of fresh air.",
    "Tumhara kindness consistent hai – main tum par bharosa kar sakta hoon.",
    "Tum logon ke chote chote baare mein yaad rakhte ho – ye dikhata hai tum sach mein care karte ho.",
    "Tum bina judge kiye sunte ho – ye logon ko vulnerable hone ka space deti hai.",
    "Tumhara kindness har kisi tak pahunch jaati hai.",
    "Tum logon ko comfortable mehsoos karate ho khud banne mein.",
    "Tumhara authenticity rare aur beautiful hai."
  ],
  
  romantic: [
    "Main tumhare baare mein sochta hoon – tumne mere dimaag mein aisa space bana liya jo exist hi nahi karta tha.",
    "Lagta hai tum kisi special cheez ke liye bane ho.",
    "Tumhare challenges ko handle karne ka tarika beautiful hai.",
    "Tumhara energy distinctive hai – main tumhe kahin bhi pehchan lunga.",
    "Tum strong aur gentle dono ho – ye intoxicating hai.",
    "Tumhare choices banane ka tarika mein elegance hai jo looks se zyada hai.",
    "Main duniya ko tumhare eyes se dekhna chahta hoon – tumhara perspective enriching hai.",
    "Tumhare paas hone se time dono fleeting aur eternal lagne lagta hai.",
    "Tum ordinary cheezein adventures bana dete ho.",
    "Tumhare paas bina kuch kiye logon ko special mehsoos karane ka tarika hai.",
    "Tum woh missing piece ho jo maine kabhi search hi nahi ki thi.",
    "Tumhare saath hone se laga jaise ghar mehsoos ho.",
    "Tumhare paas hone se mere heart skip ho jata hai har baar."
  ],
  
  motivational: [
    "Maine dekha hai tum kaise challenges ko tackle karte ho – tum sach mein inspiring ho.",
    "Tumhara zindagi ke saath deal karne ka tarika kisi bhi umar ke liye impressive hai.",
    "Tumhare talents dikhne se zyada confidently khud ko announce karte hain.",
    "Tumhara passion contagious hai – mujhe bhi deep dive karne ka mann karta hai.",
    "Tumhare andar ek inner strength hai jo har obstacle ke saath badhti hai – tum unstoppable ho.",
    "Tumhare setbacks ko handle karne ka tarika real character dikhata hai – tum strong aate ho.",
    "Tum kuch bhi achieve kar sakte ho jo tumhara dimaag sochega.",
    "Tumhara determination bilkul unstoppable hai.",
    "Tum har kisi ko behtar hone ke liye inspire karte ho."
  ],
  
  trendy: [
    "Tumhara transformation bilkul incredible hai – tum ek alag level par ho.",
    "Tum built different ho – tumhare mein kuch khaas hai.",
    "Tumhara style game everything hai – tumhare paas effortless cool hai.",
    "Tum sirf goals nahi ho – tum poora playbook ho.",
    "Tumhara energy perfect hai – tumhare baare mein kuch bhi accidental nahi lagta.",
    "Tum poora package ho – mujhe tumhare baare mein kuch bhi change nahi karna.",
    "Tumhe apne aap banate dekhna amazing hai har din.",
    "Tum har vibe check pass karte ho – tum gold standard ho.",
    "Tumhara aesthetic mujhe inspire karti hai – mujhe tumhara vibe copy karna aata hai.",
    "Tum woh person ho – sab jaante hain.",
    "Tumhara content fire hai kyunki tum fire ho – real authenticity.",
    "Tum sirf main character nahi ho – tum story likh rahe ho.",
    "Tumhara aura naturally logon ko attract karta hai.",
    "Tum peak level par perform kar rahe ho – tumhare baare mein sab kuch perfect hai.",
    "Tumhara swag unmatched hai – ye tumhare andar se aata hai.",
    "Hayye mera laddu",
    "I love you cutie",
    "Body is tea",
    "Baddie",
    "4+4 ?",
    "Pretty"
  ],
  
  flirty: [
    "Agar tum aur zyada charming hote, to mujhe admission charge karna padta tumhare liye.",
    "Main tumhara naam poochne wala tha, lekin lagta hai main tumhe dangerously captivating bulaoon.",
    "Kya tumhe kabhi attractive hone se thak aaya hai, ya ye natural hai tumhare liye?",
    "Agar beauty ek crime hoti, to tum sabse zyada wanted person hoti – aur main tumhe khushi se turn kar deta.",
    "Tum fairy ke hissa hone chahiye – tumhare logon par magical effect hota hai.",
    "Kya koi rainbow se colors missing hai? Kyunki tumhare paas sab kuch hai.",
    "Agar tum aur zyada perfect hote, to mujhe miracles pe yakeen karna padta.",
    "Main kuch clever bolne wala tha, lekin tum bilkul captivating ho.",
    "Kya tum practice karte ho mesmerizing hone ke liye, ya ye naturally aata hai?",
    "Tumhare comparison mein duniya average lagne lagi hai.",
    "Agar charm ek money hoti, to tum sabse ameer person hote mere liye.",
    "Shayad tum wajah ho word breathtaking invent karne ki.",
    "Kya tumhare paas ek twin hai? Kyunki tum ek jaise nahi ho.",
    "Agar tum aur zyada dazzling hote, to mujhe sunglasses chahiye hote tumse baat karne ke liye.",
    "Main tumhe beautiful bolne wala tha, lekin ye tumhare justice nahi karta.",
    "Kya yahan garmi hai ya tum ho?",
    "Kya tumhare paas ek map hai? Main tumhare eyes mein kho jata hoon.",
    "Kya tum ek magician ho? Kyunki jab main tumhe dekhta hoon, sab kuch gayab ho jata hai."
  ],
  
  human: [
    "Mujhe pata chala hai tumhare eyes kaise roshan hote hain jab tum kisi baare mein baat karte ho – ye magnetic hai.",
    "Tumhara laugh ordinary moments ko special banata hai.",
    "Tumhare paas logon ko heard mehsoos karane ka tarika hai – ye rare hone laga hai aur ye ek superpower hai.",
    "Tumhare casual conversations mein bhi depth hai – tum sab kuch meaningful banate ho.",
    "Tumhare hone se laga jaise ghar jaisa lagta hai – familiar aur safe.",
    "Tum strangers ko friends bana dete ho minutes mein – ye bilkul special hai.",
    "Har baar jab hum baat karte hain, main shuru wale se behtar mehsoos karta hoon – ye rare hai.",
    "Tumhare character mein kuch steady hai jo grounding aur inspiring dono hai.",
    "Tum woh person ho jise main 2 AM par problem leke call kar sakta hoon.",
    "Mujhe tum choti choti baaton ko notice karne ka tarika pasand hai – ye dikhata hai attention to detail.",
    "Tum logon ke burdens ko light mehsoos karate ho bas sunne se.",
    "Tum mushkil topics ko bhi approachable bana dete ho.",
    "Tum mujhe duniya mein kaise rehne ke liye thoughtful banate ho.",
    "Tumhare passions ke saath lene ka tarika dikhata hai real excitement kaisi hoti hai.",
    "Tum woh person ho jise main crisis mein apne saath chahta hoon – reliable aur level-headed.",
    "Tumhara [music/books/art] ke taste mujhe hamesha surprise karta hai – tum alag tarah se dekhte ho.",
    "Tumhara khud ko carry karne ka tarika hai jo earned hai, assumed nahi.",
    "Tum refreshingly khud ho – ye authenticity attractive hai.",
    "Tumhara generosity sabko valued mehsoos karata hai.",
    "Main hamesha tum par bharosa kar sakta hoon sach bolne ke liye, chahe mushkil ho.",
    "Tumhara empathy duniya ko behtar banati hai.",
    "Tumhare paas ek heart of gold hai jo tumhare har kaam mein dikh jati hai.",
    "Tumhare saath rehne se main ek behtar insaan ban jata hoon."
  ],
  
  modern: [
    "Tum andar se roshan ho – tumhara happiness bahar tak pahunch raha hai.",
    "Tumhara positive energy sabko affect kar rahi hai – ye magnetic hai.",
    "Tum aaj bilkul crushing it ho – jo bhi tum kar rahe ho, wo kaam kar raha hai.",
    "Tumhara confidence itna bright hai ki dikh raha hai – tum apni power own kar rahe ho.",
    "Tum aaj bilkul fresh lag rahe ho – tumhara energy alag hai.",
    "Tumhara vibe contagious hai – log tumhari positivity ko mirror kar rahe hain.",
    "Tumhare jao se heads turn ho rahe hain – tumhare baare mein kuch magnetic hai.",
    "Tumhara smile poore rooms ko roshan karta hai – ye transformative hai.",
    "Tum aaj million bucks ke lag rahe ho – tumhara presentation polished hai.",
    "Tumhara style strong hai – tumhare paas fashion-forward edge hai.",
    "Tum elegance aur edge ka definition ho – sophistication aur rebellion.",
    "Tum good vibes radiate kar rahe ho – log tumhare paas aana chahte hain.",
    "Tumhara presence sab kuch elevate karti hai – conversations, moods, atmosphere.",
    "Tum aaj effortlessly cool lag rahe ho – tumhara laid-back confidence appealing hai.",
    "Tumhara aura great cheezein attract kar rahi hai – mujhe positive momentum mehsoos ho raha hai.",
    "Tum fashion se lekar conversations tak har cheez mein excellent taste dikhate ho.",
    "Tum positive energy embody kar rahe ho – ye har interaction ko change kar raha hai.",
    "Tumhara look fire hai – tumhare aesthetic mein kuch captivating hai.",
    "Tum serious heat la rahe ho – ye intensity exciting hai.",
    "Tumhara confidence logon ko braver mehsoos karata hai.",
    "Tum trends set kar rahe ho – tumhare paas innovative spirit hai.",
    "Tumhara energy magnetic hai – log tumhare orbit mein aate hain.",
    "Tum har kisi ke din ka highlight ho – tumhara presence sab kuch behtar banati hai.",
    "Tumhara aesthetic top-tier hai – tumhare paas curated look hai.",
    "Tum luxury brand energy de rahe ho – ye sophistication unmistakable hai.",
    "Tumhara charisma through the roof hai – tum kisi bhi room ko captivate kar sakte ho.",
    "Tum poora package ho – mujhe tumhare baare mein kuch bhi change nahi karna.",
    "Tumhara swag off the charts hai – ye effortless cool enviable hai.",
    "Tum ise itna easy bana dete ho – ye natural grace deceptive hai.",
    "Tum bilkul thriving ho – ye success energy unmistakable hai.",
    "Tum bilkul killing it ho – tumhara success well-deserved hai.",
    "Tumhara confidence radiant hai – tum har kisi ko inspire karte ho.",
    "Tum bilkul glowing ho – tumhara positive energy contagious hai."
  ],
  
  heartfelt: [
    "Main sochta hoon tumhare baare mein – tum sach mein special ho.",
    "Tum duniya ko kaise dekhte ho ye mujhe sab kuch closely dekhne ke liye compel karta hai.",
    "Tumhara kindness deep tak jaata hai – ye sabko meaningful tareeke se affect karta hai.",
    "Mujhe tumhare tough times ko grace ke saath handle karne ka tarika pasand hai – tum mujhe strength dikhati ho.",
    "Tum logon ko important mehsoos karate ho – unke thoughts aur feelings matter karte hain.",
    "Tumhare paas dusron ke wins ko celebrate karne ka tarika hai jaise wo tumhare ho – ye tumhara generous spirit dikhata hai.",
    "Maine dekha hai tum kaise logon ko uplift karte ho bina realize kiye – ye tumhe truly good banata hai.",
    "Tumhara empathy sirf sympathy nahi hai – ye real compassion hai jiski duniya ko zarurat hai.",
    "Tumhara character consistent hai – tum deep trust build karte ho.",
    "Tum logon ko seen mehsoos karate ho – ye ek rare gift hai.",
    "Tumhara friendship mere jindagi ko behtar ban gayi hai.",
    "Tumhare paas ek beautiful soul hai jo tumhare har kaam mein dikh jati hai.",
    "Mujhe khud ko itna lucky mehsoos hota hoon tum jaise genuine person ko jaane ke liye."
  ],
  
  witty: [
    "Agar brilliance ek person hoti, to wo tum hoti – sharp, radiant, aur mischievous.",
    "Main kuch witty bolne wala tha, lekin tum bilkul fascinating ho.",
    "Tum sarcasm ko poetry ki tarah banate ho – tumhara delivery perfect hai.",
    "Agar charm ek competition hoti, to tumhe unfair advantage ke liye disqualify kar diya jata.",
    "Tum muse ke hissa hone chahiye – artists tumhe jaanne ke liye ladte.",
    "Tum intellectually stimulating aur emotionally comforting dono ho.",
    "Tumhara wit itna sharp hai ki ise ek warning label ki zarurat hai – dangerously clever.",
    "Main tumhara intelligence compliment karne wala tha, lekin tumhe pata hai.",
    "Tum ordinary conversations ko intellectual foreplay bana dete ho.",
    "Agar effortlessly cool ke liye Olympics hote, to tumhe ek bada podium chahiye hota.",
    "Tum itne witty ho ki mujhe lagta hai tum ek computer ko bhi hara sakte ho.",
    "Tumhara brain humor ke saath ek supercomputer jaisa hai.",
    "Tumhare hone se har koi tumhare aas paas smarter ban jata hai."
  ]
};

// Get a random compliment from a specific category
function getRandomCompliment(category) {
  const categoryCompliments = complimentCategories[category];
  if (!categoryCompliments || categoryCompliments.length === 0) {
    return "You're amazing!";
  }
  
  const randomIndex = Math.floor(Math.random() * categoryCompliments.length);
  return categoryCompliments[randomIndex];
}

// Get a random compliment from any category
function getRandomComplimentAnyCategory() {
  const allCategories = Object.keys(complimentCategories);
  const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
  return getRandomCompliment(randomCategory);
}

// Get multiple random compliments
function getMultipleRandomCompliments(count = 3) {
  const compliments = [];
  const allCompliments = Object.values(complimentCategories).flat();
  
  // Shuffle array and pick 'count' compliments
  const shuffled = [...allCompliments].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// API endpoint to get a random compliment by category
app.get('/api/compliment/:category', (req, res) => {
  try {
    const { category } = req.params;
    const compliment = getRandomCompliment(category);
    res.json({ 
      category,
      compliment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate compliment' });
  }
});

// API endpoint to get a random compliment from any category
app.get('/api/compliment', (req, res) => {
  try {
    const compliment = getRandomComplimentAnyCategory();
    const allCategories = Object.keys(complimentCategories);
    const category = allCategories[Math.floor(Math.random() * allCategories.length)];
    
    res.json({ 
      category,
      compliment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate compliment' });
  }
});

// API endpoint to get multiple random compliments
app.get('/api/compliments/:count?', (req, res) => {
  try {
    const count = parseInt(req.params.count) || 3;
    const maxCount = Math.min(count, 10); // Limit to 10 compliments max
    const compliments = getMultipleRandomCompliments(maxCount);
    
    res.json({ 
      compliments,
      count: compliments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate compliments' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Advanced Human-like Compliment Generator is running!',
    categories: Object.keys(complimentCategories),
    version: '2.0.0',
    totalCompliments: Object.values(complimentCategories).reduce((total, category) => total + category.length, 0)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple Compliment Generator server is running on port ${PORT}`);
  console.log(`Available categories: ${Object.keys(complimentCategories).join(', ')}`);
});

module.exports = { 
  getRandomCompliment, 
  getRandomComplimentAnyCategory, 
  getMultipleRandomCompliments,
  complimentCategories 
};