document.addEventListener("DOMContentLoaded", () => {
  const userContainer = document.getElementById('user-container');
  const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://my-website.com";
    
  async function fetchAndDisplayUsers() {
    try {
      const response = await fetch(`${BASE_URL}/api/users`); 
      const users = await response.json();

      userContainer.innerHTML = "";

      if(users.length === 0) {
        userContainer.innerHTML = `<p>No users found.</p>`;
        return;
      }

      users.forEach((user) => {
        const card = document.createElement("div");
        card.classList.add("user-card");

       card.innerHTML = `
        <img src="${user.avatarUrl}" alt="${user.username}'s avatar" id="avatar-${user._id}">
        
        <h2 id="username-display-${user._id}">${user.username}</h2>
        <input type="text" id="edit-username-${user._id}" class="edit-input" value="${user.username}" style="display:none;" />

        <p id="email-display-${user._id}">${user.email}</p>
        <input type="email" id="edit-email-${user._id}" class="edit-input" value="${user.email}" style="display:none;" />

        <input type="file" id="file-${user._id}" style="display:none;" accept="image/*" />

        <button id="edit-${user._id}" class="edit-btn">Edit</button>
        <button id="save-${user._id}" class="save-btn" style="display:none;">Save</button>
        <button id="cancel-${user._id}" class="cancel-btn" style="display:none;">Cancel</button>
        <button id="delete-${user._id}" class="delete-btn">Delete</button>
        `;


        userContainer.appendChild(card);

        const avatarImg = card.querySelector(`#avatar-${user._id}`);
        const fileInput = card.querySelector(`#file-${user._id}`);
        const editBtn = card.querySelector(`#edit-${user._id}`);
        const saveBtn = card.querySelector(`#save-${user._id}`);
        const cancelBtn = card.querySelector(`#cancel-${user._id}`);
        const deleteBtn = card.querySelector(`#delete-${user._id}`);
        const usernameDisplay = card.querySelector(`#username-display-${user._id}`);
        const emailDisplay = card.querySelector(`#email-display-${user._id}`);
        const usernameInput = card.querySelector(`#edit-username-${user._id}`);
        const emailInput = card.querySelector(`#edit-email-${user._id}`);

        // --- Avatar Upload ---
        avatarImg.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", async () => {
          const file = fileInput.files[0];
          if (!file) return;
          const allowedTypes = ["image/jpeg","image/jpg","image/png"];
          if (!allowedTypes.includes(file.type)) { alert("Invalid file type!"); return; }
          if (file.size > 2*1024*1024) { alert("File size exceeds 2MB!"); return; }

          const formData = new FormData();
          formData.append("avatar", file);
          try {
            const res = await fetch(`${BASE_URL}/api/users/${user._id}/avatar`, { method: "PUT", body: formData });
            const data = await res.json();
            if (data.success) avatarImg.src = data.avatarUrl + `?t=${Date.now()}`;
          } catch (err) {
            console.error("Upload error:", err);
            alert("Error uploading avatar.");
          }
        });

        // --- Edit Inline ---
        editBtn.addEventListener("click", () => {
          usernameDisplay.style.display = "none";
          emailDisplay.style.display = "none";
          usernameInput.style.display = "block";
          emailInput.style.display = "block";
          editBtn.style.display = "none";
          saveBtn.style.display = "inline-block";
          cancelBtn.style.display = "inline-block";
        });

        saveBtn.addEventListener("click", async () => {
          const newUsername = usernameInput.value.trim();
          const newEmail = emailInput.value.trim();
          if (!newUsername || !newEmail) return alert("Fields cannot be empty.");

          try {
            const res = await fetch(`${BASE_URL}/api/users/${user._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: newUsername, email: newEmail })
            });
            const data = await res.json();
            if (data.success) {
              usernameDisplay.textContent = data.user.username;
              emailDisplay.textContent = data.user.email;
              usernameDisplay.style.display = "block";
              emailDisplay.style.display = "block";
              usernameInput.style.display = "none";
              emailInput.style.display = "none";
              editBtn.style.display = "inline-block";
              saveBtn.style.display = "none";
              cancelBtn.style.display = "none";
              alert("User updated successfully!");
            } else {
              alert("Failed to update user: " + data.error);
            }
          } catch (err) {
            console.error("Edit error:", err);
            alert("Error editing user.");
          }
        });

        cancelBtn.addEventListener("click", () => {
          usernameInput.value = usernameDisplay.textContent;
          emailInput.value = emailDisplay.textContent;
          usernameDisplay.style.display = "block";
          emailDisplay.style.display = "block";
          usernameInput.style.display = "none";
          emailInput.style.display = "none";
          editBtn.style.display = "inline-block";
          saveBtn.style.display = "none";
          cancelBtn.style.display = "none";
        });

        // --- Delete User ---
        deleteBtn.addEventListener("click", async () => {
          if (!confirm(`Are you sure you want to delete ${user.username}?`)) return;
          try {
            const res = await fetch(`${BASE_URL}/api/users/${user._id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchAndDisplayUsers();
          } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting user.");
          }
        });

      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      userContainer.innerHTML = `<p>Failed to load users. Please check the console.</p>`;
    }
  }

  fetchAndDisplayUsers();
});
