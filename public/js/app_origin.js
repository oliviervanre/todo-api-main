/// Fichier: app.js
let db;
const request = indexedDB.open("todoDB", 1);

request.onupgradeneeded = function(event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains("tasks")) {
        db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
    }
};

request.onerror = function(event) {
    console.error("❌ Erreur d'ouverture de IndexedDB", event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("📂 Base IndexedDB ouverte avec succès");
    loadTasks();
};

function addTask() {
    let taskInput = document.getElementById("task");
    let task = taskInput.value.trim();
    if (!task) return;
    let tx = db.transaction("tasks", "readwrite");
    let store = tx.objectStore("tasks");
    let newTask = { text: task, synced: false };
    let request = store.add(newTask);
    request.onsuccess = () => {
        taskInput.value = "";
        loadTasks();
    };
}

function loadTasks() {
    if (!db || !db.objectStoreNames.contains("tasks")) return;
    let list = document.getElementById("taskList");
    list.innerHTML = "";
    let tx = db.transaction("tasks", "readonly");
    let store = tx.objectStore("tasks");
    store.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            let li = document.createElement("li");
            li.textContent = cursor.value.text;
            li.onclick = () => deleteTask(cursor.key);
            list.appendChild(li);
            cursor.continue();
        }
    };
}

function deleteTask(id) {
    if (!db || !db.objectStoreNames.contains("tasks")) return;
    let tx = db.transaction("tasks", "readwrite");
    let store = tx.objectStore("tasks");
    store.delete(id);
    tx.oncomplete = () => loadTasks();
}

async function syncTasksWithServer() {
    if (!navigator.onLine || !db || !db.objectStoreNames.contains("tasks")) return;

    let tx = db.transaction("tasks", "readonly");
    let store = tx.objectStore("tasks");
    let tasks = [];

    store.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            if (!cursor.value.synced) {
                tasks.push({ id: cursor.value.id, text: cursor.value.text, completed: cursor.value.completed || false });
            }
            cursor.continue();
        } else {
            console.log("📡 XXEnvoi des tâches au serveur:", tasks);
            sendToServer(tasks, db);
        }
    };
}

async function sendToServer(tasks, db) {
    if (tasks.length === 0) return;

    try {
        const response = await fetch("http://localhost:8000/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tasks)
        });

        if (response.ok) {
            console.log("✔️ Synchronisation réussie !");
            let tx = db.transaction("tasks", "readwrite");
            let store = tx.objectStore("tasks");
            tasks.forEach(task => {
                let updatedTask = { ...task, synced: true };
                store.put(updatedTask);
            });
            loadTasks(); // Rafraîchir la liste après synchronisation
        } else {
            console.error("❌ Erreur de synchronisation !");
        }
    } catch (error) {
        console.error("❌ Erreur lors de la requête API", error);
    }
}

const statusCircle = document.getElementById("statusCircle");
const statusText = document.getElementById("statusText");

function updateStatus() {
    if (navigator.onLine) {
        console.log('online !')
        statusCircle.classList.remove("offline");
        statusCircle.classList.add("online");
        statusText.textContent = "Connecté";
        syncTasksWithServer();
    } else {
        console.log('offline !')
        statusCircle.classList.remove("online");
        statusCircle.classList.add("offline");
        statusText.textContent = "Hors ligne";
    }
}

document.addEventListener("DOMContentLoaded", updateStatus);
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);

setInterval(() => {
    if (navigator.onLine) {
        console.log("🔄 Vérification de la connexion en ligne, tentative de synchronisation...");
       // syncTasksWithServer();
    }
    updateStatus(); // Ajout pour mettre à jour le statut même en mode hors ligne
}, 2000);
