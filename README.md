# Na-Ogrodowej

Bezpłatna wymiana nasion między ogrodnikami — MVP aplikacji full-stack.

## Stack

| Warstwa | Technologia |
|---------|-------------|
| Frontend + API | Next.js 15 (App Router, Server Actions) |
| Język | TypeScript |
| UI | Tailwind CSS 4 |
| Baza + Auth | Supabase (PostgreSQL, RLS) |
| Stan klienta | Zustand (koszyk) |
| Kontenery | Docker Compose, multi-stage builds |

Szczegóły architektury: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Funkcje MVP

- Rejestracja i logowanie (Supabase Auth)
- Dodawanie paczek nasion (limit konfigurowalny)
- Zatwierdzanie paczek przez admina po dostarczeniu
- Lista dostępnych nasion (tylko zatwierdzone, ilość > 0)
- Koszyk i składanie zamówień
- Panel administratora (ustawienia, zatwierdzenia, zamówienia)
- Godzina „dropu” nasion i limity ilości

## Wymagania

- Node.js 22+
- Konto [Supabase](https://supabase.com)
- Docker & Docker Compose (opcjonalnie, do dev w kontenerze)

## Szybki start

### 1. Supabase

1. Utwórz projekt na [supabase.com](https://supabase.com).
2. W **SQL Editor** uruchom migrację z pliku:
   `supabase/migrations/20250525000000_initial_schema.sql`
3. W **Authentication → Providers** włącz Email.
4. Skopiuj URL i klucze z **Settings → API**.

### 2. Zmienne środowiskowe

```bash
cp .env.example .env.local
```

Uzupełnij:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # opcjonalnie, tylko po stronie serwera
```

### 3. Uruchomienie lokalne (bez Dockera)

```bash
npm install
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)

### 4. Docker Compose (dev)

```bash
cp .env.example .env.local
# uzupełnij .env.local

docker compose up --build
```

| Kontener | Nazwa | Port |
|----------|-------|------|
| Dev app | `na-ogrodowej-app-dev` | 3000 |

Wolumeny:

- `na-ogrodowej-node-modules` — `node_modules`
- `na-ogrodowej-next-cache` — cache `.next`

### 5. Produkcja w Dockerze

```bash
docker compose --profile prod up --build
```

Kontener: `na-ogrodowej-app-prod`

## Pierwszy administrator

Po rejestracji użytkownika w Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'twoj@email.pl';
```

## Strony

| Ścieżka | Opis |
|---------|------|
| `/` | Strona główna |
| `/login` | Logowanie |
| `/register` | Rejestracja |
| `/dashboard` | Panel użytkownika |
| `/seeds/add` | Dodawanie nasion |
| `/seeds/available` | Dostępne nasiona |
| `/cart` | Koszyk |
| `/admin` | Panel admina |

## Reguły biznesowe

1. Zamówienia wymagają co najmniej **jednej zatwierdzonej** paczki użytkownika.
2. Widoczne są tylko paczki `approved` z `quantity_available > 0`.
3. Limit paczek na użytkownika — `app_settings.max_packages_per_user`.
4. Limit sztuk na rodzaj nasion — `max_quantity_per_seed_per_user`.
5. Zamówienia możliwe od godziny `seed_drop_hour` (domyślnie 18:00).
6. Admin ręcznie zatwierdza lub odrzuca dostarczone paczki.

## Schemat bazy

Tabele: `profiles`, `app_settings`, `seed_packages`, `orders`, `order_items`

Enumy: `user_role`, `package_status`, `order_status`

RLS włączone na wszystkich tabelach — szczegóły w migracji SQL.

## Struktura projektu

```
src/
├── app/           # Strony (App Router)
├── components/    # UI i formularze
├── lib/           # Supabase, actions, walidacja
├── stores/        # Zustand
└── types/         # Typy TypeScript
supabase/migrations/
docs/ARCHITECTURE.md
```

## Skrypty

```bash
npm run dev      # serwer deweloperski
npm run build    # build produkcyjny
npm run start    # start po buildzie
npm run lint     # ESLint
```

## Licencja

Prywatny projekt MVP — do użytku społeczności Na-Ogrodowej.
