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
var fly_icon;
var flies = [];
var walls = [];

function main()
{
    var num_flies = flies.length;
    var num_walls = walls.length;

    // Prep offscreen buffer
    bmcc.clearRect(0,0,bmc.width, bmc.height);

    // Game logic
    player.move(walls, flies);

    // Draw code
    bmcc.font = "30px Arial";
    bmcc.fillText("Hello World",100,50);

    for (var i = 0; i < num_walls; i++)
    {
        walls[i].render();
    }

    for (var i = 0; i < num_flies; i++)
    {
        flies[i].render();
    }

    player.render();

    // Screen flip
    mcc.clearRect(0,0,mc.width, mc.height);
    mcc.drawImage(bmc, 0, 0);
    requestAnimationFrame(main);
}

var Spider = function(ctx_pa, width_pa, height_pa)
{
    this.x = 0;
    this.y = 0;
    this.vel_x = 0;
    this.vel_y = 0;
    this.max_vel_sq = 9;    // Velocity squared, in px per frame
    this.cmd_x = 0;
    this.cmd_y = 0;
    this.acc = 0.25;        // px per frame^2, must be > than friction!
    this.friction = 0.2;
    this.icon = loadImage("spider.png");
    this.max_x = width_pa - this.icon.width;
    this.max_y = height_pa - this.icon.height;
    this.ctx = ctx_pa;

    this.render = function()
    {
        this.ctx.drawImage(this.icon, this.x, this.y);
    };

    this.move = function(wall_list, flies_list)
    {
        this.updateMovementVectors();
        this.checkWallCollision(wall_list);

    };

    this.checkWallCollision = function(wall_list)
    {
        var num_walls = wall_list.length;
        for (var i = 0; i < num_walls; i++)
        {
            var diff_x = Math.abs(this.x - wall_list[i].x);
            var diff_y = Math.abs(this.y - wall_list[i].y);

            if (diff_x < 32 && diff_y < 32)
            {
                if (diff_x > diff_y)
                {
                    this.vel_x = 0;

                    if (this.x > wall_list[i].x)
                    {
                        this.x = wall_list[i].x + wall_list[i].side;
                    }
                    else
                    {
                        this.x = wall_list[i].x - this.icon.width;
                    }
                }
                else
                {
                    this.vel_y = 0;

                    if (this.y > wall_list[i].y)
                    {
                        this.y = wall_list[i].y + wall_list[i].side;
                    }
                    else
                    {
                        this.y = wall_list[i].y - this.icon.height;
                    }
                }
            }
        }
    };

    this.updateMovementVectors = function()
    {
        this.vel_x += this.acc * this.cmd_x;
        this.vel_y += this.acc * this.cmd_y;
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

        var speed = Math.pow(this.vel_x, 2) + Math.pow(this.vel_y, 2);
        if (speed > this.max_vel_sq)
        {
            var scale = Math.sqrt(this.max_vel_sq/speed);
            this.vel_x *= scale;
            this.vel_y *= scale;
        }

        this.x = Math.min(this.max_x, Math.max(0, this.x + this.vel_x));
        this.y = Math.min(this.max_y, Math.max(0, this.y + this.vel_y));
    }

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

var Fly = function(ctx_pa, x_pa, y_pa)
{
    this.ctx = ctx_pa;
    this.x = x_pa - (fly_icon.width >> 1);
    this.y = y_pa - (fly_icon.height >> 1);
    this.icon = fly_icon;

    this.render = function()
    {
        this.ctx.drawImage(this.icon, this.x, this.y);
    };
}

var Wall = function(ctx_pa, x_pa, y_pa)
{
    this.side = 32;

    this.ctx = ctx_pa;
    this.x = x_pa - (this.side >> 1);
    this.y = y_pa - (this.side >> 1);

    this.render = function()
    {
        this.ctx.fillRect(this.x, this.y, this.side, this.side);
    };

}


function checkKeyDown(e)
{
    var dispatch =  {'38':player.upArrowDown.bind(player),
                     '40':player.downArrowDown.bind(player),
                     '37':player.leftArrowDown.bind(player),
                     '39':player.rightArrowDown.bind(player)
                    };

    e = e || window.event;

    if (dispatch[e.keyCode])
    {
        dispatch[e.keyCode]();
    }
}

function checkKeyUp(e)
{

    var dispatch =  {'38':player.upArrowUp.bind(player),
                     '40':player.downArrowUp.bind(player),
                     '37':player.leftArrowUp.bind(player),
                     '39':player.rightArrowUp.bind(player)
                    };

    e = e || window.event;

    if (dispatch[e.keyCode])
    {
        dispatch[e.keyCode]();
    }
}

function checkMouseDown(e)
{
    var c_off = $(this).offset();
    var click_x;
    var click_y;

    e = e || window.event;

    click_x = e.pageX - c_off.left;
    click_y = e.pageY - c_off.top;

    if (e.button === 0)
    {
        flies.push(new Fly(bmcc, click_x, click_y));
    }
    else if (e.button == 2)
    {
        walls.push(new Wall(bmcc, click_x, click_y));
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
    fly_icon = loadImage('fly.png');

    $(document).keydown(checkKeyDown);
    $(document).keyup(checkKeyUp);
    mc.onmousedown = checkMouseDown;

    // Disable the right click context menu
    mc.oncontextmenu = function(){return false;};

    main();
}

$(document).ready(initialize);
