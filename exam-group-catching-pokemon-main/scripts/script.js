const log = (msg) => console.log(msg);

// I denna fil skriver ni all er kod
setUpPage();

function setUpPage() {
  // let formRef = document.querySelector('#formWrapper');
  oGameData.formRef = document.querySelector('#formWrapper');
  oGameData.formRef.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateForm()) {
      startGame();
    }
  });
  oGameData.gameField = document.querySelector('#gameField');
  let playAgainRef = document.querySelector('#playAgainBtn');
  playAgainRef.addEventListener('click', () => {
    oGameData.gameField.classList.add('d-none');
    oGameData.formRef.classList.remove('d-none');
  });
}

function validateForm() {
  let nickRef = document.querySelector('#nick');
  let ageRef = document.querySelector('#age');
  let girlRef = document.querySelector('#girl');
  let boyRef = document.querySelector('#boy');
  let errorMsg = document.querySelector('#errorMsg');
  //   console.log(nickRef.value, ageRef.value, girlRef.value, boyRef.value)

  try {
    if (nickRef.value.length < 5) {
      throw {
        message: 'Nickname must be at least 5 characters.',
        target: nickRef,
      };
    } else if (nickRef.value.length > 15) {
      throw {
        message: "Nickname can't be longer than 15 characters.",
        target: nickRef,
      };
    } else if (isNaN(ageRef.value) || ageRef.value === '') {
      throw {
        message: 'Age must be a number.',
        target: ageRef,
      };
    } else if (ageRef.value < 10) {
      throw {
        message: 'Trainer must be at least 10 years old.',
        target: ageRef,
      };
    } else if (ageRef.value > 15) {
      throw {
        message: "Trainer can't be older than 15 years.",
        taget: ageRef,
      };
    } else if (!girlRef.checked && !boyRef.checked) {
      throw {
        message: 'You must select a gender.',
        target: girlRef,
        target2: boyRef,
      };
    }
    // errorMsg.textContent = '';
    oGameData.trainerName = nickRef.value;
    oGameData.formRef.classList.add('d-none');
    return true;
  } catch (error) {
    console.log(error.message);
    errorMsg.textContent = error.message;
    error.target.focus();
    if (error.target2) {
      error.target2.focus();
    }
    return false;
  }
}

function setupGame() {
  for (let i = 0; i < 10; i++) {
    let number = checkIfTaken(convertNumber());
    createPokemon(number);
  }
}

function startGame() {
  oGameData.init();
  document.querySelector('#highScore').classList.add('d-none');
  oGameData.startTime = oGameData.startTimeInMilliseconds();
  let musicRef = document.querySelector('audio');
  musicRef.play();
  setupGame();
}

function convertNumber() {
  let number = getRandomNumber();
  number = number.toString();
  if (number.length === 1) {
    number = '00' + number;
  } else if (number.length === 2) {
    number = '0' + number;
  }
  return number;
}

function checkIfTaken(number) {
  let isTaken = oGameData.pokemonNumbers.some((pokemonNumber) => {
    return pokemonNumber === number;
  });
  if (isTaken) {
    return checkIfTaken(convertNumber());
  } else {
    oGameData.pokemonNumbers.push(number);
    return number;
  }
}

function createPokemon(number) {
  oGameData.gameField.classList.remove('d-none');
  let pokemonRef = document.createElement('img');
  pokemonRef.src = `./assets/pokemons/${number}.png`;
  pokemonRef.classList.add('pokemon');
  pokemonRef.classList.remove();
  pokemonRef.style.width = '300px';
  pokemonRef.addEventListener('mouseover', () => {
    pokemonRef.classList.toggle('d-none');
    ballRef.classList.toggle('d-none');
    checkForGameOver();
  });

  oGameData.gameField.append(pokemonRef);

  let ballRef = document.createElement('img');
  ballRef.src = `./assets/ball.webp`;
  ballRef.classList.add('ball');
  ballRef.classList.add('d-none');
  ballRef.addEventListener('mouseover', () => {
    ballRef.classList.toggle('d-none');
    pokemonRef.classList.toggle('d-none');
  });
  oGameData.gameField.append(ballRef);

  giveRandomPos(pokemonRef);
  giveRandomPos(ballRef);
  setInterval(() => {
    giveRandomPos(pokemonRef);
    giveRandomPos(ballRef);
  }, 3000);
}

function getRandomNumber() {
  return Math.floor(Math.random() * 151) + 1;
}

function checkForGameOver() {
  let pokemonRefs = document.querySelectorAll('.pokemon');
  let ballRefs = document.querySelectorAll('.ball');

  let isWinner = [...pokemonRefs].every((pokemon) => {
    return pokemon.className.includes('d-none');
  });
  if (isWinner === true) {
    ballRefs.forEach((ball) => {
      ball.classList.add('d-none');
    });
    oGameData.endTime = oGameData.endTimeInMilliseconds();
    displayHighScore();
  }
}

function displayHighScore() {
  let musicRef = document.querySelector('audio');
  musicRef.pause();

  oGameData.nmbrOfMilliseconds = function () {
    return this.ending - this.beginning;
  };
  let timeInMil = oGameData.nmbrOfMilliseconds();
  let timeInSec = parseInt(timeInMil / 1000);
  document.querySelector('#highScore').classList.remove('d-none');

  let userObj = {
    nick: oGameData.trainerName,
    time: timeInSec,
  };

  if (localStorage.getItem('highScores') === null) {
    localStorage.setItem('highScores', '[]');
  }

  let highScores = JSON.parse(localStorage.getItem('highScores'));
  if (!highScores.length) {
    highScores.push(userObj);
  } else {
    highScores.some((player, i) => {
      if (player.time > timeInSec) {
        highScores.splice(i, 0, userObj);
        return true;
      } else if (i === highScores.length - 1 && highScores.length < 10) {
        highScores.push(userObj);
        return true;
      }
    });
    if (highScores.length > 10) {
      highScores.pop();
    }
  }
  localStorage.setItem('highScores', JSON.stringify(highScores));

  let winMsgRef = document.querySelector('#winMsg');
  winMsgRef.textContent = `Good job ${oGameData.trainerName}, you caught all pokemons in ${timeInSec} seconds!`;

  let highScoresRef = document.querySelector('#highscoreList');
  highScoresRef.innerHTML = '';
  highScores.forEach((highScore) => {
    let highScoreRef = document.createElement('li');
    let textStr = `Player: ${highScore.nick}, Time: ${highScore.time}s`;
    highScoreRef.textContent = textStr;
    highScoresRef.append(highScoreRef);
  });
}

function giveRandomPos(img) {
  let left = oGameData.getLeftPosition() + 'px';
  let top = oGameData.getTopPosition() + 'px';

  img.style.left = left;
  img.style.top = top;
}
