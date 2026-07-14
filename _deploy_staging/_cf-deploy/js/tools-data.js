/* ============================================================
   MasterTools — Master Catalog (200+ tools)
   - impl: true  => fully working (implemented in tools.js / tools2.js)
   - pro: false   => premium/paid-equivalent tool (needs a backend)
   Add a tool = 1 entry here + 1 function in tools2.js.
   ============================================================ */
window.TOOL_CATEGORIES = [
  {
    id: "pdf", name: "PDF Tools", icon: "📄", desc: "Compress, convert, merge and edit PDF files.",
    tools: [
      { id: "compress-pdf", name: "Compress PDF", icon: "🗜️", desc: "Shrink PDF file size." },
      { id: "merge-pdf", name: "Merge PDF", icon: "➕", desc: "Combine PDFs into one.", impl: true },
      { id: "split-pdf", name: "Split PDF", icon: "✂️", desc: "Extract pages from a PDF." },
      { id: "pdf-to-jpg", name: "PDF to JPG", icon: "🖼️", desc: "Convert PDF pages to images." },
      { id: "jpg-to-pdf", name: "JPG to PDF", icon: "📑", desc: "Turn images into a PDF.", impl: true },
      { id: "pdf-to-png", name: "PDF to PNG", icon: "🏞️", desc: "Convert pages to PNG." },
      { id: "png-to-pdf", name: "PNG to PDF", icon: "📄", desc: "Combine PNGs into a PDF.", impl: true },
      { id: "pdf-to-word", name: "PDF to Word", icon: "📝", desc: "Convert to editable DOCX.", pro: false },
      { id: "word-to-pdf", name: "Word to PDF", icon: "📄", desc: "Convert DOCX to PDF.", pro: false },
      { id: "pdf-to-excel", name: "PDF to Excel", icon: "📊", desc: "Extract tables to XLSX.", pro: false },
      { id: "excel-to-pdf", name: "Excel to PDF", icon: "📄", desc: "Convert spreadsheets.", pro: false },
      { id: "ppt-to-pdf", name: "PowerPoint to PDF", icon: "📽️", desc: "Convert slides to PDF.", pro: false },
      { id: "protect-pdf", name: "Protect PDF", icon: "🔒", desc: "Add a password.", pro: false },
      { id: "unlock-pdf", name: "Unlock PDF", icon: "🔓", desc: "Remove PDF password.", pro: false },
      { id: "esign-pdf", name: "eSign PDF", icon: "✍️", desc: "Sign PDF documents.", pro: false },
      { id: "rotate-pdf", name: "Rotate PDF", icon: "🔄", desc: "Rotate PDF pages.", impl: true },
      { id: "watermark-pdf", name: "Watermark PDF", icon: "💧", desc: "Add a text watermark.", pro: false },
      { id: "pdf-page-numbers", name: "Add Page Numbers", icon: "🔢", desc: "Number PDF pages.", pro: false },
      { id: "pdf-extract-text", name: "PDF Text Extractor", icon: "📃", desc: "Pull text out of a PDF.", pro: false }
    ]
  },
  {
    id: "image", name: "Image Tools", icon: "🖼️", desc: "Compress, resize, convert and edit images in your browser.",
    tools: [
      { id: "image-compressor", name: "Image Compressor", icon: "🗜️", desc: "Reduce size, keep quality.", impl: true, tags:["jpg","png"] },
      { id: "image-resizer", name: "Image Resizer", icon: "📐", desc: "Resize to any dimensions.", impl: true },
      { id: "image-converter", name: "Image Converter", icon: "🔁", desc: "PNG, JPG, WebP.", impl: true },
      { id: "image-to-base64", name: "Image to Base64", icon: "🔤", desc: "Encode image as Base64.", impl: true },
      { id: "base64-to-image", name: "Base64 to Image", icon: "🖼️", desc: "Decode Base64 to image.", impl: true },
      { id: "image-crop", name: "Crop Image", icon: "✂️", desc: "Crop images precisely.", impl: true },
      { id: "rotate-image", name: "Rotate / Flip Image", icon: "🔄", desc: "Rotate & mirror images.", impl: true },
      { id: "circle-crop", name: "Circle Crop", icon: "⭕", desc: "Round profile photos.", impl: true },
      { id: "pixelate-image", name: "Pixelate / Blur", icon: "🌫️", desc: "Pixelate part of a photo.", impl: true },
      { id: "background-remover", name: "Background Remover", icon: "🪄", desc: "Remove background with AI.", pro: false },
      { id: "image-upscaler", name: "Image Upscaler", icon: "🔍", desc: "AI upscale & enhance.", pro: false },
      { id: "favicon-generator", name: "Favicon Generator", icon: "⭐", desc: "Create favicons.", impl: true },
      { id: "color-from-image", name: "Color Picker from Image", icon: "🎨", desc: "Pick colors from a photo.", impl: true },
      { id: "meme-generator", name: "Meme Generator", icon: "😂", desc: "Add top/bottom text.", impl: true },
      { id: "image-watermark", name: "Watermark Image", icon: "💧", desc: "Add a text watermark.", impl: true },
      { id: "photo-filters", name: "Photo Filters", icon: "🎞️", desc: "Grayscale, sepia, invert.", impl: true },
      { id: "exif-viewer", name: "EXIF Data Viewer", icon: "📷", desc: "See image metadata.", impl: true },
      { id: "collage-maker", name: "Collage Maker", icon: "🧩", desc: "Combine photos.", pro: false }
    ]
  },
  {
    id: "video", name: "Video & Social", icon: "🎬", desc: "Download, transcribe and repurpose video & social content.",
    tools: [
      { id: "reel-transcriber", name: "Reel / Video Transcriber", icon: "🎙️", desc: "Video/audio → text.", pro: false, tags:["instagram","transcript"] },
      { id: "video-downloader", name: "Video Downloader", icon: "⬇️", desc: "Download online videos.", pro: false },
      { id: "thumbnail-downloader", name: "YT Thumbnail Downloader", icon: "🖼️", desc: "Grab YouTube thumbnails.", impl: true },
      { id: "video-to-mp3", name: "Video to MP3", icon: "🎵", desc: "Extract audio.", pro: false },
      { id: "subtitle-generator", name: "Subtitle Generator", icon: "💬", desc: "Auto SRT captions.", pro: false },
      { id: "clip-maker", name: "Long Video to Shorts", icon: "✂️", desc: "Cut long videos into clips.", pro: false },
      { id: "video-compressor", name: "Video Compressor", icon: "🗜️", desc: "Shrink video files.", pro: false },
      { id: "twitter-char-counter", name: "Tweet Character Counter", icon: "🐦", desc: "Count tweet length.", impl: true },
      { id: "engagement-rate", name: "Engagement Rate Calc", icon: "📊", desc: "Social engagement %.", impl: true },
      { id: "youtube-money-calc", name: "YouTube Money Calculator", icon: "💰", desc: "Estimate ad earnings.", impl: true },
      { id: "hashtag-generator", name: "Hashtag Generator", icon: "#️⃣", desc: "Build hashtag sets.", impl: true },
      { id: "fake-tweet", name: "Fake Tweet Generator", icon: "🐤", desc: "Mock a tweet image.", pro: false }
    ]
  },
  {
    id: "text", name: "Text & Writing", icon: "✍️", desc: "Count, format, clean and transform text.",
    tools: [
      { id: "word-counter", name: "Word Counter", icon: "🔢", desc: "Words, chars, sentences.", impl: true },
      { id: "case-converter", name: "Case Converter", icon: "🔠", desc: "UPPER, lower, Title, camel.", impl: true },
      { id: "text-diff", name: "Text Compare (Diff)", icon: "🔀", desc: "Differences between texts.", impl: true },
      { id: "find-replace", name: "Find & Replace", icon: "🔎", desc: "Replace text (regex).", impl: true },
      { id: "sort-lines", name: "Sort Text Lines", icon: "🔤", desc: "A→Z, Z→A, by length.", impl: true },
      { id: "remove-duplicate-lines", name: "Remove Duplicate Lines", icon: "🧹", desc: "Deduplicate lines.", impl: true },
      { id: "remove-empty-lines", name: "Remove Empty Lines", icon: "␡", desc: "Strip blank lines.", impl: true },
      { id: "remove-extra-spaces", name: "Remove Extra Spaces", icon: "␣", desc: "Collapse whitespace.", impl: true },
      { id: "remove-line-breaks", name: "Remove Line Breaks", icon: "↵", desc: "Join lines together.", impl: true },
      { id: "add-line-numbers", name: "Add Line Numbers", icon: "1️⃣", desc: "Prefix each line.", impl: true },
      { id: "reverse-text", name: "Reverse Text", icon: "↔️", desc: "Reverse chars/words/lines.", impl: true },
      { id: "text-repeater", name: "Text Repeater", icon: "♾️", desc: "Repeat text N times.", impl: true },
      { id: "slug-generator", name: "Slug Generator", icon: "🔗", desc: "URL-friendly slugs.", impl: true },
      { id: "lorem-ipsum", name: "Lorem Ipsum Generator", icon: "📃", desc: "Placeholder text.", impl: true },
      { id: "text-to-binary", name: "Text to Binary", icon: "0️⃣", desc: "Encode text as binary.", impl: true },
      { id: "binary-to-text", name: "Binary to Text", icon: "🔡", desc: "Decode binary to text.", impl: true },
      { id: "text-to-morse", name: "Morse Code Translator", icon: "📡", desc: "Text ↔ Morse code.", impl: true },
      { id: "upside-down-text", name: "Upside Down Text", icon: "🙃", desc: "Flip text ǝpᴉsdn.", impl: true },
      { id: "whitespace-remover", name: "Whitespace Remover", icon: "🧼", desc: "Remove all spaces.", impl: true },
      { id: "count-letters", name: "Letter Frequency", icon: "📊", desc: "Count each character.", impl: true },
      { id: "grammar-checker", name: "Grammar Checker", icon: "✅", desc: "AI grammar fixes.", pro: false },
      { id: "paraphraser", name: "Paraphraser / Rewriter", icon: "🔄", desc: "Rewrite text with AI.", pro: false },
      { id: "summarizer", name: "Text Summarizer", icon: "📋", desc: "Summarize with AI.", pro: false },
      { id: "plagiarism-checker", name: "Plagiarism Checker", icon: "🔍", desc: "Check duplicate content.", pro: false },
      { id: "ai-detector", name: "AI Content Detector", icon: "🤖", desc: "Detect AI text.", pro: false }
    ]
  },
  {
    id: "convert", name: "Converters", icon: "🔁", desc: "Convert between data formats and encodings.",
    tools: [
      { id: "base64", name: "Base64 Encode/Decode", icon: "🔐", desc: "Encode & decode Base64.", impl: true },
      { id: "url-encode", name: "URL Encode/Decode", icon: "🌐", desc: "Encode & decode URLs.", impl: true },
      { id: "html-encode", name: "HTML Encode/Decode", icon: "〈〉", desc: "Escape & unescape HTML.", impl: true },
      { id: "json-formatter", name: "JSON Formatter", icon: "🗂️", desc: "Beautify & validate JSON.", impl: true },
      { id: "json-to-csv", name: "JSON to CSV", icon: "📊", desc: "JSON array → CSV.", impl: true },
      { id: "csv-to-json", name: "CSV to JSON", icon: "📋", desc: "CSV → JSON.", impl: true },
      { id: "json-to-xml", name: "JSON to XML", icon: "📰", desc: "Convert JSON → XML.", impl: true },
      { id: "json-to-yaml", name: "JSON ↔ YAML", icon: "📜", desc: "Convert JSON & YAML.", impl: true },
      { id: "number-base", name: "Number Base Converter", icon: "🔢", desc: "Bin, oct, dec, hex.", impl: true },
      { id: "roman-numeral", name: "Roman Numeral Converter", icon: "🏛️", desc: "Number ↔ Roman.", impl: true },
      { id: "unit-converter", name: "Unit Converter", icon: "📏", desc: "Length, weight, temp.", impl: true },
      { id: "color-converter", name: "Color Converter", icon: "🎨", desc: "HEX ↔ RGB ↔ HSL.", impl: true },
      { id: "timestamp-converter", name: "Timestamp Converter", icon: "⏱️", desc: "Epoch ↔ human date.", impl: true },
      { id: "query-parser", name: "Query String Parser", icon: "❓", desc: "Parse URL params.", impl: true },
      { id: "url-parser", name: "URL Parser", icon: "🔗", desc: "Break down a URL.", impl: true },
      { id: "currency-converter", name: "Currency Converter", icon: "💱", desc: "Live exchange rates.", pro: false },
      { id: "text-to-speech", name: "Text to Speech", icon: "🔊", desc: "Read text aloud.", impl: true },
      { id: "speech-to-text", name: "Speech to Text", icon: "🎤", desc: "Voice → text.", impl: true }
    ]
  },
  {
    id: "generators", name: "Generators", icon: "⚙️", desc: "Generate codes, passwords, IDs and dummy data.",
    tools: [
      { id: "password-generator", name: "Password Generator", icon: "🔑", desc: "Strong random passwords.", impl: true },
      { id: "qr-generator", name: "QR Code Generator", icon: "🔳", desc: "QR codes for anything.", impl: true },
      { id: "barcode-generator", name: "Barcode Generator", icon: "▮▮", desc: "Create barcodes.", impl: true },
      { id: "uuid-generator", name: "UUID Generator", icon: "🆔", desc: "Generate v4 UUIDs.", impl: true },
      { id: "random-number", name: "Random Number", icon: "🎲", desc: "Numbers in a range.", impl: true },
      { id: "random-string", name: "Random String", icon: "🔡", desc: "Random text strings.", impl: true },
      { id: "random-name", name: "Random Name Generator", icon: "🧑", desc: "Fake names.", impl: true },
      { id: "pin-generator", name: "PIN Generator", icon: "🔢", desc: "Random numeric PINs.", impl: true },
      { id: "api-key-generator", name: "API Key Generator", icon: "🗝️", desc: "Secure API keys.", impl: true },
      { id: "fake-credit-card", name: "Test Credit Card Numbers", icon: "💳", desc: "Luhn-valid test cards.", impl: true },
      { id: "hash-generator", name: "Hash Generator", icon: "#️⃣", desc: "SHA-1/256/384/512.", impl: true },
      { id: "password-strength", name: "Password Strength", icon: "🛡️", desc: "Test strength.", impl: true },
      { id: "fancy-text", name: "Fancy Text Generator", icon: "✨", desc: "Stylish unicode fonts.", impl: true },
      { id: "lorem-json", name: "Dummy JSON Data", icon: "🧪", desc: "Fake JSON records.", impl: true },
      { id: "invoice-generator", name: "Invoice Generator", icon: "🧾", desc: "Printable invoices.", pro: false },
      { id: "resume-builder", name: "Resume Builder", icon: "📄", desc: "Professional CV.", pro: false },
      { id: "business-name", name: "Business Name Generator", icon: "🏷️", desc: "AI brand names.", pro: false }
    ]
  },
  {
    id: "calc", name: "Calculators", icon: "🧮", desc: "Everyday and financial calculators.",
    tools: [
      { id: "percentage-calc", name: "Percentage Calculator", icon: "％", desc: "Percent of, change.", impl: true },
      { id: "percentage-change", name: "Percentage Change", icon: "📈", desc: "% increase/decrease.", impl: true },
      { id: "loan-calc", name: "Loan / EMI Calculator", icon: "🏦", desc: "Payment & interest.", impl: true },
      { id: "mortgage-calc", name: "Mortgage Calculator", icon: "🏠", desc: "Home loan payments.", impl: true },
      { id: "compound-interest", name: "Compound Interest", icon: "📈", desc: "Investment growth.", impl: true },
      { id: "roi-calc", name: "ROI Calculator", icon: "💹", desc: "Return on investment.", impl: true },
      { id: "salary-calc", name: "Salary Calculator", icon: "💼", desc: "Hourly ↔ annual.", impl: true },
      { id: "sales-tax", name: "Sales Tax / VAT / GST", icon: "🧾", desc: "Add or remove tax.", impl: true },
      { id: "markup-calc", name: "Markup & Margin", icon: "🏷️", desc: "Profit margin.", impl: true },
      { id: "tip-calc", name: "Tip Calculator", icon: "💵", desc: "Split bills & tips.", impl: true },
      { id: "discount-calc", name: "Discount Calculator", icon: "🏷️", desc: "Sale price & savings.", impl: true },
      { id: "fuel-cost", name: "Fuel Cost Calculator", icon: "⛽", desc: "Trip fuel cost.", impl: true },
      { id: "speed-distance-time", name: "Speed / Distance / Time", icon: "🚗", desc: "Solve for any.", impl: true },
      { id: "average-calc", name: "Average / Mean", icon: "➗", desc: "Mean of numbers.", impl: true },
      { id: "gpa-calc", name: "GPA Calculator", icon: "🎓", desc: "Grade point average.", impl: true },
      { id: "age-calc", name: "Age Calculator", icon: "🎂", desc: "Exact age.", impl: true },
      { id: "date-diff", name: "Date Difference", icon: "📅", desc: "Days between dates.", impl: true },
      { id: "scientific-calc", name: "Scientific Calculator", icon: "🔬", desc: "Trig, log, powers.", impl: true }
    ]
  },
  {
    id: "math", name: "Math & Science", icon: "🔬", desc: "Number crunching and science helpers.",
    tools: [
      { id: "prime-checker", name: "Prime Number Checker", icon: "🔢", desc: "Is it prime?", impl: true },
      { id: "factorial-calc", name: "Factorial Calculator", icon: "❗", desc: "n! for any n.", impl: true },
      { id: "gcd-lcm", name: "GCD & LCM", icon: "➗", desc: "Greatest/least common.", impl: true },
      { id: "quadratic-solver", name: "Quadratic Solver", icon: "📐", desc: "Solve ax²+bx+c.", impl: true },
      { id: "standard-deviation", name: "Standard Deviation", icon: "📊", desc: "Mean, variance, SD.", impl: true },
      { id: "rounding-calc", name: "Rounding Calculator", icon: "🔵", desc: "Round to decimals.", impl: true },
      { id: "fraction-calc", name: "Fraction Calculator", icon: "½", desc: "Add/multiply fractions.", impl: true },
      { id: "ratio-calc", name: "Ratio Calculator", icon: "⚖️", desc: "Simplify & solve ratios.", impl: true },
      { id: "random-picker-num", name: "Number Sequence", icon: "🔢", desc: "Generate sequences.", impl: true },
      { id: "base-n-log", name: "Logarithm Calculator", icon: "📈", desc: "log, ln, custom base.", impl: true }
    ]
  },
  {
    id: "health", name: "Health & Fitness", icon: "❤️", desc: "Body, diet and fitness calculators.",
    tools: [
      { id: "bmi-calc", name: "BMI Calculator", icon: "⚖️", desc: "Body mass index.", impl: true },
      { id: "bmr-calc", name: "BMR Calculator", icon: "🔥", desc: "Basal metabolic rate.", impl: true },
      { id: "tdee-calc", name: "TDEE Calculator", icon: "🏃", desc: "Daily energy burn.", impl: true },
      { id: "calorie-calc", name: "Calorie Calculator", icon: "🍎", desc: "Daily calorie needs.", impl: true },
      { id: "macro-calc", name: "Macro Calculator", icon: "🥗", desc: "Protein/carbs/fat.", impl: true },
      { id: "body-fat", name: "Body Fat Calculator", icon: "📏", desc: "Estimate body fat %.", impl: true },
      { id: "ideal-weight", name: "Ideal Weight", icon: "🎯", desc: "Healthy weight range.", impl: true },
      { id: "water-intake", name: "Water Intake", icon: "💧", desc: "Daily hydration.", impl: true },
      { id: "one-rep-max", name: "One Rep Max", icon: "🏋️", desc: "Max lifting weight.", impl: true },
      { id: "pregnancy-due", name: "Pregnancy Due Date", icon: "🤰", desc: "Estimate due date.", impl: true },
      { id: "heart-rate-zone", name: "Heart Rate Zones", icon: "❤️‍🔥", desc: "Training zones.", impl: true }
    ]
  },
  {
    id: "datetime", name: "Time & Date", icon: "📅", desc: "Time, date, and countdown utilities.",
    tools: [
      { id: "countdown-timer", name: "Countdown Timer", icon: "⏳", desc: "Count down to a date.", impl: true },
      { id: "days-until", name: "Days Until Date", icon: "📆", desc: "Days to any event.", impl: true },
      { id: "add-subtract-days", name: "Add / Subtract Days", icon: "➕", desc: "Date math.", impl: true },
      { id: "week-number", name: "Week Number", icon: "🗓️", desc: "Current ISO week.", impl: true },
      { id: "timezone-converter", name: "Time Zone Converter", icon: "🌍", desc: "Convert between zones.", impl: true },
      { id: "stopwatch", name: "Stopwatch", icon: "⏱️", desc: "Time anything.", impl: true },
      { id: "pomodoro", name: "Pomodoro Timer", icon: "🍅", desc: "Focus timer.", impl: true },
      { id: "work-hours", name: "Work Hours Calculator", icon: "🕐", desc: "Hours between times.", impl: true },
      { id: "birthday-countdown", name: "Birthday Countdown", icon: "🎉", desc: "Days to your birthday.", impl: true }
    ]
  },
  {
    id: "dev", name: "Developer Tools", icon: "💻", desc: "Utilities developers use every day.",
    tools: [
      { id: "regex-tester", name: "Regex Tester", icon: "🔍", desc: "Test regex live.", impl: true },
      { id: "markdown-preview", name: "Markdown Preview", icon: "📝", desc: "Render Markdown.", impl: true },
      { id: "jwt-decoder", name: "JWT Decoder", icon: "🎫", desc: "Decode JWTs.", impl: true },
      { id: "html-minify", name: "HTML/CSS/JS Minifier", icon: "📉", desc: "Minify code.", impl: true },
      { id: "css-minify", name: "CSS Minifier", icon: "🎨", desc: "Compress CSS.", impl: true },
      { id: "js-beautify", name: "Code Beautifier", icon: "✨", desc: "Format & indent.", impl: true },
      { id: "sql-formatter", name: "SQL Formatter", icon: "🗄️", desc: "Pretty-print SQL.", impl: true },
      { id: "cron-generator", name: "Cron Expression Builder", icon: "⏰", desc: "Build & read cron.", impl: true },
      { id: "text-to-slug", name: "String Case (dev)", icon: "🐍", desc: "snake, kebab, camel.", impl: true },
      { id: "escape-string", name: "String Escaper", icon: "🔓", desc: "Escape/unescape strings.", impl: true },
      { id: "http-status", name: "HTTP Status Codes", icon: "📟", desc: "Look up any code.", impl: true },
      { id: "user-agent", name: "User Agent Parser", icon: "🕵️", desc: "Read your UA string.", impl: true },
      { id: "color-code-dev", name: "Color Code Converter", icon: "🌈", desc: "HEX/RGB/HSL for CSS.", impl: true },
      { id: "diff-checker", name: "Diff Checker", icon: "🔀", desc: "Compare code/text.", impl: true }
    ]
  },
  {
    id: "seo", name: "SEO & Web", icon: "📈", desc: "On-page SEO helpers and web utilities.",
    tools: [
      { id: "meta-generator", name: "Meta Tag Generator", icon: "🏷️", desc: "Title, description, OG.", impl: true },
      { id: "keyword-density", name: "Keyword Density", icon: "🔑", desc: "Keyword frequency.", impl: true },
      { id: "robots-generator", name: "Robots.txt Generator", icon: "🤖", desc: "Build robots.txt.", impl: true },
      { id: "utm-builder", name: "UTM Link Builder", icon: "🔗", desc: "Campaign URLs.", impl: true },
      { id: "serp-preview", name: "Google SERP Preview", icon: "👀", desc: "Preview snippet.", impl: true },
      { id: "og-generator", name: "Open Graph Generator", icon: "📲", desc: "Social share tags.", impl: true },
      { id: "twitter-card", name: "Twitter Card Generator", icon: "🐦", desc: "X card meta tags.", impl: true },
      { id: "htaccess-redirect", name: "301 Redirect Generator", icon: "↪️", desc: ".htaccess redirects.", impl: true },
      { id: "backlink-checker", name: "Backlink Checker", icon: "🔗", desc: "Check backlinks.", pro: false },
      { id: "keyword-suggestion", name: "Keyword Suggestions", icon: "💡", desc: "AI keyword ideas.", pro: false }
    ]
  },
  {
    id: "color", name: "Color & Design", icon: "🎨", desc: "Colors, gradients and CSS helpers.",
    tools: [
      { id: "color-picker", name: "Color Picker", icon: "🎨", desc: "Pick colors & codes.", impl: true },
      { id: "gradient-generator", name: "CSS Gradient Generator", icon: "🌈", desc: "Build CSS gradients.", impl: true },
      { id: "contrast-checker", name: "Contrast Checker", icon: "🔲", desc: "WCAG contrast.", impl: true },
      { id: "palette-generator", name: "Palette Generator", icon: "🖌️", desc: "Random palettes.", impl: true },
      { id: "shadow-generator", name: "Box Shadow Generator", icon: "🌑", desc: "CSS box-shadow.", impl: true },
      { id: "border-radius", name: "Border Radius Generator", icon: "⬜", desc: "CSS rounded corners.", impl: true },
      { id: "css-triangle", name: "CSS Triangle Generator", icon: "🔺", desc: "Pure-CSS triangles.", impl: true },
      { id: "color-blindness", name: "Color Blindness Simulator", icon: "👁️", desc: "Preview color vision.", impl: true }
    ]
  },
  {
    id: "security", name: "Security & Encryption", icon: "🔐", desc: "Encrypt, hash and encode securely.",
    tools: [
      { id: "aes-encrypt", name: "Text Encrypt / Decrypt", icon: "🔒", desc: "AES password encryption.", impl: true },
      { id: "caesar-cipher", name: "Caesar Cipher", icon: "🏛️", desc: "Classic shift cipher.", impl: true },
      { id: "rot13", name: "ROT13 Encoder", icon: "🔄", desc: "ROT13 encode/decode.", impl: true },
      { id: "md5-generator", name: "MD5 Hash", icon: "#️⃣", desc: "Generate MD5 hash.", impl: true },
      { id: "bcrypt-generator", name: "Bcrypt Hash", icon: "🧂", desc: "Bcrypt password hash.", pro: false },
      { id: "htpasswd", name: ".htpasswd Generator", icon: "🔑", desc: "Apache auth entries.", pro: false },
      { id: "ssl-checker", name: "SSL Checker", icon: "🔏", desc: "Inspect a certificate.", pro: false }
    ]
  },
  {
    id: "misc", name: "Everyday Tools", icon: "🧩", desc: "Handy utilities for daily use.",
    tools: [
      { id: "notepad", name: "Online Notepad", icon: "🗒️", desc: "Auto-saving notes.", impl: true },
      { id: "todo-list", name: "To-Do List", icon: "✅", desc: "Simple saved checklist.", impl: true },
      { id: "wheel-picker", name: "Random Picker Wheel", icon: "🎡", desc: "Pick a random option.", impl: true },
      { id: "name-picker", name: "Random Name Picker", icon: "🎯", desc: "Draw a winner.", impl: true },
      { id: "dice-roller", name: "Dice Roller", icon: "🎲", desc: "Roll virtual dice.", impl: true },
      { id: "coin-flip", name: "Coin Flip", icon: "🪙", desc: "Heads or tails.", impl: true },
      { id: "tally-counter", name: "Tally Counter", icon: "🔢", desc: "Click counter.", impl: true },
      { id: "whats-my-ip", name: "What's My IP", icon: "🌐", desc: "Your public IP & info.", impl: true },
      { id: "browser-info", name: "Browser Info", icon: "🖥️", desc: "Your device details.", impl: true },
      { id: "screen-resolution", name: "Screen Resolution", icon: "📱", desc: "Screen & viewport.", impl: true },
      { id: "internet-speed", name: "Internet Speed Test", icon: "🚀", desc: "Test your connection.", pro: false }
    ]
  }
];

