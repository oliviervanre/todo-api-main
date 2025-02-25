/// Fichier: app.js

// Initialisation de la base de données IndexedDB
let db;
const request = indexedDB.open("todoDB", 1);

/**
 * Événement déclenché si la base de données n'existe pas encore
 * ou si sa version est mise à jour.
 * Permet de créer la structure de la base de données (object store, index, etc.).
 */
request.onupgradeneeded = function(event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains("tasks")) {
        db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
    }
};

// Gestion des erreurs lors de l'ouverture de la base de données
request.onerror = function(event) {
    console.error("❌ Erreur d'ouverture de IndexedDB", event.target.error);
};

// Une fois la base de données ouverte avec succès, charger les tâches
request.onsuccess = function(event) {
    db = event.target.result;
    console.log("📂 Base IndexedDB ouverte avec succès avec nouveau appjs");
    loadTasks();
};

/**
 * Ajoute une tâche dans IndexedDB et déclenche la synchronisation immédiate si en ligne.
 */
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
        if (navigator.onLine) {
            syncTasksWithServer(); // Synchroniser immédiatement si en ligne
        }
    };
}

/**
 * Charge les tâches enregistrées dans IndexedDB et les affiche dans la liste.
 */
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

/**
 * Supprime une tâche de IndexedDB et met à jour l'affichage.
 */
function deleteTask(id) {
    if (!db || !db.objectStoreNames.contains("tasks")) return;
    let tx = db.transaction("tasks", "readwrite");
    let store = tx.objectStore("tasks");
    store.delete(id);
    tx.oncomplete = () => loadTasks();
}

/**
 * Synchronise les tâches non envoyées avec le serveur si une connexion est disponible.
 */
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
            console.log("📡 Envoi des tâches au serveur:", tasks);
            sendToServer(tasks, db);
        }
    };
}

/**
 * Envoie les tâches au serveur et met à jour leur statut en local si l'envoi réussit.
 */
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

// Gestion de l'état en ligne/hors ligne de l'utilisateur
const statusCircle = document.getElementById("statusCircle");
const statusText = document.getElementById("statusText");

/**
 * Met à jour l'affichage de l'état réseau et tente une synchronisation si en ligne.
 */
function updateStatus() {
    if (navigator.onLine) {
        statusCircle.classList.remove("offline");
        statusCircle.classList.add("online");
        statusText.textContent = "Connecté";
        syncTasksWithServer();
    } else {
        statusCircle.classList.remove("online");
        statusCircle.classList.add("offline");
        statusText.textContent = "Hors ligne";
    }
}

// Écoute les événements du navigateur pour détecter les changements d'état réseau
document.addEventListener("DOMContentLoaded", updateStatus);
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);

// Suppression de setInterval car la synchronisation est maintenant déclenchée dynamiquement
