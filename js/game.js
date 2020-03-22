var lostWdw = document.getElementById("myLostWdw");
var mainmenu = document.getElementById("mainmenu");
var customize = document.getElementById('customize');
var pressToStart = document.getElementById("myPressToStart");
var congrats = document.getElementById("myCongrats");
var scoreboard = document.getElementById("scoreboard");
var highscores = document.getElementById("highscores");
var help = document.getElementById("help");
var pause = document.getElementById("myPause");
var playBtn = document.getElementById("playBtn");
var cmzBtn = document.getElementById("cmzBtn");
var modal = document.getElementById("modal");
var overlay = document.getElementById("overlay");
var scoreLabel = document.getElementsByTagName("label")[0];
var difficulty = document.getElementById("diff").value;
var input1, input2, input3, input4, input5, slider1, name;
var columnNum = 10;
var ballColor = "#00f7ce";
var paddleColor = "#FFFFFF";
var username = "";

const cvs = document.getElementById("bricks");
const ctx = cvs.getContext("2d");
const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 40;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;

let leftArrow = false;
let rightArrow = false;
let paused = false;
let maxPoints = 1;
let bricks = [];
let LIFE = false;
let SCORE = 0;
let SCORE_UNIT = 10;

const paddle = {
  x : cvs.width/2 - PADDLE_WIDTH/2,
  y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
  width : PADDLE_WIDTH,
  height : PADDLE_HEIGHT,
  dx : 5
}

const brick = {
    row : 6,
    column : columnNum,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 15,
    marginLeft : 15,
    fillColor : "#E8E9EB"
}

const ball = {
  x : cvs.width/2,
  y : paddle.y - BALL_RADIUS,
  radius : BALL_RADIUS,
  speed : 3,
  dx : 3*(Math.random()*2-1),
  dy : -3
}

document.addEventListener("keydown", function(event){
  if(event.keyCode == 37){
    leftArrow = true;
  }else if(event.keyCode == 39){
    rightArrow = true;
  }
  if(event.keyCode == 27){
    if(pressToStart.style.display == "none"){
      if(pause.style.display == "block"){
        pause.style.display = "none";
        paused = false;
        loop();
      }else{
        pause.style.display = "block";
        paused = true;
      }
    }
  }
  if(event.keyCode == 13){
    getUserName();
  }
});

document.addEventListener("keyup", function(event){
  if(event.keyCode == 37){
    leftArrow = false;
  }else if(event.keyCode == 39){
    rightArrow = false;
  }
});

$(document).ready(function() {
  modal.style.visibility = "visible";
  modal.style.opacity = "1";
  overlay.style.visibility = "visible";
  overlay.style.opacity = "1";
});

function getUserName(){
  username = document.getElementById('name').value;
  if(username != ""){
    modal.style.opacity = "0";
    overlay.style.opacity = "0";
    setTimeout(function (){
      modal.style.visibility = "hidden";
      overlay.style.visibility = "hidden";
    }, 700);
  }
}

function openGame(){
  mainmenu.style.display = "none";
  pause.style.display = "none";
  pressToStart.style.display = "block";
  cvs.style.display = "block";
  scoreboard.style.visibility = "visible";
  scoreLabel.innerHTML = SCORE;
  resetGame();
  document.addEventListener("keydown", function(event){
    if(event.keyCode == 32){
      if(LIFE == false){
        pressToStart.style.display = "none";
        LIFE = true;
        loop();
      }
    }
  });
}

function resetGame(){
  bestScore = parseInt(localStorage.getItem(username)) || 0;
  if(SCORE >= bestScore){
    localStorage.setItem(username, SCORE+","+difficulty);
  }
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  paused = false;
  bricks = [];
  SCORE = 0;
  resetBall();
  drawBall();
  resetPaddle();
  drawPaddle();
  resetBricks();
  getInputValue();
  populateHighScores();
  maxPoints = brick.row * brick.column * 10;
}

