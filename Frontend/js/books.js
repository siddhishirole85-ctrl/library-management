console.log("books.js connected");

async function getBooks() {

  try {

    const response = await fetch("http://localhost:5000/api/books");

    const books = await response.json();

    console.log(books);

    let output = "";

    books.forEach(book => {

      output += `
        <div class="book-card">

          <h3>${book.title}</h3>

          <button onclick="deleteBook(${book.id})">
            Delete
          </button>

        </div>
      `;

    });

    document.getElementById("booksContainer").innerHTML = output;

  } catch (error) {

    console.log("Get Books Error:", error);

  }

}

getBooks();

async function addBook() {

  const title = document.getElementById("title").value;

  try {

    await fetch("http://localhost:5000/api/books", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        title
      })

    });

    document.getElementById("title").value = "";

    getBooks();

  } catch (error) {

    console.log("Add Book Error:", error);

  }

}

async function deleteBook(id) {

  try {

    await fetch(`http://localhost:5000/api/books/${id}`, {

      method: "DELETE"

    });

    getBooks();

  } catch (error) {

    console.log("Delete Book Error:", error);

  }

}