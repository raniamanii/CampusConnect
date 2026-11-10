# CampusConnect – Plateforme de vie étudiante (MERN)

Événements universitaires, inscriptions, avis, publication par les clubs avec validation par un administrateur.

## Modèles (Mongoose)
- **User** (nom, email, motDePasse haché, role : etudiant | club | admin)
- **Event** (titre, description, catégorie, date, lieu, capacité, statut, `organisateur` → User, `inscrits` → [User])
- **Feedback** (note, commentaire, `event` → Event, `auteur` → User)

Relations 1→N : User → Event, Event → Feedback (affichage avec `.populate()`).

## Lancer en local
```bash
cd server && cp .env.example .env   # renseigner MONGO_URI et JWT_SECRET
npm install && npm run seed && npm run dev
cd ../client && cp .env.example .env && npm install && npm run dev
```
Comptes de démo (après `npm run seed`) : admin@campus.tn, club@campus.tn, etudiant@campus.tn – mot de passe `password123`.

## Déploiement
1. **MongoDB Atlas** : cluster M0, utilisateur de base, accès réseau 0.0.0.0/0, copier l'URI.
2. **Render** (Web Service, dossier `server/`) : build `npm install`, start `npm start`, variables `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (URL Vercel).
3. **Vercel** (dossier `client/`, preset Vite) : variable `VITE_API_URL` = `https://<votre-api>.onrender.com/api`.
4. Lancer `npm run seed` une fois en local avec l'URI Atlas pour créer les données de démo.

## API
| Méthode | Route | Accès |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | connecté |
| GET | /api/events, /api/events/:id | public |
| POST | /api/events | club, admin |
| PATCH | /api/events/:id/valider | admin |
| DELETE | /api/events/:id | organisateur, admin |
| GET | /api/events/mes-inscriptions | connecté |
| POST / DELETE | /api/events/:id/inscription | connecté |
| GET | /api/events/:id/feedback | public |
| POST | /api/events/:id/feedback | inscrit |
| DELETE | /api/feedback/:id | auteur, admin |
