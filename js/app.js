var timer = new Timer();

timer.start();
timer.addEventListener('secondsUpdated', function (e) {
    $('#timer').html(timer.getTimeValues().toString());
});

let score = 0;
let gemscore = 0; // Gems increase score as well, this is just for the final screen
let gameOver = false;
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
  constructor() {
    this.sprite = "images/char-boy.png";
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
  constructor() {
    const yCoordinates = [110, 190, 270];
    const xCoordinates = [20, 120, 220, 320, 420];
    let gemOption = this.gemColour();
    this.y = yCoordinates[Math.floor(Math.random() * yCoordinates.length)];
    this.x = xCoordinates[Math.floor(Math.random() * xCoordinates.length)];
    this.sprite = `images/Gem-${gemOption}.png`;
  }

  update(dt) {}

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

// TODO: Create character selector
class CharacterOption {
  constructor(option) {
    let spriteOptions = ['images/char-boy.png',
      'images/char-cat-girl.png',
      'images/char-horn-girl.png',
      'images/char-pink-girl.png',
      'images/char-princess-girl.png'];
    let xPositions = [20, 110, 200, 290, 380];
    this.y = 250;
    this.x = xPositions[option];
    this.sprite = spriteOptions[option];
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

class Selector {
  constructor() {
    this.y = 280;
    this.x = 200;
    this.sprite = "images/Selector.png";
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

//Create class for selector, including handling arrow key input + enter

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

function spawnEnemy() {
  if (allEnemies.size < 6) {
    allEnemies.add(new Enemy());
  }
}

function spawnGem() {
  if (allGems.size < 3) {
    setTimeout( () => allGems.add(new Gem()), Math.floor(Math.random() * 10000));
  }
}

function generateCharacterOption(index) {
  allCharacterOptions.add(new CharacterOption(index));
}

function characterSelector() {
  for (i = 0; i < 5; i++) {
    generateCharacterOption(i);
  }
}

//Start game on page load
const player = new Player();
// TODO: Create set of characters from which to choose
const allCharacterOptions = new Set();
const allEnemies = new Set();
const allGems = new Set();
const selector = new Selector();
let autoSpawnGem = setInterval(spawnGem, Math.random() * 10000);
let autoSpawnEnemy = setInterval(spawnEnemy, Math.random() * 2000);

characterSelector();


//Clear board and restart game
function reset() {
  allGems.clear();
  autoSpawnGem = setInterval(spawnGem, Math.random() * 10000);
  autoSpawnEnemy = setInterval(spawnEnemy, Math.random() * 2000);
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
document.addEventListener("keyup", function(e) {
  var allowedKeys = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