function populateHighScores(){
  var arrayOfKeys = Object.keys(localStorage);
  var arrayOfValues = Object.values(localStorage);
  var arrayOfScores = [];
  var arrayOfDiff = [];
  var finalArray = [];

  for(var i=0; i<arrayOfKeys.length; i++){
    arrayOfScores[i] = arrayOfValues[i].split(",")[0]; //get only scores out
    arrayOfDiff[i] = arrayOfValues[i].split(",")[1]; //get only diff out
    finalArray[i] = [arrayOfKeys[i], parseInt(arrayOfScores[i]), parseInt(arrayOfDiff[i])]; //put all in one array
  }

  finalArray.sort(sortFunction);

  //delete the worst player if there are more than 8
  if(finalArray.length > 7){
    for(var i=8; i<finalArray.length; i++){
      localStorage.removeItem(finalArray[i][0]);
      finalArray.splice(i, 1);
    }
  }

  //draw from finalArray to scoreboard table
  document.getElementsByTagName("h6")[0].style.display = "none";
  var table = document.getElementById("highscores-table");
  var row, cell1, cell2, cell3, cell4;
  clearTable(table);
  for(var i=0; i<finalArray.length; i++){
    row = table.insertRow(-1);
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    cell3 = row.insertCell(2);
    cell4 = row.insertCell(3);
    cell1.innerHTML = (i+1)+".";
    cell2.innerHTML = finalArray[i][0];
    cell3.innerHTML = finalArray[i][1];
    cell4.innerHTML = getDifficulty(finalArray[i][2]);
  }
}

function sortFunction(a, b){
  if(a[1] === b[1]){
    return 0;
  }
  else{
    return (a[1] > b[1]) ? -1 : 1;
  }
}

function clearTable(table){
  var rows = table.rows;
  var i = rows.length;
  while(--i){
    rows[i].parentNode.removeChild(rows[i]);
  }
}

function getDifficulty(diffNum){
  switch(diffNum){
    case 4: return "Easy";
    case 5: return "Medium";
    case 6: return "Hard";
    case 7: return "Very Hard";
    case 8: return "Insane";
  }
}

function backToMainMenuBtn(){
  LIFE--;
  gameOver();
  pause.style.display = "none";
  pressToStart.style.display = "none";
  scoreboard.style.visibility = "hidden";
  mainmenu.style.display = "block";
  highscores.style.display = "none";
  congrats.style.display = "none";
  cvs.style.display = "none";
}

function openHelp(){
  mainmenu.style.display = "none";
  help.style.display = "block";
}

function openHighscores(){
  mainmenu.style.display = "none";
  highscores.style.display = "block";
  if(localStorage.length < 1)
   document.getElementsByTagName("h6")[0].style.display = "block";
  else
    populateHighScores();
}

function openCustomize(){
  mainmenu.style.display = "none";
  customize.style.display = "block";
}

function openMainMenu(){
  help.style.display = "none";
  customize.style.display = "none";
  highscores.style.display = "none";
  mainmenu.style.display = "block";
}

function setGame(){
  getInputValue();
  changeElements();
}

function getInputValue(){
  //get all values from inputs
  input1 = document.getElementById('input1').value;
  input2 = document.getElementById('input2').value;
  input3 = document.getElementById('input3').value;
  input4 = document.getElementById('input4').value;
  input5 = document.getElementById('input5').value;
  slider1 = document.getElementById("brickRows");
  slider2 = document.getElementById("diff");
}

function changeElements(){
  //change background
  document.body.style.backgroundColor = "#"+input1;

  //change main menu elements
  mainmenu.style.backgroundColor = "#"+input2;
  mainmenu.style.boxShadow = "0px 0px 50px -10px #"+input2;
  playBtn.style.backgroundColor = "#"+input1;
  cmzBtn.style.backgroundColor = "#"+input1;
  leaderBoardBtn.style.backgroundColor = "#"+input1;
  document.getElementsByTagName("h1")[0].style.color = "#"+input1;

  //change customize tab elements
  customize.style.backgroundColor = "#"+input2;
  customize.style.boxShadow = "0px 0px 50px -10px #"+input2;
  document.getElementsByTagName("table")[0].style.color = "#"+input1;
  document.getElementsByTagName("h2")[0].style.color = "#"+input1;

  //change scoreboard tab elements
  highscores.style.backgroundColor = "#"+input2;
  highscores.style.boxShadow = "0px 0px 50px -10px #"+input2;
  document.getElementsByTagName("h4")[0].style.color = "#"+input1;
  document.getElementsByTagName("h6")[0].style.color = "#"+input1;
  document.getElementsByTagName("table")[1].style.color = "#"+input1;

  //change help tab elements
  help.style.backgroundColor = "#"+input2;
  help.style.boxShadow = "0px 0px 50px -10px #"+input2;
  document.getElementsByTagName("h4")[1].style.color = "#"+input1;
  $(".help-p, .text").css({
    "color": "#"+input1
  });

  //change game elements
  scoreboard.style.backgroundColor = "#"+input1;
  scoreboard.style.color = "#"+input2;
  scoreboard.style.borderColor = "#"+input2;
  cvs.style.borderColor = "#"+input2;
  cvs.style.boxShadow = "0px 0px 50px -10px #"+input2;
  pause.style.boxShadow = "0px 0px 50px -10px #"+input2;
  pressToStart.style.boxShadow = "0px 0px 50px -10px #"+input2;
  paddleColor = "#"+input3;
  ballColor = "#"+input4;
  bricksColor = '#'+input5;
  brick.fillColor = bricksColor;
  brick.row = slider1.value;
  ball.speed = slider2.value;
  difficulty = slider2.value;
  $(".game-p").css({
    "color": "#"+input2
  });
}

