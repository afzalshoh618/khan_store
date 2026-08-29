import logging
import urllib.request
import urllib.parse
import json
from app.core.config import settings

logger = logging.getLogger("telegram_service")


async def send_telegram_order_notification(order_data: dict, order_items: list):
    """
    Sends an instant notification to Telegram channel/group via Bot API.
    Guaranteed error safety: Failure to send does not interrupt order placement.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID or "-1004299963020"

    if not token:
        logger.warning("[Telegram Bot] TELEGRAM_BOT_TOKEN sozlanmagan. Telegram kanaliga yuborish uchun bot tokenini kiriting.")
        return

    try:
        # Format Order Items
        items_text_list = []
        for idx, item in enumerate(order_items, start=1):
            product_name = (
                getattr(item, "product_name", None)
                or (getattr(item.product, "name", "Mahsulot") if hasattr(item, "product") else "Mahsulot")
            )
            price = item.unit_price if hasattr(item, "unit_price") else 0
            quantity = item.quantity if hasattr(item, "quantity") else 1
            item_total = price * quantity
            formatted_price = f"{int(item_total):,}".replace(",", " ") + " so'm"
            items_text_list.append(f"  {idx}. <b>{product_name}</b> x{quantity} — <code>{formatted_price}</code>")

        items_str = "\n".join(items_text_list)
        total_str = f"{int(order_data.get('total_amount', 0)):,}".replace(",", " ") + " so'm"

        # Extract Promo Code Info from notes
        notes_text = order_data.get("notes", "") or ""
        if "Promokod:" in notes_text or "promokod" in notes_text.lower():
            promo_status = f"✅ <b>Ishlatilgan</b> (<i>{notes_text}</i>)"
        else:
            promo_status = "❌ <b>Ishlatilmagan</b>"

        message = (
            f"🛒 <b>YANGI BUYURTMA #{order_data.get('order_number', 'N/A')}</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"👤 <b>Buyurtmachi:</b> {order_data.get('customer_name')}\n"
            f"📞 <b>Telefon:</b> <code>{order_data.get('customer_phone')}</code>\n"
            f"🏛 <b>Viloyat / Hudud:</b> {order_data.get('city', 'Toshkent shahri')}\n"
            f"📍 <b>Manzil:</b> {order_data.get('shipping_address')}\n"
            f"💳 <b>To'lov Usuli:</b> {str(order_data.get('payment_method', 'naqd')).upper()}\n\n"
            f"📦 <b>Buyurtma qilingan mahsulotlar:</b>\n{items_str}\n\n"
            f"🏷 <b>Promokod Holati:</b> {promo_status}\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"💰 <b>UMUMIY SUMMA:</b> <b>{total_str}</b>\n"
        )

        if notes_text and not ("Promokod:" in notes_text):
            message += f"💬 <b>Qo'shimcha izoh:</b> {notes_text}\n"

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML",
        }

        # Send request
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode("utf-8")
            logger.info(f"[Telegram Bot] Xabarnoma yuborildi: {res_body}")

    except Exception as e:
        logger.error(f"[Telegram Bot] Xabar yuborishda xatolik: {str(e)}")
