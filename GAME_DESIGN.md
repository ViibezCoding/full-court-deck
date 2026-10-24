# Game Design Doc: *Full Court Deck*

A browser-based roguelike deck builder in the style of Slay the Spire 2, starring parody versions of famous basketball players. You play one NBA-style season. Rewards and the shop are built around opening card packs.

> Items marked **[PROPOSED]** are suggestions that fill gaps in the vision. Change them freely.

---

## 1. Core Pillars
1. **Basketball as strategy.** Every game is a back-and-forth of offense and defense, played with cards.
2. **The thrill of the pack.** Opening packs and pulling numbered cards, Autos and Memorabilia is the main reward.
3. **From rookie to legend.** Your Character Card starts as a Rookie Card and grows over the season.
4. **One season, one run.** November to June. Survive the regular season, then win it all in the playoffs.

---

## 2. Run Structure: 8 Acts (Months)

| Act | Month | Phase | Notes |
|---|---|---|---|
| 1 | November | Regular Season | Tutorial-level difficulty |
| 2 | December | Regular Season | |
| 3 | January | Regular Season | |
| 4 | February | Regular Season | All-Star break event? **[PROPOSED]** |
| 5 | March | Regular Season | |
| 6 | April | Regular Season | Playoff push |
| 7 | May | **Playoffs** | Each round is **one game**. Lose and the run ends. |
| 8 | June | **Finals** | **Best of three** against the final boss, a "Superteam" |

- Each act has a **branching map** like Slay the Spire 2.
- Each regular-season act ends with a **Marquee Game** (boss fight) against a rival team.
- **[PROPOSED]** Acts 1–6 are shorter maps (~8–10 nodes) to keep a full run around 45–60 minutes.
- May has 3 playoff rounds (one game each), with a choice of **Card Shop or Practice Facility** between them. June has one Card Shop / Practice choice before the Finals. **No Locker Rooms in the Playoffs or Finals.**

