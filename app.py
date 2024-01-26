from flask import Flask, request, render_template, jsonify, session
from boggle import Boggle

app = Flask(__name__)
app.config["SECRET_KEY"] = "fdfgkjtjkkg45yfdb"

boggle_game = Boggle()


@app.route("/")
def homepage():
    """Show board."""

    board = boggle_game.make_board()
    session['board'] = board

    return render_template("index.html", board=board)


@app.route("/check_word")
def check_word():
    """Check if word is in dictionary."""

    word = request.args["word"]
    board = session["board"]
    response = boggle_game.check_valid_word(board, word)

    return jsonify({'result': response})


@app.route("/post-score", methods=["POST"])
def post_score():
    """End game and post players score, update num_plays, and update highscore if applicable"""

    score = request.json["score"]
    highscore = session.get('highscore', 0)
    num_plays = session.get('num_plays', 0)

    session['num_plays'] = num_plays + 1
    session['highscore'] = max(score, highscore)

    if( score > highscore):
        return jsonify({'brokenRecord': score})
    else:
        return jsonify({'score': score})