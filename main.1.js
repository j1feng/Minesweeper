const $grid = $('#grid');

let COLS = 10;
let ROWS = 10;

let math = 0.2 //The probability of getting a bomb in a ceil.

let trials = 0; //Can be used to check if the click is the first-click.
let numFlag = 0; //Set the number of flags the same number with bombs.


$(document).ready(function(){
  function makeGrid(rows, cols) {
    $grid.empty();
    for (let i = 0; i < rows; i++) {
      const $row = $('<div>').addClass('row');
      for (let j = 0; j < cols; j++) {
        const $col = $('<div>').addClass('col hidden')
          .attr({'data-row': i, 'data-col':j});
        if (Math.random() < math) {
          $col.addClass('mine');
        }
        $row.append($col);
      }
      $grid.append($row);
    }
    if ($('.col.mine').length < 2) makeGrid(rows, cols); //Set mininum bomb amount.
    numFlag = $('.col.mine').length; 
  }

  function restart() {
    makeGrid(ROWS, COLS);
    trials = 0;
  }

  function gameOver(isWin) {
    let message, icon;
    if (isWin) {
      message = 'YOU WON!';
      icon = 'fa fa-flag';
    } else {
      message = 'YOU LOST!';
      icon = 'fa fa-bomb';
    }
    $('.col.mine').append(
      $('<i>').addClass(icon)
    );
    $('.col:not(.mine)')
      .html(function() {
        const $cell = $(this);
        const count = getMineCount($cell.data('row'), $cell.data('col'));
        return count === 0 ? '' : count;
      })
    $('.col.hidden').removeClass('hidden');
    setTimeout(function() {
      alert(message);
      restart();
    }, 1000);
  }

  function findMine(i, j) {
    let seen = {};
    const key = `${i} ${j}`
    if (seen[key]) return;
    const $cell = $(`.col.hidden[data-row=${i}][data-col=${j}]`);
    const mineCount = getMineCount(i, j);
    if (
      !$cell.hasClass('hidden') ||
      $cell.hasClass('mine')
    ) {
      return;
    }

    $cell.removeClass('hidden');

    if (mineCount) {
      $cell.text(mineCount);
      return;
    }
    
    for (let _i = -1; _i <= 1; _i++) {
      for (let _j = -1; _j <= 1; _j++) {
        findMine(i + _i, j + _j);
      }      
    }
  }


  function getMineCount(i, j) {
    let count = 0;
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        const _i = i + di;
        const _j = j + dj;

        const $cell =
          $(`.col.hidden[data-row=${_i}][data-col=${_j}]`);
        if ($cell.hasClass('mine')) count++;
      }      
    }
    return count;
  }
/** By Creating a noMine function, the game can prevent the player from dying
 * on the first click by deleting that one bomb; the miminum bomb number from
 * the game preset is set to 2, no matter how big the map is.
 */

  function noMine(row, col) {
    const isGameOver = $('.col.hidden').length === $('.col.mine').length;
    trials += 1;
    findMine(row, col);
    if (isGameOver && trials === 1){
      restart();
      /**There is no need to worry about winning on the first click now cuz
       * the mininum bomb amount is 2.
       */
    }
    else if (isGameOver) {
      gameOver(true);
    }
  }

  function leftClick() {
    const $cell = $(this);
    const row = $cell.data('row');
    const col = $cell.data('col');
    if ($cell.hasClass('mine')) {
      if (trials === 0){
        $cell.removeClass('mine');
        noMine(row, col);
      } else{
        gameOver(false);
      }
    } else {
      noMine(row, col);
    }
  }

  function rightClick(){
    icon = 'fa fa-flag'
    const $cell = $(this);
    if ($cell.hasClass('hidden') && !$cell.hasClass('flag') && numFlag >0) {
      $cell.addClass('flag')
      $cell.append($('<i>').addClass(icon))
      numFlag -= 1;
    }
    else if ($cell.hasClass('hidden') && $cell.hasClass('flag')) {
      $cell.removeClass('flag')
      $cell.empty();
      numFlag += 1;
    }
  }
  
  $(function() {
    $(this).bind("contextmenu", function(e) {
      e.preventDefault();
    });
  });
  
  $grid.on('click', '.col.hidden', leftClick)
  
  $grid.on('contextmenu', '.col.hidden', rightClick)
  
  restart();

  document.getElementById("numFlag").innerHTML = numFlag;
  
});


