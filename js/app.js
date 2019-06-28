let timer = new Timer();

timer.start();
timer.addEventListener('secondsUpdated', function (e) {
    $('#timer').html(timer.getTimeValues().toString());
});

let player;
let score = 0;
let gemscore = 0; // Gems increase score as well, this is just for the final screen
let gameOver = false; // Necessary to stop character moving after game end
const xLaneCoordinates = [0, 100, 200, 300, 400];
const spriteOptions = ['images/char-boy.png',
  'images/char-cat-girl.png',
  'images/char-horn-girl.png',
  'images/char-pink-girl.png',
  'images/char-princess-girl.png'];

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false,
})

//Custom popup when game over
function swalReset() {
  swalWithBootstrapButtons.fire({
  title: 'Game over!',
  text: `Final score: ${score}, including ${gemscore} gem(s). Care for another?`,
  type: 'warning',
  showCancelButton: true,
  confirmButtonText: "Yes, let's go again!",
  cancelButtonText: "No, leave me be!",
  reverseButtons: false
  }).then((result) => {
    if (result.value) {
      reset();
    } else if (
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        "No problem!",
        "You probably have more important things to do."
      )
    }
  })
}

// Enemies our player must avoid
class Enemy {
  constructor() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    let laneYCoordinates = [60, 140, 220]; //lane Y Coordinates
    this.speed = this.generateSpeed();
    this.lane = this.whichLane();
    this.y = laneYCoordinates[this.lane];
    this.x = -100;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = "images/enemy-bug.png";
  }

  //Decide which of the three horizontal lanes the enemy will spawn in
  whichLane() {
    let laneIndex = Math.floor(Math.random() * 3);
    return laneIndex;
  }

  //Assign a random speed to each enemy (within certain limits)
  generateSpeed() {
    let randomSpeed = Math.random() * 100 + 100;
    return randomSpeed;
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x >= 600) {
      allEnemies.delete(this);
    }
  }

  // Draw the enemy on the screen, required method for game
  render(dt) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
class Player {
  //Allows generating player based on selected sprite
  constructor(sprite) {
    this.sprite = `${sprite}`;
    this.x = 200;
    this.y = 410;
  }

  //Enemy collision handler
  collision() {
    allEnemies.clear();
    clearInterval(autoSpawnEnemy);
    clearInterval(autoSpawnGem);
    swalReset();
    timer.stop();
    gameOver = true;
  }

  //Gem pickup handler
  gemCollect() {
    gemscore++;
    score++;
    document.querySelector('.score').innerText = score;
    console.log("Oooh, shiny!");
  }

  //Check for collisions whenever the screen updates
  update(dt) {
    //Collision with enemy
    for (let enemy of allEnemies) {
      if (
        this.x >= enemy.x - 80 &&
        this.x <= enemy.x + 80 &&
        (this.y >= enemy.y - 50 && this.y <= enemy.y + 50)
      ) {
        setTimeout(() => {
          return this.collision();
        }, 50);
      }
    }
    //Collision with gem
    for (let gem of allGems) {
      if (
        this.x >= gem.x - 30 &&
        this.x <= gem.x + 30 &&
        (this.y >= gem.y - 70 && this.y <= gem.y + 25)
      ) {
        setTimeout(() => {
          allGems.delete(gem);
          return this.gemCollect();
        }, 0);
      }
    }
  }

  //Update score and reset player location to beginning when river is reached
  hitRiver() {
    this.x = 200;
    this.y = 410;
    score++;
    document.querySelector('.score').innerText = score;
  }

  //Draw player on screen
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }

  //What to do when keys are pressed. Each has a limit to prevent off-screen movement
  handleInput(key) {
    if (gameOver === false) {
      if (key === "left") {
        if (this.x < 50) {
          return;
        } else {
          this.x -= 100;
        }
      } else if (key === "right") {
        if (this.x > 350) {
          return;
        } else {
          this.x += 100;
        }
      } else if (key === "down") {
        if (this.y > 400) {
          return;
        } else {
          this.y += 90;
        }
      } else if (key === "up") {
        if (this.y < 100) {
          return this.hitRiver();
        } else {
          this.y -= 90;
        }
      }
    }
  }
}