function drawPaddle(){
  ctx.fillStyle = paddleColor;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function movePaddle(){
  if(rightArrow && paddle.x + paddle.width < cvs.width){
      paddle.x += paddle.dx;
  }else if(leftArrow && paddle.x > 0){
      paddle.x -= paddle.dx;
  }
}

function createBricks(){
  bricks = [];
  var randNum
  for(let r = 0; r < brick.row; r++){
    bricks[r] = [];
    randBrickInRow = Math.floor(Math.random()*10);
    for(let c = 0; c < brick.column; c++){
      bricks[r][c] = {
        x : c * ( brick.offSetLeft + brick.width ) + brick.offSetLeft + brick.marginLeft,
        y : r * ( brick.offSetTop + brick.height ) + brick.offSetTop + brick.marginTop,
        status : true,
        bonus : false
      }
      if(c == randBrickInRow)
        bricks[r][c].bonus = true;
    }
  }
}

function drawBricks(){
  for(let r = 0; r < brick.row; r++){
    for(let c = 0; c < brick.column; c++){
      let b = bricks[r][c];
      if(b.status){
        if(b.bonus){
          ctx.fillStyle = "#"+input4;
          ctx.fillRect(b.x, b.y, brick.width, brick.height);
        }else{
          ctx.fillStyle = brick.fillColor;
          ctx.fillRect(b.x, b.y, brick.width, brick.height);
        }
      }
    }
  }
}

function ballBrickCollision(){
  for(let r = 0; r < brick.row; r++){
    for(let c = 0; c < brick.column; c++){
      let b = bricks[r][c];
      if(b.status){
        if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
            ball.dy = - ball.dy;
            b.status = false;
            if(b.bonus)
              SCORE += SCORE_UNIT*2;
            else
              SCORE += SCORE_UNIT;
            finalScore = SCORE;
        }
      }
    }
  }
}

function drawBall(){
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

function moveBall(){
  ball.x += ball.dx;
  ball.y += ball.dy;
}

function ballWallCollision(){
  if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0){
    ball.dx = - ball.dx;
  }
  if(ball.y - ball.radius < 0){
    ball.dy = -ball.dy;
  }
  if(ball.y - ball.radius > cvs.height){
    LIFE = false;
  }
}

function resetBall(){
  ball.x = cvs.width/2;
  ball.y = paddle.y - BALL_RADIUS;
  ball.dx = 3 * (Math.random() * 2 - 1);
  ball.dy = -3;
}

function resetPaddle(){
  paddle.x = cvs.width/2 - PADDLE_WIDTH/2,
  paddle.y = cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT
}

function resetBricks(){
  createBricks();
  drawBricks();
}

function ballPaddleCollision(){
  if(ball.y + ball.radius > paddle.y &&
     ball.x + ball.radius > paddle.x &&
     ball.x - ball.radius < paddle.x + paddle.width &&
     ball.y - ball.radius < paddle.y + paddle.height){

    let collidePoint = ball.x - (paddle.x + paddle.width/2);
    collidePoint = collidePoint / (paddle.width/2);
    let angle = collidePoint * Math.PI/3;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = - ball.speed * Math.cos(angle);
  }
}

function gameOver(){
  resetGame();
  pressToStart.style.display = "block";
}

function checkWin(){
  var countF = 0;
  for(let r = 0; r < brick.row; r++){
    for(let c = 0; c < brick.column; c++){
      let b = bricks[r][c];
      if(b.status == false)
        countF += 1;
    }
  }
  if(countF == (brick.row*brick.column)){
    congrats.style.display = "block";
    paused = true;
  }
}

function draw(){
  drawPaddle();
  drawBall();
  drawBricks();
  scoreLabel.innerHTML = SCORE;
}

function update(){
  movePaddle();
  moveBall();
  ballWallCollision();
  ballPaddleCollision();
  ballBrickCollision();
  checkWin();
  if(LIFE == false){
    gameOver();
  }
}

function loop(){
  if(!paused){
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    draw();
    update();
    if(LIFE){
      requestAnimationFrame(loop);
    }
  }
}
