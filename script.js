// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyBiyx-8r2iK_kcv7f6rOoFTWlyuh-EfYKw",
  authDomain: "qr-code-azeem.firebaseapp.com",
  projectId: "qr-code-azeem",
  storageBucket: "qr-code-azeem.firebasestorage.app",
  messagingSenderId: "240169376117",
  appId: "1:240169376117:web:684bcd0c2d16fbd5389b3c",
  measurementId: "G-0VNVJ8ZHFH",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Input validation
function isValidName(name) {
  // More comprehensive name validation including accented characters
  return /^[\p{L}\s'-]{1,50}$/u.test(name.trim());
}

function validateInput(input, validationFn) {
  // Debounce the validation to improve performance
  clearTimeout(input.debounceTimer);
  input.debounceTimer = setTimeout(() => {
    const isValid = validationFn(input.value);
    input.classList.toggle("error", !isValid);
    input.classList.toggle("valid", isValid);
    input.style.backgroundColor = isValid ? "#333" : "#3a2828";

    // Show validation message
    const messageElement = input.nextElementSibling;
    if (
      messageElement &&
      messageElement.classList.contains("validation-message")
    ) {
      messageElement.textContent = isValid ? "" : "Please enter a valid name";
      messageElement.style.display = isValid ? "none" : "block";
    }
  }, 300);

  return validationFn(input.value); // Return immediate result for form submission
}

async function validateForm(event) {
  event.preventDefault();

  // Disable form while submitting
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const firstname = document.getElementById("firstname");
    const lastname = document.getElementById("lastname");

    const isFirstNameValid = validateInput(firstname, isValidName);
    const isLastNameValid = validateInput(lastname, isValidName);

    if (isFirstNameValid && isLastNameValid) {
      // Add rate limiting check
      const lastSubmission = localStorage.getItem("lastSubmission");
      const now = Date.now();
      if (lastSubmission && now - parseInt(lastSubmission) < 5000) {
        throw new Error("Please wait a few seconds before submitting again");
      }

      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("signins").add({
        firstName: firstname.value.trim(),
        lastName: lastname.value.trim(),
        timestamp: timestamp,
        userAgent: navigator.userAgent, // Additional security tracking
        submittedAt: new Date().toISOString(),
      });

      // Store submission time for rate limiting
      localStorage.setItem("lastSubmission", now.toString());

      // Clear form
      event.target.reset();

      // Redirect to success page
      window.location.href = "success.html";
    }
  } catch (error) {
    console.error("Error saving to Firebase:", error);

    // Show error message to user
    const errorMessage =
      document.getElementById("error-message") || createErrorElement();
    errorMessage.textContent =
      error.message || "There was an error saving your data. Please try again.";
    errorMessage.style.display = "block";

    // Hide error message after 5 seconds
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  } finally {
    // Re-enable form
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

function preventNumbers(event) {
  // Allow control keys (backspace, delete, arrows, etc.)
  if (event.ctrlKey || event.metaKey || event.key.length > 1) {
    return;
  }

  // Prevent numbers and special characters except allowed ones
  if (!/^[\p{L}\s'-]$/u.test(event.key)) {
    event.preventDefault();
  }
}

// Create error message element if it doesn't exist
function createErrorElement() {
  const errorDiv = document.createElement("div");
  errorDiv.id = "error-message";
  errorDiv.style.cssText =
    "display:none; color:red; margin-top:10px; text-align:center;";
  document.getElementById("registerForm").appendChild(errorDiv);
  return errorDiv;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (form) {
    form.addEventListener("submit", validateForm);

    // Add input validation
    const inputs = form.querySelectorAll(".input");
    inputs.forEach((input) => {
      input.addEventListener("keypress", preventNumbers);
      input.addEventListener("input", function () {
        validateInput(this, isValidName);
      });

      // Add validation message element
      const messageDiv = document.createElement("div");
      messageDiv.className = "validation-message";
      messageDiv.style.cssText =
        "display:none; color:red; font-size:0.8em; margin-top:4px;";
      input.parentNode.insertBefore(messageDiv, input.nextSibling);
    });
  }
});
