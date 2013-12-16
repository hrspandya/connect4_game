//Build By Harsh Pandya
//Contact: hrspandya@gmail.com


//Truly Reusable and Scalable solution
//See game.html to see how two different ways we have used this component.
//Use config Object to set the behavior of your component.


//Adding NameSpace to avoid conflict with other external js
//Also minimize global and modulerize the components

var HpApp = HpApp || {};

HpApp.comp = {};

HpApp.comp.ConnectFour = function(container, config){
    config = config || {};
    
    var _config = {
        row: config.row || 6,
        col: config.col || 8,
        rounds: config.rounds || 1,
        p1: config.p1 || "Player 1",
        p2: config.p2 || "Player 2",
        turn: Math.floor((Math.random()*10)+1) % 2 == 0 ? 'red' : 'blue',  //First turn is given to random player
        clicked: false,
        topBar: "",
        board: "",
        resultArray: [],
        winingCells:[],
        gameOver: false
    };
    
     var _init = function(){
        //Initialize your Game components
        //Keeping everything private
        _config.board = _createBoard();
        _config.topBar = _createTopBar();
        _config.board.append(_config.topBar);
        _setupEvents();
    }
    
    var _createBoard = function(){
        //Build Grid based on config rows and cols
        var c, r, column, board = $('<div>').addClass('board'), cell;
        container.append(board);
        
        _config.resultArray = [];
        for(var i = 0; i <_config.col; i++){
            _config.resultArray[i] = []; //Creating 2 dimentional array, similar to our board (rows and cols)
        }
        
        for(c = 0; c < _config.col; c++){
            column = $('<div>').addClass('column');
            board.append(column);            
            for(r = 0; r < _config.row; r++){
                cell = $("<div row='"+ r +"' col='"+ c +"' class='cell'> "+
                         //"r:"+ r+ "  c:"+c+
                         " </div>");
                $(cell).data( "cell", { row: r, col: c, ownedBy:"" } );
                column.append(cell);
            }
        }
        return board;
    }
    
    var _createTopBar = function(){
        return $('<div>').append('<b></b>').addClass(_config.turn);
    }
    
    var _setupEvents = function(){
        var globalThis = this;
        
        //Putting event on parent only, instead of attaching event to all children
        //Event delegation,
        
        $( "#" + container[0].id + " .board" ).delegate( ".column", "mouseover", moveTopBar);
        $( "#"+ container[0].id + " .board" ).delegate( ".column div", "click", userClikedOnCell);
        
        //TopBar section for every new token,
        //which should follow user in more intuative way        
        
        function moveTopBar(e) {
            if ($(_config.topBar).is(':animated')){
                $(_config.topBar).finish();
            }
                        
            e.stopPropagation();
            
            var list = $( "#" + container[0].id + " .board" ).find( ".column" );
            var index = list.index(this);
            var left = parseInt($(_config.topBar).css( "left" )) - (index * 50);            
            $(_config.topBar).animate({ "left": "-="+ left +"px" }, "fast");
        }
        
        
        //Whenever user clicks on any cell within the board
        //We need to find right cell to move that token with animation
        //update the 2 dimentional array, We would need this array later
        
        function userClikedOnCell(e) {
            var r, c, ownedBy, position, row, col;
            r = $(e.currentTarget).data( "cell").row;
            c = $(e.currentTarget).data( "cell").col;
            ownedBy = $(e.currentTarget).data( "cell").ownedBy;
            
            //We need to stop this click event, otherwise it will an issue
            e.stopPropagation();
            _config.clicked = true;
            
            //Putting fix
            var left = parseInt($(_config.topBar).css( "left" )) - (c * 50);            
            $(_config.topBar).animate({ "left": "-="+ left +"px" }, "fast");
            
            //We need to find which row and col are valid
            row = (_config.row + 1) - ((_config.row + 1) - _config.resultArray[c].length);
            col = c;
            makeItFall(row, c);
        }
        
        
        //Doing the animation, token is falling and stopping at the availabel box
        //Here we need to know if below cells are alreay taken or they are available
        //this we could easily figure it out because we were updating the 2 dimentinoal Array on every Click
        
        function makeItFall(r, c){
            var totalRowsMoveDown = (_config.row) - r;
            position = totalRowsMoveDown * 52; //2 added for border 50 + 2 px border
            $(_config.topBar).animate({ "top": "+="+ position +"px" }, "fast");
            
            //Update the Array with correct value
            _config.resultArray[c].push(_config.turn);
            var cell = _config.board.find(".column").eq(c).find(".cell").eq(_config.row -1 - r);
            cell.append(_config.topBar);
            
            //Check if Anyone Win
            if (_checkForWin(r, c)){
                //game is over, Show result
                _gameOver();
                //Remove event binding
                $( "#" + container[0].id + " .board" ).off('click');
                $( "#" + container[0].id + " .board" ).off('mouseover');
            }else{
                //Now Change the Turn to Other User and create new TOPBar
                _changeTurn();
            }
        }
        
        
        //We need to change the turn of players
        //if last play was red then choose blue or vice versa,
        
        function _changeTurn(){
            if (_config.turn == 'red'){
                _config.turn = 'blue';
            }else{
                _config.turn = 'red';
            }
            
            //Next Players turn, Create new Token in TopBar
            _config.topBar = _createTopBar();
            _config.board.append(_config.topBar);
        }
        
        //If Game is Over then show result
        //Show the winning Cells and their position
        //Engaging user and making it more intuative
        function _gameOver(){
            var cells = _config.winingCells;
            var counter = 50;
            var opacityVal;
            (function animateWinningCells(){
                if (counter >= 0) {
                    counter--;                    
                }else{
                    return;
                }
                
                for(var index in cells){
                    var cell = _config.board.find(".column").eq(cells[index].c).find(".cell").eq(_config.row -1- cells[index].r);
                    //cell.css("opacity", "0.3");
                    //cell.fadeToggle( "slow", "linear");
                    cell.animate({opacity:'+=1'}, 300, "linear");
                    cell.animate({opacity:'-=0.5'}, 300, "linear", animateWinningCells);
                }
                
            })();
            
        }
    }
    
    //Check if user win or not,
    //Check Horizonal
    //Check Vertical
    //Check Diagnal or Cross Direction
    var _checkForWin = function(r, c){
        
        //Check in row for win
        //We know which R and C token is going, then we check 1 previous and 1 next element to check if same
        //values are available, if yes then increment the count
        //Now go 2 steps forward and backward until we reach deadline or null, if total goes to 4 user wins
        //Simple
        function checkRowForWin() {
            var i, totalCount = 1;
            var leftSideComplete = false;
            var rightSideComplete = false;
            var cells = [];
            var row, col;
            
            for(i = 1; i < _config.col; i++){
                
                if (_config.resultArray[c + i] &&
                    _config.resultArray[c + i][r] == _config.resultArray[c][r]) {
                    //found one                                        
                    totalCount++;
                    row = r;
                    col = c + i;
                    cells.push({r:[row],c:[col]}); //Keeping records of winning cells
                }else{
                    rightSideComplete = true;
                }
                
                if (_config.resultArray[c - i]
                    && _config.resultArray[c - i][r] == _config.resultArray[c][r]) {
                    //found one
                    totalCount++;
                    row = r;
                    col = c - i;
                    cells.push({r:[row],c:[col]}); //Keeping records of winning cells
                }else{
                    leftSideComplete = true;
                }
                
                if (totalCount >= 4){
                    //alert(_config.resultArray[c][r] + " has won the game");
                    cells.push({r:[r],c:[c]});
                    _config.winingCells = cells;
                    return true;
                }
                
                if (leftSideComplete && rightSideComplete){
                    return false;
                }
                
            }
            
            return false;
        }
        
        //We know which R and C token is going, then we check 1 previous and 1 next element to check if same
        //values are available, if yes then increment the count
        //Now go 2 steps forward and backward until we reach deadline or null, if total goes to 4 user wins
        //Simple
        function checkColForWin() {
            var i, totalCount = 1;
            var leftSideComplete = false;
            var rightSideComplete = false;
            var cells = [];
            var row, col;
            
            for(i = 1; i < _config.row; i++){
                
                if (_config.resultArray[c][r + i] &&
                    _config.resultArray[c][r + i] == _config.resultArray[c][r]) {
                    //found one
                    totalCount++;
                    row = r + i;
                    col = c;
                    cells.push({r:[row],c:[col]}); //Keeping records of winning cells
                }else{
                    rightSideComplete = true;
                }
                
                if (_config.resultArray[c][r - i] &&
                    _config.resultArray[c][r - i] == _config.resultArray[c][r]) {
                    //found one
                    totalCount++;
                    row = r - i;
                    col = c;
                    cells.push({r:[row],c:[col]}); //Keeping records of winning cells
                }else{
                    leftSideComplete = true;
                }
                
                if (totalCount >= 4){
                    //alert(_config.resultArray[c][r] + " has won the game");
                    cells.push({r:[r],c:[c]});
                    _config.winingCells = cells;
                    return true;
                }
                
                if (leftSideComplete && rightSideComplete){
                    return false;
                }
                
            }
            
            return false;
        }
        
        //This one is also simple, Do the same things but do it in all for direction
        function checkCrossForWin() {
            //We can easily Implement Cross Side as well
            var i, totalCount = 1;
            var topLeftSideComplete = false;
            var bottomRightSideComplete = false;
            var topRightSideComplete = false;
            var bottomLeftSideComplete = false;
            var cells = [];
            var row, col;
            
            //Check in topLeft and bottomRight Direction for Win
            for(i = 1; i < _config.row; i++){
                
                if (_config.resultArray[c - i] && _config.resultArray[c - i][r + i] &&
                    _config.resultArray[c - i][r + i] == _config.resultArray[c][r]) {
                    //found one
                    totalCount++;
                    row = r + i;
                    col = c - i;
                    cells.push({r:[row],c:[col]}); //Keeping records of winning cells
                }else{
                    topLeftSideComplete = true;
                }
                
                if (_config.resultArray[c + i] && _config.resultArray[c + i][r - i] &&
                    _config.resultArray[c + i][r - i] == _config.resultArray[c][r]) {
                    //found one
                    totalCount++;
                    row = r - i;
                    col = c + i;
                    cells.push({r:[row],c:[col]}); //Keeping records of winning cells
                }else{
                    bottomRightSideComplete = true;
                }
                
                if (totalCount >= 4){
                    //alert(_config.resultArray[c][r] + " has won the game");
                     cells.push({r:[r],c:[c]});
                    _config.winingCells = cells;
                    return true;
                }
                
                if (topLeftSideComplete && bottomRightSideComplete){
                    //If not a Win then make totalCount to 1 again
                    //and Go to next for look where we check in topRight and bottomLeft Direction
                    totalCount = 1;
                    cells = [];                    
                }
                
            }
            
            
             //Check in topRight and bottomLeft Direction for Win
            for(i = 1; i < _config.row; i++){
                
                if (_config.resultArray[c + i] && _config.resultArray[c + i][r + i] &&
                    _config.resultArray[c + i][r + i] == _config.resultArray[c][r]) {
                    //found one
                    totalCount++;
                    row = r + i;
                    col = c + i;
                    cells.push({r:[row],c:[col]}); //Keeping records of winning cells
                }else{
                    topRightSideComplete = true;
                }
                
                if (_config.resultArray[c - i] && _config.resultArray[c - i][r - i] &&
                    _config.resultArray[c - i][r - i] == _config.resultArray[c][r]) {
                    //found one
                    totalCount++;
                    row = r - i;
                    col = c - i;
                    cells.push({r:[row],c:[col]}); //Keeping records of winning cells
                }else{
                    bottomLeftSideComplete = true;
                }
                
                if (totalCount >= 4){
                    //alert(_config.resultArray[c][r] + " has won the game");
                    cells.push({r:[r],c:[c]});
                    _config.winingCells = cells;
                    return true;
                }
                
                if (topRightSideComplete && bottomLeftSideComplete){
                    //If not a Win then make false
                    return false;
                }
                
            }
            
            return false;
            
        }
        
        if (checkRowForWin()){
            return true;
        }else if (checkColForWin()) {
            return true;
        }else if (checkCrossForWin()) {
            return true;
        }
        
        return false;
    }
    
    //Declaring the Public Methods, i dont think we need to though.. Private is better
    this.create = function(){
        return _create();
    }

    //Initialize automatically on object creation   
    _init();
}