/**
 * Created by Andrei Nadchuk on 12.09.16.
 * email: navikom11@mail.ru
 */
var engine = require( 'engine' ),
    Layout = require( '../Layout' ),
    Pane = require( '../components/Pane' ),
    BorderPane = require( '../components/BorderPane' ),
    Label = require( '../components/Label' ),
    Image = require( '../components/Image' ),
    Tooltip = require( '../components/Tooltip' );

function getRandomInt ( min, max ) {
    return Math.floor( Math.random() * (max - min) ) + min;
}


function Leaderboard ( game, settings ) {
    Pane.call( this, game, {
        width : 188,
        height : 250,
        padding : [ 0 ],
        layout : {
            ax : Layout.CENTER,
            ay : Layout.TOP,
            direction : Layout.VERTICAL,
            gap : 200
        },
        bg : {
            fillAlpha : 0.0,
            borderSize : 0.0
        }
    } );

    this.users = [];
    this.uuid = 0;
    this.max = 10;

    this.infoUsersBorderPane = new BorderPane( game, {
        padding : [ 0 ],
        gap : [ 5, 0 ],
        bg : {
            fillAlpha : 0.0,
            borderSize : 0.0
        }
    } );

    this.infoCurrentUserBorderPane = new BorderPane( game, {
        padding : [ 0 ],
        gap : [ 5, 0 ],
        bg : {
            fillAlpha : 0.0,
            borderSize : 0.0,
        }
    } );

    this.addPanel( Layout.TOP, this.infoUsersBorderPane );
    this.addPanel( Layout.BOTTOM, this.infoCurrentUserBorderPane );

    this.addPlayer( { name : 'Current user', score : "0", current : true } );

    for ( var i = 0; i < 10; i++ ) {
        this.addPlayer( { name : 'User' + i, score : getRandomInt( 0, 500 ).toString() } );

    }


    game.clock.events.loop(1000, this._updateInfo, this);
};

Leaderboard.prototype = Object.create( Pane.prototype );
Leaderboard.prototype.constructor = Leaderboard;

Leaderboard.prototype.validate = function () {
    return Pane.prototype.validate.call( this );
};

Leaderboard.prototype.addPlayer = function ( user ) {

    user.uuid = this.uuid++;

    this.users.push( user );


    this.users.sort( function ( a, b ) {
        return b.score - a.score;
    } );

    this.redraw();
};

Leaderboard.prototype.removePlayer = function ( user ) {


    if(user.panel)
        user.panel.removePanel(user.row);

    this.users.splice(this.users.indexOf(user), 1);

    this.redraw();

};


Leaderboard.prototype.redraw = function () {

    var scope = this;

    for ( var i = 0, j = this.users.length; i < j; i++ ) {

        draw( this.users[ i ], false, i >= this.max );

        if(this.users[ i ].current){
            draw(this.users[ i ], true, i >= this.max);
        }
    }

    function draw ( user, current, filled ) {

        var panel = current ? scope.infoCurrentUserBorderPane : scope.infoUsersBorderPane;

        if(current){
            if(user.currentRow)
                panel.removePanel( user.currentRow );
        } else {
            if(user.row){
                panel.removePanel( user.row );
                user.row = undefined;
            }
        }

        if(!user.current && filled)
            return;


        var row = new BorderPane( game, {
            padding : [ 0 ],
            gap : [ 0, 5 ],
            bg : {
                fillAlpha : 0.0
            }
        } );

        var size = 85 * (4 / user.name.length);
        var paddingName = [ 6, 2, 6, size ];
        var paddingScore = [ 6, 15 ];
        var userName = new Label( this.game,
            user.name, {
                padding : paddingName,
                text : {
                    fontName : 'medium',
                    tint : user.current ? 0xffaaff : 0x66aaff
                },
                bg : {
                    fillAlpha : 0.0,
                    borderAlpha : 0.0
                }
            } );


        var userScore = new Label( scope.game,
            user.score, {
                padding : paddingScore,
                text : {
                    fontName : 'medium',
                    tint : user.current ? 0xffaaff : 0x66aaff
                },
                bg : {
                    fillAlpha : 0.0,
                    borderAlpha : 0.0
                }
            } );


        row.addPanel( Layout.RIGHT, userScore );
        row.addPanel( Layout.LEFT, userName );

        panel.addPanel( Layout.TOP, row );


        if(current)
            user.currentRow = row ;
        else
            user.row = row;

        user.panel = panel;
    }

}



Leaderboard.prototype._updateInfo = function () {

    for(var i = 0, j = this.users.length; i < j; i++){
        this.users[i ].score = getRandomInt(0, 500 ).toString();
    }

    this.users.sort( function ( a, b ) {
        return b.score - a.score;
    } );

    var index = getRandomInt(0, this.users.length - 1);

    if(this.users[index ].current){
        if(index >= this.users.length)
            index--;
        else
            index++;
    }

    var random = getRandomInt(0, 5);

    if(random < 2 && this.users.length > 2)
        this.removePlayer(this.users[index ]);
    else if(random > 2 && this.users.length <= this.max)
        this.addPlayer({ name : 'User' + this.uuid, score : getRandomInt( 0, 500 ).toString() });

    this.redraw();

};

module.exports = Leaderboard;