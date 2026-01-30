const fileIn = document.getElementById("fileIn");
const qualitySlider = document.getElementById("quality");
const formatSelect = document.getElementById("format");
const downloadBtn = document.getElementById("downloadBtn");
const canvas = document.getElementById("processCanvas");
const ctx = canvas.getContext("2d");

let currentFile = null;
let originalSize = 0;

// 1. Handle File Upload
fileIn.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    currentFile = file;
    originalSize = file.size;

    // Update UI stats
    document.getElementById("orig-size").innerText = formatBytes(originalSize);
    document.getElementById("controls").classList.remove("disabled");

    // Load image to process
    processImage();
  }
});

// 2. Process & Compress Logic
function processImage() {
  const img = new Image();
  img.src = URL.createObjectURL(currentFile);

  img.onload = () => {
    // Set canvas dimensions
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image onto canvas
    ctx.drawImage(img, 0, 0);

    // Compress
    compress();
  };
}

function compress() {
  const quality = qualitySlider.value / 100; // 0.1 to 1.0
  const format = formatSelect.value;

  document.getElementById("q-val").innerText = qualitySlider.value + "%";

  // The Magic Line: Convert Canvas to Blob with Quality Param
  canvas.toBlob(
    (blob) => {
      // Update New Size Stats
      const newSize = blob.size;
      document.getElementById("new-size").innerText = formatBytes(newSize);

      // Calculate Savings
      const percent = ((originalSize - newSize) / originalSize) * 100;
      document.getElementById("savings").innerText =
        Math.round(percent) + "% Saved";

      // Setup Download
      const url = URL.createObjectURL(blob);
      downloadBtn.onclick = () => {
        const link = document.createElement("a");
        link.href = url;
        // Auto-generate extension (e.g., .webp)
        const ext = format.split("/")[1];
        link.download = `compressed_image.${ext}`;
        link.click();
      };
      downloadBtn.disabled = false;
    },
    format,
    quality,
  );
}

// 3. Listen for changes
qualitySlider.addEventListener("input", compress);
formatSelect.addEventListener("change", compress);

// Helper: Format Bytes to KB/MB
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