### Map Nodes
| Node | What it does |
|---|---|
| 🏀 **Game** | Normal fight |
| 🔥 **Rivalry Game** | Elite fight: harder, better rewards (guaranteed good pack) |
| 🛒 **Card Shop** | Spend Bucks on packs, sell cards, remove cards |
| 🏋️ **Practice Facility** | Upgrade 2 different cards one serial tier each OR train a Character Card stat. (The Locker Room's Film session also upgrades 2 cards; the Veteran Mentor event upgrades 3 random cards.) |
| 🛋️ **Locker Room** | Rest: restore Stamina |
| ❓ **Trade Deadline / Event** | Random story event with choices |
| 🎁 **Treasure / Sponsor** | Free piece of memorabilia (a pack if you own every item) |
| 👑 **Marquee Game** | End-of-month boss |

---

## 3. Characters

You choose one of two stars at the start of a run. Each has:
1. A **Character Card** (stat card), which starts as a **Rookie Card**
2. A **starting deck** of play cards (includes some Momentum cards)
3. A **signature mechanic**

### 3.1 The Character Card (Rookie Card)
- Every run starts with your star's **Rookie Card**, with modest stats.
- Rewards during the run **increase stats** on the card for the rest of that run.
- **Stat gains reset at the start of every run.** Every run begins from the Rookie Card again.
- **Stats affect the base value of play cards.** For example, higher Shooting means 3-pointers and jump shots score more.
- **Scaling:** every starting stat counts as **+0**. Each 2 points gained on top of it (Training Camp Ring upgrades or stats earned during the season) adds +1 to that stat's cards (half as much on Momentum cards).

**Ways to raise stats [PROPOSED]:**
- 🏋️ Practice Facility: pick Scoring (SHO/FIN), Defense (STL/BLK/REB) or Playmaking (PAS/HDL); one random stat in that group gets +1
- Winning Marquee Games: choose a stat boost
- Events: risk/reward choices ("Extra film session: +1 Passing, −5 Stamina")

**No card "evolution":** the Character Card stays a Rookie Card for the whole run. Stat gains are the only way it grows.

### 3.2 Stats
| Stat | Affects |
|---|---|
| Shooting | 3-pointers, jump shots, fadeaways and floaters |
| Finishing | Layups, dunks, drives, fast breaks |
| Passing | Pass / assist cards, Momentum gain |
| Ball Handling | Card draw, hustle plays, Energy effects |
| Stealing | Steal cards and the full-court press (disrupt the opponent) |
| Blocking | Block / contest cards (Defense) |
| Rebounding | Second-chance cards |
| Stamina | Your **max Stamina (HP)** for the run |

*Starting idea for scaling, to tune later: each card is tagged with a stat, and the bonus to its base value comes from that stat.*

### 3.3 The King *(inspired by LeBron)*
- **Style:** Do-everything all-rounder
- **Signature mechanic: Versatility.** If you play an **Offense, Defense and Pass** card in the same turn, gain +1 Energy next turn.
- **Rookie Card stats:** *TBD. Balanced across the board, strongest in Finishing and Passing.*

### 3.4 The Chef *(inspired by Steph)*
- **Style:** Long-range sniper, glass cannon
- **Signature mechanic: Heat.** Each turn you play 3 scoring cards gives +1 Heat (the 3rd one lights it up). Heat adds to every Shooting card (SHO stat; Finishing cards like layups and dunks don't get it). A turn with fewer than 3 scoring cards resets Heat to 0. Maximum Heat is +3. Chef's Special gives 1 extra Heat.
- **Rookie Card stats:** *TBD. Strongest in 3PT and Ball Handling, weakest in Blocking and Rebounding.*

---

## 4. Combat: Offense vs. Defense

Built like Slay the Spire 2 combat, using basketball concepts:

| Slay the Spire | This game |
|---|---|
| Attack / Damage | **Score points** |
| Block | **Defense** (reduces opponent's points) |
| Enemy HP | **Opponent reaching the target score** |
| Enemy Intent | **Opponent's Play** (shown in advance) |
| Player HP | **Stamina** (carries across the whole run) |
| Power cards | **Autographed Cards** (in-battle boosts, see 6.3) |
| Relics | **Memorabilia** (signed items, see 6.4) |
| Energy | **Energy** (3 per turn to start) |

### 4.1 Flow of a Game
1. **Target score** is set by month: 50 (Nov), 55, 65, 75, 85, 95 (Apr). Rivalry games +5; Marquee games +10; Playoff and Finals games are played to 120.
2. The opponent shows their **next Play** above their head, e.g. *"Pull-up Three: 6 pts"* or *"Hard Foul: 7 pts"*. Opponents never hit your Stamina directly: every play they make goes through your Defense.
3. **Your possession:** draw 5 cards, spend Energy:
   - **Offense cards** add to your score
   - **Defense cards** give Defense that reduces their upcoming Play
   - **Skill cards** (passes, crossovers) draw cards, build Momentum, etc.
4. **Their possession:** their Play resolves. Points minus your Defense are added to their score.
5. Repeat. **First to the target score wins.**

### 4.2 Momentum
- **Momentum cards are part of the starting decks.**
- Pass and hustle cards build **Momentum**. Your next shot gets a bonus based on Momentum, then Momentum resets.
- This is the Balatro-style "big combo" moment.

### 4.3 Example Cards
| Card | Cost | Type | Stat | Effect |
|---|---|---|---|---|
| Crossover | 1 | Skill | Handling | Draw 2. Next shot +1 pt. |
| Corner Three | 1 | Offense | 3PT | Score 3. |
| No-Look Pass | 0 | Momentum | Passing | Gain 2 Momentum. |
| Posterizer | 3 | Offense | Finishing | Score 4 × Momentum. Exhaust. |
| Lockdown | 1 | Defense | Stealing | Opponent's next Play scores half. |

*(Numbers shown are base values before stat scaling.)*

---

## 5. Economy, Rewards and Losing

### 5.1 Bucks 💵 (per-run currency)
- **Win a game:** base Bucks
- **Victory margin bonus:** extra Bucks for winning big, e.g. +1 Buck per point of margin **[PROPOSED]**
- **Rivalry/Marquee wins:** large bonus
- Spent at the **Card Shop**

### 5.2 Rings 💍 (permanent currency)
- Kept between runs
- **Rings and the upgrades bought with them are the ONLY things that carry over between runs.** Everything else (stats, deck, Memorabilia, Bucks) resets.
- **Earned:** 1 Ring for making the playoffs (finishing April), 3 Rings for winning the Finals (4 total for a championship season)
- **[PROPOSED] Spent on:** unlocking new characters, new pack types, new starting cards, cosmetic card frames
- **Front Office upgrades (built):** Signing Bonus (+20 Bucks/level: 5/10/20), Conditioning Coach (+5 max Stamina/level: 10/20/30), Training Camp (+1 to two random stats/level: 25/50/100), Card Show VIP (100), Scouting Department (200).
- **Performance Enhancing Drugs:** separate for each star, 9 levels. Each level is +1 to a stat you pick. Levels 1-8 cost 75 Rings and each stat can only be boosted once; level 9 costs 150 Rings and can go on any stat. Buying opens a popup: pick the star, then the stat.

### 5.3 Losing a Game
- **Regular season (Nov–Apr):** a loss does **not** end the run. You lose Stamina equal to the **margin of defeat** **[PROPOSED]** and get no pack. The run only ends if Stamina hits 0.
- **Playoffs (May):** one game per round. **A loss ends the run.**
- **Stamina doesn't count in the Playoffs or Finals:** losses don't drain it and it can't run out. Only the game (or series) result matters.
- **Finals (June):** best of three. Win 2 games to become champion.

---

## 6. Cards, Collecting and Packs

### 6.1 Card Categories
| Category | What it is | Role |
|---|---|---|
| **Play Cards** | Normal deck cards | Go in your deck. Rarity is shown by **serial number** (6.2). |
| **Memorabilia** 👟 | Items from **historic players** (parody names): signed sneakers, game-worn jerseys... | **Relics.** Passive bonus for the rest of the run. Stored in your **Memorabilia**. |
| **Autographed Cards** ✍️ | Signed cards | **Deck cards** you play during a game. The buff lasts for the rest of that game, then resets. They stay in your deck for every game. |
| **Character Card** | Your star's stat card | Starts as a Rookie Card and grows over the run (3.1) |

### 6.2 Serialization (Play Card Rarity)
Rarer cards are "short printed" with a serial number, from /500 down to the ultimate **1 of 1**.

| Tier | Print Run | Feel |
|---|---|---|
| Base | Unnumbered | Common |
| Numbered | **/500** | Uncommon |
| Numbered | **/250** | Uncommon+ |
| Numbered | **/99** | Rare |
| Numbered | **/25** | Very Rare |
| Numbered | **/10** | Epic |
| **1 of 1** | **1/1** | Legendary, the ultimate pull |

**[PROPOSED] details:**
- Each pulled card gets a **random serial number** shown on it, e.g. *#137/500*. Pulling **#23** or the **1/1** could be extra special.
- **The rarer the card (lower print run), the higher its base value.** Some rare cards also **cost less Energy**.
- Example: *Corner Three* scores 3 as a Base card, more at /99, and the most at 1/1. It might also drop from 1 Energy to 0 at the top tiers. *(Exact numbers to be tuned.)*
- **Upgrades stop at /10.** Practice Facility and event upgrades can raise a card up to /10, but a **1/1 can only be pulled from a pack**.
- **No Holo cards.** The chrome card look already gives every card a holo shine, so rarity comes from serial numbers only.

### 6.2.1 Showtime (Rare Insert Set)
- **Showtime** is a special insert set drawn in the **Cartoon / Comic** style.
- Showtime cards only come in short print runs: **/99, /25, /10 and 1/1**.
- They can show up in packs as a rare surprise pull.
- **[PROPOSED]** Showtime cards are unique cards not found in the regular set (e.g. flashy signature plays), with the same rule that rarer prints are stronger.
- **[PROPOSED]** Legends and Mystery Packs have the best Showtime odds.
- Each tier gets its own card frame or color (e.g. /99 gold, /25 red, 1/1 black-and-gold), so rarity is easy to read at a glance.

### 6.3 Autographed Cards (In-Battle Boosts)
- Autographs are **regular cards in your deck**. You draw and play them like any other card.
- Playing one gives a buff that lasts **for the rest of that game**.
- The buff **resets** after the game, but the card stays in your deck, so you can use it again **every game**.
- Similar to Power cards in Slay the Spire.
- **[PROPOSED]** Autographs cost more Energy than normal cards, since their effect lasts all game.

**Example Autographs:**
- *Signed Sharpshooter:* +3 to all 3-point cards this game.
- *Signed Floor General:* gain +1 Momentum every turn this game.
- *Signed Lockdown Defender:* start each turn with 3 Defense this game.

### 6.4 Memorabilia (Relics)
- Memorabilia are **items, not cards**: signed sneakers, game-worn jerseys, autographed basketballs and so on.
- They come from **historic players**, using parody names.
- Each one gives a **passive bonus for the rest of the run**.
- Items are shown in **glass display cases** with a plaque: item type (Signed, Game-worn, Game-used...), name and effect.
- Found in **Rivalry Game** rewards, **events** and **Sponsor Gifts**, or bought as a **Mystery Bag** in the Card Shop (120 Bucks, one per visit, a random item you do not own yet). Never found in packs.

**The 12 items:**
| Item | Effect |
|---|---|
| His Airness's Signed Sneakers | First shot each game scores +3 |
| Sky Hook's Game-Worn Goggles | Mid-range Shooting cards (not 3-pointers) ignore Defense |
| Magic Act's Game-Worn Jersey | First Playmaking card each turn costs 1 less |
| Big Fundamental's Warmup Jacket | Start every game with 8 Defense |
| The Mailman's Mailbag | Draw 1 extra card on your first turn |
| Dream Shake's Autographed Basketball | Gain 1 Momentum each turn |
| The Glove's Signed Wristband | Stealing Defense cards give +2 Defense |
| The Worm's Rainbow Headband | Rebounding cards also give 2 Defense |
| The Answer's Arm Sleeve | Ball Handling cards also give 1 Momentum |
| Iron Man's Bench Towel | +10 max Stamina |
| The Logo's Signed Ticket Stub | +15 Bucks after every win |
| Big Shot's Cut-Down Net | Start a turn trailing: gain 1 Energy |

### 6.5 Pack Types
| Pack | Cost | Contents |
|---|---|---|
| **Base Pack** | Cheap | 3 cards, mostly Base and /500. |
| **Team Pack** | Medium | 3 cards themed around one style (Shooting, Defense, Playmaking). |
| **Legends Pack** | Expensive | Guaranteed /99 or better. Higher chance of Autos. |
| **Mystery Pack** | Random price | Could be junk, could be a 1/1. |

### 6.6 Pack Rules **[PROPOSED]**
- **Pick 1 of 3** for play cards, which keeps your deck lean.
- **Bonus Autographs:** the player chooses to **keep or pass** (so they don't clog a deck). You still pick a pack card either way.
- **Pack odds are shown** in the shop so players can make smart gambles.
- **Sell cards** back to the shop for Bucks. Rarer serials sell for more.

---

## 7. Art Direction

| What | Style |
|---|---|
| **Most cards** (play cards, packs, Memorabilia) | **Modern Chrome**: foil, shine, numbered parallels |
| **Character Card** (Rookie Card) | **Retro '80s–'90s**: cardstock border, bold team colors, "Rookie" seal |
| **Showtime insert set** (/99, /25, /10, 1/1) | **Cartoon / Comic**: thick outlines, halftone, loud colors |

- Reference mockups: https://claude.ai/artifact/66PHtKYQfSn2Rkb1CjCPkN
- **[PROPOSED]** Each serial tier gets its own chrome foil color (e.g. /500 silver, /99 gold, /25 red, /10 green, 1/1 black-and-gold).

---

## 8. Open Questions
- [ ] Stat scaling: how many stat points = how much extra score/Defense? (Tune during playtesting.)
- [ ] Rookie Card starting stats for The King and The Chef
- [ ] Exact base-value and Energy bonuses per serial tier
- [x] Practice Facility upgrade = raise serial tiers (2 cards per visit, up to /10).
- [x] Target score per month: 40 → 85 in the regular season, 100 in the Playoffs and Finals.
- [ ] How many fights per act? How many playoff rounds in May?
- [ ] Which characters unlock with Rings later?
