# AWS Deployment Guide: Publicér AI Tuner Workbench 🚀

Denne guide er skrevet til dig uden forudgående erfaring med AWS. Formålet er at omdanne vores nuværende lokale applikation til en fuldt kørende, offentligt tilgængelig webløsning på en gratis server.

Vi udnytter **AWS Free Tier**, hvilket betyder, at hvis dette er din første AWS-konto, kan du køre serveren gratis i 12 måneder (ved valg af `t2.micro` eller `t3.micro`).

---

## 🏗️ Trin 1: Opret din AWS EC2-Server

1. Log ind på din [AWS Console](https://aws.amazon.com/console/).
2. Søg efter **EC2** i toppen og klik på det.
3. Klik på den orange knap **Launch Instance** (Start instans).
4. **Navngiv** din server (f.eks. `AI-Tuner-Server`).
5. Vælg **Ubuntu** under *Application and OS Images* (Ubuntu 24.04 LTS eller 22.04 LTS).
6. Under *Instance Type* skal du sikre dig, at der står **`t2.micro`** (eller `t3.micro`). Der vil stå *"Free tier eligible"* ved siden af!
7. **Key Pair (Login):** Klik *Create new key pair*, kald den `tuner-nøgle`, lad alt være standard, og tryk *Create*. **Gem filen (.pem) et super sikkert sted på din PC!** Du skal bruge den til at logge ind.
8. **Network Settings:** Kryds *både* **Allow HTTP traffic from the internet** og **Allow HTTPS traffic...** af. (Dette er kritisk for at folk kan besøge din app).
9. Klik **Launch Instance** ude til højre.

---

## 🔑 Trin 2: Log ind på din Server

Din server kører nu et sted i et af Amazons datacentre. Nu skal vi logge ind på terminalen på den.

1. I AWS EC2 konsollen, gå til **Instances (running)**.
2. Klik på dit `AI-Tuner-Server` ID, og find din **Public IPv4 address** under *Details*. Kopiér den.
3. På din egen Windows PC: Åbn PowerShell eller Terminal.
4. Navigér til mappen hvor du gemte `.pem`-nøglen: 
   ```powershell
   cd Downloads
   ```
5. Log ind via SSH med denne kommando (skift `Din-IP-Her` ud med din EC2 IP):
   ```powershell
   ssh -i "tuner-nøgle.pem" ubuntu@Din-IP-Her
   ```
   *Skriv `yes` hvis den spørger om tillid til fingerprintet.*

*(Nu befinder du dig på selve Linux-serveren! Herfra er alle kommandoer Linux)*

---

## 🛠️ Trin 3: Installer det nødvendige software (Node.js & Nginx)

Kør følgende kommandoer linje for linje på serveren:

**1. Opdater serveren:**
```bash
sudo apt update && sudo apt upgrade -y
```

**2. Installer Git (til at hente din kode):**
```bash
sudo apt install git -y
```

**3. Installer Node.js (version 20):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**4. Installer PM2 (PM2 holder din app kørende 24/7):**
```bash
sudo npm install -g pm2
```

**5. Installer Nginx (Web-portvakten der modtager trafik på port 80/443):**
```bash
sudo apt install nginx -y
```

---

## 📦 Trin 4: Hent din kode og start appen

For at serveren kan køre din app, skal du have pushet din nuværende app op på Github og hente den ned på serveren.

**1. Hent din app fra Github:**
*(Husk at udskifte URL'en med dit eget open-source repository)*
```bash
git clone https://github.com/DitBrugernavn/ai-tuner-workbench.git
cd ai-tuner-workbench
```

**2. Installer afhængigheder & Byg applikationen:**
```bash
npm install
```

**2. Opret din .env fil (KRITISK for Firebase):**
Da vi ikke gemmer koder i koden, skal du oprette en fil med dine Firebase-oplysninger direkte på serveren:
```bash
nano .env
```
Paste følgende ind (skift "..." ud med dine egne data fra Firebase Console):
```bash
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
VITE_GEMINI_API_KEY="..." # Valgfrit: System-nøgle hvis brugeren ikke har sin egen
```
*(Tryk `Ctrl+O`, `Enter`, `Ctrl+X` for at gemme og lukke).*

**3. Byg applikationen:**
```bash
npm run build
```

**3. Start Express-serveren via PM2:**
```bash
NODE_ENV=production pm2 start server.ts --interpreter ./node_modules/.bin/tsx --name tuner-app
```

**4. Sæt PM2 til at starte automatisk hvis serveren genstarter:**
```bash
pm2 save
pm2 startup
```
*(Kopiér og kør den kommando som PM2 beder dig om at køre).*

Appen kører nu internt på Port `3000` på serveren!

---

## 🌍 Trin 5: Send verdens trafik ind i appen (Nginx)

Nu opsætter vi Nginx, som tager trafikken fra internettet (Port 80) og sender den ind til vores app (Port 3000).

1. Opsæt en ny config fil:
```bash
sudo nano /etc/nginx/sites-available/tuner-app
```
2. Paste dette ind:
```nginx
server {
    listen 80;
    server_name dit-domæne.dk www.dit-domæne.dk; # Skift dette eller brug din IP til at starte med

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*(Tryk `Ctrl+O`, så `Enter` for at gemme. Tryk `Ctrl+X` for at lukke filedatoren).*

3. Aktiver konfigurationen og genstart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/tuner-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Nu burde du kunne besøge din App ved at skrive serverens IP-adresse ind i en webbrowser!

---

## 🔒 Trin 6: Domæne & Sikkerhed (SSL / HTTPS)

Når du har købt dit domæne (f.eks. på Namecheap eller Cloudflare), skal du opsætte en **A-Record** i dine DNS-indstillinger, der peger på din EC2 indstans' IP-adresse.

Når domænet virker (du kan besøge appen via _dit-domæne.dk_), skal du tilføje hængelåsen (HTTPS):

1. **Installer Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. **Udsted et gratis certifikat:**
```bash
sudo certbot --nginx -d dit-domæne.dk -d www.dit-domæne.dk
```

Certbot spørger om lidt info og genstarter selv Nginx. Dit domæne er nu grønt, sikkert, og din app er ude til det brede publikum! 🎉

---

## 🚀 Trin 7: Pro-Tip: RAM-Optimering (Hvis build fejler)

Gratis AWS-servere (`t2.micro`) har kun 1GB RAM. Nogle gange fryser `npm run build` fordi det kræver mere hukommelse. Løsningen er at oprette en **Swap-fil** (virtuel RAM):

```bash
# Opret en 2GB swap fil
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Gør den permanent (valgfrit)
echo '/swapfile lib none swap sw 0 0' | sudo tee -a /etc/fstab
```

Hvis din build nogensinde fejler i fremtiden, så tjek om swap er aktiv med `free -m`.
