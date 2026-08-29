# Khan Store — Premium Swiss Watches Full-Stack Application

Khan Store — Shveytsariya premium soatlari uchun mo'ljallangan, "Quiet Luxury" vizual uslubiga ega, full-stack elektron tijorat platformasi.

---

## 🚀 Texnologik Stek

### Frontend
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + Quiet Luxury Design System (Obsidian, Charcoal Slate & Champagne Gold)
- **Animations**: Framer Motion & Lenis Smooth Scroll
- **State Management**: Zustand (Savat va Auth holati) + TanStack React Query v5
- **Form Handling**: React Hook Form + Zod

### Backend
- **Framework**: Python 3.11 + FastAPI (Async REST API)
- **ORM & DB**: SQLAlchemy 2.0 (Async Engine) + Alembic Migrations
- **Database**: MySQL 8.0
- **Security**: JWT (Access Tokens), Passlib + Bcrypt parollarni heshlash
- **Cache**: Redis 7

### Deployment & Containerization
- **Containers**: Docker & Docker Compose
- **Web Server & Reverse Proxy**: Nginx

---

## 📁 Papka Tuzilishi

```text
khan-store/
├── frontend/               # Next.js 14 App Router ilovasi
│   ├── src/
│   │   ├── app/            # App Router (page.tsx, shop, product, checkout, admin)
│   │   ├── components/     # Navbar, HeroSection, ProductCard, CartDrawer, AuthModal, Footer
│   │   ├── lib/            # api.ts (Axios), providers.tsx (Lenis & React Query)
│   │   └── store/          # Zustand (useCartStore, useAuthStore)
│   ├── public/
│   ├── tailwind.config.js
│   └── Dockerfile
├── backend/                # FastAPI Python ilovasi
│   ├── app/
│   │   ├── api/            # API Routerlar (auth, products, categories, brands, cart, orders, admin)
│   │   ├── core/           # Config, Database ulanish, Security
│   │   ├── models/         # SQLAlchemy 2.0 async modellari
│   │   └── main.py         # FastAPI ilovasining kirish nuqtasi
│   ├── alembic/            # Database migratsiyalar
│   ├── seed.py             # Demo ma'lumotlarni yuklash skripti
│   ├── requirements.txt
│   └── Dockerfile
├── nginx/
│   └── nginx.conf          # Reverse Proxy va Nginx sozlamalari
├── docker-compose.yml      # Local Development uchun
├── docker-compose.prod.yml # Production (Nginx + VPS) uchun
└── README.md
```

---

## 🛠️ Lokal Muhitda Ishga Tushirish (Development)

### Option A: Docker Compose Bilan (Tavsiya etiladi)

1. Root katalogda `.env` faylini yaratib sozlang:
   ```bash
   cp .env.example .env
   ```

2. Docker konteynerlarni ishga tushiring:
   ```bash
   docker-compose up --build
   ```

3. Backend bazasini seed ma'lumotlar bilan to'ldirish uchun:
   ```bash
   docker exec -it khan_backend python seed.py
   ```

4. Brauzerda quyidagi manzillarga kiring:
   - **Frontend App**: `http://localhost:3000`
   - **Backend API Docs (Swagger)**: `http://localhost:8000/docs`

---

### Option B: Handheld / Qo'lda Ishga Tushirish

#### 1. Backend (FastAPI):
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend (Next.js):
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 VPS Serverga Deploy Qilish Qo'llanmasi (Production)

### 1. VPS Server Tayyorgarligi (Ubuntu 22.04 LTS)

Serverga kirib Docker va Docker Compose paketlarini o'rnating:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git certbot
sudo systemctl enable --now docker
```

### 2. Loyihani Serverga Klonshering Qilish

```bash
cd /var/www
git clone <repository_url> khan-store
cd khan-store
```

### 3. Environment O'zgaruvchilarini Sozlash

```bash
cp .env.example .env.prod
nano .env.prod
```
`.env.prod` fayliga kuchli va maxfiy parollarni kiriting (`SECRET_KEY`, `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`).

### 4. Production Docker Compose ni Ishga Tushirish

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

### 5. Bazaga Demo Ma'lumotlarni Yuklash

```bash
docker exec -it khan_backend_prod python seed.py
```

### 6. SSL Sertifikatini O'rnatish (Let's Encrypt / Certbot)

```bash
sudo certbot --nginx -d domeningiz.uz -d www.domeningiz.uz
```

---

## 🔑 Demo Kirish Ma'lumotlari

- **Admin Account**:
  - Email: `admin@khanstore.uz`
  - Parol: `admin123`

- **Mijoz (Client) Account**:
  - Email: `client@khanstore.uz`
  - Parol: `client123`
