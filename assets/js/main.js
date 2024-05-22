// {
//     id: string | number,
//     title: string,
//     author: string,
//     year: number,
//     isComplete: boolean,
// }

const books = [];
const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-bookshelf";
const SAVED_EVENT = "saved-books";

function isStorageExists() {
  if (typeof Storage === "undefined") {
    alert("Your browser doesn't support Web storage API");
    return false;
  }
  return true;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function generateBookObjects(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function save() {
  if (isStorageExists()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(id) {
  for (const bookItem of books) {
    if (bookItem.id == id) {
      return bookItem;
    }
  }
  return null;
}

function addBooks() {
  const titleInput = document.getElementById("bookTitle");
  const authorInput = document.getElementById("bookAuthor");
  const yearInput = document.getElementById("releaseDate");
  const isCompleteInput = document.getElementById("read");

  const title = titleInput.value;
  const author = authorInput.value;
  const year = parseInt(yearInput.value);
  const isComplete = isCompleteInput.checked;

  const bookObjects = generateBookObjects(
    generateId(),
    title,
    author,
    year,
    isComplete
  );
  books.push(bookObjects);
  titleInput.value = "";
  authorInput.value = "";
  yearInput.value = "";
  isCompleteInput.checked = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  save();
}

function markAsRead(id) {
  const target = findBook(id);
  if (target == null) return;
  target.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  save();
}

function cancelAsRead(id) {
  const target = findBook(id);
  if (target == null) return;
  target.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  save();
}

function deleteBook(id) {
  const target = findBook(id);
  if (target == null) return;
  const bookTarget = books.indexOf(target);
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  save();
}

function bookShelf(bookObjects) {
  const { id, title, author, year, isComplete } = bookObjects;
  const textTitle = document.createElement("h4");
  textTitle.innerText = title;
  const textAuthor = document.createElement("p");
  textAuthor.innerText = `By ${author}`;
  const textYear = document.createElement("p");
  textYear.innerText = `Published in ${year}`;
  const textContainer = document.createElement("div");
  textContainer.append(textTitle, textAuthor, textYear);

  const actionBtnContainer = document.createElement("div");
  actionBtnContainer.classList.add("action-btn-container");
  if (!isComplete) {
    const doneBtn = document.createElement("button");
    const doneIcon = document.createElement("i");
    doneIcon.classList.add("fa-solid");
    doneIcon.classList.add("fa-circle-check");
    doneBtn.append(doneIcon);
    doneBtn.addEventListener("click", () => {
      markAsRead(id);
    });
    actionBtnContainer.append(doneBtn);
  } else {
    const cancelBtn = document.createElement("button");
    const cancelIcon = document.createElement("i");
    cancelIcon.classList.add("fa-solid");
    cancelIcon.classList.add("fa-circle-xmark");
    cancelBtn.append(cancelIcon);
    cancelBtn.addEventListener("click", () => {
      cancelAsRead(id);
    });
    actionBtnContainer.append(cancelBtn);
  }
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid");
  deleteIcon.classList.add("fa-trash-can");
  deleteBtn.append(deleteIcon);
  deleteBtn.addEventListener("click", () => {
    const alertBox = document.getElementById("delete-alert-box");
    alertBox.style.display = "flex";
    const cancelDeleteBtn = document.getElementById("cancel-btn");
    const continueDeleteBtn = document.getElementById("continue-btn");
    cancelDeleteBtn.addEventListener("click", () => {
      alertBox.style.display = "none";
    });
    continueDeleteBtn.addEventListener("click", () => {
      deleteBook(id);
      alertBox.style.display = "none";
    });
  });
  actionBtnContainer.append(deleteBtn);

  const container = document.createElement("div");
  container.classList.add("book-list-container");
  container.append(textContainer, actionBtnContainer);
  container.setAttribute("id", `book-${id}`);

  return container;
}

function searchBook() {
  const searchBtn = document.getElementById("search-btn");
  searchBtn.addEventListener("click", () => {
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    addBooks();
  });
  if (isStorageExists()) {
    loadDataFromStorage();
  }
  searchBook();
});

document.addEventListener(RENDER_EVENT, () => {
  const unread = document.getElementById("unread");
  const alreadyRead = document.getElementById("already-read");
  const searchInput = document.getElementById("search-book-input");
  const searchWords = searchInput.value.toLowerCase();
  const bookTarget = books.filter((book) =>
    book.title.toLowerCase().includes(searchWords)
  );

  unread.innerHTML = "";
  alreadyRead.innerHTML = "";
  if (bookTarget) {
    for (const bookItems of bookTarget) {
      const bookshelf = bookShelf(bookItems);
      if (bookItems.isComplete) {
        alreadyRead.append(bookshelf);
      } else {
        unread.append(bookshelf);
      }
    }
  } else {
    for (const bookItems of books) {
      const bookshelf = bookShelf(bookItems);
      if (bookItems.isComplete) {
        alreadyRead.append(bookshelf);
      } else {
        unread.append(bookshelf);
      }
    }
  }
});
