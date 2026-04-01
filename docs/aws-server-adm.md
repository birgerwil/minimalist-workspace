# AWS Server Administration

**Projekt Github:** [birgerwil/minimalist-workspace](https://github.com/birgerwil/minimalist-workspace)
**Live URL:** [http://13.51.242.239](http://13.51.242.239) (Kun HTTP)

Denne guide indeholder de mest brugte kommandoer til at vedligeholde og opdatere din AI Tuner Workbench på AWS.

## 1. Login (PowerShell)
Åbn PowerShell på din Windows-maskine og kør følgende (husk at stå i mappen med din `.pem` fil):

```powershell
# cd C:\Users\birge\AI
ssh -i "C:\Users\birge\AI\tuner-key.pem" ubuntu@13.51.242.239
```

---

## 2. Opdater Appen (Workflow)
Hver gang du har lavet ændringer i koden lokalt og pushed til Github, skal du køre dette på serveren:

```bash
# Gå ind i projektmappen (hvis du ikke allerede er der)
cd ~/minimalist-workspace

# Hent den nye kode
git pull

# Tjek .env (KRITISK: Mangler der variabler efter opdatering?)
nano .env # (Tjek at VITE_FIREBASE_* er der)

# Installer nye pakker (kun nødvendigt hvis package.json er ændret)
npm install

# BYG APPEN (Dette trin er det vigtigste for at se ændringerne i browseren)
npm run build

# Genstart selve kørslen
pm2 restart tuner-app
```

---

## 3. Status & Fejlfinding
Hvis siden viser "Not Found" eller appen driller:

| Kommando | Beskrivelse |
| :--- | :--- |
| `pm2 status` | Se om appen (`tuner-app`) er "online" |
| `pm2 logs tuner-app` | Se de seneste fejlbeskeder fra appen |
| `pm2 restart tuner-app` | Genstart applikationen |
| `sudo systemctl restart nginx` | Genstart selve web-portvakten (Nginx) |

---

## 4. Hvis serveren hænger (RAM mangel)
Hvis `npm run build` fryser, så aktiver Swap-filen (virtuel RAM) igen:
```bash
sudo swapon /swapfile
```

---

## 5. Pro-Tip: Hurtig adgang i PowerShell (Windows)
Hvis du vil undgå at skrive den lange sti hver gang på din PC, kan du lave en "genvej" i din PowerShell profil:

1. Åbn din profil i Notesblok: `notepad $PROFILE`
2. Indsæt denne linje: `function goai { cd C:\Users\birge\AI }`
3. Gem og luk notesblok.
4. Genstart PowerShell – derefter kan du bare skrive **`goai`** for at hoppe direkte til din nøgle!

---

## 6. Fejlsøgning: "No such file or directory"
Hvis du logger ind og mappen `minimalist-workspace` er væk (eller `dir` er tom), selvom appen kører:

1. **Tjek hvor appen kører fra:**
   ```bash
   pm2 info tuner-app
   ```
   (Kig efter `exec cwd` linjen).

2. **Gendan mappen (hvis den er slettet):**
   Uden mappen kan du ikke køre `git pull`. Gendan den sådan her:
   ```bash
   cd ~
   git clone https://github.com/birgerwil/minimalist-workspace.git
   cd minimalist-workspace
   npm install
   npm run build
   pm2 restart tuner-app
   ```

3. **Tjek RAM (Swap):**
   Hvis serveren føles "sløv" eller hænger ved `npm run build`:
   ```bash
   free -m  # Se ledig RAM
   sudo swapon /swapfile # Aktiver ekstra RAM
   ```
