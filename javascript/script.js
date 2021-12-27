/** Elements */

const body = document.body;
const menuButton = document.querySelector("#menuButton");
const menu = document.querySelector("#menu");
const addBookButton = document.querySelector("#addBookButton");
const exitAddBookFormButton = document.querySelector("#exitAddBook");
const booksDisplay = document.querySelector("#booksDisplay");
const bookForm = document.querySelector("#bookForm")
const bookFormSubmit = document.querySelector("#bookFormSubmit")
const bookTitle = document.querySelector("#title")
const bookAuthor = document.querySelector("#author")
const bookPages = document.querySelector("#pages")
const bookCover = document.querySelector("#bookCover");
const bookRead = document.querySelector("#read")




// Initalize library array
let myLibrary = [];

// Constructor for books
function Book(title, author, pages, backgroundImage = "", read = false) {
    this.title = title
    this.author = author
    this.pages = pages
    this.backgroundImage = backgroundImage
    this.read = read
}

// Dummy data
const LOTR = new Book("Lord Of The Rings", "J.R.R. Tolkien", "421", "https://images-na.ssl-images-amazon.com/images/I/81rzgaqcfZL.jpg", false)
const STARWARS = new Book("Star Wars", "George Lucas", "351", "https://d29xot63vimef3.cloudfront.net/image/star-wars-books/1-1.jpg", true);
const HJARNSTARK = new Book("Hjärnstark", "Anders Hansen", "268", "https://image.bokus.com/images/9789173630788_200x_hjarnstark-hur-motion-och-traning-starker-din-hjarna", true);

myLibrary.push(LOTR, STARWARS, HJARNSTARK, new Book(), new Book(), new Book(), new Book(), new Book(), new Book(), new Book(), new Book(), new Book());




/** Functions */

// Creates card for all the books stored in the myLibrary array and renders them to the page
function displayBooks() {
    myLibrary.map(book => {
        createCard(book)
    })
}


bookFormSubmit.addEventListener("click", addBook);

function addBook(event) {

    // Prevents reloading of the page
    event.preventDefault();

    // Adds new book to array
    const bookToAdd = new Book(bookTitle.value, bookAuthor.value, bookPages.value, bookCover.value, bookRead.checked);
    myLibrary.push(bookToAdd);

    // Creates card for the new book and renders it on the page
    let book = myLibrary[myLibrary.length - 1];
    createCard(book);

    // Removes bookForm from screen
    handleAddBookAnimation();
}


function createCard(book) {
    const card = document.createElement("div");
    const flipCardInner = document.createElement("div");
    const flipCardFront = document.createElement("div");
    const flipCardBack = document.createElement("div");
    const removeBook = document.createElement("div");
    const isReadCheckbox = document.createElement("input");

    card.classList.add("card");
    flipCardInner.classList.add("flipCardInner");
    flipCardFront.classList.add("flipCardFront");
    flipCardBack.classList.add("flipCardBack");
    removeBook.classList.add("removeBook");
    isReadCheckbox.classList.add("isReadCheckbox");

    removeBook.addEventListener("click", handleDeleteBook);
    isReadCheckbox.addEventListener("click", handleIsReadCheckbox);
    
    card.setAttribute("data-bookindex", myLibrary.indexOf(book));
    flipCardFront.style.backgroundImage = `url(${book.backgroundImage})`;
    removeBook.textContent = "X";
    isReadCheckbox.type = "checkbox";

    // Adds text content to the back of the book card and only if user input something
    for (let i = 0; i < Object.values(book).length - 2; i++) {
        if (Object.values(book)[i] !== "") {
            const paragraph = document.createElement("p");
            paragraph.textContent = Object.values(book)[i];
            flipCardBack.appendChild(paragraph);
        }
    }
    
    booksDisplay.appendChild(card);
    card.appendChild(flipCardInner);
    flipCardInner.appendChild(flipCardFront);
    flipCardInner.appendChild(flipCardBack);
    flipCardBack.appendChild(isReadCheckbox);
    flipCardBack.appendChild(removeBook);
    
    book.read === true ? isReadCheckbox.checked = true : isReadCheckbox.checked = false;
}


// Refreshes each book's index so it corresponds to the correct element in the array
// Starts from previously removed book's index so it doesn't have to loop through the entire array
function handleRefreshOfBookIndex(removedBookIndex) {
    for (let i = removedBookIndex; i < myLibrary.length; i++) {
        document.querySelectorAll(".card")[i].setAttribute("data-bookindex", i)
    }
}


// Deletes book from display and myLibrary array
function handleDeleteBook() {
    let book = this.parentElement.parentElement.parentElement;

    smoothDeletion(book);
    
    myLibrary.splice(book.dataset.bookindex, 1)
    
    setTimeout(() => {

        const nextElement = book.nextElementSibling;
        let bookNumber = Number(book.dataset.bookindex);
        book.remove()
        handleRefreshOfBookIndex(book.dataset.bookindex);
        const cards = document.querySelectorAll(".card");
        
        for (let i = bookNumber; i < cards.length; i++) {
            cards[i].style.transitionDuration = "0.000000001s";
            cards[i].style.transform = "none";
        }
    }, 650)
}

function smoothDeletion(book) {
    let bookNumber = Number(book.dataset.bookindex);
    
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => card.style.transitionDuration = "0.65s")
    book.classList.toggle("hide");
    
    for (let i = bookNumber + 1; i < cards.length; i++) {
        let cardPosition = cards[i].getBoundingClientRect();
        let previousCardPosition = cards[i].previousElementSibling.getBoundingClientRect();
        cards[i].style.transform = `translate(${previousCardPosition.x - cardPosition.x}px, ${previousCardPosition.y - cardPosition.y}px)`;
    }
}

// Reads checkbox for checked or not checked and sets the book to read or not read in the myLibrary array
function handleIsReadCheckbox(book) {
    book = book.target.parentElement.parentElement.parentElement;
    const checkbox = book.children[0].children[1].children[0];

    if (checkbox.checked === false) {
        myLibrary[book.dataset.bookindex].read = false;
        return;
    }

    myLibrary[book.dataset.bookindex].read = true;
}




/** Animations */

// Handles animation of the menu button
menuButton.addEventListener("click", handleMenuAnimation)

function handleMenuAnimation() {
    if (menu.className === "activeMenu") {
        menu.classList.remove("activeMenu");
        menu.classList.add("inactiveMenu");
    } else if (menu.className === "inactiveMenu") {
        menu.classList.remove("inactiveMenu");
        menu.classList.add("activeMenu");
    } else {
        menu.classList.add("activeMenu");
    }
}

// Handles animation of the form that lets user add a book
addBookButton.addEventListener("click", handleAddBookAnimation);
exitAddBookFormButton.addEventListener("click", handleAddBookAnimation);

function handleAddBookAnimation() {
    if (bookForm.className === "activeAddBook") {
        bookForm.classList.remove("activeAddBook");
        bookForm.classList.add("inactiveAddBook");
    } else if (bookForm.className === "inactiveAddBook") {
        bookForm.classList.remove("inactiveAddBook");
        bookForm.classList.add("activeAddBook");
    } else {
        bookForm.classList.add("activeAddBook");
    }
}




/** Run at start */

displayBooks();