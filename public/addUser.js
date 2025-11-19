document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-user-form");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const avatarInput = document.getElementById("avatar");

  const avatarPreview = document.getElementById("avatar-preview");
  const progressContainer = document.getElementById("progress-container");
  const uploadProgress = document.getElementById("upload-progress");
  const uploadStatus = document.getElementById("upload-status");
  const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://user-api-demo.vercel.app";


  // --- Avatar preview ---
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) {
      avatarPreview.style.display = "none";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type! Only JPEG, JPG, PNG are allowed.");
      avatarInput.value = "";
      avatarPreview.style.display = "none";
      return;
    }

    if (file.size > maxSize) {
      alert("File size exceeds 2MB!");
      avatarInput.value = "";
      avatarPreview.style.display = "none";
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      avatarPreview.src = e.target.result;
      avatarPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  // --- Submit form with progress ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const file = avatarInput.files[0];

    if (!username || !email || !file) {
      alert("Please fill all fields and select an avatar.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type! Only JPEG, JPG, PNG are allowed.");
      return;
    }
    if (file.size > maxSize) {
      alert("File size exceeds 2MB!");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("avatar", file);

    // Show progress bar
    progressContainer.style.display = "block";
    uploadProgress.value = 0;
    uploadStatus.textContent = "Uploading... 0%";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/users`, true);

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        uploadProgress.value = percent;
        uploadStatus.textContent = `Uploading... ${percent}%`;
      }
    };

    xhr.onload = function() {
      if (xhr.status === 201) {
        const data = JSON.parse(xhr.responseText);
        alert("User added successfully!");
        if (window.opener && window.opener.fetchAndDisplayUsers) {
          window.opener.fetchAndDisplayUsers();
        }
        window.location.href = "index.html";
      } else {
        const data = JSON.parse(xhr.responseText);
        alert("Upload failed: " + (data.message || "Unknown error"));
      }
    };

    xhr.onerror = function() {
      alert("Upload error. Please try again.");
    };

    xhr.send(formData);
  });
});
