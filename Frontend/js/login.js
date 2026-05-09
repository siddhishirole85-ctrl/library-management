console.log("login.js connected");

async function login() {

  console.log("Login button clicked");

  const email = document.getElementById("email").value;

  const password = document.getElementById("password").value;

  try {

    const response = await fetch("http://localhost:5000/api/auth/login", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        email,
        password
      })

    });

    const data = await response.json();

    console.log(data);

    document.getElementById("message").innerText = data.message;

    if (data.message === "Login successful") {

      localStorage.setItem("userEmail", email);

      window.location.href = "dashboard.html";

    }

  } catch (error) {

    console.log("Login Error:", error);

  }

}