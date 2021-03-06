import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence, browserPopupRedirectResolver, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { myLibraryArray, global } from "./index.js";
import { loadSettings, userSettings, defaultUserSettings } from "./loadUserSettings.js";
import { showMyLibrary } from "./showMyLibrary.js";
import { saveData } from "./handleData.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZQlasiygfXSG7iKMwkpanVK8F_D4hDzQ",
    authDomain: "mylibrary3.firebaseapp.com",
    databaseURL: "https://mylibrary3-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "mylibrary3",
    storageBucket: "mylibrary3.appspot.com",
    messagingSenderId: "209783491184",
    appId: "1:209783491184:web:0e6c7592f905e82c9982b5",
    measurementId: "G-8JDWF4X4CD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

// Use initializeAuth instead of getAuth due to a problem with mobile.
// A file called iFrame gets requested when using the google login service
// The only way to disable the request until it actually is getting used
// is by utilizing initializeAuth and giving signInWithPopup another argument
export const auth = initializeAuth(app, {
    persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence
      ],
});

const authenticationFormButton = document.querySelector("#authenticationFormButton")

let getDatabase;
let get;
let child;
let ref;
let set;
let update;

async function importDatabase() {
    const database = await import("firebase/database");
    getDatabase = database.getDatabase;
    get = database.get;
    child = database.child;
    ref = database.ref;
    set = database.set;
    update = database.update;  
}

export async function createUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("New user created");
    }
    catch (error) {
        console.log(error);
    }
}

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in");
    }
    catch (error) {
        console.log(error)
    }
}

export function loginUserWithGoogle() {
    
        signInWithPopup(auth, provider, browserPopupRedirectResolver)
            .then((result) => {
            })
            .catch((error) => {
                console.log(error)
            });
}

function logoutUser() {
    auth.signOut()
        .then(() => {
            console.log("Signed out")
            authenticationFormButton.textContent = "Login";
        })
}

export async function onLogin() {

    // Change login button to a logout button when a user is signed in
    authenticationFormButton.addEventListener("click", logoutUser)
    authenticationFormButton.textContent = "Logout";

    // Remove login/register container
    const authenticationFormContainer = document.querySelector(".authenticationFormContainer");
    if (authenticationFormContainer !== null) authenticationFormContainer.remove();
}

export function onLogout() {
    
    authenticationFormButton.removeEventListener("click", logoutUser);
    authenticationFormButton.textContent = "Login";
}


export function saveDataOnCloud() {
    const db = getDatabase();
    set(ref(db, 'users/' + global.userID), {
        settings: userSettings,
        books: myLibraryArray
    });
}

export function updateBook(edits, bookIndex) {
    const db = getDatabase();

    update(ref(db, 'users/' + global.userID + '/books' + '/' + bookIndex), edits)
}

export function updateAllBooks() {
    const db = getDatabase();

    update(ref(db, 'users/' + global.userID), { books: myLibraryArray })
}

export function updateSettings(edits) {
    const db = getDatabase();

    update(ref(db, 'users/' + global.userID + "/settings"), edits)
}


export async function clearAllBooks() {
    const db = getDatabase();

    await update(ref(db, 'users/' + global.userID), { books: [] });

    while (myLibraryArray.length !== 0) {
        myLibraryArray.pop();
    }

    showMyLibrary();
}


export async function clearSettings() {
    const db = getDatabase();
    const dbRef = ref(getDatabase());


    await update(ref(db, 'users/' + global.userID + '/settings'), defaultUserSettings)

    // I absolutely do not know why - but I couldn't set global.userSettingsOnCloud
    // to defaultUserSettings. Doing so, somehow, made the defaultUserSettings update its values
    // as if it was the current userSettings object. Solved it by fetching settings from the cloud
    // after it has been reverted to default. This bug cost me several hours (:
    get(child(dbRef, `users/${global.userID}/settings`))
        .then((snapshot) => {
            global.userSettingsOnCloud = snapshot.val();
            loadSettings();
        })
}


export async function getUserDataFromCloud() {
    await importDatabase();
    const dbRef = ref(getDatabase());

    get(child(dbRef, `users/${global.userID}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                while (myLibraryArray.length !== 0) {
                    myLibraryArray.pop();
                }

                if (snapshot.val().books !== undefined) myLibraryArray.push(...snapshot.val().books);
                global.userSettingsOnCloud = snapshot.val().settings;
            }
            else saveData();

            loadSettings();
            showMyLibrary();
        })
        .catch((error) => {
            console.error(error);
        });
}