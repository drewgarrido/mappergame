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

var Vector2D = function(xp, yp)
{
    this.x = xp;
    this.y = yp;

    this.isEqual = function(otherV)
    {
        var result = false;
        if (this.x === otherV.x && this.y === otherV.y)
        {
            result = true;
        }
        return result;
    };

    this.round = function()
    {
        return (new Vector2D(Math.round(this.x), Math.round(this.y)));
    };

    this.add = function(otherV)
    {
        return (new Vector2D(this.x + otherV.x, this.y + otherV.y));
    };

    this.negate = function()
    {
        return (new Vector2D(-this.x, -this.y));
    };

    this.elementMultiply = function(otherV)
    {
        return (new Vector2D(this.x * otherV.x, this.y * otherV.y));
    };

    this.scale = function(scalar)
    {
        return (new Vector2D(this.x * scalar, this.y * scalar));
    };

    this.distance = function(otherV)
    {
        var diffX = this.x - otherV.x;
        var diffY = this.y - otherV.y;
        return (Math.sqrt(diffX * diffX + diffY * diffY));
    };

    this.magnitude = function()
    {
        return (Math.sqrt(this.x * this.x + this.y * this.y));
    };
};
