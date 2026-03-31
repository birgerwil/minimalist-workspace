# CONTRIBUTING.md — AI Tuner Workbench

Tak for at du vil bidrage. Dette dokument beskriver spillereglerne.

---

## 1. Kom i gang

```bash
git clone <repo-url>
cd <projekt>
npm install
cp .env.example .env.local   # Tilføj dine nøgler
npm run dev
```

## 2. Branch-navngivning

| Type         | Prefix          | Eksempel                      |
|:-------------|:----------------|:------------------------------|
| Ny funktion  | `feature/`      | `feature/booking-kalender`    |
| Fejlrettelse | `fix/`          | `fix/dobbeltbooking-crash`    |
| Refaktorering| `refactor/`     | `refactor/state-management`   |
| Dokumentation| `docs/`         | `docs/api-eksempler`          |
| Hotfix       | `hotfix/`       | `hotfix/kritisk-login-bug`    |

## 3. Commit-format (Conventional Commits)

```
<type>(<scope>): <beskrivelse på dansk>

feat(booking): tilføj pessimistisk låsning af tidsslots
fix(auth): ret JWT-udløb ved stille tab-inaktivitet
docs(api): tilføj eksempler til send-sms endpoint
```

**Typer:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 4. Pull Request-regler

- [ ] Alle tests er grønne (`npm test`)
- [ ] TypeScript-fejl: 0 (`npx tsc --noEmit`)
- [ ] Ingen `console.log` i produktion
- [ ] CHANGELOG.md opdateret
- [ ] Beskrivende PR-titel på dansk

## 5. Kodestil

- **TypeScript:** Strict mode — ingen `any`
- **Kommentarer:** Dansk i forretningslogik, engelsk i teknisk kode
- **Komponentnavne:** PascalCase · **Hooks:** `use`-prefix · **Konstanter:** SCREAMING_SNAKE_CASE
- **Linting:** Kør `npm run lint` inden commit

## 6. Rapportér en fejl

Opret et issue med:
1. Hvad forventede du?
2. Hvad skete der i stedet?
3. Trin til reproduction
4. Browser/OS-version

> For sikkerhedsproblemer — se **SECURITY.md**. Rapportér IKKE sikkerhedsfejl som offentlige issues.
