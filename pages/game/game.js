var game = new Phaser.Game(480, 320, Phaser.CANVAS, null, {
    preload: preload, create: create, update: update
});

let ball;
let paddle;
let bricks;
let newBrick;
let brickInfo;
let scoreText;
let score = 0;
let lives = 3;
let livesText;
let lifeLostText;
let textStyle = { font: '18px Arial', fill: '#0095DD'};
let playing = false;
let startButton;
let seconds = 0;
let minutes = 0;
let timeText;
let gameStarted = false;
let results;
let bestResult;
let playerName = prompt("Здравствуйте! Введите свое имя!", 'Игрок-1');


function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = "#eee";
    game.load.image('ball', '../../images/ball.png');
    game.load.image('paddle', '../../images/paddle.png');
    game.load.image('brick', '../../images/brick.png');
    game.load.spritesheet('ball', '../../images/wobble.png', 20, 20);
    game.load.spritesheet('button', '../../images/button.png', 120, 40);
}
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    ball.anchor.set(0.5);
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    game.physics.arcade.checkCollision.down = false;
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);
    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
    paddle.anchor.set(0.5,1);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    paddle.body.immovable = true;
    initBricks();


    //Текст в игре

    scoreText = game.add.text(5,5, 'Points: 0', textStyle);
    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
    livesText.anchor.set(1,0);
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, click to continue', textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;
    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);
    timeText = game.add.text(200, 5, 'Time: ', textStyle);
    chronograph();
}
function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    paddle.x = game.input.x|| game.world.width*0.5;
}

function initBricks() {
    brickInfo = {
        width: 50,
        height: 20,
        count: {
            row: 3,
            col: 7
        },
        offset: {
            top: 50,
            left: 60
        },
        padding: 10
    };
    bricks = game.add.group();
    for (c = 0; c<brickInfo.count.col;c++) {
        for (r = 0; r<brickInfo.count.row; r++) {
            let brickX = (c*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
            let brickY = (r*(brickInfo.height+brickInfo.padding))+brickInfo.offset.left;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            bricks.add(newBrick);
        }
    }

}
function ballHitBrick(ball, brick) {
    let killTween = game.add.tween(brick.scale);
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function() {
        brick.kill();
    }, this);
    killTween.start();
    ball.animations.play('wobble');
    score +=10;
    scoreText.setText('Points: ' +score);

    if (score === (c*r*10)) {
        alert('You won the game, congratulations! Your time is ' +minutes + ' minutes and ' +seconds + ' seconds');
        results = {
            'name' : playerName,
            'time' : seconds,
            'score': score
        };
        bestResult = JSON.parse(localStorage.getItem('results'));
        console.log(bestResult);
        if (bestResult !== null) {
            if (bestResult.time > results.time) {
                localStorage.setItem('results', JSON.stringify(results));
                alert('Поздравляем! Ваш результат - лучший')
            }
            else {alert('Неплохо но ' + bestResult.name + ' был быстрее - ' + bestResult.time + ' секунд лучший результат!')}
        }
        else {
            alert('Поздравляем! Вы установили первый результат!');
            localStorage.setItem('results', JSON.stringify(results));
        }

        location.reload();
    }
}
function ballLeaveScreen() {
    lives--;
    gameStarted = false;
    if(lives) {
        livesText.setText('Lives: '+lives);
        lifeLostText.visible = true;
        ball.reset(game.world.width*0.5, game.world.height-25);
        paddle.reset(game.world.width*0.5, game.world.height-5);
        game.input.onDown.addOnce(function(){
            lifeLostText.visible = false;
            ball.body.velocity.set(150, -150);
            gameStarted = true;
        }, this);
    }
    else {
        gameStarted = false;
        alert('You lost, game over!');
        location.reload();
    }
}
function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);
}

function startGame() {
    startButton.destroy();
    ball.body.velocity.set(150, -150);
    gameStarted = true;
}

function addTime() {
    if (gameStarted === true) {
        seconds++;
        if (seconds < 10) {seconds = '0' +seconds}
        if (minutes < 10) {timeText.setText('Time: 0' +minutes + ':' +seconds);}
        else {timeText.setText('Time: ' +minutes + ':' +seconds);}
        if (seconds == 60) {
            minutes += 1;
            seconds = 0;
        }
    }
}

function chronograph() {
    setInterval(addTime, 1000);
}