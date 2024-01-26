class BoggleGame  {
/* make a new game when the DOM loads */

    constructor(boardId, secs = 60){
        this.words = new Set();
        this.board = $('#' + boardId);
        this.score = 0;
        this.secs = secs;
        this.showTimer();
        this.timer = setInterval(this.updateTimer.bind(this), 1000);

       $('.add-word', this.board).on('submit', this.handleSubmit.bind(this));
    }
    

    /* show word in list of words */
    
    showWord(word)  {
        $('.words', this.board).append($('<li>', {text: word})); 
    }
    /* show status message */
    showMessage(msg)  {
        $('.msg', this.board).text(msg);
    }

    /* handle word submission: if not in words.list, show status message and add to overall score */

    async handleSubmit(e){
        e.preventDefault();
        const $word = $('.word', this.board);
        let word = $word.val();

        // Test to see if the word is valid and has already been guessed

        if(!word) return;

        if(this.words.has(word)){
            this.showMessage(`You've already found ${word}`);
            return
        }
        
        /* check server for word acceptance */

        const resp = await axios.get('/check_word', {params: {word: word}});
        if (resp.data.result === 'not-word')    {
            this.showMessage(`${word} is not an English word`);
        }
        else if (resp.data.result === 'not-on-board')  {
            this.showMessage(`${word} is not on the board`);
        }  
        else  {
            this.showMessage(`${word} is a valid word on the board!`);
            this.words.add(word);
            this.score += word.length;
            $('.score').text(this.score);
            this.showWord(word)
        } 
        $('.word').val('');
    }


    /* show game timer  */
        showTimer()  {
            $('.timer', this.board).text(this.secs);
        }

        async updateTimer()  {
            this.secs -= 1;
            this.showTimer()

            if(this.secs === 0)  {
                clearInterval(this.timer);
                await this.ScoreGame();
            }
        }


        /* Hide word input section and board. Send a post request to server with score and show message of score or new high score if applicable */

        async ScoreGame()  {
            $('.add-word', this.board).hide();
            $('#boggle-board', this.board).hide()
            const resp = await axios.post('/post-score',  {score: this.score});
            // if score higher than high score return high score message
            if(resp.data.brokenRecord){    
                this.showMessage(`New Highscore: ${this.score}`)
            }
            else{
                // if score lower than high score return score message
                this.showMessage(`Your Score: ${this.score}`)   
            }

        }
}