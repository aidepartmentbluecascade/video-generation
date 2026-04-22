import { useState, useRef, useCallback } from "react";

const ACTIONS = [
  { id: "break", emoji: "🤌", label: "Break Chocolate", desc: "Two fingers slowly breaking chocolate in half with a satisfying snap", prompt: "two realistic human fingers slowly breaking this exact chocolate product in half, revealing the inner texture with a satisfying snap, small chocolate crumbs falling" },
  { id: "snap", emoji: "🍫", label: "Snap a Piece", desc: "Fingers snapping off a corner piece", prompt: "fingers delicately snapping off a corner piece from this chocolate, with a clean break line visible, tiny fragments scattering" },
  { id: "bite", emoji: "😋", label: "Take a Bite", desc: "Someone taking a slow satisfying bite", prompt: "a person taking a slow, satisfying bite of this exact chocolate, revealing the rich inside texture, lips and teeth visible in close-up" },
  { id: "melt", emoji: "🫠", label: "Melt & Pour", desc: "Melted chocolate poured slowly", prompt: "warm melted version of this chocolate being poured in a slow, thick, glossy stream, creating beautiful ripples as it pools" },
  { id: "touch", emoji: "✋", label: "Touch & Feel", desc: "Fingers pressing and feeling texture", prompt: "fingers gently pressing and running across the surface of this chocolate, showing the texture details, slight indentation from finger pressure" },
  { id: "cut", emoji: "🔪", label: "Cut & Slice", desc: "Knife cutting revealing layers", prompt: "a sharp knife slowly cutting through this chocolate, revealing beautiful cross-section layers inside, smooth clean cut" },
  { id: "unbox", emoji: "🎁", label: "Unbox & Reveal", desc: "Hands opening gift box revealing chocolates", prompt: "hands slowly lifting a gift box lid to reveal these chocolates arranged beautifully inside, with a moment of pause showing the full display" },
  { id: "drizzle", emoji: "💧", label: "Chocolate Drizzle", desc: "Liquid chocolate drizzling in slow-mo", prompt: "liquid melted chocolate being drizzled in slow motion over this chocolate product, creating glossy streaks and patterns" },
  { id: "dip", emoji: "🍓", label: "Dip Something", desc: "Dipping a strawberry or biscuit", prompt: "a fresh strawberry being slowly dipped into melted chocolate made from this product, chocolate coating the strawberry smoothly as it's lifted" },
  { id: "arrange", emoji: "📦", label: "Arrange Display", desc: "Hands arranging chocolates elegantly", prompt: "hands elegantly arranging these chocolates into a beautiful gift tray formation, adjusting each piece with care and precision" },
];

const STYLES = [
  { id: "macro", label: "Extreme Close-up", desc: "Macro lens feel", prompt: "extreme close-up macro shot" },
  { id: "medium", label: "Medium Shot", desc: "Hands + product visible", prompt: "medium shot showing hands and full product" },
  { id: "topdown", label: "Top-Down View", desc: "Bird's eye perspective", prompt: "top-down bird's eye view" },
  { id: "cinematic", label: "Cinematic 45°", desc: "Dramatic angle", prompt: "cinematic 45-degree angle with dramatic depth" },
];

const LIGHTING = [
  { id: "golden", label: "Warm Golden", color: "#D4A017", prompt: "warm golden ambient lighting, cozy premium atmosphere" },
  { id: "dark", label: "Dramatic Dark", color: "#2C1810", prompt: "dramatic low-key lighting with deep shadows, luxury mysterious mood" },
  { id: "bright", label: "Bright & Clean", color: "#FFF8E1", prompt: "bright clean studio lighting, fresh and appetizing" },
  { id: "sunset", label: "Sunset Warm", color: "#E8734A", prompt: "warm sunset-toned lighting, romantic gifting mood" },
];

const BACKGROUNDS = [
  { id: "marble", label: "Marble Surface", prompt: "on a polished white marble surface" },
  { id: "wood", label: "Wooden Table", prompt: "on a rustic dark wooden table" },
  { id: "velvet", label: "Dark Velvet", prompt: "on a luxurious dark velvet cloth" },
  { id: "kitchen", label: "Kitchen Counter", prompt: "on a clean home kitchen counter" },
  { id: "eid", label: "Eid Decorated", prompt: "on an Eid-themed decorated surface with crescent moon and star elements" },
  { id: "gradient", label: "Plain Gradient", prompt: "on a smooth dark gradient background" },
];

