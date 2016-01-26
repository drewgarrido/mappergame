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

var Fly = function(ctxp, locationp, iconp)
{
    this.ctx = ctxp;
    this.location = locationp;
    this.icon = iconp;
    this.width = this.icon.width;
    this.height = this.icon.height;
    this.halfWidth = (this.icon.width >> 1);
    this.halfHeight = (this.icon.height >> 1);
};

Fly.prototype = {

    render: function()
    {
        this.ctx.drawImage(this.icon,
                           this.location.x - this.halfWidth,
                           this.location.y - this.halfHeight);
    },

    setLocation: function(xp, yp)
    {
        this.location.x = Math.round(xp);
        this.location.y = Math.round(yp);
    },

    checkCollision: function(otherLocation)
    {
        var diffX = Math.abs(otherLocation.x - this.location.x);
        var diffY = Math.abs(otherLocation.y - this.location.y);
        var result = false;

        if (diffX < this.halfWidth && diffY < this.halfHeight)
        {
            result = true;
        }
        return result;
    }
};
