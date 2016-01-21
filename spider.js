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

var Spider = function(ctxp, iconp, widthp, heightp)
{
    this.velocity = new Vector2D(0,0);
    this.maxSpeed = 3;
    this.commandVector = new Vector2D(0,0);
    this.acc = 0.25;        // px per frame^2, must be > than friction!
    this.friction = 0.2;
    this.icon = iconp;
    this.halfWidth = (this.icon.width >> 1);
    this.halfHeight = (this.icon.height >> 1);
    this.maxX = widthp - this.halfWidth;
    this.maxY = heightp - this.halfHeight;
    this.ctx = ctxp;
    this.location = new Vector2D((widthp >> 1), (heightp >> 1));

    this.render = function()
    {
        this.ctx.drawImage(this.icon,
                           this.location.x - this.halfWidth,
                           this.location.y - this.halfHeight);
    };

    this.move = function()
    {
        var speed;

        this.velocity = this.velocity.add(this.commandVector.scale(this.acc));

        if (this.velocity.x > this.friction)
        {
            this.velocity.x -= this.friction;
        }
        else if (this.velocity.x < -this.friction)
        {
            this.velocity.x += this.friction;
        }
        else
        {
            this.velocity.x = 0;
        }

        if (this.velocity.y > this.friction)
        {
            this.velocity.y -= this.friction;
        }
        else if (this.velocity.y < -this.friction)
        {
            this.velocity.y += this.friction;
        }
        else
        {
            this.velocity.y = 0;
        }

        speed = this.velocity.magnitude();
        if (speed > this.maxSpeed)
        {
            this.velocity.scale(this.maxSpeed / speed);
        }

        this.location = this.location.add(this.velocity);
        this.location.x = Math.min(this.maxX, Math.max(this.halfWidth, this.location.x));
        this.location.y = Math.min(this.maxY, Math.max(this.halfHeight, this.location.y));
    };

    this.upArrowDown = function()
    {
        this.commandVector.y = -1;
    };

    this.downArrowDown = function()
    {
        this.commandVector.y = 1;
    };

    this.leftArrowDown = function()
    {
        this.commandVector.x = -1;
    };

    this.rightArrowDown = function()
    {
        this.commandVector.x = 1;
    };

    this.upArrowUp = function()
    {
        this.commandVector.y = 0;
    };

    this.downArrowUp = function()
    {
        this.commandVector.y = 0;
    };

    this.leftArrowUp = function()
    {
        this.commandVector.x = 0;
    };

    this.rightArrowUp = function()
    {
        this.commandVector.x = 0;
    };
};
