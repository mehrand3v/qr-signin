// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection } from "firebase/firestore";

// const firebaseApp = initializeApp({
//                 apiKey: "AIzaSyBiyx-8r2iK_kcv7f6rOoFTWlyuh-EfYKw",
//                 authDomain: "qr-code-azeem.firebaseapp.com",
//                 projectId: "qr-code-azeem",
//                 storageBucket: "qr-code-azeem.firebasestorage.app",
//                 messagingSenderId: "240169376117",
//                 appId: "1:240169376117:web:684bcd0c2d16fbd5389b3c",
//                 measurementId: "G-0VNVJ8ZHFH"
//             });

// const db = getFirestore(firebaseApp);
// ****For Newer Version of Firebase****

// Initialize Firebase (older version)
const firebaseConfig = {
                  apiKey: "AIzaSyBiyx-8r2iK_kcv7f6rOoFTWlyuh-EfYKw",
                  authDomain: "qr-code-azeem.firebaseapp.com",
                  projectId: "qr-code-azeem",
                  storageBucket: "qr-code-azeem.firebasestorage.app",
                  messagingSenderId: "240169376117",
                  appId: "1:240169376117:web:684bcd0c2d16fbd5389b3c",
                  measurementId: "G-0VNVJ8ZHFH"
};
            firebase.initializeApp(firebaseConfig);
            const db = firebase.firestore();

        // Declare timer variable globally
        let successMessageTimer;

        function isValidName(name) {
            return /^[A-Za-z\s'-]+$/.test(name) && name.trim().length > 0;
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function showSuccessMessage() {
            const successMessage = document.getElementById('successMessage');
            successMessage.classList.add('show');

            // Clear any existing timer
            if (successMessageTimer) {
                clearTimeout(successMessageTimer);
            }

            // Set new timer to hide message after 3 seconds
            successMessageTimer = setTimeout(() => {
                successMessage.classList.remove('show');
            }, 3000);
        }

        function validateInput(input, validationFn) {
            const isValid = validationFn(input.value);
            input.classList.remove('error', 'valid');
            input.classList.add(isValid ? 'valid' : 'error');

            // Reset background color based on state
            if (isValid) {
                input.style.backgroundColor = '#333';
            } else {
                input.style.backgroundColor = '#3a2828';
            }
            return isValid;
        }

        async function validateForm(event) {
            event.preventDefault();
            const firstname = document.getElementById('firstname');
            const lastname = document.getElementById('lastname');
            const email = document.getElementById('email');

            const isFirstNameValid = validateInput(firstname, isValidName);
            const isLastNameValid = validateInput(lastname, isValidName);
            const isEmailValid = validateInput(email, isValidEmail);

                       if (isFirstNameValid && isLastNameValid && isEmailValid) {
                try {
                    // Add timestamp to the data
                    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

                    // Save to Firebase
                    await db.collection('signins').add({
                        firstName: firstname.value.trim(),
                        lastName: lastname.value.trim(),
                        email: email.value.trim(),
                        timestamp: timestamp
                    });

                    showSuccessMessage();
                    // Clear form
                    document.getElementById('registerForm').reset();
                    // Reset validation styles
                    [firstname, lastname, email].forEach(input => {
                        input.classList.remove('valid', 'error');
                        input.style.backgroundColor = '#333';
                    });
                } catch (error) {
                    console.error("Error saving to Firebase:", error);
                    alert("There was an error saving your data. Please try again.");
                }
            }
        }

        // Prevent typing numbers in name fields
        function preventNumbers(event) {
            if (!/^[A-Za-z\s'-]$/.test(event.key) && event.key.length === 1) {
                event.preventDefault();
            }
        }
        // Form submission
        document.getElementById('registerForm').addEventListener('submit', validateForm);

        // Add input validation
        document.getElementById('firstname').addEventListener('keypress', preventNumbers);
        document.getElementById('lastname').addEventListener('keypress', preventNumbers);

        // Live validation as user types
        const inputs = document.querySelectorAll('.input');
        inputs.forEach(input => {
            input.addEventListener('input', function () {
                if (this.id === 'firstname' || this.id === 'lastname') {
                    validateInput(this, isValidName);
                } else if (this.id === 'email') {
                    validateInput(this, isValidEmail);
                }
                // Remove success message when typing
                document.getElementById('successMessage').classList.remove('show');
            });
        });
