export function initForm() {
    const form = document.getElementById('consultation-form');
    if (!form) return;

    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const statusDiv = document.getElementById('form-status');

    const URL = "https://script.google.com/macros/s/AKfycbzfZzRY_0sBJ7O-GYioHD5kZwFEoWJzbLsXb0vOVW1s2y4DJIChwxyL54foUMaf9Rchhg/exec";

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !message) {
            statusDiv.textContent = 'Please fill out all required fields.';
            statusDiv.style.color = '#ff6b6b';
            return;
        }

        // UI loading
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitBtn.style.opacity = '0.7';
        submitBtn.style.pointerEvents = 'none';

        statusDiv.textContent = "Sending...";

        const data = {
            name,
            email,
            phone,
            message
        };

        try {
            await fetch(URL, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams({
        name,
        email,
        phone,
        message
    })
});

            statusDiv.textContent = "Sent successfully ✔";
            statusDiv.style.color = "green";

            form.reset();

        } catch (err) {
            statusDiv.textContent = "Error sending ❌";
            statusDiv.style.color = "red";
        }

        // restore UI
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';

        setTimeout(() => {
            statusDiv.textContent = '';
        }, 5000);
    });
}
