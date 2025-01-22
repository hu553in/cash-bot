# Cash bot

Very simple Node.js Telegram bot to track cash incomes and outcomes.

## Features

- Starts from zero sum for each Telegram user.
- If user sends "+50000", the current sum is increased by 50000.
- If user sends "-40000", the current sum is decreased by 40000.
- Stores only the latest and previous sum in an SQLite database (per user).
- Button "Undo" reverts to the previous sum (only single previous value is stored in history).
- Button "Show sum" shows current sum.
- Button "Reset to 0" sets the current sum to 0.
