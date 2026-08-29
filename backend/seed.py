import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product, ProductImage, ProductAttribute


async def seed_data():
    # Drop all existing tables and recreate clean schema
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("[+] Khan Store 3-kategoriya (Soatlar, Ko'zoynaklar, Kepkalar) ma'lumotlarini kiritish boshlandi...")

        # 1. Create Admin User
        import os
        admin_email = os.getenv("ADMIN_EMAIL", "admin@khanstore.uz")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            full_name="Khan Store Admin",
            phone="+998901234567",
            role=UserRole.ADMIN,
        )
        session.add(admin_user)
        await session.flush()
        print(f"[+] Admin foydalanuvchi yaratildi: Email='{admin_email}' (Parolni admin paneldan almashtiring)")

        # 2. Create 3 Main Categories
        cat_watch = Category(
            name="Soatlar",
            slug="watch",
            description="Klassik, sport va zamonaviy qo'l soatlari kolleksiyasi.",
            image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
            display_order=1,
        )
        cat_sunglasses = Category(
            name="Ko'zoynaklar",
            slug="sunglasses",
            description="Quyoshdan himoyalovchi va zamonaviy stilist ko'zoynaklar.",
            image_url="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
            display_order=2,
        )
        cat_cap = Category(
            name="Kepkalar",
            slug="cap",
            description="Premium brendli va zamonaviy shahar kepkalari.",
            image_url="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop",
            display_order=3,
        )
        session.add_all([cat_watch, cat_sunglasses, cat_cap])
        await session.flush()

        # 3. Create Brands
        brands_data = [
            ("Rolex", "rolex", "Shveytsariya soat uyi"),
            ("Casio", "casio", "Yaponiya elektron va kvars soatlari"),
            ("Tissot", "tissot", "Shveytsariya klassik soatlari"),
            ("Seiko", "seiko", "Yaponiya mexanik va avtomatik soatlari"),
            ("Ray-Ban", "ray-ban", "Dunyoning mashhur ko'zoynak brendi"),
            ("Oakley", "oakley", "Sport ko'zoynaklari yetakchisi"),
            ("Tom Ford", "tom-ford", "Hashamatli uslub va ko'zoynaklar"),
            ("New Era", "new-era", "Original brendli kepkalar"),
            ("Adidas", "adidas", "Sport va shahar aksessuarlari"),
            ("Nike", "nike", "Sport stil kepkalari"),
        ]
        created_brands = {}
        for name, slug, desc in brands_data:
            b = Brand(name=name, slug=slug, description=desc, country="International")
            session.add(b)
            await session.flush()
            created_brands[slug] = b

        # 4. Products Payload (SOATLAR, KO'ZOYNAKLAR, KEPKALAR)
        products_payload = [
            # --- SOATLAR ---
            {
                "name": "Tissot PRX Powermatic 80 Blue",
                "slug": "tissot-prx-powermatic-80-blue",
                "short_description": "Shveytsariya avtomatik mexanizmi, 80 soat quvvat zahirasi va moviy siferblat.",
                "description": "Tissot PRX 1978-yilgi klassik dizaynning zamonaviy talqini. 80 soatlik quvvat zahirasiga ega Powermatic 80 avtomatik mexanizmi va sapfir shisha bilan ta'minlangan.",
                "price": 8500000.0,
                "original_price": 9200000.0,
                "stock_quantity": 8,
                "is_featured": True,
                "is_new": True,
                "brand": created_brands["tissot"],
                "category": cat_watch,
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
                ],
            },
            {
                "name": "Casio Edifice EFV-550D Chronograph",
                "slug": "casio-edifice-efv-550d",
                "short_description": "Sport-xronograf dizayni, zanglamaydigan po'lat korpus va aniq kvars mexanizmi.",
                "description": "Casio Edifice har kunlik taqish uchun mukammal xronograf. 100m suv o'tkazmaslik va sekundomer funksiyasiga ega.",
                "price": 1850000.0,
                "original_price": 2100000.0,
                "stock_quantity": 12,
                "is_featured": True,
                "is_new": False,
                "brand": created_brands["casio"],
                "category": cat_watch,
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
                ],
            },
            {
                "name": "Seiko 5 Sports Automatic SRPE55K1",
                "slug": "seiko-5-sports-automatic",
                "short_description": "Yaponiya avtomatik mexanizmi 4R36 va qora klassik siferblat.",
                "description": "Seiko 5 Sports — ishonchlilik va chidamlilik timsoli. Shafqatsiz sharoitlarga chidamli Hardlex shishasi va haftaning kuni bilan ta'minlangan.",
                "price": 3900000.0,
                "original_price": 4300000.0,
                "stock_quantity": 6,
                "is_featured": False,
                "is_new": True,
                "brand": created_brands["seiko"],
                "category": cat_watch,
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
                ],
            },
            {
                "name": "Rolex Submariner Date Gold Black",
                "slug": "rolex-submariner-date-gold-black",
                "short_description": "Eksklyuziv Shveytsariya g'avvos soati, oltin elementlar va keramik Bezel.",
                "description": "Afsonaviy Rolex Submariner. Premium darajadagi 18K oltin va Oystersteel gibrid korpusi, Calibre 3235 avtomatik mexanizmi.",
                "price": 185000000.0,
                "original_price": 195000000.0,
                "stock_quantity": 2,
                "is_featured": True,
                "is_new": True,
                "brand": created_brands["rolex"],
                "category": cat_watch,
                "gender": "Erkaklar uchun",
                "mechanism": "Avtomatik",
                "case_material": "Oltin / Po'lat",
                "images": [
                    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Suv o'tkazmaslik", "300m"),
                    ("Korpus diametri", "41 mm"),
                    ("Kafolat", "5 Yil"),
                ],
            },

            # --- KO'ZOYNAKLAR ---
            {
                "name": "Ray-Ban Aviator Classic RB3025 Gold",
                "slug": "ray-ban-aviator-classic-rb3025",
                "short_description": "Afsonaviy aviator quyosh ko'zoynagi, oltin ramka va yashil G-15 linzalar.",
                "description": "1937-yilda AQSH uchuvchilari uchun yaratilgan klassik Ray-Ban Aviator. 100% UV400 quyosh nuridan himoya qiladi va har qanday yuz tuzilishiga mos keladi.",
                "price": 1950000.0,
                "original_price": 2200000.0,
                "stock_quantity": 15,
                "is_featured": True,
                "is_new": True,
                "brand": created_brands["ray-ban"],
                "category": cat_sunglasses,
                "gender": "Uniseks",
                "mechanism": "Aksessuar",
                "case_material": "Metal Gold Frame",
                "images": [
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("UV Himoya", "UV400 Category 3"),
                    ("Linza turi", "Shisha G-15"),
                    ("Mamlakat", "Italiya"),
                ],
            },
            {
                "name": "Oakley Holbrook Matte Black Prizm",
                "slug": "oakley-holbrook-matte-black-prizm",
                "short_description": "Sport va faol hayot tarzi uchun Prizm tinlashtiruvchi linzalar.",
                "description": "Oakley Holbrook zamonaviy Amerika uslubini aks ettiradi. O Matter yengil va mustahkam ramkasi hamda rasm tiniqligini oshiruvchi Prizm linzalar.",
                "price": 2400000.0,
                "original_price": 2700000.0,
                "stock_quantity": 10,
                "is_featured": True,
                "is_new": False,
                "brand": created_brands["oakley"],
                "category": cat_sunglasses,
                "gender": "Erkaklar uchun",
                "mechanism": "Aksessuar",
                "case_material": "O Matter Polymer",
                "images": [
                    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("UV Himoya", "100% UVA/UVB/UVC"),
                    ("Linza texnologiyasi", "Prizm Sapphire"),
                    ("Og'irligi", "Engil sportiv"),
                ],
            },
            {
                "name": "Tom Ford Soft Square Black Gold",
                "slug": "tom-ford-soft-square-black-gold",
                "short_description": "Eksklyuziv 'T' belgili to'q qora ramka va qorong'i linzalar.",
                "description": "Tom Ford klassik luxury ko'zoynagi. Zamonaviy kvadrat shakl va ikonik oltin 'T' logotipi bilan ishlov berilgan.",
                "price": 4200000.0,
                "original_price": 4800000.0,
                "stock_quantity": 5,
                "is_featured": False,
                "is_new": True,
                "brand": created_brands["tom-ford"],
                "category": cat_sunglasses,
                "gender": "Uniseks",
                "mechanism": "Aksessuar",
                "case_material": "Atsetat va Oltin Elementlar",
                "images": [
                    "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("UV Himoya", "100% UV Protection"),
                    ("Ramka materiali", "Premium Italian Acetate"),
                ],
            },

            # --- KEPKALAR ---
            {
                "name": "New Era 59FIFTY NY Yankees Fitted Cap Black",
                "slug": "new-era-59fifty-ny-yankees-black",
                "short_description": "Original Nyu-York Yankis brendli qattiq forma va kashta tikilgan logotip.",
                "description": "New Era 59FIFTY — butun dunyoda tan olingan afsonaviy beysbol kepkasi. 100% paxta, premium kashta va original Nyu-York Yankis brendi.",
                "price": 450000.0,
                "original_price": 520000.0,
                "stock_quantity": 20,
                "is_featured": True,
                "is_new": True,
                "brand": created_brands["new-era"],
                "category": cat_cap,
                "gender": "Uniseks",
                "mechanism": "Aksessuar",
                "case_material": "100% Paxta",
                "images": [
                    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("O'lcham", "Standart sozlangan (Adjustable)"),
                    ("Material", "Paxta canvas"),
                    ("Brend", "New Era Genuine"),
                ],
            },
            {
                "name": "Adidas Classic Trefoil Cap Navy",
                "slug": "adidas-classic-trefoil-cap-navy",
                "short_description": "To'q ko'k rangli, kashta logotipli va yengil paxta materialli kepka.",
                "description": "Adidas trefoil original sport kepkasi. Har kunlik kiyish, sport va shahar aylanmalari uchun juda qulay.",
                "price": 380000.0,
                "original_price": 420000.0,
                "stock_quantity": 14,
                "is_featured": False,
                "is_new": False,
                "brand": created_brands["adidas"],
                "category": cat_cap,
                "gender": "Uniseks",
                "mechanism": "Aksessuar",
                "case_material": "Paxta",
                "images": [
                    "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Rang", "To'q ko'k (Navy)"),
                    ("Format", "Baseball Cap"),
                ],
            },
            {
                "name": "Nike Club Metal Swoosh Cap Black",
                "slug": "nike-club-metal-swoosh-black",
                "short_description": "Metall Nike swoosh belgisiga ega zamonaviy qora kepka.",
                "description": "Nike Club metall logotipli kepka. Boshga qulay o'tiradi va kamari orqali o'lchami oson moslashtiriladi.",
                "price": 420000.0,
                "original_price": 460000.0,
                "stock_quantity": 18,
                "is_featured": True,
                "is_new": True,
                "brand": created_brands["nike"],
                "category": cat_cap,
                "gender": "Uniseks",
                "mechanism": "Aksessuar",
                "case_material": "Polyester / Paxta",
                "images": [
                    "https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=1000&auto=format&fit=crop",
                ],
                "attributes": [
                    ("Logotip", "Metall Swoosh"),
                    ("O'lcham", "Universal Sozlanuvchi"),
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
        print("[+] Khan Store 3-kategoriya ma'lumotlari muvaffaqiyatli qayta yuklandi!")


if __name__ == "__main__":
    asyncio.run(seed_data())
