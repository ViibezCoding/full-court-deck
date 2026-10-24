# Full Court Deck

A basketball roguelike deck builder that runs in your browser.

## How to play

Double-click **`index.html`**. It opens in your web browser. There's nothing to install.

Your progress saves automatically in the browser. Close the tab and come back, then click **Continue season**.

### Controls
| Action | How |
|---|---|
| Play a card | Click it, or press its number key (1–9) |
| End your turn | Click **End turn**, or press **E** |
| Close a popup | **Esc** |
| Dev tools (for playtesting) | Press the **`** key (top-left, under Esc) |

The dev tools let you add Bucks, refill Stamina, win the current game instantly, open free packs and skip to the next month.

## Binder Collection

The **Binder Collection** on the title screen is your card encyclopedia. Each star has a binder that shows every card in the game. Hover over a card to see which serial numbers you've pulled. Your pulls are added to the binder when a season ends, whether you won or lost. A season you abandon by starting a new one doesn't count.

New cards you add to `js/data/cards.js` show up in the binders automatically.

## Hall of Fame

Lifetime records for each star: total play time, fastest championship, wins and losses, current win streak and best win streak. A **win** means winning the Finals. Any other season ending counts as a **loss**. The season clock only runs while you're in a season and the browser tab is open in front of you.

## Music and sound

The music is a shuffled playlist of 5 one-minute songs in `js/audio/songs.js` (Warm-Up, Night Game, Shootaround, Fast Break, Victory Lap). Sound effects are in `js/audio/audio.js`. All of it is placeholder audio generated with code. Nothing needs downloading. Music starts after your first click, because browsers block sound until you interact with the page. The speaker button (home screen and top bar) has music and effects volume sliders and a mute switch, all saved in your browser.

## How to tweak the game

All the numbers live in plain text files. Open them in VS Code, change a number, save, then **refresh the browser** (F5).

| I want to change... | Edit this file |
|---|---|
| Difficulty, target scores, Bucks, Stamina, stat scaling, shop prices | `js/config.js` |
| Card names, costs, numbers, text | `js/data/cards.js` |
| Starting decks | bottom of `js/data/cards.js` |
| The King / The Chef starting stats, colors, Rookie Card picture | `js/data/characters.js` |
| How the Rookie Card player is drawn | `js/ui/player-art.js` |
| Home screen background (players, baskets, spotlights) | `js/ui/home-background.js` |
| Opponent teams and their plays | `js/data/teams.js` |
| Memorabilia items (names, effects, colors) | `js/data/memorabilia.js` |
| Trade Deadline events | `js/data/events.js` |
| Pack prices and odds | `js/data/packs.js` |

### Quick difficulty knobs (in `js/config.js`)
- **`OPP_POWER`**: how hard opponents hit. `2.75` is the current setting. Try `2.5` for easier, `3.0` for harder.
- **`MARQUEE_OPP_MULT`**: extra strength for Marquee Games on top of `OPP_POWER`, one number per month (Nov–Apr). `1.10` = 10% stronger. December is currently `0.99` (10% easier than the others).
- **`OPP_SCORE_MULT`**: extra strength for opponents' points (and their score buffs) only. `1.10` = 10% more.
- **`TARGET_SCORE`**: points needed to win each month. Higher means longer games.
- **`STARTING_ENERGY`** and **`HAND_SIZE`**: big swings in player power.

### Reset your save
Open the browser's developer console (F12 → Console) and run:
```js
localStorage.clear()
```
This erases your Rings and any season in progress.

## Project layout
```
index.html          the page that loads everything
css/style.css       all the visuals
js/config.js        balance settings
js/data/            cards, characters, teams, memorabilia, events, packs
js/core/            game rules (runs, map, combat, packs)
js/ui/              screens and drawing
js/main.js          starts the game, keyboard shortcuts
GAME_DESIGN.md      the design doc
```
