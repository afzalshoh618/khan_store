import os
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product, ProductImage, ProductAttribute, QualityTier

logger = logging.getLogger("khan_store_seed")


async def seed_data(drop_existing: bool = False):
    async with engine.begin() as conn:
        if drop_existing:
            await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        logger.info("[+] Seeding database with initial admin, brands, and products...")

        # 1. Create Admin User
        admin_email = os.getenv("ADMIN_EMAIL", "admin@khanstore.uz")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

        res_user = await session.execute(select(User).where(User.email == admin_email))
        existing_admin = res_user.scalars().first()

        if not existing_admin:
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash(admin_password),
                full_name="Khan Store Admin",
                phone="+998901234567",
                role=UserRole.ADMIN,
            )
            session.add(admin_user)
            await session.commit()
            logger.info(f"[+] Admin user created: Email='{admin_email}'")
        else:
            logger.info(f"[+] Admin user already exists: Email='{admin_email}'")

        # 2. Check if products already exist
        res_prod = await session.execute(select(Product))
        if res_prod.scalars().first():
            logger.info("[+] Products already exist in database. Skipping product seed.")
            await session.commit()
            return

        # 3. Main Category: Soatlar
        res_cat = await session.execute(select(Category).where(Category.slug == "watch"))
        cat_watch = res_cat.scalars().first()
        if not cat_watch:
            cat_watch = Category(
                name="Soatlar",
                slug="watch",
                description="Klassik, sport va eksklyuziv qo'l soatlari kolleksiyasi.",
                image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
                display_order=1,
            )
            session.add(cat_watch)
            await session.flush()

        # 4. Create Brands (Exact 19 Brands)
        brands_data = [
            ("Rolex", "rolex", "Shveytsariya afsonaviy soat brendi"),
            ("Patek Philippe", "patek-philippe", "Hashamatli Shveytsariya soat uyi"),
            ("Cartier", "cartier", "Fransiya va Shveytsariya zargarlik va soat uyi"),
            ("Audemars Piguet", "audemars-piguet", "Royallik va sport xronograflari"),
            ("Tissot", "tissot", "Shveytsariya klassik soatlari"),
            ("Rado", "rado", "Shveytsariya keramik va yuqori texnologik soatlari"),
            ("Casio", "casio", "Yaponiya kvars va elektron soatlari"),
            ("Orient", "orient", "Yaponiya mexanik soatlari"),
            ("Seiko", "seiko", "Yaponiya mexanik va avtomatik soatlari"),
            ("Richard Mille", "richard-mille", "Yuqori texnologiyali ultra-lux soatlar"),
            ("West End Co", "west-end-co", "Klassik va harbiy uslubdagi soatlar"),
            ("Bulova", "bulova", "Amerika va Shveytsariya aniq kvars soatlari"),
            ("Khan", "khan", "Khan Store eksklyuziv soat brendi"),
            ("Frank Muller", "frank-muller", "Murakkab va noodatiy dizayndagi Shveytsariya soatlari"),
            ("Jacob & Co", "jacob-and-co", "Hashamatli va fantastik zargarlik soatlari"),
            ("Hublot", "hublot", "Zamonaviy fujn dizaynli soatlar"),
            ("Omega", "omega", "Kosmos va g'avvoslar soat markasi"),
            ("Gucci", "gucci", "Italiya moda va lyuks soatlari"),
            ("Chopard", "chopard", "Shveytsariya zargarlik va oliy toifa soat markasi"),
        ]

        created_brands = {}
        for name, slug, desc in brands_data:
            res_b = await session.execute(select(Brand).where(Brand.slug == slug))
            b = res_b.scalars().first()
            if not b:
                b = Brand(name=name, slug=slug, description=desc, country="International")
                session.add(b)
                await session.flush()
            created_brands[slug] = b

        # 5. Products Payload
        products_payload = [
            # --- ORIGINAL ---
            {
                "name": "Tissot PRX Powermatic 80 Blue",
                "slug": "tissot-prx-powermatic-80-blue",
                "short_description": "Rasmiy Shveytsariya avtomatik mexanizmi, 80 soat quvvat zahirasi va moviy siferblat.",
                "description": "Tissot PRX 1978-yilgi klassik dizaynning zamonaviy talqini. 80 soatlik quvvat zahirasiga ega Powermatic 80 avtomatik mexanizmi va sapfir shisha bilan ta'minlangan.",
                "price": 8500000.0,
                "original_price": 9200000.0,
                "stock_quantity": 8,
                "is_featured": True,
                "is_new": True,
                "brand": created_brands["tissot"],
                "category": cat_watch,
                "quality_tier": QualityTier.ORIGINAL,
                "gender": "Erkaklar uchun",
                "mechanism": "Avtomatik",
                "case_material": "316L Zanglamaydigan po'lat",
                "images": [
                    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Suv o'tkazmaslik", "100m / 10 ATM"),
                    ("Korpus diametri", "40 mm"),
                    ("Shisha", "Sapfir"),
                    ("Sifat Darajasi", "Original"),
                ],
            },
            {
                "name": "Casio Edifice EFV-550D Chronograph",
                "slug": "casio-edifice-efv-550d",
                "short_description": "Original Yaponiya kvars mexanizmi va sport xronograf dizayni.",
                "description": "Casio Edifice har kunlik taqish uchun mukammal xronograf. 100m suv o'tkazmaslik va sekundomer funksiyasiga ega.",
                "price": 1850000.0,
                "original_price": 2100000.0,
                "stock_quantity": 12,
                "is_featured": True,
                "is_new": False,
                "brand": created_brands["casio"],
                "category": cat_watch,
                "quality_tier": QualityTier.ORIGINAL,
                "gender": "Erkaklar uchun",
                "mechanism": "Kvars",
                "case_material": "Po'lat",
                "images": [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Suv o'tkazmaslik", "100m"),
                    ("Korpus diametri", "47 mm"),
                    ("Mexanizm", "Kvars (Yaponiya)"),
                    ("Sifat Darajasi", "Original"),
                ],
            },
            {
                "name": "Seiko 5 Sports Automatic SRPE55K1",
                "slug": "seiko-5-sports-automatic",
                "short_description": "Original Yaponiya 4R36 avtomatik mexanizmi va qora klassik siferblat.",
                "description": "Seiko 5 Sports — ishonchlilik va chidamlilik timsoli. Shafqatsiz sharoitlarga chidamli Hardlex shishasi va haftaning kuni bilan ta'minlangan.",
                "price": 3900000.0,
                "original_price": 4300000.0,
                "stock_quantity": 6,
                "is_featured": False,
                "is_new": True,
                "brand": created_brands["seiko"],
                "category": cat_watch,
                "quality_tier": QualityTier.ORIGINAL,
                "gender": "Erkaklar uchun",
                "mechanism": "Avtomatik",
                "case_material": "Po'lat",
                "images": [
                    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Suv o'tkazmaslik", "100m"),
                    ("Korpus diametri", "40 mm"),
                    ("Quvvat zahirasi", "41 soat"),
                    ("Sifat Darajasi", "Original"),
                ],
            },

            # --- SUPER KLON 1:1 ---
            {
                "name": "Rolex Submariner Date Gold Black (Super Klon 1:1)",
                "slug": "rolex-submariner-date-super-clone",
                "short_description": "Original bilan og'irligi, korpusi va avtomatik Cal.3235 mexanizmi bo'yicha 1:1 klon.",
                "description": "Eng yuqori Super Klon 1:1 sifat darajasi. Sapfir shisha, 904L zanglamaydigan po'lat va haqiqiy keramik bezel.",
                "price": 12500000.0,
                "original_price": 14000000.0,
                "stock_quantity": 4,
                "is_featured": True,
                "is_new": True,
                "brand": created_brands["rolex"],
                "category": cat_watch,
                "quality_tier": QualityTier.SUPER_CLONE,
                "gender": "Erkaklar uchun",
                "mechanism": "Avtomatik (Clone Cal.3235)",
                "case_material": "904L Po'lat va Keramika",
                "images": [
                    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Sifat Darajasi", "Super Klon 1:1"),
                    ("Suv o'tkazmaslik", "100m"),
                    ("Korpus diametri", "41 mm"),
                    ("Shisha", "Sapfir"),
                ],
            },
            {
                "name": "Patek Philippe Nautilus 5711 Blue (Super Klon 1:1)",
                "slug": "patek-philippe-nautilus-super-clone",
                "short_description": "Super Klon 1:1 aniqlikdagi moviy dial, yupqa korpus va avtomatik mexanizm.",
                "description": "Patek Philippe afsonaviy Nautilus 5711 modelining Super Klon 1:1 varianti. Original o'lcham va sapfir korpus orqasi.",
                "price": 14800000.0,
                "original_price": 16500000.0,
                "stock_quantity": 3,
                "is_featured": True,
                "is_new": True,
                "brand": created_brands["patek-philippe"],
                "category": cat_watch,
                "quality_tier": QualityTier.SUPER_CLONE,
                "gender": "Erkaklar uchun",
                "mechanism": "Avtomatik (Cal.324 SC)",
                "case_material": "316L Po'lat",
                "images": [
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Sifat Darajasi", "Super Klon 1:1"),
                    ("Korpus diametri", "40 mm"),
                    ("Shisha", "Sapfir"),
                ],
            },

            # --- LUX NUSXA ---
            {
                "name": "Audemars Piguet Royal Oak Black (Lux Nusxa)",
                "slug": "audemars-piguet-royal-oak-lux-copy",
                "short_description": "Yuqori sifatli Lux Kopiya soat, avtomatik mexanizm va sakkiz qirrali korpus.",
                "description": "Audemars Piguet Royal Oak modelining premium Lux Nusxasi. Alo darajadagi po meva korpus va metall braslet.",
                "price": 4800000.0,
                "original_price": 5500000.0,
                "stock_quantity": 6,
                "is_featured": True,
                "is_new": False,
                "brand": created_brands["audemars-piguet"],
                "category": cat_watch,
                "quality_tier": QualityTier.LUX_COPY,
                "gender": "Erkaklar uchun",
                "mechanism": "Avtomatik",
                "case_material": "Zanglamaydigan po'lat",
                "images": [
                    "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Sifat Darajasi", "Lux Nusxa"),
                    ("Korpus diametri", "41 mm"),
                    ("Mexanizm", "Avtomatik"),
                ],
            },
            {
                "name": "Hublot Big Bang Unico Titanium (Lux Nusxa)",
                "slug": "hublot-big-bang-lux-copy",
                "short_description": "Sportiv va zamonaviy Lux Nusxa xronograf soat, rezina remen.",
                "description": "Hublot Big Bang modelining yuqori sifatli Lux Kopiyasi. Skelet siferblat va qulay kauchuk remen.",
                "price": 3900000.0,
                "original_price": 4500000.0,
                "stock_quantity": 5,
                "is_featured": False,
                "is_new": True,
                "brand": created_brands["hublot"],
                "category": cat_watch,
                "quality_tier": QualityTier.LUX_COPY,
                "gender": "Erkaklar uchun",
                "mechanism": "Kvars Xronograf",
                "case_material": "Po'lat / Kauchuk",
                "images": [
                    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Sifat Darajasi", "Lux Nusxa"),
                    ("Korpus diametri", "44 mm"),
                ],
            },
        ]

        for pdata in products_payload:
            imgs = pdata.pop("images")
            attrs = pdata.pop("attributes")
            brand_obj = pdata.pop("brand")
            cat_obj = pdata.pop("category")

            prod = Product(
                **pdata,
                brand_id=brand_obj.id,
                category_id=cat_obj.id,
            )
            session.add(prod)
            await session.flush()

            for idx, img_url in enumerate(imgs):
                session.add(
                    ProductImage(
                        product_id=prod.id,
                        image_url=img_url,
                        is_primary=(idx == 0),
                        display_order=idx,
                    )
                )

            for key, val in attrs:
                session.add(
                    ProductAttribute(
                        product_id=prod.id,
                        attribute_key=key,
                        attribute_value=val,
                    )
                )

        await session.commit()
        logger.info("[+] Khan Store products and 19 brands seeded successfully!")
