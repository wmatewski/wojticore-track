# Wojticore Track

Nowa wersja aplikacji do skrotow linkow i trackingu klikniec zbudowana na:

- Next.js 16.1.6
- React 19 + TypeScript
- Tailwind CSS 4
- PostgreSQL na Neon
- Prisma 7
- Clerk z wlasnymi ekranami logowania i rejestracji

## Co zostalo przeniesione ze starego PHP

- rejestracja i logowanie uzytkownikow
- prywatny dashboard z lista tylko wlasnych linkow
- tworzenie nowych skrotow
- usuwanie linkow
- publiczny redirect po kodzie `/[code]`
- zapis wizyt i podstawowej analityki
- dopisywanie danych przegladarki po stronie klienta przed przekierowaniem

## Wymagane zmienne srodowiskowe

Skopiuj wartosci z `.env.example` i podmien na swoje dane z Neon:

```env
DATABASE_URL="postgresql://USER:PASSWORD@YOUR-NEON-HOST-pooler/YOUR_DB?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://USER:PASSWORD@YOUR-NEON-HOST/YOUR_DB?sslmode=require&channel_binding=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_replace_me"
CLERK_SECRET_KEY="sk_test_replace_me"
```

`DATABASE_URL` jest uzywany przez runtime aplikacji z adapterem Neon i powinien wskazywac na host z `-pooler`.
`DIRECT_URL` jest uzywany przez Prisma CLI (`db:push`, `db:migrate`, `db:generate`) i powinien wskazywac na bezposredni host bazy.
`NEXT_PUBLIC_APP_URL` jest jedynym publicznym adresem bazowym aplikacji i sluzy tez do budowania linkow skroconych.
Konta email/password i Google wymagaja dodatkowo skonfigurowanego projektu Clerk oraz wlaczonych providerow w panelu Clerk.

## Pierwsze uruchomienie

1. Zainstaluj zaleznosci:

```bash
npm install
```

2. Wygeneruj klienta Prisma:

```bash
npm run db:generate
```

3. Wypchnij schemat do bazy Neon albo utworz migracje lokalnie:

```bash
npm run db:push
```

lub

```bash
npm run db:migrate
```

4. Uruchom aplikacje developersko:

```bash
npm run dev
```

5. Otworz `http://localhost:3000`.

## Dostepne skrypty

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
```

## Struktura funkcjonalna

- `src/app/(auth)` - logowanie i rejestracja
- `src/app/(app)/dashboard` - prywatny panel i analityka wlasciciela
- `src/app/[code]/route.ts` - publiczny skrot linku
- `src/app/visit/[visitId]` - ekran zapisujacy dane klienta przed redirectem
- `src/app/oauth-callback` - finalizacja logowania Google przez Clerk
- `src/app/api/visits/[visitId]/details` - dopisanie danych przegladarki do wizyty
- `middleware.ts` - ochrona dashboardu przez Clerk
- `prisma/schema.prisma` - modele `User`, `Link` i `Visit`

## Uwagi wdrozeniowe

- Statyczny landing page i cala strefa auth/dashboard sa gotowe pod deploy na Vercel albo inny hosting wspierajacy Next.js.
- Jesli wdrazasz pod wlasna domena, ustaw `NEXT_PUBLIC_APP_URL` na finalny adres aplikacji i skonfiguruj ten sam adres w ustawieniach domen Clerk.
- Publiczny link skrocony ma format `https://twoja-domena/[code]`.
