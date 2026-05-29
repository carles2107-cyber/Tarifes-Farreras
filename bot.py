import os
import logging
import sentry_sdk
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

_sentry_dsn = os.getenv("SENTRY_DSN")
sentry_sdk.init(
    dsn=_sentry_dsn,
    traces_sample_rate=1.0,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

anthropic = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# Per-user conversation history: {user_id: [{"role": ..., "content": ...}]}
conversations: dict[int, list[dict]] = {}

SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    "Ets un assistent útil. Respon sempre de manera clara i concisa.",
)
MAX_HISTORY = int(os.getenv("MAX_HISTORY_MESSAGES", "20"))


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    conversations.pop(user.id, None)
    await update.message.reply_text(
        f"Hola, {user.first_name}! Sóc un assistent basat en Claude.\n"
        "Escriu el teu missatge per començar.\n"
        "Utilitza /ajuda per veure les comandes disponibles."
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "*Comandes disponibles:*\n"
        "/start — Inicia o reinicia la conversa\n"
        "/nou — Esborra l'historial i comença de nou\n"
        "/ajuda — Mostra aquest missatge\n"
        "/seer — Mostra l'estat de la monitorització d'errors (Sentry)",
        parse_mode="Markdown",
    )


async def new_conversation(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    conversations.pop(update.effective_user.id, None)
    await update.message.reply_text("Conversa reiniciada. Escriu el teu primer missatge.")


async def seer_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if _sentry_dsn:
        sentry_sdk.capture_message("Sentry test event from /seer command", level="info")
        status = "Sentry esta actiu i monitoritzant errors."
    else:
        status = "Sentry no esta configurat (SENTRY_DSN no definit)."
    await update.message.reply_text(f"*Estat de monitoritzacio:*\n{status}", parse_mode="Markdown")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    text = update.message.text

    history = conversations.setdefault(user_id, [])
    history.append({"role": "user", "content": text})

    # Keep history bounded
    if len(history) > MAX_HISTORY:
        history[:] = history[-MAX_HISTORY:]

    await context.bot.send_chat_action(
        chat_id=update.effective_chat.id, action="typing"
    )

    try:
        response = anthropic.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=history,
        )
        reply = response.content[0].text
    except Exception as e:
        sentry_sdk.capture_exception(e)
        logger.error("Anthropic API error: %s", e)
        reply = "Ha ocorregut un error en processar la teva petició. Torna-ho a intentar."

    history.append({"role": "assistant", "content": reply})
    await update.message.reply_text(reply)


def main() -> None:
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    app = Application.builder().token(token).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("ajuda", help_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("nou", new_conversation))
    app.add_handler(CommandHandler("seer", seer_command))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Bot en marxa...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
