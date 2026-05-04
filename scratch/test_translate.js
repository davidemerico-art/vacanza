
async function testTranslate() {
  const q = "Culla per bambini";
  const langpair = "it|en";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${langpair}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Translation:", data.responseData.translatedText);
  } catch (e) {
    console.error("Error:", e);
  }
}

testTranslate();