class Gem {
  //Randomize gem locations and colour
  constructor() {
    const yCoordinates = [110, 190, 270];
    const xCoordinates = [20, 120, 220, 320, 420];
    let gemOption = this.gemColour();
    this.y = yCoordinates[Math.floor(Math.random() * yCoordinates.length)];
    this.x = xCoordinates[Math.floor(Math.random() * xCoordinates.length)];
    this.sprite = `images/Gem-${gemOption}.png`;
  }

//Randomize spawning gem colour
  gemColour() {
    const gemColours = ["Orange", "Green", "Blue"];
    let gemIndex = Math.floor(Math.random() * gemColours.length);
    return gemColours[gemIndex];
  }

  // Draw gem on screen
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 60, 100);
  }
}

class CharacterOption {
  //Constructor allows looping through with an index
  //in order to show multiple sprites on screen
  constructor(option) {
    this.y = 250;
    this.x = xLaneCoordinates[option];
    this.sprite = spriteOptions[option];
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

//Selector class for player to choose sprite
class Selector {
  constructor() {
    this.y = 280;
    this.x = 200;
    this.sprite = "images/Selector.png";
  }

  handleInput(key) {
    if (key === 'left') {
      if (this.x < 50) {
        return;
      } else {
        this.x -= 100;
      }
    } else if (key === 'right') {
      if (this.x > 350) {
        return;
      } else {
        this.x += 100;
      }
    } else if (key === 'enter') {
      if (allCharacterOptions.size > 0) { //Prevents enter key triggering once selection is made
        let xIndex = xLaneCoordinates.findIndex(function(index) {return index === this.x}, selector);
        let selectedSpriteIndex = spriteOptions[xIndex];
        init(selectedSpriteIndex);
      }
    }
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

//Spawn an enemy if there are fewer than 6 already
function spawnEnemy() {
  if (allEnemies.size < 6) {
    allEnemies.add(new Enemy());
  }
}

//Spawn a gem at random intervals if there are fewer than 3 already
function spawnGem() {
  if (allGems.size < 3) {
    setTimeout( () => allGems.add(new Gem()), Math.floor(Math.random() * 10000));
  }
}

//Generate character sprites on screen from which the player can choose
function characterSelector() {
  for (i = 0; i < 5; i++) {
    allCharacterOptions.add(new CharacterOption(i));
  }
}

//Start game on character selection (sprite).
function init(sprite) {
  player = new Player(sprite);
  playerKeyPressListener();
  autoSpawnGem = setInterval(spawnGem, Math.random() * 10000);
  autoSpawnEnemy = setInterval(spawnEnemy, Math.random() * 2000);
  allCharacterOptions.clear();
  delete selector.x;
}

let autoSpawnGem;
let autoSpawnEnemy;
const allEnemies = new Set();
const allGems = new Set();
const allCharacterOptions = new Set();
const selector = new Selector();
characterSelector();


//Clear board and restart game
function reset() {
  allGems.clear(); //Remove any existing gems
  //Set up auto spawners again
  autoSpawnGem = setInterval(spawnGem, Math.random() * 10000);
  autoSpawnEnemy = setInterval(spawnEnemy, Math.random() * 2000);
  //Reset player position
  player.x = 200;
  player.y = 410;
  score = 0;
  gemscore = 0;
  gameOver = false;
  timer.start();
  $('#timer').html(timer.getTimeValues().toString());
  document.querySelector('.score').innerText = score;
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
// I modified this as a function so it can be called once the player is selected
function playerKeyPressListener() {
  document.addEventListener("keyup", function(e) {
    var allowedKeys = {
      37: "left",
      38: "up",
      39: "right",
      40: "down"
    };

    if (typeof player === 'object') {
      player.handleInput(allowedKeys[e.keyCode]);
    };
  });
}

//Keypress listener for character selector
document.addEventListener("keyup", function(e) {
  var allowedKeys = {
    13: "enter",
    37: "left",
    39: "right"
  }

  if (selector) {
    selector.handleInput(allowedKeys[e.keyCode]);
  }
});
