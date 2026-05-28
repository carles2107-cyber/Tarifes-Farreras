# Tarifes-Farreras — Bot de Telegram amb Claude AI

Bot de Telegram que utilitza Claude (Anthropic) com a motor de conversa.

## Requisits

- Python 3.10+
- Compte a [Anthropic Console](https://console.anthropic.com) per obtenir una API key
- Un bot de Telegram creat via [@BotFather](https://t.me/BotFather)

## Configuració

### 1. Crea el bot a Telegram

1. Obre Telegram i busca **@BotFather**
2. Envia `/newbot` i segueix les instruccions
3. Copia el **token** que et proporciona

### 2. Configura les variables d'entorn

```bash
cp .env.example .env
```

Edita `.env` i omple:

```
TELEGRAM_BOT_TOKEN=el_teu_token_de_botfather
ANTHROPIC_API_KEY=la_teva_api_key_anthropic
```

### 3. Instal·la les dependències

```bash
pip install -r requirements.txt
```

### 4. Executa el bot

```bash
python bot.py
```

## Comandes del bot

| Comanda | Descripció |
|---------|------------|
| `/start` | Inicia o reinicia la conversa |
| `/nou` | Esborra l'historial de la conversa |
| `/ajuda` | Mostra l'ajuda |

## Variables d'entorn opcionals

| Variable | Per defecte | Descripció |
|----------|-------------|------------|
| `SYSTEM_PROMPT` | Assistent general | Personalitza el comportament del bot |
| `MAX_HISTORY_MESSAGES` | `20` | Nombre de missatges a recordar per conversa |
