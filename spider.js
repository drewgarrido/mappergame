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

var Spider = function(ctx_pa, icon, width_pa, height_pa)
{
    this.vel_x = 0;
    this.vel_y = 0;
    this.max_vel_sq = 9;    // Velocity squared, in px per frame
    this.cmd_x = 0;
    this.cmd_y = 0;
    this.acc = 0.25;        // px per frame^2, must be > than friction!
    this.friction = 0.2;
    this.icon = icon;
    this.half_width = (this.icon.width >> 1);
    this.half_height = (this.icon.height >> 1);
    this.max_x = width_pa - this.half_width;
    this.max_y = height_pa - this.half_height;
    this.ctx = ctx_pa;
    this.location = new Vector2D((width_pa >> 1), (height_pa >> 1));

    this.render = function()
    {
        this.ctx.drawImage(this.icon,
                           this.location.x - this.half_width,
                           this.location.y - this.half_height);
    };

    this.move = function()
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

        this.location.x = Math.min(this.max_x, Math.max(this.half_width, this.location.x + this.vel_x));
        this.location.y = Math.min(this.max_y, Math.max(this.half_height, this.location.y + this.vel_y));
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
};
