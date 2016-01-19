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

var Spider = function(ctx_pa, width_pa, height_pa)
{
    this.x = 0;
    this.y = 0;
    this.cmd_x = 0;
    this.cmd_y = 0;
    this.vel_x = 0;
    this.vel_y = 0;
    this.max_vel_sq = 9;
    this.acc = 0.05;
    this.friction = 0.2;
    this.icon = loadImage("spider.png");
    this.max_x = width_pa - this.icon.width;
    this.max_y = height_pa - this.icon.height;
    var ctx = ctx_pa;

    this.render = function()
    {
        this.vel_x += this.acc * this.cmd_x;
        this.vel_y += this.acc * this.cmd_y;
        if (!this.cmd_x)
        {
            if (this.vel_x > this.friction)
            {
                this.vel_x -= this.friction;
            }
            else if (this.vel_x < -this.friction)
            {
                this.vel_x += this.friction;
            }
            else
            {
                this.vel_x = 0;
            }
        }
        if (!this.cmd_y)
        {
            if (this.vel_y > this.friction)
            {
                this.vel_y -= this.friction;
            }
            else if (this.vel_y < -this.friction)
            {
                this.vel_y += this.friction;
            }
            else
            {
                this.vel_y = 0;
            }
        }

        var speed = Math.pow(this.vel_x, 2) + Math.pow(this.vel_y, 2);
        if (speed > this.max_vel_sq)
        {
            var scale = Math.sqrt(this.max_vel_sq/speed);
            this.vel_x *= scale;
            this.vel_y *= scale;
        }
        this.x = Math.min(this.max_x, Math.max(0, this.x + this.vel_x));
        this.y = Math.min(this.max_y, Math.max(0, this.y + this.vel_y));

        ctx.drawImage(this.icon, this.x, this.y);
    };

    this.upArrowDown = function()
    {
        this.cmd_y = -1;
    };

    this.downArrowDown = function()
    {
        this.cmd_y = 1;
    };

    this.leftArrowDown = function()
    {
        this.cmd_x = -1;
    };

    this.rightArrowDown = function()
    {
        this.cmd_x = 1;
    };

    this.upArrowUp = function()
    {
        this.cmd_y = 0;
    };

    this.downArrowUp = function()
    {
        this.cmd_y = 0;
    };

    this.leftArrowUp = function()
    {
        this.cmd_x = 0;
    };

    this.rightArrowUp = function()
    {
        this.cmd_x = 0;
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

    player = new Spider(bmcc, bmc.width, bmc.height);

    document.onkeydown = checkKeyDown;
    document.onkeyup = checkKeyUp;

    main();
}

window.onload=initialize;
