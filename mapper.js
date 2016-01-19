"use strict";
/*
    Copyright 2016 Drew Garrido

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
    MA 02110-1301, USA.
*/

var player;
var mc;
var mcc;
var bmc;
var bmcc;

function main()
{
    bmcc.clearRect(0,0,bmc.width, bmc.height);
    bmcc.font = "30px Arial";
    bmcc.fillText("Hello World",100,50);

    player.render();

    mcc.clearRect(0,0,mc.width, mc.height);
    mcc.drawImage(bmc, 0, 0);
    requestAnimationFrame(main);
}

var Spider = function(ctx_pa)
{
    this.x = 0;
    this.y = 0;
    this.move_x = 0;
    this.move_y = 0;
    this.icon = loadImage("spider.png");
    var ctx = ctx_pa;

    this.render = function()
    {
        this.x += this.move_x;

        if (this.x < 0)
        {
            this.x = 0;
        }
        else if (this.x > 600)
        {
            this.x = 600;
        }

        this.y += this.move_y;

        if (this.y < 0)
        {
            this.y = 0;
        }
        else if (this.y > 450)
        {
            this.y = 450;
        }

        ctx.drawImage(this.icon, this.x, this.y);
    };

    this.upArrowDown = function()
    {
        this.move_y = -1;
    };

    this.downArrowDown = function()
    {
        this.move_y = 1;
    };

    this.leftArrowDown = function()
    {
        this.move_x = -1;
    };

    this.rightArrowDown = function()
    {
        this.move_x = 1;
    };

    this.upArrowUp = function()
    {
        this.move_y = 0;
    };

    this.downArrowUp = function()
    {
        this.move_y = 0;
    };

    this.leftArrowUp = function()
    {
        this.move_x = 0;
    };

    this.rightArrowUp = function()
    {
        this.move_x = 0;
    };

}

function checkKeyDown(e)
{
    e = e || window.event;

    if (e.keyCode == '38')
    {
        player.upArrowDown();
    }
    else if (e.keyCode == '40')
    {
        player.downArrowDown();
    }
    else if (e.keyCode == '37')
    {
       player.leftArrowDown();
    }
    else if (e.keyCode == '39')
    {
       player.rightArrowDown();
    }
}

function checkKeyUp(e)
{
    e = e || window.event;

    if (e.keyCode == '38')
    {
        player.upArrowUp();
    }
    else if (e.keyCode == '40')
    {
        player.downArrowUp();
    }
    else if (e.keyCode == '37')
    {
       player.leftArrowUp();
    }
    else if (e.keyCode == '39')
    {
       player.rightArrowUp();
    }
}



function loadImage(src)
{
    var img1 = false;
    if (document.images)
    {
        img1 = new Image();
        img1.src = src;
    }
    return img1;
}



function initialize()
{
    mc = document.getElementById("mapperCanvas");

    bmc = document.createElement('canvas');
    bmc.width = mc.width;
    bmc.height = mc.height;

    mcc = mc.getContext("2d");
    bmcc = bmc.getContext("2d");

    player = new Spider(bmcc);

    document.onkeydown = checkKeyDown;
    document.onkeyup = checkKeyUp;

    main();
}

window.onload=initialize;
