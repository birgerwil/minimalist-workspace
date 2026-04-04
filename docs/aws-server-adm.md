# AWS Server Administration (Persistence-First)

**Projekt Github:** [birgerwil/minimalist-workspace](https://github.com/birgerwil/minimalist-workspace)
**Live URL:** [http://13.51.242.239](http://13.51.242.239) (Kun HTTP)

Denne guide er skrevet ud fra princippet om **"Persistence-by-Design"**. Det betyder, at serveren kører uafhængigt af din login-session via PM2, så applikationen aldrig stopper, selvom du lukker din PowerShell.

---

## 1. Login (PowerShell)
Husk at stå i mappen med din `.pem` fil:
```powershell
ssh -i "C:\Users\birge\AI\tuner-key.pem" ubuntu@13.51.242.239
```

---

## 2. Standard Workflow: Opdatering & Deploy
Hver gang du har pushet ny kode til Github, skal du køre følgende på serveren. Bemærk at vi bruger `pm2` til at håndtere kørslen autonomt.

```bash
cd ~/minimalist-workspace

# 1. Synkroniser med Github
git pull

# 2. Vedligeholdelse (hvis nødvendigt)
npm install         # Kun hvis package.json er ændret
npm run build       # KRITISK: Bygger de nye filer til Nginx

# 3. Persistence Update
# Dette genstarter processen i baggrunden, uafhængigt af din session
pm2 restart tuner-app
```

> [!TIP]
> Hvis appen slet ikke er startet endnu, bruges:
> `pm2 start server.ts --name "tuner-app" --interpreter tsx`

---

## 3. Status & Overvågning
Da serveren kører uafhængigt i baggrunden, bruger du disse kommandoer til at "kigge ind" i maskinrummet:

| Kommando | Beskrivelse |
| :--- | :--- |
| `pm2 status` | Bekræft at `tuner-app` er "online" (grøn) |
| `pm2 logs tuner-app` | Se fejlmeddelelser og server-output live |
| `pm2 info tuner-app` | Se detaljer (f.eks. hvor på disken appen kører fra) |
| `sudo systemctl restart nginx` | Genstart selve portvagten (Nginx) hvis URL'en driller |

---

## 4. Resource Management (RAM)
Hvis `npm run build` fryser eller serveren føles sløv, skyldes det typisk mangel på RAM (da vi kører på en lille t3.micro). Aktivér Swap (virtuel RAM):
```bash
sudo swapon /swapfile
free -m  # Tjek om Swap nu er aktiv (> 0)
```

---

## 5. Pro-Tip: Hurtig adgang (PowerShell)
Gør dit liv lettere ved at tilføje denne funktion til din `$PROFILE`:
1. `notepad $PROFILE`
2. Indsæt: `function goai { cd C:\Users\birge\AI; ssh -i "tuner-key.pem" ubuntu@13.51.242.239 }`
3. Nu kan du bare skrive **`goai`** for at logge direkte på!

---

## 6. Katastrofe-genopretning: "Hvor er min mappe?"
Hvis mappen `minimalist-workspace` er væk, men appen stadig kører (tjek `pm2 status`), kan du gendanne kildekoden uden at stoppe sitet:
```bash
cd ~
git clone https://github.com/birgerwil/minimalist-workspace.git
cd minimalist-workspace
npm install
npm run build
pm2 restart tuner-app
```
