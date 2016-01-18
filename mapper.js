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
    //~ mcc.clearRect(0,0,mc.width, mc.height);
    //~ mcc.font = "30px Arial";
    //~ mcc.fillText("Hello World",100,50);

    player.render();

    mcc.clearRect(0,0,mc.width, mc.height);
    mcc.drawImage(bmc, 0, 0);
    requestAnimationFrame(main);
}

var Spider = function(ctx_pa)
{
    this.x = 0;
    this.y = 0;
    this.icon = loadImage("spider.png");
    var ctx = ctx_pa;

    this.render = function()
    {
        ctx.drawImage(this.icon, this.x, this.y);
    };

    this.upArrow = function()
    {
        this.y -= 1;

        if (this.y < 0)
        {
            this.y = 0;
        }
    };

    this.downArrow = function()
    {
        this.y += 1;

        if (this.y > 450)
        {
            this.y = 450;
        }
    };

    this.leftArrow = function()
    {
        this.x -= 1;

        if (this.x < 0)
        {
            this.x = 0;
        }
    };

    this.rightArrow = function()
    {
        this.x += 1;

        if (this.x > 600)
        {
            this.x = 600;
        }
    };
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38')
    {
        player.upArrow();
    }
    else if (e.keyCode == '40')
    {
        player.downArrow();
    }
    else if (e.keyCode == '37')
    {
       player.leftArrow();
    }
    else if (e.keyCode == '39')
    {
       player.rightArrow();
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

    document.onkeydown = checkKey;

    main();
}

window.onload=initialize;
