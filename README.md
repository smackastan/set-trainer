# Set Card Game Trainer

An interactive web-based trainer for practicing the Set card game. This trainer helps you develop your pattern recognition skills by showing you two random cards and challenging you to find the third card that completes the set.

## How to Play

1. Open `index.html` in your web browser
2. Look at the two cards displayed
3. Determine which card completes the set (all attributes must be all-same or all-different)
4. Enter your answer using the shorthand notation
5. Press Enter or click Submit

## Card Attributes

- **Number**: 1, 2, 3
- **Color**: Red, Purple, Green
- **Shape**: Oval, Diamond, Wave
- **Pattern**: Filled, Striped, Empty

## Input Format

Use the first letter of each attribute to enter your answer:

- Number: `1`, `2`, `3`
- Pattern: `f` (filled), `s` (striped), `e` (empty)
- Color: `r` (red), `p` (purple), `g` (green)
- Shape: `o` (oval), `d` (diamond), `w` (wave)

**Examples:**
- `1frw` or `1,f,r,w` = 1 filled red wave
- `3spd` or `3,s,p,d` = 3 striped purple diamonds

The order doesn't matter - you can enter attributes in any sequence!

## Features

- ✅ Visual SVG card rendering with accurate shapes and patterns
- ✅ Flexible input (with or without commas)
- ✅ Instant feedback on your answers
- ✅ Automatic new cards after correct answers
- ✅ Score tracking (correct/incorrect)
- ✅ Shows solution when incorrect

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- SVG for card graphics

## License

MIT
