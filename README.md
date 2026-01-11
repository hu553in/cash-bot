# Cash bot

[![CI](https://github.com/hu553in/cash-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/hu553in/cash-bot/actions/workflows/ci.yml)

A minimal Node.js Telegram bot for tracking personal cash balance.

The bot keeps a simple running total per Telegram user and is designed to be lightweight, fast, and easy to reason about.

## Features

- Each Telegram user has an independent balance starting from `0`.
- Sending `+50000` increases the current balance by `50000`.
- Sending `-40000` decreases the current balance by `40000`.
- Only two values are stored per user in SQLite:
  - the current balance
  - the previous balance
- **Undo** button restores the previous balance (single-step undo).
- **Show sum** button displays the current balance.
- **Reset to 0** button resets the balance back to zero.

## Notes

- No transaction history is stored — only the current and previous values.
- Designed for personal use and simplicity rather than accounting precision.
- Stateless interaction model with minimal persistence.