const SPEEDS = [
  { id: "ultra", label: "Ultra Slow-Mo", prompt: "ultra slow motion, 120fps feel" },
  { id: "slow", label: "Slow Motion", prompt: "slow motion, 60fps feel" },
  { id: "normal", label: "Normal Speed", prompt: "normal natural speed" },
  { id: "ramp", label: "Speed Ramp", prompt: "speed ramp — starts ultra slow then transitions to normal speed" },
];

const DURATIONS = [
  { id: "3", label: "3 sec", sub: "Story" },
  { id: "5", label: "5 sec", sub: "Quick Reel" },
  { id: "10", label: "10 sec", sub: "Standard Reel" },
  { id: "15", label: "15 sec", sub: "Detailed Reel" },
];

export default function ChocoVision() {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const [step, setStep] = useState(0);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedLighting, setSelectedLighting] = useState(null);
  const [selectedBg, setSelectedBg] = useState(null);
  const [selectedSpeed, setSelectedSpeed] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [captionLang, setCaptionLang] = useState(null);
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  const [videoError, setVideoError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFilename, setVideoFilename] = useState("asmr-chocolate.mp4");
  const fileRef = useRef(null);

  const handleImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const generatePrompt = () => {
    const action = ACTIONS.find((a) => a.id === selectedAction);
    const style = STYLES.find((s) => s.id === selectedStyle);
    const light = LIGHTING.find((l) => l.id === selectedLighting);
    const bg = BACKGROUNDS.find((b) => b.id === selectedBg);
    const speed = SPEEDS.find((s) => s.id === selectedSpeed);
    const dur = DURATIONS.find((d) => d.id === selectedDuration);

    const prompt = `Generate an ultra-photorealistic ASMR chocolate commercial video with natural physics and zero CGI look.

ACTION DIRECTION:
${action.prompt}

SHOT LANGUAGE:
- Camera style: ${style.prompt}
- Lighting: ${light.prompt}
- Background: ${bg.prompt}
- Motion timing: ${speed.prompt}
- Target length: ${dur.label}

REALISM LOCK (VERY IMPORTANT):
- The chocolate must match the uploaded reference product EXACTLY: same geometry, garnish placement, surface texture, color tone, thickness, and edges
- Preserve realistic imperfections: tiny cracks, fingerprints, crumbs, slight unevenness, and subtle gloss variation
- Hands must look like real human hands (South Asian skin tone), with authentic skin pores, knuckle folds, nail beds, micro-wrinkles, and natural tendon movement
- Real contact physics only: accurate pressure deformation, believable snap resistance, crumbs obey gravity, realistic chocolate viscosity when melting
- Food cinematography look: macro lens feel, shallow depth of field, natural lens breathing, soft bokeh, realistic specular highlights
- Premium 4K capture quality, crisp focus on contact points, no jitter, no motion warping

ASMR FEEL THROUGH VISUALS:
- Emphasize moments that imply satisfying sound: crack initiation, clean break, crumb scatter, sticky pull, glossy drizzle ribbon, gentle bite compression
- Keep movements deliberate and slow, with smooth acceleration and deceleration

NEGATIVE CONSTRAINTS (DO NOT DO):
- No cartoon, no illustration, no plastic texture, no waxy surfaces
- No fake/AI-looking hands, no extra fingers, no finger morphing, no anatomy distortion
- No object melting artifacts, no shape drifting, no identity change of the chocolate
- No over-sharpened halos, no unrealistic glow, no flicker, no frame-to-frame inconsistency

MOOD:
Premium handmade chocolate brand, warm, intimate, appetizing, irresistible, luxury food-ad style.`;

    setGeneratedPrompt(prompt);
    setStep(6);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const generateCaption = (lang) => {
    setCaptionLang(lang);
    const action = ACTIONS.find((a) => a.id === selectedAction)?.label || "";
    const captions = {
      urdu: `✨ گھر کی بنی ہوئی چاکلیٹ — ہر ٹکڑے میں محبت 🍫

آج ہی آرڈر کریں — صرف ایک میسج دور!

📱 واٹس ایپ پر آرڈر کریں
🚗 ملتان میں فری ڈلیوری

#گھرکیچاکلیٹ #ملتانی_چاکلیٹ #HomemadeChocolate #MultaniChocolate #ChocolateLovers #ASMR #ASMRChocolate #SatisfyingVideos #PakistaniChocolate #DesiFoodie #عید_تحفہ #چاکلیٹ #EidGifts #MultanFood #ChocolateASMR #GiftBox #HandmadeChocolate`,
      english: `✨ Handcrafted with love, one piece at a time 🍫

Our homemade chocolates — made fresh in Multan, delivered to your doorstep.

📱 WhatsApp to order
🚗 Free delivery in Multan

${action === "Unbox & Reveal" ? "🎁 Custom gift boxes available for Eid, weddings & birthdays!" : "😍 One bite and you'll be hooked!"}

#HomemadeChocolate #MultaniChocolate #ChocolateLovers #ASMR #ASMRChocolate #SatisfyingVideos #PakistaniChocolate #DesiFoodie #EidGifts #MultanFood #ChocolateASMR #HandmadeWithLove #GiftBox #ChocolateInMultan #FoodPorn #Foodstagram`,
      saraiki: `✨ گھر دی بنائی ہوئی چاکلیٹ — ہر ٹکڑے وچ پیار 🍫

اج ای آرڈر کرو — بس اک میسج!

📱 واٹس ایپ تے آرڈر کرو
🚗 ملتان اچ مفت ڈلیوری

#ملتانی_چاکلیٹ #گھرکیچاکلیٹ #سرائیکی #HomemadeChocolate #MultaniChocolate #Multan #ASMR #ChocolateLovers #PakistaniFood #DesiFoodie #EidGifts`,
    };
    setGeneratedCaption(captions[lang] || "");
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        const base64 = result.split(",")[1];
        if (!base64) {
          reject(new Error("Could not read image as base64."));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const parseVideoUriFromOperation = (operation) =>
    operation?.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
    operation?.response?.generatedVideos?.[0]?.video?.uri ||
    operation?.response?.generatedSamples?.[0]?.video?.uri ||
    "";

  const parseOperationError = (operation) =>
    operation?.error?.message ||
    operation?.error?.details?.[0]?.message ||
    operation?.error?.status ||
    "";

  const generateVideoWithGemini = async () => {
    if (!GEMINI_API_KEY) {
      setVideoError("Missing API key. Add VITE_GEMINI_API_KEY in .env and restart the app.");
      return;
    }
    if (!imageFile) {
      setVideoError("Please upload a chocolate image first.");
      return;
    }
    if (!generatedPrompt.trim()) {
      setVideoError("Generate your prompt first.");
      return;
    }

    try {
      setIsGeneratingVideo(true);
      setVideoError("");
      setVideoStatus("Preparing image...");
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl("");
      }

      const base64Image = await fileToBase64(imageFile);
      const mimeType = imageFile.type || "image/jpeg";
      setVideoStatus("Submitting video generation request to Gemini...");
      const createResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: generatedPrompt,
                image: {
                  bytesBase64Encoded: base64Image,
                  mimeType,
                },
              },
            ],
            parameters: {
              sampleCount: 1,
              resolution: "720p",
              aspectRatio: "9:16",
            },
          }),
        }
      );

      const createJson = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(createJson?.error?.message || "Failed to start video generation.");
      }

      const operationName = createJson?.name;
      if (!operationName) {
        throw new Error("No operation id returned from Gemini.");
      }

      let operation = createJson;
      let pollCount = 0;
      while (!operation.done && pollCount < 90) {
        pollCount += 1;
        setVideoStatus(`Generating video... (${pollCount * 10}s)`);
        await new Promise((resolve) => setTimeout(resolve, 10000));

        const pollResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
          {
            headers: {
              "x-goog-api-key": GEMINI_API_KEY,
            },
          }
        );
        operation = await pollResponse.json();
        if (!pollResponse.ok) {
          throw new Error(operation?.error?.message || "Failed while polling video generation.");
        }
        const operationError = parseOperationError(operation);
        if (operationError) {
          throw new Error(operationError);
        }
      }

      if (!operation.done) {
        throw new Error("Generation is taking too long. Please try again.");
      }

      const videoUri = parseVideoUriFromOperation(operation);
      if (!videoUri) {
        throw new Error("Video generation finished but no video URL was returned.");
      }

      setVideoStatus("Downloading generated video...");
      const downloadResponse = await fetch(videoUri, {
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
        },
      });
      if (!downloadResponse.ok) {
        throw new Error("Generated video could not be downloaded.");
      }

      const blob = await downloadResponse.blob();
      const extension = blob.type.includes("webm") ? "webm" : "mp4";
      const fileName = `asmr-chocolate-${Date.now()}.${extension}`;
      setVideoFilename(fileName);
      setVideoUrl(URL.createObjectURL(blob));
      setVideoStatus("Video ready!");
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Unexpected error while generating video.");
      setVideoStatus("");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setStep(0); setImage(null); setImageFile(null);
    setSelectedAction(null); setSelectedStyle(null);
    setSelectedLighting(null); setSelectedBg(null);
    setSelectedSpeed(null); setSelectedDuration(null);
    setGeneratedPrompt(""); setGeneratedCaption(""); setCaptionLang(null);
    setIsGeneratingVideo(false); setVideoStatus(""); setVideoError("");
    setVideoUrl(""); setVideoFilename("asmr-chocolate.mp4");
  };

  const canProceed = () => {
    if (step === 0) return !!image;
    if (step === 1) return !!selectedAction;
    if (step === 2) return !!selectedStyle;
    if (step === 3) return !!selectedLighting && !!selectedBg;
    if (step === 4) return !!selectedSpeed;
    if (step === 5) return !!selectedDuration;
    return true;
  };

  const stepLabels = ["Upload", "Action", "Camera", "Scene", "Speed", "Duration", "Prompt"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #1A0E0A 0%, #2C1810 40%, #1A0E0A 100%)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#FFF8E1",
      padding: "0",
      margin: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #3E2723 0%, #2C1810 100%)",
        borderBottom: "2px solid #D4A01740",
        padding: "20px 24px",
        textAlign: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(10px)",
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "26px",
          fontWeight: 800,
          background: "linear-gradient(135deg, #D4A017, #F5D77A, #D4A017)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "2px",
        }}>
          🍫 CHOCOVISION
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#D4A01799", letterSpacing: "3px", textTransform: "uppercase" }}>
          AI ASMR Video Prompt Generator
        </p>
      </div>

      {/* Progress */}
      <div style={{ padding: "16px 20px 0", display: "flex", gap: "4px", alignItems: "center" }}>
        {stepLabels.map((label, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              height: "4px",
              borderRadius: "2px",
              background: i <= step
                ? "linear-gradient(90deg, #D4A017, #F5D77A)"
                : "#3E272350",
              transition: "all 0.4s ease",
            }} />
            <span style={{
              fontSize: "9px",
              color: i <= step ? "#D4A017" : "#5A3A28",
              marginTop: "4px",
              display: "block",
              fontWeight: i === step ? 700 : 400,
            }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>

        {/* STEP 0: Upload */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "#F5D77A" }}>
              Upload Your Chocolate
            </h2>
            <p style={{ color: "#A08060", fontSize: "14px", marginBottom: "20px" }}>
              Take a clear photo of your chocolate product
            </p>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #D4A01760",
                borderRadius: "16px",
                padding: image ? "12px" : "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: "#2C181040",
                transition: "all 0.3s",
                minHeight: image ? "auto" : "200px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              {image ? (
                <div>
                  <img src={image} alt="Chocolate" style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px #00000060",
                  }} />
                  <p style={{ color: "#D4A017", fontSize: "13px", marginTop: "12px" }}>
                    ✓ Image loaded — tap to change
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>📸</div>
                  <p style={{ color: "#D4A017", fontSize: "16px", fontWeight: 600 }}>
                    Tap to upload or drag & drop
                  </p>
                  <p style={{ color: "#A08060", fontSize: "12px", marginTop: "4px" }}>
                    JPG, PNG, WEBP supported
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Action */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "#F5D77A" }}>
              Choose ASMR Action
            </h2>
            <p style={{ color: "#A08060", fontSize: "14px", marginBottom: "16px" }}>
              What should happen to your chocolate in the video?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {ACTIONS.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAction(a.id)}
                  style={{
                    padding: "14px 12px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: selectedAction === a.id ? "2px solid #D4A017" : "2px solid #3E272340",
                    background: selectedAction === a.id
                      ? "linear-gradient(135deg, #3E2723, #4A2C20)"
                      : "#2C181030",
                    transition: "all 0.2s",
                    transform: selectedAction === a.id ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <div style={{ fontSize: "24px" }}>{a.emoji}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF8E1", marginTop: "4px" }}>{a.label}</div>
                  <div style={{ fontSize: "11px", color: "#A08060", marginTop: "2px", lineHeight: "1.3" }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Camera Style */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "#F5D77A" }}>
              Camera Style
            </h2>
            <p style={{ color: "#A08060", fontSize: "14px", marginBottom: "16px" }}>
              How should the video be shot?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {STYLES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: selectedStyle === s.id ? "2px solid #D4A017" : "2px solid #3E272340",
                    background: selectedStyle === s.id ? "linear-gradient(135deg, #3E2723, #4A2C20)" : "#2C181030",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "10px",
                    background: selectedStyle === s.id ? "#D4A01720" : "#3E272330",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px",
                  }}>
                    {s.id === "macro" ? "🔍" : s.id === "medium" ? "📷" : s.id === "topdown" ? "🔽" : "🎬"}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF8E1" }}>{s.label}</div>
                    <div style={{ fontSize: "12px", color: "#A08060" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Lighting + Background */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "#F5D77A" }}>
              Scene Setup
            </h2>

            <p style={{ color: "#A08060", fontSize: "14px", marginBottom: "12px" }}>Lighting Mood</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
              {LIGHTING.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setSelectedLighting(l.id)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: selectedLighting === l.id ? "2px solid #D4A017" : "2px solid #3E272340",
                    background: selectedLighting === l.id ? "linear-gradient(135deg, #3E2723, #4A2C20)" : "#2C181030",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: l.color, margin: "0 auto 8px",
                    border: "2px solid #FFF8E120",
                    boxShadow: `0 0 16px ${l.color}40`,
                  }} />
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF8E1" }}>{l.label}</div>
                </div>
              ))}
            </div>

            <p style={{ color: "#A08060", fontSize: "14px", marginBottom: "12px" }}>Background Surface</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {BACKGROUNDS.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBg(b.id)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    border: selectedBg === b.id ? "2px solid #D4A017" : "2px solid #3E272340",
                    background: selectedBg === b.id ? "linear-gradient(135deg, #3E2723, #4A2C20)" : "#2C181030",
                    fontSize: "13px",
                    fontWeight: selectedBg === b.id ? 700 : 400,
                    color: selectedBg === b.id ? "#F5D77A" : "#A08060",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Speed */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "#F5D77A" }}>
              Motion Speed
            </h2>
            <p style={{ color: "#A08060", fontSize: "14px", marginBottom: "16px" }}>
              Slow motion makes ASMR content more satisfying
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {SPEEDS.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSpeed(s.id)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: selectedSpeed === s.id ? "2px solid #D4A017" : "2px solid #3E272340",
                    background: selectedSpeed === s.id ? "linear-gradient(135deg, #3E2723, #4A2C20)" : "#2C181030",
                    fontSize: "15px",
                    fontWeight: selectedSpeed === s.id ? 700 : 400,
                    color: selectedSpeed === s.id ? "#F5D77A" : "#C0A080",
                    transition: "all 0.2s",
                  }}
                >
                  {s.label}
                  {s.id === "ultra" && <span style={{ fontSize: "11px", color: "#D4A017", marginLeft: "8px" }}>⭐ Recommended</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Duration */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "#F5D77A" }}>
              Video Duration
            </h2>
            <p style={{ color: "#A08060", fontSize: "14px", marginBottom: "16px" }}>
              Choose based on where you'll post it
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {DURATIONS.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDuration(d.id)}
                  style={{
                    padding: "20px 14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: selectedDuration === d.id ? "2px solid #D4A017" : "2px solid #3E272340",
                    background: selectedDuration === d.id ? "linear-gradient(135deg, #3E2723, #4A2C20)" : "#2C181030",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "24px", fontWeight: 800, color: selectedDuration === d.id ? "#F5D77A" : "#C0A080" }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#A08060", marginTop: "4px" }}>{d.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Generated Prompt */}
        {step === 6 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "#F5D77A" }}>
              Your AI Prompt is Ready! 🎉
            </h2>
            <p style={{ color: "#A08060", fontSize: "14px", marginBottom: "16px" }}>
              Copy this prompt → Open Google AI Studio → Upload your image → Paste prompt → Generate
            </p>

            <div style={{
              background: "#1A0E0A",
              border: "1px solid #D4A01730",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "16px",
              maxHeight: "300px",
              overflowY: "auto",
            }}>
              <pre style={{
                whiteSpace: "pre-wrap",
                fontSize: "12px",
                color: "#C0A080",
                lineHeight: "1.6",
                margin: 0,
                fontFamily: "'Courier New', monospace",
              }}>
                {generatedPrompt}
              </pre>
            </div>

            <button onClick={copyPrompt} style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: copied
                ? "linear-gradient(135deg, #2E7D32, #43A047)"
                : "linear-gradient(135deg, #D4A017, #F5D77A)",
              color: copied ? "#fff" : "#1A0E0A",
              fontSize: "16px",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.3s",
              letterSpacing: "1px",
            }}>
              {copied ? "✓ COPIED!" : "📋 COPY PROMPT"}
            </button>

            <button
              onClick={generateVideoWithGemini}
              disabled={isGeneratingVideo}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: isGeneratingVideo
                  ? "#3E272340"
                  : "linear-gradient(135deg, #8E24AA, #5E35B1)",
                color: "#FFF8E1",
                fontSize: "15px",
                fontWeight: 800,
                cursor: isGeneratingVideo ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                letterSpacing: "0.6px",
              }}
            >
              {isGeneratingVideo ? "⏳ GENERATING VIDEO..." : "🎬 GENERATE VIDEO WITH GEMINI"}
            </button>

            {!!videoStatus && (
              <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#D4A017" }}>
                {videoStatus}
              </p>
            )}

            {!!videoError && (
              <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#EF9A9A" }}>
                {videoError}
              </p>
            )}

            {!!videoUrl && (
              <div style={{
                marginTop: "14px",
                padding: "12px",
                borderRadius: "12px",
                background: "#1A0E0A",
                border: "1px solid #D4A01730",
              }}>
                <video
                  src={videoUrl}
                  controls
                  style={{ width: "100%", borderRadius: "10px", display: "block" }}
                />
                <a
                  href={videoUrl}
                  download={videoFilename}
                  style={{
                    display: "inline-block",
                    marginTop: "10px",
                    color: "#F5D77A",
                    fontSize: "13px",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  ⬇ Download Video
                </a>
              </div>
            )}

            {/* How to use section */}
            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "#2C181050",
              borderRadius: "12px",
              border: "1px solid #3E272340",
            }}>
              <h3 style={{ fontSize: "14px", color: "#F5D77A", margin: "0 0 12px" }}>📱 How to Generate the Video:</h3>
              <div style={{ fontSize: "13px", color: "#A08060", lineHeight: "1.8" }}>
                <p style={{ margin: "0 0 6px" }}><strong style={{ color: "#D4A017" }}>Step 1:</strong> Open Google AI Studio app</p>
                <p style={{ margin: "0 0 6px" }}><strong style={{ color: "#D4A017" }}>Step 2:</strong> Start a new chat with Gemini</p>
                <p style={{ margin: "0 0 6px" }}><strong style={{ color: "#D4A017" }}>Step 3:</strong> Upload your chocolate photo</p>
                <p style={{ margin: "0 0 6px" }}><strong style={{ color: "#D4A017" }}>Step 4:</strong> Paste the copied prompt</p>
                <p style={{ margin: "0 0 6px" }}><strong style={{ color: "#D4A017" }}>Step 5:</strong> Click Generate → Download the video</p>
                <p style={{ margin: "0" }}><strong style={{ color: "#D4A017" }}>Step 6:</strong> Post on Instagram Reels!</p>
              </div>
            </div>

            {/* Image Prompt */}
            <div style={{
              marginTop: "16px",
              padding: "16px",
              background: "#2C181050",
              borderRadius: "12px",
              border: "1px solid #3E272340",
            }}>
              <h3 style={{ fontSize: "14px", color: "#F5D77A", margin: "0 0 8px" }}>🖼️ Want a Still Image Instead?</h3>
              <p style={{ fontSize: "12px", color: "#A08060", margin: "0 0 10px" }}>
                Use this prompt for generating a high-quality photo (for Instagram post/thumbnail):
              </p>
              <div style={{
                background: "#1A0E0A", borderRadius: "8px", padding: "12px",
                fontSize: "11px", color: "#C0A080", fontFamily: "monospace", lineHeight: "1.5",
              }}>
                Generate a photorealistic still image of this chocolate product being displayed in a premium {BACKGROUNDS.find(b => b.id === selectedBg)?.label || "marble"} setting with {LIGHTING.find(l => l.id === selectedLighting)?.label || "warm"} lighting. Show the chocolate {selectedAction === "break" ? "broken in half revealing the inside" : selectedAction === "melt" ? "with chocolate drizzle" : "in an elegant arrangement"}. 4K quality, shallow depth of field, professional food photography, Instagram-worthy composition. Square 1:1 aspect ratio.
              </div>
            </div>

            {/* Caption Generator */}
            <div style={{
              marginTop: "16px",
              padding: "16px",
              background: "#2C181050",
              borderRadius: "12px",
              border: "1px solid #3E272340",
            }}>
              <h3 style={{ fontSize: "14px", color: "#F5D77A", margin: "0 0 12px" }}>📝 Generate Instagram Caption:</h3>
              <div style={{ display: "flex", gap: "8px", marginBottom: generatedCaption ? "12px" : 0 }}>
                {[
                  { id: "urdu", label: "اردو" },
                  { id: "english", label: "English" },
                  { id: "saraiki", label: "سرائیکی" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => generateCaption(lang.id)}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: captionLang === lang.id ? "2px solid #D4A017" : "1px solid #3E272360",
                      background: captionLang === lang.id ? "#3E2723" : "transparent",
                      color: captionLang === lang.id ? "#F5D77A" : "#A08060",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              {generatedCaption && (
                <div style={{
                  background: "#1A0E0A",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "12px",
                  color: "#C0A080",
                  lineHeight: "1.7",
                  direction: captionLang !== "english" ? "rtl" : "ltr",
                  whiteSpace: "pre-wrap",
                }}>
                  {generatedCaption}
                  <button
                    onClick={async () => {
                      try { await navigator.clipboard.writeText(generatedCaption); } catch {}
                    }}
                    style={{
                      display: "block",
                      margin: "12px auto 0",
                      padding: "8px 20px",
                      borderRadius: "6px",
                      border: "1px solid #D4A01740",
                      background: "#2C1810",
                      color: "#D4A017",
                      fontSize: "12px",
                      cursor: "pointer",
                      direction: "ltr",
                    }}
                  >
                    📋 Copy Caption
                  </button>
                </div>
              )}
            </div>

            {/* Start Over */}
            <button onClick={reset} style={{
              width: "100%",
              marginTop: "16px",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #3E272360",
              background: "transparent",
              color: "#A08060",
              fontSize: "14px",
              cursor: "pointer",
            }}>
              🔄 Create Another Video Prompt
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 6 && (
          <div style={{
            display: "flex",
            gap: "10px",
            marginTop: "24px",
            paddingBottom: "40px",
          }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #3E272360",
                background: "transparent",
                color: "#A08060",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}>
                ← Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === 5) generatePrompt();
                else setStep(step + 1);
              }}
              disabled={!canProceed()}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: canProceed()
                  ? "linear-gradient(135deg, #D4A017, #F5D77A)"
                  : "#3E272340",
                color: canProceed() ? "#1A0E0A" : "#5A3A28",
                fontSize: "15px",
                fontWeight: 800,
                cursor: canProceed() ? "pointer" : "not-allowed",
                transition: "all 0.3s",
                letterSpacing: "0.5px",
              }}
            >
              {step === 5 ? "✨ Generate Prompt" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
