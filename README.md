# 📌 PWA Todo List avec IndexedDB et API Symfony

## 📖 Description
Ce projet est une **Progressive Web App (PWA)** qui permet de gérer une liste de tâches (Todo List) avec **IndexedDB** en mode hors ligne et synchronisation avec une API Symfony lorsque l'application repasse en ligne.

### 🎯 Fonctionnalités principales
- 📌 **Ajout, suppression et affichage de tâches** en local avec IndexedDB.
- 🔄 **Synchronisation automatique** avec une API Symfony lorsqu'une connexion Internet est disponible.
- 🛜 **Détection de l'état en ligne/hors ligne** pour informer l'utilisateur.
- 💾 **Stockage persistant** via IndexedDB permettant un fonctionnement hors ligne.
- 📱 **Progressive Web App (PWA)** avec Service Worker et Manifest pour une installation sur mobile.

---

## 🚀 Installation et Lancement

### 1️⃣ **Cloner le projet**
```bash
 git clone https://github.com/votre-repository/pwa-todo.git
 cd pwa-todo
```

### 2️⃣ **Installation des dépendances Symfony**
```bash
composer install
```

### 3️⃣ **Lancer le serveur Symfony**
```bash
symfony server:start
```

### 4️⃣ **Vérifier que l'API est accessible**
```bash
curl -I http://localhost:8000/api/tasks
```
> Si une redirection 307 apparaît, lancer :
```bash
symfony server:start --no-tls
```

---

## 📦 Structure du projet
```
/public
   ├── manifest.json  # Déclare la PWA
   ├── sw.js  # Service Worker pour le cache
   ├── js/
   │   ├── app.js  # Logique principale de la PWA
   ├── css/
   │   ├── style.css  # Styles de l'application
/src
   ├── Controller/
   │   ├── PwaController.php  # Affichage de l'application
   │   ├── TaskController.php  # API Symfony pour gérer les tâches
/templates
   ├── pwa/
   │   ├── index.html.twig  # Interface utilisateur (frontend PWA)
```

---

## 🔧 Configuration du Manifest PWA
Le fichier **`public/manifest.json`** définit les paramètres de la PWA.

```json
{
  "name": "Ma PWA Todo List",
  "short_name": "PWA Todo",
  "start_url": "/pwa",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/images/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔗 API Symfony (Endpoints disponibles)
| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/tasks` | Récupérer la liste des tâches |
| `POST` | `/api/tasks` | Ajouter une nouvelle tâche |
| `DELETE` | `/api/tasks/{id}` | Supprimer une tâche |

**Exemple d'ajout d'une tâche avec `curl` :**
```bash
curl -X POST http://localhost:8000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"text": "Faire les courses"}'
```

---

## 📱 Installation en tant que PWA
1. **Ouvrir l'application dans Chrome/Edge sur mobile ou desktop.**
2. **Cliquer sur "Ajouter à l'écran d'accueil".**
3. **L'application s'installe comme une app native !**

---

## 🛠 Développement et Debug
### 🐞 Voir les logs IndexedDB dans le navigateur
1. **Ouvrir les DevTools (`F12`)**
2. **Aller dans Application > IndexedDB**
3. **Consulter la base `todoDB` et l'object store `tasks`**

### 🔄 Désenregistrer un Service Worker obsolète
Si des problèmes de cache persistent après une modification de `sw.js` :
1. **Aller dans `F12 > Application > Service Workers`**
2. **Cliquer sur "Unregister"**
3. **Recharger la page (`Ctrl + Shift + R`)**

---

## 🚧 Problèmes fréquents et solutions
| Problème | Solution |
|----------|---------|
| **Manifest non détecté** | Vérifier que `<link rel="manifest" href="/manifest.json">` est bien dans `<head>` |
| **Service Worker ne s'enregistre pas** | Vérifier que `sw.js` est bien accessible à `http://localhost:8000/sw.js` |
| **Erreur CORS** | Vérifier `nelmio_cors.yaml` et lancer `symfony server:start --no-tls` |

---

## ✨ Contribuer
1. **Forker ce projet**
2. **Créer une branche** (`feature/nouvelle-fonction`)
3. **Faire un commit** (`git commit -m "Ajout de la fonctionnalité X"`)
4. **Créer une Pull Request** 🎉

---
