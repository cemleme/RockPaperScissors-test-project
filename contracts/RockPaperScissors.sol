pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;

contract RockPaperScissors{
    
    struct Room { 
        uint id;
        address player1;
        address player2;
        uint8 move1;
        uint8 move2;
        uint bet;
        uint8 winner;
        bool cancelled;
    }

    Room[] public rooms;
    mapping(address => int) public earnings;

    uint8 constant ROCK = 1;
    uint8 constant PAPER = 2;
    uint8 constant SCISSORS = 3;

    event UpdateRoom(Room room);
    event CreateRoom(Room room);
    event Earnings(address indexed player, int earnings);
    
    constructor() {}

    function createRoom() public payable {
        //require(rooms[msg.sender].player1 != msg.sender, "You already have a room.");
        Room memory room = Room(0,address(0),address(0),0,0,0,0,false);
        room.player1 = msg.sender;
        room.bet = msg.value;
        room.id = rooms.length;
        rooms.push(room);

        emit CreateRoom(room);
    }

    function joinRoom(uint index) public payable {
        require(rooms[index].cancelled == false, "The game is cancelled");
        require(rooms[index].player1 != msg.sender, "You are already in this room.");
        require(rooms[index].player2 == address(0), "The room is full, you can't join.");
        require(msg.value == rooms[index].bet, "You need to match the bet amount to join.");
        
        rooms[index].player2 = msg.sender;

        emit UpdateRoom(rooms[index]);
    }

    function getRooms() public view returns (Room[] memory)
    {
        return rooms;
    }

    function getEarnings() public view returns (int)
    {
        return earnings[msg.sender];
    }

    function getRoom(uint index) public view returns (Room memory)
    {
        return rooms[index];
    }

    function cancelRoom(uint index) public
    {
        require(rooms[index].player1 == msg.sender, "This is not your game to cancel");
        require(rooms[index].player2 == address(0), "You can not cancel at this stage");
        require(rooms[index].cancelled == false, "The game is already cancelled");

        rooms[index].cancelled = true;
        payable(rooms[index].player1).transfer(rooms[index].bet);
    }

    function makeMove(uint index, uint8 move) public {
        require(rooms[index].cancelled == false, "The game is cancelled");
        require(move > 0 && move < 4, "You need to make a move between 1 and 3. 1: Rock, 2: Paper, 3: Scissors");
        require(rooms[index].player1 == msg.sender || rooms[index].player2 == msg.sender, "You are not in this room.");
        require(rooms[index].winner == 0, "This game is already complete.");

        if(rooms[index].player1 == msg.sender){
            rooms[index].move1 = move;
        }
        else{
            rooms[index].move2 = move;
        }

        if(rooms[index].move1 != 0 && rooms[index].move2 != 0){
            pickWinner(index);
        }

        emit UpdateRoom(rooms[index]);
    }
    
    function pickWinner(uint index) private {
        
        //check if draw
            if(rooms[index].move1 == rooms[index].move2)
            {
                rooms[index].move1 = 0;
                rooms[index].move2 = 0;
            }
            else{
                if((rooms[index].move1 == ROCK && rooms[index].move2 == SCISSORS) ||
                    (rooms[index].move1 == PAPER && rooms[index].move2 == ROCK) ||
                    (rooms[index].move1 == SCISSORS && rooms[index].move2 == PAPER))
                {
                    payable(rooms[index].player1).transfer(rooms[index].bet * 2);
                    rooms[index].winner = 1;
                    int betAmount = int(rooms[index].bet);
                    earnings[rooms[index].player1] = earnings[rooms[index].player1] + betAmount;
                    earnings[rooms[index].player2] = earnings[rooms[index].player2] - betAmount;

                    emit Earnings(rooms[index].player1, earnings[rooms[index].player1]);
                    emit Earnings(rooms[index].player2, earnings[rooms[index].player2]);
                }
                else
                {
                    payable(rooms[index].player2).transfer(rooms[index].bet * 2);
                    rooms[index].winner = 2;
                    int betAmount = int(rooms[index].bet);
                    earnings[rooms[index].player1] = earnings[rooms[index].player1] - betAmount;
                    earnings[rooms[index].player2] = earnings[rooms[index].player2] + betAmount;

                    emit Earnings(rooms[index].player1, earnings[rooms[index].player1]);
                    emit Earnings(rooms[index].player2, earnings[rooms[index].player2]);
                }
            }
    }
    
}
