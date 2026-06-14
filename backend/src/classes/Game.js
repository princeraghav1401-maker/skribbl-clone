const words = require("../words/words");

class Game {
    constructor({ rounds = 3, drawTime = 60, wordCount = 3 }) {
        this.totalRounds = rounds;
        this.drawTime = drawTime;
        this.wordCount = wordCount;

        this.currentRound = 0;
        this.currentDrawerIndex = 0;
        this.currentDrawer = null;

        this.selectedWord = null;
        this.wordOptions = [];

        this.phase = "lobby";
        this.timeLeft = drawTime;
        this.timer = null;
    }

    getRandomWords(count = this.wordCount) {
        const safeCount = Math.min(Math.max(count, 1), 5);
        const shuffledWords = [...words].sort(() => 0.5 - Math.random());
        return shuffledWords.slice(0, safeCount);
    }

    startNewRound(players) {
        this.phase = "word_selection";
        this.currentRound += 1;

        this.selectedWord = null;
        this.timeLeft = this.drawTime;

        players.forEach((player) => player.resetGuessStatus());

        this.currentDrawer = players[this.currentDrawerIndex];
        this.wordOptions = this.getRandomWords(this.wordCount);

        return {
            round: this.currentRound,
            drawer: this.currentDrawer,
            wordOptions: this.wordOptions,
            drawTime: this.drawTime,
        };
    }

    chooseWord(word) {
        this.selectedWord = word;
        this.phase = "drawing";
    }

    getHint() {
        if (!this.selectedWord) return "";

        return this.selectedWord
            .split("")
            .map((char) => (char === " " ? " " : "_"))
            .join(" ");
    }

    getRevealedHint() {
        if (!this.selectedWord) return "";

        const word = this.selectedWord;
        const totalTime = this.drawTime;
        const elapsed = totalTime - this.timeLeft;

        const lettersOnly = word
            .split("")
            .filter((char) => char !== " ");

        const revealCount = Math.floor((elapsed / totalTime) * lettersOnly.length);

        let revealed = 0;

        return word
            .split("")
            .map((char) => {
                if (char === " ") return " ";

                if (revealed < revealCount) {
                    revealed++;
                    return char;
                }

                revealed++;
                return "_";
            })
            .join(" ");
    }

    checkGuess(guess) {
        if (!this.selectedWord) return false;

        return (
            guess.trim().toLowerCase() ===
            this.selectedWord.trim().toLowerCase()
        );
    }

    nextDrawer(players) {
        this.currentDrawerIndex =
            (this.currentDrawerIndex + 1) % players.length;
    }
}

module.exports = Game;