/* Flat lookup helpers */
window.ALL_TOOLS = [];
window.TOOL_CATEGORIES.forEach(cat => {
  cat.tools.forEach(t => { t.category = cat.id; t.categoryName = cat.name; window.ALL_TOOLS.push(t); });
});
window.getTool = id => window.ALL_TOOLS.find(t => t.id === id);
window.getCategory = id => window.TOOL_CATEGORIES.find(c => c.id === id);


/* Related / reverse tool groups — every tool links to its siblings on its page */
window.TOOL_GROUPS = [
  ["jpg-to-pdf", "pdf-to-jpg", "png-to-pdf", "pdf-to-png", "compress-pdf", "merge-pdf", "split-pdf"],
  ["pdf-to-word", "word-to-pdf"],
  ["pdf-to-excel", "excel-to-pdf"],
  ["protect-pdf", "unlock-pdf", "watermark-pdf", "pdf-page-numbers", "esign-pdf", "rotate-pdf"],
  ["pdf-extract-text", "ppt-to-pdf"],
  ["json-to-csv", "csv-to-json"],
  ["json-formatter", "json-to-xml", "json-to-yaml"],
  ["text-to-binary", "binary-to-text"],
  ["text-to-speech", "speech-to-text"],
  ["base64", "url-encode", "html-encode", "escape-string"],
  ["number-base", "roman-numeral"],
  ["image-compressor", "image-resizer", "image-converter", "image-crop", "rotate-image", "circle-crop", "pixelate-image", "image-watermark", "photo-filters", "background-remover", "image-upscaler", "collage-maker"],
  ["image-to-base64", "base64-to-image"],
  ["color-picker", "color-converter", "gradient-generator", "palette-generator", "contrast-checker", "color-blindness"],
  ["reel-transcriber", "subtitle-generator", "video-to-mp3", "video-compressor", "clip-maker", "video-downloader", "thumbnail-downloader"],
  ["rot13", "caesar-cipher", "aes-encrypt", "md5-generator", "hash-generator", "bcrypt-generator", "htpasswd"],
  ["case-converter", "fancy-text", "upside-down-text", "reverse-text", "morse", "text-to-morse"],
  ["sort-lines", "remove-duplicate-lines", "remove-empty-lines", "remove-extra-spaces", "remove-line-breaks", "whitespace-remover", "add-line-numbers", "find-replace"],
  ["percentage-calc", "percentage-change", "discount-calc", "sales-tax", "markup-calc"],
  ["loan-calc", "mortgage-calc", "compound-interest", "roi-calc"],
  ["bmi-calc", "bmr-calc", "tdee-calc", "calorie-calc", "macro-calc", "body-fat", "ideal-weight", "water-intake"],
  ["password-generator", "password-strength", "random-string", "pin-generator", "api-key-generator"],
  ["grammar-checker", "paraphraser", "summarizer", "plagiarism-checker", "ai-detector"],
  ["meta-generator", "og-generator", "twitter-card", "serp-preview", "keyword-density", "keyword-suggestion"],
  ["countdown-timer", "days-until", "add-subtract-days", "date-diff", "age-calc", "birthday-countdown", "week-number"]
];
window.getRelated = id => {
  const g = window.TOOL_GROUPS.find(grp => grp.includes(id));
  if (!g) return [];
  return g.filter(x => x !== id).map(x => window.getTool(x)).filter(Boolean);
};
