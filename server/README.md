# Iwosan API

Backend Node.js/Express pour la plateforme Iwosan.

## Prerequis

- Node 18+
- PostgreSQL
- Redis, optionnel en developpement
- Compte Cloudinary, Moneroo et SMTP pour la production

## Installation

```bash
cd server
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run dev
```

## Variables d'environnement

Voir `.env.example`. Les variables critiques sont `DATABASE_URL`, les secrets JWT, `CLIENT_URL`, puis les cles Cloudinary, Moneroo, SMTP et Cloudflare Turnstile.

## Commandes

- `npm run dev` : API en watch mode
- `npm run build` : compile TypeScript
- `npm start` : lance `dist/index.js`
- `npm run prisma:migrate` : migration Prisma
- `npm run prisma:generate` : generation Prisma Client
- `npm run seed` : donnees demo

## Architecture

- `src/controllers` : logique HTTP par module
- `src/routes` : endpoints REST
- `src/middlewares` : auth, RBAC, KYC, validation, i18n, securite
- `src/services` : integrations Moneroo, Cloudinary, email, Socket.io, MLM
- `src/jobs` : cron jobs
- `prisma` : schema et seed

## Flux Moneroo

`POST /api/payments/initiate` cree une intention de paiement et retourne une URL checkout. `POST /api/webhooks/moneroo` verifie la signature HMAC, marque la commande `PAID`, conserve les fonds en sequestre et declenche les commissions MLM.

## Flux MLM

A l'inscription, un `MLMNode` est cree. Si un code parrain existe, le node est rattache au parent. Apres paiement confirme, le service MLM calcule la commission directe et remonte 3 niveaux configurables.

## Roles

| Role         | Capacites principales                    |
| ------------ | ---------------------------------------- |
| USER         | Achat, forum, wallet, notifications      |
| PROFESSIONAL | Produits, articles autorises, evenements |
| RESEARCHER   | Contribution scientifique future         |
| MODERATOR    | Moderation forum                         |
| ADMIN        | Administration complete                  |

## Deploiement Render / Hostinger Node.js

Depuis la racine du repo, utiliser :

```bash
npm run render:build
npm start
```

Le build compile le frontend TanStack Start, installe le backend, genere Prisma Client, applique les migrations avec `prisma migrate deploy`, puis compile Express.

Variables obligatoires en production : `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EMAIL_SECRET`, `JWT_PASSWORD_RESET_SECRET`, `CLIENT_URL`.

Si l'hebergeur ne fournit pas d'URL directe PostgreSQL separee, mettre `DIRECT_URL` a la meme valeur que `DATABASE_URL`.

## Deploiement VPS

Installer Node, PostgreSQL et Redis. Utiliser un reverse proxy Nginx vers le port API, configurer HTTPS, puis gerer le process avec PM2 ou systemd.
